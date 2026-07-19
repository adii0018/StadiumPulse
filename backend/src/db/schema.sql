-- =============================================================================
-- StadiumPulse SQLite Schema
-- Production upgrade path: PostgreSQL (types are compatible; change AUTOINCREMENT 
-- to SERIAL, TEXT to VARCHAR, and enable pgvector for embedding storage)
-- =============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Gates table: reference data for stadium gates
CREATE TABLE IF NOT EXISTS gates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  capacity    INTEGER NOT NULL,
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  accessibility_features TEXT NOT NULL DEFAULT '[]', -- JSON array
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Staff users table: for JWT auth (demo only — production uses LDAP/SSO)
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('fan', 'staff', 'admin')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  last_login  TEXT
);

-- Alerts log: persistent record of all AI-generated alerts
CREATE TABLE IF NOT EXISTS alerts_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  gate_id         TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  occupancy       REAL NOT NULL,
  message         TEXT NOT NULL,
  recommendation  TEXT,            -- JSON-stringified OpsRecommendation[]
  acknowledged    INTEGER NOT NULL DEFAULT 0,
  acknowledged_by TEXT,
  acknowledged_at TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (gate_id) REFERENCES gates(id)
);

-- Indexes for frequent query patterns
CREATE INDEX IF NOT EXISTS idx_alerts_log_gate_id    ON alerts_log(gate_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_severity   ON alerts_log(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_log_created_at ON alerts_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_log_acknowledged ON alerts_log(acknowledged);
