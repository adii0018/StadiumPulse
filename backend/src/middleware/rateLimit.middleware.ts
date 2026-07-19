/**
 * @fileoverview Rate limiting middleware — per-IP token bucket implementation.
 * Configurable limits: public endpoints (10 req/10s), staff endpoints (50 req/10s).
 *
 * Production upgrade path: Replace the in-memory Map with Redis sorted sets
 * (use ioredis + sliding window log algorithm for distributed rate limiting).
 *
 * OWASP mapping: A04 Insecure Design (resource exhaustion prevention).
 */

import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { env } from '../config/env';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/** In-memory store for rate limit buckets, keyed by IP address */
const publicBuckets = new Map<string, TokenBucket>();
const staffBuckets = new Map<string, TokenBucket>();

// Periodic cleanup to prevent OOM memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of publicBuckets.entries()) {
    if (now - bucket.lastRefill > env.RATE_LIMIT_PUBLIC_WINDOW_MS) {
      publicBuckets.delete(ip);
    }
  }
  for (const [ip, bucket] of staffBuckets.entries()) {
    if (now - bucket.lastRefill > env.RATE_LIMIT_STAFF_WINDOW_MS) {
      staffBuckets.delete(ip);
    }
  }
}, Math.max(env.RATE_LIMIT_PUBLIC_WINDOW_MS, env.RATE_LIMIT_STAFF_WINDOW_MS)).unref();

/**
 * Extracts the client IP from the request (handles X-Forwarded-For for proxied setups).
 */
function getClientIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return request.ip ?? 'unknown';
}

/**
 * Token bucket rate limiter factory.
 * Returns a Fastify preHandler hook configured for the given limits.
 *
 * @param bucketStore - The Map to use for this endpoint group
 * @param maxTokens - Maximum requests per window
 * @param windowMs - Window duration in milliseconds
 */
function createRateLimiter(
  bucketStore: Map<string, TokenBucket>,
  maxTokens: number,
  windowMs: number,
) {
  return function rateLimitHook(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ): void {
    const ip = getClientIp(request);
    const now = Date.now();

    let bucket = bucketStore.get(ip);
    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
      bucketStore.set(ip, bucket);
    }

    // Refill tokens proportional to elapsed time
    const elapsed = now - bucket.lastRefill;
    const refillAmount = (elapsed / windowMs) * maxTokens;
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refillAmount);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      const retryAfterMs = Math.ceil(((1 - bucket.tokens) / maxTokens) * windowMs);
      reply.header('Retry-After', Math.ceil(retryAfterMs / 1000).toString());
      reply.header('X-RateLimit-Limit', maxTokens.toString());
      reply.header('X-RateLimit-Remaining', '0');
      void reply.code(429).send({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
        retryAfterMs,
      });
      return;
    }

    bucket.tokens -= 1;
    reply.header('X-RateLimit-Limit', maxTokens.toString());
    reply.header('X-RateLimit-Remaining', Math.floor(bucket.tokens).toString());
    done();
  };
}

/** Rate limiter for public Fan Companion endpoints (unauthenticated) */
export const publicRateLimit = createRateLimiter(
  publicBuckets,
  env.RATE_LIMIT_PUBLIC_MAX,
  env.RATE_LIMIT_PUBLIC_WINDOW_MS,
);

/** Rate limiter for authenticated Ops Command Center endpoints */
export const staffRateLimit = createRateLimiter(
  staffBuckets,
  env.RATE_LIMIT_STAFF_MAX,
  env.RATE_LIMIT_STAFF_WINDOW_MS,
);
