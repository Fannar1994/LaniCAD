-- LániCAD — Turso/SQLite Schema
-- Run this against your Turso database to create all tables
-- Example: turso db shell lanicad < schema.sql

-- ══════════════════════════════════════════
-- 1. USERS
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default admin (password: admin123 — change in production!)
-- The hash is bcrypt of 'admin123'
INSERT OR IGNORE INTO users (email, password_hash, name, role)
VALUES ('admin@lanicad.is', '$2b$10$placeholder_change_on_first_run', 'Kerfisstjóri', 'admin');


-- ══════════════════════════════════════════
-- 2. PROJECTS (saved calculator work)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  client TEXT NOT NULL DEFAULT '{}',
  data TEXT NOT NULL DEFAULT '{}',
  line_items TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);


-- ══════════════════════════════════════════
-- 3. TEMPLATES (reusable equipment configs)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  config TEXT NOT NULL DEFAULT '{}',
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);


-- ══════════════════════════════════════════
-- 4. PRODUCTS (editable product catalog)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  calculator_type TEXT NOT NULL CHECK (calculator_type IN ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  rental_no TEXT NOT NULL UNIQUE,
  sale_no TEXT DEFAULT '',
  description TEXT NOT NULL,
  category TEXT DEFAULT '',
  rates TEXT NOT NULL DEFAULT '{}',
  sale_price REAL DEFAULT 0,
  weight REAL DEFAULT 0,
  image_url TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_calculator_type ON products(calculator_type);
CREATE INDEX IF NOT EXISTS idx_products_rental_no ON products(rental_no);


-- ══════════════════════════════════════════
-- 5. AUDIT LOG (track user actions)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);


-- ══════════════════════════════════════════
-- 6. REQUEST QUEUE (offline request queueing)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS request_queue (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
  path TEXT NOT NULL,
  headers TEXT NOT NULL DEFAULT '{}',
  body TEXT NOT NULL DEFAULT '{}',
  source_ip TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  response_code INTEGER,
  response_body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_request_queue_status ON request_queue(status);
CREATE INDEX IF NOT EXISTS idx_request_queue_created_at ON request_queue(created_at DESC);


-- ══════════════════════════════════════════
-- 7. PROJECT SHARES (read-only share links)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS project_shares (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_shares_token ON project_shares(token);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);
