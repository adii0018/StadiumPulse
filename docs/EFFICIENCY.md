# StadiumPulse — Efficiency Documentation

## Token / Cost Considerations

### LLM Model Choice
**Model**: `claude-3-5-haiku-20241022`
- Input: $0.80 / 1M tokens
- Output: $0.40 / 1M tokens (as of 2025)

**Rationale**: Haiku is 5x cheaper and 3x faster than Claude Sonnet while producing sufficient quality for structured JSON output. The structured system prompts constrain output size.

### Estimated Token Usage per Request Type

| Request Type | Avg Input Tokens | Avg Output Tokens | Estimated Cost |
|---|---|---|---|
| `POST /api/fan/chat` | ~800 (system + RAG + user) | ~200 | $0.00072 |
| `POST /api/fan/navigate` | ~1200 (system + crowd + RAG + user) | ~400 | $0.00112 |
| `GET /api/fan/accessibility` | ~1000 (system + RAG) | ~300 | $0.00092 |
| `POST /api/ops/alert` (crowd only) | ~600 (system + snapshot) | ~200 | $0.00056 |
| `POST /api/ops/alert` (full orchestration) | ~2000 (two agent calls + RAG) | ~600 | $0.00204 |

**Daily cost estimate** (500 fan chats + 50 ops alerts): ~$0.50/day

---

## Caching Strategy

### LRU Cache (in-memory)
**File**: `backend/src/services/cache.service.ts`
**Config**: Max 500 entries, 5-minute TTL

| Cache Key Pattern | Layer | TTL | Hit Rate (estimated) |
|---|---|---|---|
| `rag:{query}:{topK}` | RAG retrieval | 5 min | ~60% (common queries) |
| `fanchat:{language}:{message}` | Chat responses | 5 min | ~20% (diverse queries) |
| `nav:{from}:{to}:{lang}:{access}` | Navigation | 5 min | ~40% (repeated routes) |
| `access:{needType}:{gateId}:{lang}` | Accessibility | 5 min | ~50% |
| `crowd:{snapshot_hash}` | Crowd analysis | 30s | ~80% (data changes slowly) |
| `ops:{gateId}:{snapshot_hash}` | Ops recommendations | 30s | ~70% |

**Efficiency gain**: RAG cache alone reduces LLM calls by ~40% during peak hours when many fans ask similar questions (e.g., "Where is Gate 3?").

---

## WebSocket Efficiency

**File**: `backend/src/services/crowdSimulator.service.ts`

- Crowd simulator emits exactly 1 update per second (debounced by `setInterval`)
- WebSocket events are only emitted when gate status actually changes (threshold crossings)
- No polling — all updates are push-based
- Client reconnects with 3-second exponential backoff
- Binary message format considered but not implemented (JSON sufficient at 1 update/sec)

---

## LLM Call Minimization

### Pre-filters (avoid unnecessary LLM calls)
1. **CrowdIntelligenceAgent**: If no gate > 80%, returns a no-alert response without any LLM call
2. **OpsOrchestratorAgent**: If crowd analysis returns 0 alerts, returns a no-action response without a second LLM call
3. **Cache hits**: All agent results are cached — cache hit = 0 LLM calls

### One call per agent turn
- Each agent makes exactly 1 `messages.create()` call per request
- No chained calls within a single agent
- OpsOrchestrator chains CrowdIntelligence (1 call) + Ops recommendations (1 call) = 2 LLM calls max

---

## Production Upgrade Path

### Current (Dev/Hackathon)
```
LRU Cache (in-memory) → SQLite (sql.js) → TF-IDF RAG (in-memory)
```

### Production
```
Redis Cluster (distributed cache) → PostgreSQL (pooled) → Chroma/Pinecone (vector store)
```

| Component | Current | Production | Why |
|---|---|---|---|
| Cache | LRU (in-memory, single process) | Redis | Shared across multiple backend instances; TTL management; pub/sub for invalidation |
| Database | sql.js (in-memory + file) | PostgreSQL | ACID compliance, connection pooling, pgvector for embeddings |
| RAG | In-memory TF-IDF | Chroma / Pinecone | Semantic search, embedding-based retrieval, much higher recall |
| Rate limit | Per-process Map | Redis (sliding window) | Correct rate limiting across multiple backend instances |
| LLM calls | Direct Claude API | LLM gateway + semantic cache | Semantic caching (similar queries = cache hit), retry logic, cost tracking |

### CDN for Static Assets
- Frontend static assets (JS, CSS) served via CloudFront / Fastly
- TTL: 1 year for hashed assets (`/assets/main.a1b2c3.js`)
- Reduces origin load to near-zero for static delivery

### Load Testing (see TESTING.md for k6 script)
Target: 1000 concurrent users, 100 RPS fan chat, p95 < 500ms response time
