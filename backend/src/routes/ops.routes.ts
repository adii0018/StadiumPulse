/**
 * @fileoverview Ops Command Center routes — protected by JWT + staff role.
 */

import type { FastifyInstance } from 'fastify';
import {
  handleGetCrowd,
  handlePostAlert,
  handleGetRecommendations,
  handleGetAlertLog,
} from '../controllers/ops.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';
import { staffRateLimit } from '../middleware/rateLimit.middleware';
import { validateBody, opsAlertSchema } from '../middleware/validate.middleware';

/**
 * Registers all Ops Command Center routes under /api/ops.
 * All routes require a valid JWT with staff or admin role.
 */
export async function opsRoutes(fastify: FastifyInstance): Promise<void> {
  // Shared preHandler for all ops routes
  const opsAuth = [staffRateLimit, authenticateJWT, requireRole('staff', 'admin')];

  fastify.get('/crowd', { preHandler: opsAuth }, handleGetCrowd);

  fastify.post(
    '/alert',
    { preHandler: [...opsAuth, validateBody(opsAlertSchema)] },
    handlePostAlert,
  );

  fastify.get('/recommendations', { preHandler: opsAuth }, handleGetRecommendations);

  fastify.get('/alerts/log', { preHandler: opsAuth }, handleGetAlertLog);
}
