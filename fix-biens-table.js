require('dotenv').config();

console.log('🔧 RÉPARATION AUTOMATIQUE - TABLE BIENS');
console.log('=' .repeat(50));
console.log('');

async function fixBiensTable() {
  try {
    // 1. Vérifier la structure actuelle
    console.log('1️⃣ Diagnostic de la table biens...');
    const { execSync } = require('child_process');
    
    try {
      execSync('node check-table-structure.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Problème détecté avec la structure');
    }

    console.log('\n2️⃣ Application de la migration GPS...');
    
    // 2. Exécuter la migration GPS
    const migrateGPS = require('./db/migrate-gps');
    await migrateGPS();

    console.log('\n3️⃣ Vérification post-migration...');
    
    // 3. Test final
    const pool = require('./db/pool');
    
    const testResult = await pool.query(`
      INSERT INTO biens (nom, type, adresse, description, latitude, longitude, horaire_ouverture, horaire_fermeture, jours_ouverture) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [
      'Test Final Réparation',
      'Stade',
      '123 Rue Test Final',
      'Test après réparation',
      48.8566,
      2.3522,
      '08:00',
      '20:00',
      'Lundi-Dimanche'
    ]);
    
    console.log('✅ Test final réussi:', testResult.rows[0].nom);
    
    // Nettoyer
    await pool.query('DELETE FROM biens WHERE nom = $1', ['Test Final Réparation']);
    await pool.end();
    
    console.log('\n🎉 RÉPARATION TERMINÉE AVEC SUCCÈS!');
    console.log('');
    console.log('Vous pouvez maintenant:');
    console.log('1. Démarrer le serveur: npm start');
    console.log('2. Tester l\'API: node test-api-properties.js');
    console.log('3. Utiliser l\'interface web pour créer des biens');

  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error.message);
    console.error('');
    console.error('Solutions possibles:');
    console.error('1. Vérifiez la connexion à la base de données');
    console.error('2. Exécutez manuellement: node db/migrate-gps.js');
    console.error('3. Vérifiez les permissions de la base de données');
    process.exit(1);
  }
}

fixBiensTable();