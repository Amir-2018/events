const pool = require('./pool');

async function migrateReclamationsImages() {
  console.log('--- Migration des images et statuts pour reclamations ---');
  
  try {
    // Vérifier si la colonne image existe déjà
    const columnsResult = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reclamations' 
      AND COLUMN_NAME = 'image'
    `);
    
    if (columnsResult.rows.length === 0) {
      // Ajouter la colonne image
      await pool.query(`
        ALTER TABLE reclamations 
        ADD COLUMN image LONGTEXT AFTER description
      `);
      console.log('Colonne image ajoutée');
    } else {
      console.log('Colonne image existe déjà');
    }
    
    // Mettre à jour l'enum des statuts pour inclure 'Résolu' et 'Rejeté'
    await pool.query(`
      ALTER TABLE reclamations 
      MODIFY COLUMN status ENUM('En attente', 'En cours', 'Terminé', 'Résolu', 'Rejeté') DEFAULT 'En attente'
    `);
    console.log('Statuts mis à jour');
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
  }
  
  console.log('--- Migration terminée ---');
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
  migrateReclamationsImages()
    .then(() => {
      console.log('Migration réussie');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = migrateReclamationsImages;