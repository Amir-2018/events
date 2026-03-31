const pool = require('./db/pool');

async function addPriceColumnToEvents() {
  try {
    console.log('Ajout de la colonne prix à la table events...');
    
    // Vérifier si la colonne existe déjà
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'events' 
      AND COLUMN_NAME = 'prix' 
      AND TABLE_SCHEMA = DATABASE()
    `;
    
    const columnExists = await pool.query(checkColumnQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ La colonne prix existe déjà');
      return;
    }
    
    // Ajouter la colonne prix
    const addColumnQuery = `
      ALTER TABLE events 
      ADD COLUMN prix DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Prix du ticket en euros (0.00 = gratuit)'
    `;
    
    await pool.query(addColumnQuery);
    console.log('✅ Colonne prix ajoutée avec succès');
    
    // Vérifier la structure mise à jour
    const describeQuery = 'DESCRIBE events';
    const result = await pool.query(describeQuery);
    
    console.log('\n📋 Structure mise à jour de la table events:');
    result.rows.forEach(row => {
      if (row.Field === 'prix') {
        console.log(`  ✨ ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : ''} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne prix:', error);
  } finally {
    process.exit(0);
  }
}

addPriceColumnToEvents();