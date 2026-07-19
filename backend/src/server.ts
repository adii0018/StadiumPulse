/**
 * @fileoverview StadiumPulse Backend — Fastify server entry point.
 *
 * Registers: CORS, JWT, WebSocket, all route plugins, crowd simulator,
 * auth endpoint, and RAG knowledge base initialization.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from '@fastify/jwt';
import websocketPlugin from '@fastify/websocket';
import { createHash } from 'crypto';

import { env } from './config/env';
import { fanRoutes } from './routes/fan.routes';
import { opsRoutes } from './routes/ops.routes';
import { healthRoutes } from './routes/health.routes';
import { ragKnowledgeBase } from './services/ragKnowledgeBase.service';
import { crowdSimulator } from './services/crowdSimulator.service';
import { getDb, seedDemoUser, closeDb } from './db/sqlite';
import type { LoginRequest, LoginResponse, WSMessage } from './types';
import { loginSchema } from './middleware/validate.middleware';
import { validateBody } from './middleware/validate.middleware';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

async function buildServer(): Promise<void> {
  // -------------------------------------------------------------------------
  // Plugins
  // -------------------------------------------------------------------------
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await fastify.register(jwtPlugin, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  await fastify.register(websocketPlugin);

  // -------------------------------------------------------------------------
  // REST Routes
  // -------------------------------------------------------------------------
  await fastify.register(healthRoutes);
  await fastify.register(fanRoutes, { prefix: '/api/fan' });
  await fastify.register(opsRoutes, { prefix: '/api/ops' });

  // -------------------------------------------------------------------------
  // Auth endpoint — POST /api/auth/login
  // -------------------------------------------------------------------------
  fastify.post<{ Body: LoginRequest }>(
    '/api/auth/login',
    { preHandler: [validateBody(loginSchema)] },
    async (request, reply) => {
      const { email, password } = request.body;
      const db = await getDb();

      const passwordHash = createHash('sha256').update(password).digest('hex');
      const stmt = db.prepare('SELECT email, role FROM users WHERE email = ? AND password_hash = ?');
      stmt.bind([email, passwordHash]);
      const user = stmt.step()
        ? { email: stmt.get()[0] as string, role: stmt.get()[1] as string }
        : undefined;
      stmt.free();

      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid credentials.' });
      }

      const token = fastify.jwt.sign({ sub: user.email, role: user.role });
      db.run('UPDATE users SET last_login = datetime(\'now\') WHERE email = ?', [email]);

      const response: LoginResponse = {
        token,
        expiresIn: env.JWT_EXPIRES_IN,
        user: { email: user.email, role: user.role as 'fan' | 'staff' | 'admin' },
      };

      return reply.send(response);
    },
  );

  // -------------------------------------------------------------------------
  // WebSocket — /ws/crowd — streams live crowd density updates
  // -------------------------------------------------------------------------
  fastify.get(
    '/ws/crowd',
    { websocket: true },
    (socket) => {
      fastify.log.info('WebSocket client connected');

      // Send current snapshot immediately on connect
      const initial: WSMessage = {
        type: 'crowd_update',
        payload: crowdSimulator.getLatestSnapshot(),
        timestamp: Date.now(),
      };
      socket.send(JSON.stringify(initial));

      // Forward crowd updates (debounced by simulator — 1 per second)
      const onSnapshot = (snapshots: WSMessage['payload']): void => {
        if (socket.readyState === socket.OPEN) {
          const msg: WSMessage = {
            type: 'crowd_update',
            payload: snapshots as any,
            timestamp: Date.now(),
          };
          socket.send(JSON.stringify(msg));
        }
      };

      // Forward alert events
      const onAlert = (alert: WSMessage['payload']): void => {
        if (socket.readyState === socket.OPEN) {
          const msg: WSMessage = {
            type: 'alert',
            payload: alert as any,
            timestamp: Date.now(),
          };
          socket.send(JSON.stringify(msg));
        }
      };

      crowdSimulator.on('snapshot', onSnapshot);
      crowdSimulator.on('alert', onAlert);

      socket.on('close', () => {
        crowdSimulator.off('snapshot', onSnapshot);
        crowdSimulator.off('alert', onAlert);
        fastify.log.info('WebSocket client disconnected');
      });
    },
  );

  // -------------------------------------------------------------------------
  // Graceful shutdown
  // -------------------------------------------------------------------------
  const gracefulShutdown = async (): Promise<void> => {
    fastify.log.info('Shutting down gracefully...');
    crowdSimulator.stop();
    closeDb();
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void gracefulShutdown());
  process.on('SIGINT', () => void gracefulShutdown());
}

async function start(): Promise<void> {
  // Initialize knowledge base
  await ragKnowledgeBase.initialize();

  // Seed demo user
  const passwordHash = createHash('sha256')
    .update(env.DEMO_ADMIN_PASSWORD)
    .digest('hex');
  seedDemoUser(env.DEMO_ADMIN_EMAIL, passwordHash);

  // Start simulation
  crowdSimulator.start();

  await buildServer();

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
  fastify.log.info(`StadiumPulse backend running on port ${env.PORT}`);
}

start().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});

export { fastify };
