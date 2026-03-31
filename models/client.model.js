const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, nom, prenom, email, tel, password FROM clients WHERE email = ?',
    [email]
  );
  return result.rows[0] || null;
}

async function create({ nom, prenom, email, tel, password }) {
  const id = uuidv4();
  await pool.query(
    'INSERT INTO clients (id, nom, prenom, email, tel, password) VALUES (?, ?, ?, ?, ?, ?)',
    [id, nom, prenom, email, tel, password]
  );
  return { id, nom, prenom, email, tel };
}

async function getById(id) {
  const result = await pool.query(
    'SELECT id, nom, prenom, email, tel FROM clients WHERE id = ?',
    [id]
  );
  return result.rows[0] || null;
}

async function getAllWithEvents() {
  const result = await pool.query(`
    SELECT 
      c.id, c.nom, c.prenom, c.email, c.tel, c.created_at,
      GROUP_CONCAT(
        CONCAT(
          '{"id":"', COALESCE(e.id, ''), 
          '","nom":"', COALESCE(e.nom, ''), 
          '","date":"', COALESCE(e.date, ''), 
          '"}'
        ) SEPARATOR '|||'
      ) as events_json
    FROM clients c
    LEFT JOIN event_registrations er ON c.id = er.client_id
    LEFT JOIN events e ON er.event_id = e.id
    GROUP BY c.id, c.nom, c.prenom, c.email, c.tel, c.created_at
    ORDER BY c.created_at DESC
  `);

  return result.rows.map(client => ({
    ...client,
    events: client.events_json ? 
      client.events_json.split('|||')
        .filter(eventStr => eventStr && eventStr !== '{"id":"","nom":"","date":""}')
        .map(eventStr => {
          try {
            return JSON.parse(eventStr);
          } catch (e) {
            return null;
          }
        })
        .filter(event => event && event.id) : []
  }));
}

async function getByIdWithEvents(id) {
  const clientResult = await pool.query(
    'SELECT id, nom, prenom, email, tel, created_at FROM clients WHERE id = ?',
    [id]
  );
  
  if (clientResult.rows.length === 0) {
    return null;
  }

  const client = clientResult.rows[0];

  const eventsResult = await pool.query(`
    SELECT e.id, e.nom, e.date
    FROM events e
    INNER JOIN event_registrations er ON e.id = er.event_id
    WHERE er.client_id = ?
    ORDER BY e.date DESC
  `, [id]);

  client.events = eventsResult.rows;
  return client;
}

async function update(id, { nom, prenom, email, tel }) {
  await pool.query(
    'UPDATE clients SET nom = ?, prenom = ?, email = ?, tel = ?, updated_at = NOW() WHERE id = ?',
    [nom, prenom, email, tel, id]
  );
  return { id, nom, prenom, email, tel };
}

async function deleteClient(id) {
  // Supprimer d'abord les inscriptions
  await pool.query('DELETE FROM event_registrations WHERE client_id = ?', [id]);
  
  // Puis supprimer le client
  await pool.query('DELETE FROM clients WHERE id = ?', [id]);
}

module.exports = {
  findByEmail,
  create,
  getById,
  getAllWithEvents,
  getByIdWithEvents,
  update,
  delete: deleteClient,
};
