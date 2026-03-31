const pool = require('./db/pool');

async function addEmailToAdmin() {
  try {
    console.log('🔄 Ajout d\'un email à un utilisateur admin...');

    // Mettre à jour l'utilisateur admin 'mmmm' avec un email
    const result = await pool.query(
      'UPDATE users SET email = ? WHERE username = ?',
      ['admin.test@gmail.com', 'mmmm']
    );

    console.log(`✅ ${result.affectedRows} utilisateur mis à jour`);

    // Vérifier la mise à jour
    const checkResult = await pool.query(
      'SELECT username, nom, prenom, email FROM users WHERE username = ?',
      ['mmmm']
    );

    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      console.log(`✅ Utilisateur mis à jour: ${user.username} - Email: ${user.email}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

addEmailToAdmin();