const pool = require('../db/pool');

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, nom, prenom, email, tel, password FROM clients WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function create({ nom, prenom, email, tel, password }) {
  const result = await pool.query(
    'INSERT INTO clients (nom, prenom, email, tel, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, prenom, email, tel',
    [nom, prenom, email, tel, password]
  );
  return result.rows[0];
}

async function getById(id) {
  const result = await pool.query(
    'SELECT id, nom, prenom, email, tel FROM clients WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  create,
  getById,
};
