const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const usePostgres = Boolean(process.env.DATABASE_URL);
const dataDir = path.resolve(process.env.DATA_DIR || './data');
let sqlite;
let pool;

if (usePostgres) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 });
} else {
  if (process.env.NODE_ENV === 'production') throw new Error('PostgreSQL é obrigatório em produção. Configure DATABASE_URL.');
  fs.mkdirSync(dataDir, { recursive: true });
  sqlite = new Database(path.join(dataDir, 'workspace.sqlite'));
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
}

const ready = usePostgres ? initializePostgres() : initializeSqlite();

async function initializePostgres() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations/001-initial.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    const existing = await client.query('SELECT version FROM schema_migrations WHERE version = 1');
    if (!existing.rowCount) {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES (1)');
    }
    await client.query(`INSERT INTO workspace_state (id, version, data) VALUES (1, 1, '{"leads":[],"events":[],"docs":[],"cases":[],"campaigns":[],"legalLibrary":[],"tasks":[],"analyses":[]}'::jsonb) ON CONFLICT (id) DO NOTHING`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

function initializeSqlite() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      disabled_at TEXT
    );
    CREATE TABLE IF NOT EXISTS workspace_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const userColumns = sqlite.prepare('PRAGMA table_info(users)').all().map(column => column.name);
  if (!userColumns.includes('role')) sqlite.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'");
  sqlite.prepare('INSERT OR IGNORE INTO workspace_state (id, version, data) VALUES (1, 1, ?)')
    .run(JSON.stringify({ leads: [], events: [], docs: [], cases: [], campaigns: [], legalLibrary: [], tasks: [], analyses: [] }));
  const row = sqlite.prepare('SELECT data FROM workspace_state WHERE id = 1').get();
  const data = JSON.parse(row.data);
  let changed = false;
  for (const key of ['tasks', 'analyses']) if (!Array.isArray(data[key])) { data[key] = []; changed = true; }
  if (changed) sqlite.prepare('UPDATE workspace_state SET data = ? WHERE id = 1').run(JSON.stringify(data));
}

async function getUser(username) {
  await ready;
  if (usePostgres) {
    const result = await pool.query('SELECT id, username, password_hash, role FROM users WHERE lower(username) = lower($1) AND disabled_at IS NULL', [username]);
    return result.rows[0] || null;
  }
  return sqlite.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ? COLLATE NOCASE AND disabled_at IS NULL').get(username) || null;
}

async function getState() {
  await ready;
  const row = usePostgres
    ? (await pool.query('SELECT version, data FROM workspace_state WHERE id = 1')).rows[0]
    : sqlite.prepare('SELECT version, data FROM workspace_state WHERE id = 1').get();
  return { version: row.version, data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data };
}

async function saveState(version, data) {
  await ready;
  if (usePostgres) {
    const result = await pool.query('UPDATE workspace_state SET data = $1::jsonb, version = version + 1, updated_at = now() WHERE id = 1 AND version = $2 RETURNING version', [JSON.stringify(data), version]);
    if (result.rowCount) return { saved: true, version: result.rows[0].version };
    const current = await pool.query('SELECT version FROM workspace_state WHERE id = 1');
    return { saved: false, version: current.rows[0]?.version };
  }
  const result = sqlite.prepare('UPDATE workspace_state SET data = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1 AND version = ?').run(JSON.stringify(data), version);
  if (result.changes) return { saved: true, version: version + 1 };
  return { saved: false, version: sqlite.prepare('SELECT version FROM workspace_state WHERE id = 1').get().version };
}

async function createUser(username, passwordHash, role = 'admin') {
  await ready;
  if (!['admin', 'atendimento', 'execucao', 'revisao'].includes(role)) throw new Error('Perfil inválido.');
  if (usePostgres) await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', [username, passwordHash, role]);
  else sqlite.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, passwordHash, role);
}

async function close() {
  if (usePostgres) {
    try { await ready; } finally { await pool.end(); }
  } else {
    sqlite.close();
  }
}

module.exports = { ready, pool, usePostgres, dataDir, getUser, getState, saveState, createUser, close };
