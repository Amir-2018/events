const initDb = require('./db/init');
const seedData = require('./db/seed');

async function setupNewFeatures() {
  console.log('🚀 Configuration des nouvelles fonctionnalités...\n');

  try {
    // 1. Initialiser la base de données (créer les nouvelles tables)
    console.log('1️⃣ Initialisation de la base de données...');
    await initDb();
    console.log('✅ Base de données initialisée\n');

    // 2. Insérer les données de test
    console.log('2️⃣ Insertion des données de test...');
    await seedData();
    console.log('✅ Données de test insérées\n');

    console.log('🎉 Configuration terminée avec succès!');
    console.log('\n📋 Nouvelles fonctionnalités disponibles:');
    console.log('   • Gestion des types d\'événements');
    console.log('   • Gestion des biens (lieux)');
    console.log('   • Sélection de type et bien lors de la création d\'événement');
    console.log('   • Navigation par sections dans le sidebar');
    console.log('\n🌐 Démarrez le serveur avec: npm start');
    console.log('🖥️  Puis ouvrez: http://localhost:3000');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Exécuter la configuration
if (require.main === module) {
  setupNewFeatures();
}

module.exports = setupNewFeatures;