const { Pool } = require('pg');

const {
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGPORT,
  PGSSLMODE,
  PGSSL,
} = process.env;

const sslDisabled =
  PGSSL === 'false' ||
  PGSSLMODE === 'disable' ||
  PGSSLMODE === 'false' ||
  PGSSLMODE === '0';

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: PGPORT ? Number(PGPORT) : 5432,
  ssl: sslDisabled ? false : { rejectUnauthorized: false },
});

module.exports = pool;
