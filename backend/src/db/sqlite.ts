/**
 * @fileoverview SQLite singleton using sql.js (pure-JS, no native build needed).
 * sql.js runs an in-memory SQLite database initialized from a WASM binary.
 *
 * Production upgrade path: Replace with @prisma/client + PostgreSQL.
 * All queries here use standard SQL — migration is straightforward.
 *
 * Note: sql.js keeps the database in memory. The DB is persisted to disk
 * periodically via saveDatabase(). For production, switch to better-sqlite3
 * (needs Visual Studio C++ tools on Windows) or Prisma + PostgreSQL.
 */

import initSqlJs, { type Database } from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

let db: Database | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

const DB_PATH = join(process.cwd(), 'stadiumpulse.db.bin');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

/**
 * Returns the singleton sql.js database instance.
 * Initializes on first call (async).
 */
export async function getDb(): Promise<Database> {
  if (db) return db;

  SQL = await initSqlJs();

  if (process.env.NODE_ENV !== 'test' && existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Run schema
  const schema = readFileSync(SCHEMA_PATH, 'utf-8');
  // sql.js doesn't support PRAGMA syntax in the same way — filter out WAL/FK lines
  const cleanSchema = schema
    .split('\n')
    .filter((line) => !line.trim().startsWith('PRAGMA'))
    .join('\n');
  db.run(cleanSchema);

  return db;
}

/**
 * Persists the in-memory database to disk.
 * Call this after writes in production mode.
 */
export function saveDatabase(): void {
  if (!db || process.env.NODE_ENV === 'test') return;
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Seeds the demo admin user if not already present.
 */
export async function seedDemoUser(email: string, passwordHash: string): Promise<void> {
  const database = await getDb();
  const stmt = database.prepare('SELECT id FROM users WHERE email = ?');
  stmt.bind([email]);
  const userExists = stmt.step();
  stmt.free();
  if (!userExists) {
    database.run(
      `INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      [email, passwordHash, 'admin'],
    );
    saveDatabase();
  }
}

export interface AlertLogEntry {
  gateId: string;
  severity: string;
  occupancy: number;
  message: string;
  recommendation?: string;
}

/**
 * Inserts an alert into the persistent alert log.
 */
export async function logAlert(entry: AlertLogEntry): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO alerts_log (gate_id, severity, occupancy, message, recommendation)
     VALUES (?, ?, ?, ?, ?)`,
    [entry.gateId, entry.severity, entry.occupancy, entry.message, entry.recommendation ?? null],
  );
  const result = database.exec('SELECT last_insert_rowid()');
  saveDatabase();
  return (result[0]?.values[0]?.[0] as number) ?? 0;
}

/**
 * Returns recent alert log entries.
 */
export async function getRecentAlerts(limit = 20): Promise<AlertLogEntry[]> {
  const database = await getDb();
  const result = database.exec(
    `SELECT gate_id, severity, occupancy, message, recommendation
     FROM alerts_log
     ORDER BY rowid DESC
     LIMIT ${limit}`,
  );
  if (!result.length) return [];
  const [{ columns, values }] = result;
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      gateId: obj['gate_id'] as string,
      severity: obj['severity'] as string,
      occupancy: obj['occupancy'] as number,
      message: obj['message'] as string,
      recommendation: obj['recommendation'] as string | undefined,
    };
  });
}

/**
 * Closes the database (no-op for sql.js, provided for interface compatibility).
 */
export function closeDb(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}
