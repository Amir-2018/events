const pool = require('./pool');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function initDb() {
  console.log('--- Initializing MySQL Database ---');

  // Clients table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id VARCHAR(36) PRIMARY KEY,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      tel TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Roles table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(36) PRIMARY KEY,
      nom VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      nom TEXT,
      prenom TEXT,
      role_id VARCHAR(36),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // Event Types table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS types_evenements (
      id VARCHAR(36) PRIMARY KEY,
      nom VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Bien Types table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS type_biens (
      id VARCHAR(36) PRIMARY KEY,
      nom VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Biens table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS biens (
      id VARCHAR(36) PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      type_bien_id VARCHAR(36),
      adresse TEXT,
      description TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      horaire_ouverture TIME,
      horaire_fermeture TIME,
      jours_ouverture VARCHAR(50) DEFAULT 'Lundi-Dimanche',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_biens_type FOREIGN KEY (type_bien_id) REFERENCES type_biens(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // Events table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(36) PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      date DATETIME,
      date_fin DATETIME,
      image LONGTEXT,
      adresse TEXT,
      type_evenement_id VARCHAR(36),
      bien_id VARCHAR(36),
      max_participants INT DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_events_type FOREIGN KEY (type_evenement_id) REFERENCES types_evenements(id) ON DELETE SET NULL,
      CONSTRAINT fk_events_bien FOREIGN KEY (bien_id) REFERENCES biens(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // Event Souvenirs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_souvenirs (
      id VARCHAR(36) PRIMARY KEY,
      event_id VARCHAR(36),
      url LONGTEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_souvenirs_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Event Registrations (Join table)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      event_id VARCHAR(36),
      client_id VARCHAR(36),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (event_id, client_id),
      CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      CONSTRAINT fk_reg_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Seed Roles
  const superAdminRoleId = uuidv4();
  const adminRoleId = uuidv4();

  // We use standard INSERT IGNORE or check existence for seeding
  const { rows: existingRoles } = await pool.query('SELECT * FROM roles');
  if (existingRoles.length === 0) {
    await pool.query('INSERT INTO roles (id, nom) VALUES (?, ?), (?, ?)', [
      superAdminRoleId, 'superadmin',
      adminRoleId, 'admin'
    ]);
  }

  // Reclamations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reclamations (
      id VARCHAR(36) PRIMARY KEY,
      client_id VARCHAR(36),
      sujet VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image LONGTEXT,
      status ENUM('En attente', 'En cours', 'Terminé', 'Résolu', 'Rejeté') DEFAULT 'En attente',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_reclamations_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  // Seed Users
  const { rows: existingUsers } = await pool.query('SELECT * FROM users WHERE username = ?', ['superadmin']);
  if (existingUsers.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const superPassword = await bcrypt.hash('superadmin', salt);
    const adminPassword = await bcrypt.hash('admin', salt);

    const { rows: superRoleRows } = await pool.query('SELECT id FROM roles WHERE nom = ?', ['superadmin']);
    const { rows: adminRoleRows } = await pool.query('SELECT id FROM roles WHERE nom = ?', ['admin']);
    const superRole = superRoleRows[0];
    const adminRole = adminRoleRows[0];

    if (superRole.length > 0) {
      await pool.query('INSERT INTO users (id, username, password, nom, prenom, role_id) VALUES (?, ?, ?, ?, ?, ?)', [
        uuidv4(), 'superadmin', superPassword, 'Admin', 'Super', superRole[0].id
      ]);
    }
    if (adminRole.length > 0) {
      await pool.query('INSERT INTO users (id, username, password, nom, prenom, role_id) VALUES (?, ?, ?, ?, ?, ?)', [
        uuidv4(), 'admin', adminPassword, 'Societé', 'Administrateur', adminRole[0].id
      ]);
    }
  }

  console.log('--- Database Initialization Complete ---');
}

module.exports = initDb;
