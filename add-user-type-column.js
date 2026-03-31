const pool = require('./db/pool');

async function addUserTypeColumn() {
  try {
    console.log('🔄 Ajout de la colonne user_type à la table password_resets...');

    // Vérifier si la colonne existe déjà
    const checkColumn = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'password_resets' 
      AND COLUMN_NAME = 'user_type'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ La colonne user_type existe déjà');
      return;
    }

    // Ajouter la colonne user_type
    await pool.query(`
      ALTER TABLE password_resets 
      ADD COLUMN user_type ENUM('user', 'client') DEFAULT 'user' AFTER email
    `);

    console.log('✅ Colonne user_type ajoutée avec succès à la table password_resets');

    // Mettre à jour les enregistrements existants (par défaut 'user')
    const updateResult = await pool.query(`
      UPDATE password_resets 
      SET user_type = 'user' 
      WHERE user_type IS NULL
    `);

    console.log(`✅ ${updateResult.affectedRows} enregistrements mis à jour`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
  } finally {
    process.exit(0);
  }
}

addUserTypeColumn();