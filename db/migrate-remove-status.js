const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function removeStatusColumns() {
  try {
    console.log('🔄 Début de la migration - Suppression des colonnes status...');
    
    // Lire le script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'remove-status-columns.sql'), 'utf8');
    
    // Diviser le script en requêtes individuelles
    const queries = sqlScript
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    // Exécuter chaque requête
    for (const query of queries) {
      if (query.toLowerCase().includes('describe')) {
        console.log(`\n📋 Exécution: ${query}`);
        const result = await pool.query(query);
        console.table(result.rows);
      } else {
        console.log(`✅ Exécution: ${query}`);
        await pool.query(query);
      }
    }
    
    console.log('\n✅ Migration terminée avec succès !');
    console.log('📝 Les colonnes status et description ont été supprimées des tables type_biens et types_evenements');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter la migration
removeStatusColumns();