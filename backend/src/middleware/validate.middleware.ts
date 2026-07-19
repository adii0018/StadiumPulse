/**
 * @fileoverview Request body validation middleware using Zod schemas.
 * All incoming request bodies are validated before reaching any controller.
 *
 * OWASP mapping: A03 Injection (validates and types all input).
 */

import { z } from 'zod';
import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

/** Supported language values */
const languageSchema = z.enum(['en', 'es', 'hi']);

// ---------------------------------------------------------------------------
// Fan Companion schemas
// ---------------------------------------------------------------------------

export const fanChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
  language: languageSchema.default('en'),
  sessionId: z.string().uuid().optional(),
});

export const fanNavigateSchema = z.object({
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
  language: languageSchema.default('en'),
  accessibilityRequired: z.boolean().default(false),
});

export const fanAccessibilitySchema = z.object({
  needType: z.enum(['wheelchair', 'visual', 'hearing', 'general']).default('general'),
  nearGateId: z.string().regex(/^G\d{1,2}$/).optional(),
  language: languageSchema.default('en'),
  query: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ---------------------------------------------------------------------------
// Ops schemas
// ---------------------------------------------------------------------------

export const opsAlertSchema = z.object({
  gateId: z.string().regex(/^G\d{1,2}$/, 'Invalid gate ID format'),
  message: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

type ZodSchema = z.ZodTypeAny;

/**
 * Returns a Fastify preHandler hook that validates request.body against the given Zod schema.
 * Returns 422 with detailed error messages on validation failure.
 *
 * @param schema - Zod schema to validate against
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return function validationHook(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ): void {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      void reply.code(422).send({
        error: 'Validation Error',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }
    request.body = result.data;
    done();
  };
}

/**
 * Returns a Fastify preHandler hook that validates request.query against the given Zod schema.
 *
 * @param schema - Zod schema to validate against
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return function validationHook(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ): void {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      void reply.code(400).send({
        error: 'Bad Request',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }
    request.query = result.data;
    done();
  };
}
