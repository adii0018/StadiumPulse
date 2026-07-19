/**
 * @fileoverview Fan Companion routes — public endpoints for fans.
 * Rate-limited (token bucket) + prompt injection guarded.
 */

import type { FastifyInstance } from 'fastify';
import { handleFanChat, handleFanNavigate, handleFanAccessibility } from '../controllers/fan.controller';
import { publicRateLimit } from '../middleware/rateLimit.middleware';
import { promptInjectionGuard } from '../middleware/promptInjectionGuard.middleware';
import { validateBody, validateQuery, fanChatSchema, fanNavigateSchema, fanAccessibilitySchema } from '../middleware/validate.middleware';

/**
 * Registers all Fan Companion routes under /api/fan.
 */
export async function fanRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/chat',
    {
      preHandler: [
        publicRateLimit,
        promptInjectionGuard,
        validateBody(fanChatSchema),
      ],
    },
    handleFanChat,
  );

  fastify.post(
    '/navigate',
    {
      preHandler: [
        publicRateLimit,
        promptInjectionGuard,
        validateBody(fanNavigateSchema),
      ],
    },
    handleFanNavigate,
  );

  fastify.get('/accessibility', { preHandler: [publicRateLimit, validateQuery(fanAccessibilitySchema)] }, handleFanAccessibility);
}
