require('dotenv').config();
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrateGPS() {
  console.log('🔄 Migration GPS - Ajout des colonnes manquantes...\n');
  
  try {
    // 1. Vérifier la structure actuelle
    console.log('1️⃣ Vérification de la structure actuelle...');
    const currentColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'biens'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colonnes actuelles:');
    currentColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // 2. Exécuter la migration
    console.log('\n2️⃣ Exécution de la migration...');
    const migrationPath = path.join(__dirname, 'add-gps-columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    console.log('✅ Migration exécutée avec succès!');

    // 3. Vérifier la nouvelle structure
    console.log('\n3️⃣ Vérification de la nouvelle structure...');
    const newColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'biens'
      ORDER BY ordinal_position;
    `);
    
    console.log('Nouvelle structure:');
    newColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 4. Test d'insertion avec les nouvelles colonnes
    console.log('\n4️⃣ Test d\'insertion avec GPS...');
    const testResult = await pool.query(`
      INSERT INTO biens (nom, type, adresse, description, latitude, longitude, horaire_ouverture, horaire_fermeture, jours_ouverture) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [
      'Test GPS Migration',
      'Stade',
      '123 Rue Test GPS',
      'Test avec coordonnées GPS',
      48.8566,
      2.3522,
      '08:00',
      '20:00',
      'Lundi-Vendredi'
    ]);
    
    console.log('✅ Test d\'insertion réussi:', testResult.rows[0].nom);
    
    // Nettoyer le test
    await pool.query('DELETE FROM biens WHERE nom = $1', ['Test GPS Migration']);
    console.log('✅ Nettoyage effectué');

    console.log('\n🎉 Migration GPS terminée avec succès!');
    console.log('Vous pouvez maintenant créer des biens avec coordonnées GPS.');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('Détails:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateGPS()
    .then(() => {
      console.log('\n✨ Migration terminée!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = migrateGPS;