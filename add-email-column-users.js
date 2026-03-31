const pool = require('./db/pool');

async function addEmailColumnToUsers() {
  try {
    console.log('🔧 Ajout de la colonne email à la table users...');
    
    // Ajouter la colonne email
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN email VARCHAR(255) NULL
    `);
    
    console.log('✅ Colonne email ajoutée avec succès à la table users');
    
    // Vérifier que la colonne a été ajoutée
    const { rows: columns } = await pool.query('DESCRIBE users');
    const emailColumn = columns.find(col => col.Field === 'email');
    
    if (emailColumn) {
      console.log(`✅ Vérification: colonne email créée (${emailColumn.Type}, ${emailColumn.Null === 'YES' ? 'nullable' : 'not null'})`);
    }
    
    console.log('\n📋 Structure mise à jour de la table users:');
    columns.forEach(column => {
      const marker = column.Field === 'email' ? ' 🆕' : '';
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''}${marker}`);
    });
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  La colonne email existe déjà dans la table users');
    } else {
      console.error('❌ Erreur lors de l\'ajout de la colonne email:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

addEmailColumnToUsers();