const pool = require('./pool');

async function migrateReclamationsConstraint() {
  console.log('--- Mise à jour de la contrainte de clé étrangère pour reclamations ---');
  
  try {
    // Supprimer l'ancienne contrainte
    await pool.query(`
      ALTER TABLE reclamations 
      DROP FOREIGN KEY fk_reclamations_client
    `);
    console.log('Ancienne contrainte supprimée');
    
    // Ajouter la nouvelle contrainte avec ON DELETE SET NULL
    await pool.query(`
      ALTER TABLE reclamations 
      ADD CONSTRAINT fk_reclamations_client 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    `);
    console.log('Nouvelle contrainte ajoutée avec ON DELETE SET NULL');
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
    
    // Si la contrainte n'existe pas, essayer de l'ajouter directement
    if (error.message.includes("check that column/key exists")) {
      try {
        await pool.query(`
          ALTER TABLE reclamations 
          ADD CONSTRAINT fk_reclamations_client 
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
        `);
        console.log('Contrainte ajoutée directement');
      } catch (addError) {
        console.error('Erreur lors de l\'ajout de la contrainte:', addError.message);
      }
    }
  }
  
  console.log('--- Migration terminée ---');
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
  migrateReclamationsConstraint()
    .then(() => {
      console.log('Migration réussie');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = migrateReclamationsConstraint;