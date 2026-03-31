const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'events',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mocking query method to match pg's result structure for easier migration
const originalQuery = pool.query.bind(pool);
pool.query = async (sql, values) => {
  const [rows] = await originalQuery(sql, values);
  return { rows };
};

module.exports = pool;
