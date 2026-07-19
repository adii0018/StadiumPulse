/**
 * @fileoverview Environment variable loading and validation.
 * Throws at startup if any required variable is missing or malformed.
 */

import { config } from 'dotenv';
import { z } from 'zod';

config(); // Load .env file

const envSchema = z.object({
  // Groq
  GROQ_API_KEY: z.string().min(10, 'GROQ_API_KEY is required'),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  // Demo credentials
  DEMO_ADMIN_EMAIL: z.string().email().default('admin@stadiumpulse.com'),
  DEMO_ADMIN_PASSWORD: z.string().min(6).default('demo1234'),

  // Server
  PORT: z
    .string()
    .default('3001')
    .transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_PUBLIC_MAX: z
    .string()
    .default('10')
    .transform((v) => parseInt(v, 10)),
  RATE_LIMIT_PUBLIC_WINDOW_MS: z
    .string()
    .default('10000')
    .transform((v) => parseInt(v, 10)),
  RATE_LIMIT_STAFF_MAX: z
    .string()
    .default('50')
    .transform((v) => parseInt(v, 10)),
  RATE_LIMIT_STAFF_WINDOW_MS: z
    .string()
    .default('10000')
    .transform((v) => parseInt(v, 10)),

  // Cache
  LRU_CACHE_MAX_SIZE: z
    .string()
    .default('500')
    .transform((v) => parseInt(v, 10)),
  LRU_CACHE_TTL_MS: z
    .string()
    .default('300000')
    .transform((v) => parseInt(v, 10)),

  // Crowd simulator
  CROWD_UPDATE_INTERVAL_MS: z
    .string()
    .default('1000')
    .transform((v) => parseInt(v, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

/** Validated, typed environment configuration */
export const env = parsed.data;
