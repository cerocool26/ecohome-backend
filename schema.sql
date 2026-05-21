-- ============================================================
-- EcoHome Store — Script de base de datos
-- Ejecutar: psql -U ecohome_user -d ecohome_db -f schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────
-- Tabla: users
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  UNIQUE NOT NULL,
  password_hash TEXT          NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'client'
                              CHECK (role IN ('admin', 'client')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- Tabla: products
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200)   NOT NULL,
  price         NUMERIC(10,2)  NOT NULL CHECK (price > 0),
  description   TEXT,
  stock         INTEGER        NOT NULL DEFAULT 0,
  is_active     BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- Trigger: actualiza updated_at automáticamente
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────
-- Seed: productos de ejemplo
-- ──────────────────────────────────────────
INSERT INTO products (name, price, description, stock) VALUES
  ('Vaso de vidrio reciclado 350ml', 12500, 'Vaso artesanal de vidrio 100% reciclado', 80),
  ('Plato biodegradable 25cm',       8900,  'Plato de fibra de caña de azúcar compostable', 120),
  ('Utensilio bambú set x3',         15000, 'Cuchara, tenedor y cuchillo de bambú certificado', 60)
ON CONFLICT DO NOTHING;

-- Nota: el usuario admin se crea desde la app con POST /auth/signup
-- y luego se actualiza manualmente el rol:
--   UPDATE users SET role = 'admin' WHERE email = 'admin@ecohome.com';
