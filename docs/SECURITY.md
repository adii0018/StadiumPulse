# StadiumPulse — Security Documentation

## Security Measures & OWASP Top 10 Mapping

### 1. Prompt Injection Guardrails
**File**: `backend/src/middleware/promptInjectionGuard.middleware.ts`

**Measures**:
- **Input sanitization**: All user-facing string fields (`message`, `query`, `from`, `to`) are sanitized before reaching any agent: null bytes removed, HTML stripped, length capped at 500 characters.
- **Injection pattern detection**: 14 regex patterns detect common jailbreak techniques (ignore instructions, act as DAN, reveal system prompt, override safety, bypass filter, system tag injection, instruction tags).
- **Strict system prompts**: Every agent has a `SECURITY:` clause in its system prompt explicitly instructing the LLM to ignore embedded user instructions. The LLM is also told never to reveal its instructions.
- **Output validation**: LLM output is passed through `validateLLMOutput()` before returning to the client. This strips script tags and redacts accidental system prompt leakage.

**OWASP Mapping**: A03 Injection (LLM-specific injection / Prompt Injection)

---

### 2. JWT Authentication + Role-Based Authorization
**Files**: `backend/src/middleware/auth.middleware.ts`, `backend/src/routes/ops.routes.ts`

**Measures**:
- All Ops Command Center endpoints require a valid JWT (`Authorization: Bearer <token>`)
- JWT is verified using `@fastify/jwt` with a secret loaded from environment (never hardcoded)
- Role-based check enforced: `staff` or `admin` role required for all `/api/ops/*` endpoints
- JWT expiry is configurable (default 8h) via `JWT_EXPIRES_IN` env var
- 401 returned for missing/invalid tokens; 403 for insufficient role

**OWASP Mapping**: A01 Broken Access Control, A07 Identification and Authentication Failures

---

### 3. Input Validation (Zod)
**File**: `backend/src/middleware/validate.middleware.ts`

**Measures**:
- Every request body validated against a Zod schema before any business logic runs
- Schema violations return 422 with field-level error details
- String length caps enforced at schema level (message: 500, gateId: regex `/^G\d{1,2}$/`, email: email format)
- No business logic in route handlers — controllers only receive validated, typed data

**OWASP Mapping**: A03 Injection (prevents malformed data reaching DB/LLM), A04 Insecure Design

---

### 4. Rate Limiting
**File**: `backend/src/middleware/rateLimit.middleware.ts`

**Measures**:
- Token bucket algorithm, per-IP tracking
- Public endpoints: 10 requests / 10 seconds
- Staff endpoints: 50 requests / 10 seconds
- `Retry-After` and `X-RateLimit-*` headers returned on 429
- IP extracted from `X-Forwarded-For` for proxied deployments
- **Production upgrade**: Replace in-memory Map with Redis sorted set for distributed rate limiting

**OWASP Mapping**: A04 Insecure Design (resource exhaustion / DDoS prevention)

---

### 5. Secret Management
**Files**: `.env.example`, `backend/src/config/env.ts`, `.gitignore`

**Measures**:
- All secrets (API key, JWT secret, DB credentials) loaded exclusively from environment variables
- Zod schema validates presence and format at startup — fails fast with clear errors if missing
- `.env` is gitignored; only `.env.example` (with placeholders) is committed
- No secrets appear in any source file, log output, or API response

**OWASP Mapping**: A02 Cryptographic Failures, A09 Security Logging and Monitoring Failures

---

### 6. CORS Configuration
**File**: `backend/src/server.ts`

**Measures**:
- CORS explicitly configured to allow only `FRONTEND_URL` (default: `http://localhost:5173`)
- Only `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` methods allowed
- Only `Content-Type` and `Authorization` headers allowed

**OWASP Mapping**: A05 Security Misconfiguration

---

### 7. SQL Injection Prevention
**File**: `backend/src/db/sqlite.ts`

**Measures**:
- All DB queries use parameterized statements (sql.js `.run(sql, params)`)
- No string interpolation of user data into SQL (auth query uses fixed values after sanitization)
- Zod validation ensures data shape before it reaches any DB query

**OWASP Mapping**: A03 Injection (SQL Injection)

---

### 8. Security Headers
**Production recommendation**: Add the following headers via nginx or a Fastify plugin:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**OWASP Mapping**: A05 Security Misconfiguration

---

### 9. Logging & Monitoring
**File**: `backend/src/server.ts` (Pino logger)

**Measures**:
- Pino structured logging on all requests (request ID, method, URL, status code, response time)
- All alerts persisted to SQLite `alerts_log` with timestamp and severity
- Production: integrate with Datadog / CloudWatch for alerting on 4xx/5xx spikes and unusual patterns

**OWASP Mapping**: A09 Security Logging and Monitoring Failures

---

## Security Disclosure

To report a security vulnerability, please email security@stadiumpulse.example.com. Do not open a public GitHub issue for security vulnerabilities.
