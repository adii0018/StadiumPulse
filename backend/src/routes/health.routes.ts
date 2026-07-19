/**
 * @fileoverview Health check route — used by Docker healthcheck and load balancers.
 */

import type { FastifyInstance } from 'fastify';

/**
 * Registers /health route — returns 200 with system status.
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_request, reply) => {
    void reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
      uptime: Math.round(process.uptime()),
    });
  });
}
