const pool = require('./pool');

async function migrateReclamationsTable() {
  console.log('🔄 Migration de la table réclamations...');

  try {
    // Vérifier la structure actuelle de la table
    console.log('1. Vérification de la structure actuelle...');
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM reclamations
    `);
    
    const existingColumns = columns.map(col => col.Field);
    console.log('   Colonnes existantes:', existingColumns);

    // 2. Ajouter la colonne image si elle n'existe pas
    if (!existingColumns.includes('image')) {
      console.log('2. Ajout de la colonne image...');
      await pool.query(`
        ALTER TABLE reclamations 
        ADD COLUMN image LONGTEXT NULL
      `);
      console.log('   ✅ Colonne image ajoutée');
    } else {
      console.log('2. Colonne image déjà présente');
    }

    // 3. Vérifier et ajuster la colonne status si nécessaire
    const statusColumn = columns.find(col => col.Field === 'status');
    if (!statusColumn) {
      console.log('3. Ajout de la colonne status...');
      await pool.query(`
        ALTER TABLE reclamations 
        ADD COLUMN status ENUM('En attente', 'En cours', 'Terminé', 'Résolu', 'Rejeté') DEFAULT 'En attente'
      `);
      console.log('   ✅ Colonne status ajoutée');
    } else {
      console.log('3. Mise à jour de la colonne status...');
      await pool.query(`
        ALTER TABLE reclamations 
        MODIFY COLUMN status ENUM('En attente', 'En cours', 'Terminé', 'Résolu', 'Rejeté') DEFAULT 'En attente'
      `);
      console.log('   ✅ Colonne status mise à jour avec plus d\'options');
    }

    // 4. Modifier la contrainte pour rendre client_id optionnel
    console.log('4. Modification de la contrainte client_id...');
    
    // Supprimer l'ancienne contrainte si elle existe
    try {
      await pool.query(`
        ALTER TABLE reclamations 
        DROP FOREIGN KEY fk_reclamations_client
      `);
      console.log('   Ancienne contrainte supprimée');
    } catch (error) {
      console.log('   Aucune contrainte à supprimer');
    }

    // Modifier la colonne pour permettre NULL
    await pool.query(`
      ALTER TABLE reclamations 
      MODIFY COLUMN client_id VARCHAR(36) NULL
    `);

    // Recréer la contrainte avec ON DELETE SET NULL
    await pool.query(`
      ALTER TABLE reclamations 
      ADD CONSTRAINT fk_reclamations_client 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    `);
    console.log('   ✅ Contrainte client_id mise à jour');

    // 5. Vérifier la structure finale
    console.log('5. Vérification de la structure finale...');
    const [finalColumns] = await pool.query(`
      SHOW COLUMNS FROM reclamations
    `);
    
    console.log('\n📋 Structure finale de la table réclamations:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    throw error;
  }
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
  migrateReclamationsTable()
    .then(() => {
      console.log('🎉 Migration complète!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = { migrateReclamationsTable };