require('dotenv').config();
const pool = require('./db/pool');

async function quickDebug() {
  console.log('🔍 Diagnostic rapide des biens...\n');

  try {
    // 1. Vérifier la connexion
    await pool.query('SELECT 1');
    console.log('✅ Connexion DB OK');

    // 2. Vérifier si la table biens existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'biens'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table biens n\'existe pas!');
      console.log('💡 Exécutez: node db/migrate.js');
      return;
    }
    console.log('✅ Table biens existe');

    // 3. Vérifier la structure de la table
    console.log('\n🔍 Vérification de la structure...');
    const columns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'biens'
    `);
    
    const existingColumns = columns.rows.map(col => col.column_name);
    const requiredColumns = ['latitude', 'longitude', 'horaire_ouverture', 'horaire_fermeture', 'jours_ouverture'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Colonnes manquantes:', missingColumns.join(', '));
      console.log('💡 Exécutez: node db/migrate-gps.js');
      return;
    }
    console.log('✅ Structure de table complète');

    // 4. Test d'insertion directe (sans GPS d'abord)
    console.log('\n🧪 Test d\'insertion simple...');
    const insertResult = await pool.query(`
      INSERT INTO biens (nom, type) 
      VALUES ('Test Debug Simple', 'Stade') 
      RETURNING *
    `);
    console.log('✅ Insertion simple OK:', insertResult.rows[0].nom);

    // 5. Test d'insertion avec GPS
    console.log('\n🧪 Test d\'insertion avec GPS...');
    const insertGPSResult = await pool.query(`
      INSERT INTO biens (nom, type, latitude, longitude, horaire_ouverture, horaire_fermeture) 
      VALUES ('Test Debug GPS', 'Salle', 48.8566, 2.3522, '08:00', '20:00') 
      RETURNING *
    `);
    console.log('✅ Insertion GPS OK:', insertGPSResult.rows[0].nom);

    // 6. Nettoyer
    await pool.query('DELETE FROM biens WHERE nom LIKE $1', ['Test Debug%']);
    console.log('✅ Nettoyage OK');

    // 7. Tester le modèle
    console.log('\n🧪 Test du modèle Property...');
    const Property = require('./models/property.model');
    const testProp = await Property.create({
      nom: 'Test Modèle Debug',
      type: 'Salle',
      latitude: 48.8566,
      longitude: 2.3522
    });
    console.log('✅ Modèle OK:', testProp.nom);
    
    await Property.delete(testProp.id);
    console.log('✅ Suppression modèle OK');

    console.log('\n🎉 Tout fonctionne côté backend!');
    console.log('\n💡 Si les biens ne s\'insèrent pas depuis le frontend:');
    console.log('   1. Vérifiez la console du navigateur (F12)');
    console.log('   2. Vérifiez les logs du serveur');
    console.log('   3. Testez l\'API avec: node test-api-properties.js');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n💡 SOLUTION: Colonnes manquantes détectées');
      console.log('   Exécutez: node db/migrate-gps.js');
    } else {
      console.error('Stack:', error.stack);
    }
  } finally {
    await pool.end();
  }
}

quickDebug();