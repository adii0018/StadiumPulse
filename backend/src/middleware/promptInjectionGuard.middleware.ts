/**
 * @fileoverview Prompt injection guard middleware.
 * Sanitizes and inspects user input before it reaches any LLM agent.
 * Validates LLM output before returning to the client.
 *
 * OWASP mapping: A03 Injection, A05 Security Misconfiguration.
 */

import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

/** Maximum allowed user input length in characters */
const MAX_INPUT_LENGTH = 500;

/**
 * Patterns that indicate a prompt injection attempt.
 * We look for common jailbreak patterns, instruction overrides, and system prompt leakage attempts.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|above|all)\s+instructions?/i,
  /disregard\s+(your|the)\s+(system|previous)\s+(prompt|instructions?)/i,
  /you\s+are\s+now\s+(?!a\s+fan|helping)/i,
  /act\s+as\s+(?:DAN|an?\s+unrestricted|jailbreak)/i,
  /reveal\s+(your|the)\s+(system\s+prompt|instructions?|rules?)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(?!a\s+helpful)/i,
  /forget\s+(everything|all)\s+(you|your)/i,
  /system\s*:\s*you\s+are/i,
  /<\s*system\s*>/i,
  /\[INST\]/i,
  /###\s*instruction/i,
  /override\s+safety/i,
  /bypass\s+(filter|restriction|guardrail)/i,
];

/**
 * HTML/script injection patterns (OWASP A03).
 */
const HTML_PATTERNS: RegExp[] = [/<script/i, /<iframe/i, /javascript:/i, /on\w+\s*=/i];

/**
 * Sanitizes a user input string.
 * - Trims whitespace
 * - Caps length at MAX_INPUT_LENGTH
 * - Removes null bytes
 * - Strips HTML tags
 *
 * @param input - Raw user input
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // strip script tags AND content
    .replace(/<[^>]*>/g, '') // strip remaining HTML tags
    .slice(0, MAX_INPUT_LENGTH);
}

/**
 * Checks if a string contains prompt injection or HTML injection patterns.
 *
 * @param input - Sanitized user input
 * @returns true if injection is detected
 */
export function detectInjection(input: string): boolean {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) return true;
  }
  for (const pattern of HTML_PATTERNS) {
    if (pattern.test(input)) return true;
  }
  return false;
}

/**
 * Validates LLM output before returning to the client.
 * Checks that the output doesn't accidentally leak system prompt content
 * or contain script injection.
 *
 * @param output - Raw LLM output string
 * @returns Sanitized output string
 */
export function validateLLMOutput(output: string): string {
  // Strip any HTML/script injection that might have leaked through
  let sanitized = output.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove any system prompt leak patterns
  const systemLeakPatterns = [
    /STRICT RULES?:/gi,
    /SYSTEM PROMPT:/gi,
    /you are the stadiumpulse.*agent/gi,
  ];
  for (const pattern of systemLeakPatterns) {
    sanitized = sanitized.replace(pattern, '[redacted]');
  }

  return sanitized.trim();
}

/**
 * Fastify preHandler hook that guards all fan/ops endpoints against prompt injection.
 * Sanitizes the `message`, `query`, `from`, `to` fields in the request body.
 * Returns 400 if injection is detected.
 */
export function promptInjectionGuard(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  const body = request.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== 'object') {
    done();
    return;
  }

  const fieldsToCheck = ['message', 'query', 'from', 'to'];

  for (const field of fieldsToCheck) {
    const value = body[field];
    if (typeof value === 'string') {
      const sanitized = sanitizeInput(value);
      if (detectInjection(sanitized)) {
        void reply.code(400).send({
          error: 'Invalid input',
          message: 'Your input contains patterns that are not allowed.',
        });
        return;
      }
      // Replace with sanitized version
      (body as Record<string, unknown>)[field] = sanitized;
    }
  }

  done();
}
