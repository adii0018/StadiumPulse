/**
 * @fileoverview Global test setup — sets env vars and initializes RAG for tests.
 */

process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = 'gsk-groq-test-key-placeholder';
process.env.JWT_SECRET = 'test-jwt-secret-32-chars-minimum!!';
process.env.DEMO_ADMIN_EMAIL = 'admin@stadiumpulse.com';
process.env.DEMO_ADMIN_PASSWORD = 'demo1234';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.LRU_CACHE_MAX_SIZE = '100';
process.env.LRU_CACHE_TTL_MS = '60000';
process.env.CROWD_UPDATE_INTERVAL_MS = '1000';
process.env.RATE_LIMIT_PUBLIC_MAX = '100';
process.env.RATE_LIMIT_PUBLIC_WINDOW_MS = '10000';
process.env.RATE_LIMIT_STAFF_MAX = '200';
process.env.RATE_LIMIT_STAFF_WINDOW_MS = '10000';
