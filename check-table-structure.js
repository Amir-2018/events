require('dotenv').config();
const pool = require('./db/pool');

async function checkTableStructure() {
  console.log('🔍 Vérification de la structure de la table biens...\n');

  try {
    // 1. Vérifier si la table existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'biens'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La table biens n\'existe pas!');
      console.log('💡 Exécutez: node db/migrate.js');
      return;
    }

    console.log('✅ Table biens existe');

    // 2. Afficher la structure complète
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'biens'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Structure de la table biens:');
    console.log('-'.repeat(80));
    console.log('| Colonne              | Type            | Nullable | Défaut');
    console.log('-'.repeat(80));
    
    columns.rows.forEach(col => {
      let type = col.data_type;
      if (col.character_maximum_length) {
        type += `(${col.character_maximum_length})`;
      } else if (col.numeric_precision && col.numeric_scale) {
        type += `(${col.numeric_precision},${col.numeric_scale})`;
      }
      
      const nullable = col.is_nullable === 'YES' ? 'Oui' : 'Non';
      const defaultVal = col.column_default || '-';
      
      console.log(`| ${col.column_name.padEnd(20)} | ${type.padEnd(15)} | ${nullable.padEnd(8)} | ${defaultVal}`);
    });
    console.log('-'.repeat(80));

    // 3. Vérifier les colonnes requises
    const requiredColumns = [
      'id', 'nom', 'type', 'adresse', 'description', 
      'latitude', 'longitude', 'horaire_ouverture', 
      'horaire_fermeture', 'jours_ouverture', 
      'created_at', 'updated_at'
    ];

    const existingColumns = columns.rows.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    console.log('\n🔍 Vérification des colonnes requises:');
    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes requises sont présentes');
    } else {
      console.log('❌ Colonnes manquantes:');
      missingColumns.forEach(col => {
        console.log(`   - ${col}`);
      });
      console.log('\n💡 Exécutez: node db/migrate-gps.js');
    }

    // 4. Compter les biens existants
    const count = await pool.query('SELECT COUNT(*) as total FROM biens');
    console.log(`\n📊 Nombre de biens existants: ${count.rows[0].total}`);

    // 5. Afficher quelques exemples
    if (parseInt(count.rows[0].total) > 0) {
      const examples = await pool.query('SELECT nom, type, latitude, longitude FROM biens LIMIT 3');
      console.log('\n📝 Exemples de biens:');
      examples.rows.forEach(bien => {
        const gps = bien.latitude && bien.longitude ? `GPS: ${bien.latitude}, ${bien.longitude}` : 'Pas de GPS';
        console.log(`   - ${bien.nom} (${bien.type}) - ${gps}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Détails:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();