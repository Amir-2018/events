const pool = require('./pool');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id BIGSERIAL PRIMARY KEY,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      tel TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Backward-compat: if an older version created password_hash, rename it.
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'password_hash'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'password'
      ) THEN
        ALTER TABLE clients RENAME COLUMN password_hash TO password;
      END IF;
    END $$;
  `);
}

module.exports = initDb;
