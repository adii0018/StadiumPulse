/**
 * @fileoverview JWT authentication and role-based authorization middleware.
 * Protects all Ops Command Center endpoints behind staff/admin role check.
 *
 * OWASP mapping: A01 Broken Access Control, A07 Identification/Authentication Failures.
 */

import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import type { JWTPayload, UserRole } from '../types';

declare module 'fastify' {
  interface FastifyRequest {
    /** Decoded JWT payload attached after successful authentication */
    jwtUser?: JWTPayload;
  }
}

/**
 * Fastify preHandler hook that verifies a JWT and attaches the payload to the request.
 * Returns 401 if the token is missing or invalid.
 */
export function authenticateJWT(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    void reply.code(401).send({ error: 'Unauthorized', message: 'Missing or invalid token.' });
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const payload = request.server.jwt.verify(authHeader.slice(7)) as JWTPayload;
    request.jwtUser = payload;
    done();
  } catch {
    void reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token.' });
  }
}

/**
 * Role-based authorization factory. Returns a preHandler hook that
 * checks whether the authenticated user has one of the allowed roles.
 *
 * @param allowedRoles - Array of roles permitted to access the endpoint
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ): void {
    const user = request.jwtUser;
    if (!user) {
      void reply.code(401).send({ error: 'Unauthorized', message: 'Not authenticated.' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      void reply
        .code(403)
        .send({
          error: 'Forbidden',
          message: `This endpoint requires one of these roles: ${allowedRoles.join(', ')}.`,
        });
      return;
    }
    done();
  };
}
