const pool = require('./db/pool');

async function syncUsersClients() {
  console.log('🔄 Synchronisation users → clients...\n');

  try {
    // 1. Vérifier les tables
    console.log('1. Vérification des tables...');
    
    const [userColumns] = await pool.query(`SHOW COLUMNS FROM users`);
    const [clientColumns] = await pool.query(`SHOW COLUMNS FROM clients`);
    
    const userHasEmail = userColumns.some(col => col.Field === 'email');
    console.log(`   Table users - email: ${userHasEmail ? '✅' : '❌'}`);
    console.log(`   Table clients: ✅`);

    if (!userHasEmail) {
      console.log('\n⚠️  La table users n\'a pas de colonne email.');
      console.log('   Exécutez d\'abord: node fix-users-table.js');
      return;
    }

    // 2. Récupérer tous les utilisateurs
    console.log('\n2. Récupération des utilisateurs...');
    const [users] = await pool.query(`
      SELECT id, username, email, nom, prenom, role 
      FROM users 
      WHERE role IN ('client', 'admin', 'superadmin')
      AND email IS NOT NULL
    `);

    console.log(`   ${users.length} utilisateur(s) trouvé(s)`);

    if (users.length === 0) {
      console.log('\n📝 Création d\'un utilisateur de test...');
      
      const bcrypt = require('bcrypt');
      const { v4: uuidv4 } = require('uuid');
      
      const testUserId = uuidv4();
      const hashedPassword = await bcrypt.hash('password123', 10);

      await pool.query(`
        INSERT INTO users (id, username, email, password, nom, prenom, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        testUserId,
        'client.test',
        'client.test@example.com',
        hashedPassword,
        'Testeur',
        'Client',
        'client',
        'active'
      ]);

      console.log('   ✅ Utilisateur test créé:');
      console.log('      Email: client.test@example.com');
      console.log('      Password: password123');
      
      // Ajouter à la liste pour synchronisation
      users.push({
        id: testUserId,
        username: 'client.test',
        email: 'client.test@example.com',
        nom: 'Testeur',
        prenom: 'Client',
        role: 'client'
      });
    }

    // 3. Synchroniser avec la table clients
    console.log('\n3. Synchronisation avec la table clients...');
    
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Vérifier si le client existe déjà
        const [existingClient] = await pool.query(
          'SELECT id FROM clients WHERE id = ?', 
          [user.id]
        );

        if (existingClient.length === 0) {
          // Créer un nouvel enregistrement client
          await pool.query(`
            INSERT INTO clients (id, nom, prenom, email, tel, password)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            user.id,
            user.nom || 'Non renseigné',
            user.prenom || 'Non renseigné',
            user.email,
            'Non renseigné',
            'synced_from_users'
          ]);
          
          console.log(`   ✅ Créé: ${user.prenom} ${user.nom} (${user.email})`);
          created++;
        } else {
          // Mettre à jour les informations
          await pool.query(`
            UPDATE clients 
            SET nom = ?, prenom = ?, email = ?
            WHERE id = ?
          `, [
            user.nom || 'Non renseigné',
            user.prenom || 'Non renseigné',
            user.email,
            user.id
          ]);
          
          console.log(`   🔄 Mis à jour: ${user.prenom} ${user.nom}`);
          updated++;
        }
      } catch (userError) {
        console.log(`   ❌ Erreur pour ${user.email}: ${userError.message}`);
        skipped++;
      }
    }

    // 4. Résumé
    console.log('\n4. Résumé de la synchronisation:');
    console.log(`   ✅ Créés: ${created}`);
    console.log(`   🔄 Mis à jour: ${updated}`);
    console.log(`   ❌ Ignorés: ${skipped}`);

    // 5. Test de la synchronisation
    console.log('\n5. Test de la synchronisation...');
    const [syncedClients] = await pool.query(`
      SELECT c.*, u.role 
      FROM clients c
      LEFT JOIN users u ON c.id = u.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    console.log('   Derniers clients synchronisés:');
    syncedClients.forEach(client => {
      console.log(`   - ${client.prenom} ${client.nom} (${client.email}) - Rôle: ${client.role || 'N/A'}`);
    });

    console.log('\n✅ Synchronisation terminée!');
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Connectez-vous avec un compte utilisateur');
    console.log('2. Créez une réclamation sur /reclamations');
    console.log('3. Vérifiez qu\'elle apparaît avec les bonnes infos dans l\'admin');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    throw error;
  }
}

// Exécuter la synchronisation
syncUsersClients()
  .then(() => {
    console.log('\n🎉 Synchronisation complète!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });