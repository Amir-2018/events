const pool = require('./pool');

function toSqlType(dataType) {
  if (dataType === 'uuid') return 'UUID';
  if (dataType === 'bigint') return 'BIGINT';
  if (dataType === 'integer') return 'INT';
  return 'TEXT';
}

async function getColumnType({ tableName, columnName }) {
  const result = await pool.query(
    `
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
    `,
    [tableName, columnName]
  );
  return result.rows[0]?.data_type || null;
}

async function initDb() {
  // Needed for DEFAULT gen_random_uuid() on some schemas.
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'password_hash'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'password'
      ) THEN
        ALTER TABLE clients RENAME COLUMN password_hash TO password;
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nom VARCHAR(255) NOT NULL,
      date TIMESTAMP,
      image TEXT,
      adresse TEXT,
      type_evenement_id UUID,
      bien_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Créer la table des types d'événements
  await pool.query(`
    CREATE TABLE IF NOT EXISTS types_evenements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nom VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Créer la table des biens
  await pool.query(`
    CREATE TABLE IF NOT EXISTS biens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nom VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      adresse TEXT,
      description TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      horaire_ouverture TIME,
      horaire_fermeture TIME,
      jours_ouverture VARCHAR(50) DEFAULT 'Lundi-Dimanche',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const clientIdType = toSqlType(
    (await getColumnType({ tableName: 'clients', columnName: 'id' })) || 'uuid'
  );
  const eventIdType = toSqlType(
    (await getColumnType({ tableName: 'events', columnName: 'id' })) || 'uuid'
  );

  // Create join table (no FKs) first.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      event_id ${eventIdType} NOT NULL,
      client_id ${clientIdType} NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (event_id, client_id)
    );
  `);

  // If event_registrations exists with incompatible types, recreate it when empty.
  const erCount = await pool.query('SELECT COUNT(*)::int AS n FROM event_registrations');
  const isEmpty = erCount.rows[0]?.n === 0;

  const erClientIdType = toSqlType(
    (await getColumnType({ tableName: 'event_registrations', columnName: 'client_id' })) || clientIdType
  );
  const erEventIdType = toSqlType(
    (await getColumnType({ tableName: 'event_registrations', columnName: 'event_id' })) || eventIdType
  );

  if (isEmpty && (erClientIdType !== clientIdType || erEventIdType !== eventIdType)) {
    await pool.query('DROP TABLE event_registrations');
    await pool.query(`
      CREATE TABLE event_registrations (
        event_id ${eventIdType} NOT NULL,
        client_id ${clientIdType} NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (event_id, client_id)
      );
    `);
  }

  // Add FK constraints (idempotent).
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'event_registrations'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'fk_event_registrations_client'
      ) THEN
        ALTER TABLE event_registrations
          ADD CONSTRAINT fk_event_registrations_client
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'event_registrations'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'fk_event_registrations_event'
      ) THEN
        ALTER TABLE event_registrations
          ADD CONSTRAINT fk_event_registrations_event
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  // Ajouter les contraintes FK pour les nouvelles colonnes des événements
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'events'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'fk_events_type_evenement'
      ) THEN
        ALTER TABLE events
          ADD CONSTRAINT fk_events_type_evenement
          FOREIGN KEY (type_evenement_id) REFERENCES types_evenements(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'events'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'fk_events_bien'
      ) THEN
        ALTER TABLE events
          ADD CONSTRAINT fk_events_bien
          FOREIGN KEY (bien_id) REFERENCES biens(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);
}

module.exports = initDb;
