-- LániCAD — PostgreSQL Schema
-- Run this against your PostgreSQL database to create all tables
-- Example: psql -U lanicad -d lanicad -f schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════
-- 1. USERS
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default admin (password: admin123 — change in production!)
-- The hash is bcrypt of 'admin123'
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@lanicad.is', '$2b$10$placeholder_change_on_first_run', 'Kerfisstjóri', 'admin')
ON CONFLICT (email) DO NOTHING;


-- ══════════════════════════════════════════
-- 2. PROJECTS (saved calculator work)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  client JSONB NOT NULL DEFAULT '{}',
  data JSONB NOT NULL DEFAULT '{}',
  line_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);


-- ══════════════════════════════════════════
-- 3. TEMPLATES (reusable equipment configs)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ══════════════════════════════════════════
-- 4. PRODUCTS (editable product catalog)
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_type TEXT NOT NULL CHECK (calculator_type IN ('fence', 'scaffolding', 'formwork', 'rolling', 'ceiling')),
  rental_no TEXT NOT NULL UNIQUE,
  sale_no TEXT DEFAULT '',
  description TEXT NOT NULL,
  category TEXT DEFAULT '',
  rates JSONB NOT NULL DEFAULT '{}',
  sale_price NUMERIC(12,2) DEFAULT 0,
  weight NUMERIC(8,2) DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_calculator_type ON products(calculator_type);
CREATE INDEX IF NOT EXISTS idx_products_rental_no ON products(rental_no);


-- ══════════════════════════════════════════
-- Auto-update updated_at trigger
-- ══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
