require('dotenv').config();

async function runCompleteTest() {
  console.log('🚀 Test complet du système de biens\n');
  console.log('=' .repeat(50));

  // 1. Test de la base de données
  console.log('\n📊 ÉTAPE 1: Test de la base de données');
  console.log('-'.repeat(30));
  
  try {
    const { testProperties } = require('./debug-properties');
    await testProperties();
  } catch (error) {
    console.error('❌ Erreur base de données:', error.message);
    return false;
  }

  // 2. Test de l'API (nécessite que le serveur soit démarré)
  console.log('\n🌐 ÉTAPE 2: Test de l\'API REST');
  console.log('-'.repeat(30));
  
  try {
    const { testPropertiesAPI } = require('./test-api-properties');
    await testPropertiesAPI();
  } catch (error) {
    console.error('❌ Erreur API:', error.message);
    console.log('💡 Assurez-vous que le serveur est démarré avec: npm start');
    return false;
  }

  console.log('\n✨ Tous les tests sont passés!');
  return true;
}

// Instructions pour l'utilisateur
function showInstructions() {
  console.log('📋 INSTRUCTIONS DE DÉBOGAGE');
  console.log('=' .repeat(50));
  console.log('');
  console.log('1. 🗄️  Test de la base de données:');
  console.log('   node debug-properties.js');
  console.log('');
  console.log('2. 🚀 Démarrer le serveur:');
  console.log('   npm start');
  console.log('');
  console.log('3. 🌐 Test de l\'API (dans un autre terminal):');
  console.log('   node test-api-properties.js');
  console.log('');
  console.log('4. 🖥️  Test du frontend:');
  console.log('   - Ouvrir http://localhost:3000 dans le navigateur');
  console.log('   - Aller dans la section "Biens"');
  console.log('   - Ouvrir les outils de développement (F12)');
  console.log('   - Regarder la console pour les logs de débogage');
  console.log('   - Essayer de créer un bien');
  console.log('');
  console.log('5. 🔍 Vérifications à faire:');
  console.log('   - La table "biens" existe-t-elle?');
  console.log('   - Le serveur répond-il sur /api/properties?');
  console.log('   - Y a-t-il des erreurs dans la console du navigateur?');
  console.log('   - Y a-t-il des erreurs dans les logs du serveur?');
  console.log('');
  console.log('6. 🐛 Problèmes courants:');
  console.log('   - Base de données non initialisée: node db/migrate.js');
  console.log('   - Serveur non démarré: npm start');
  console.log('   - Erreur de CORS: vérifier les headers');
  console.log('   - Erreur de validation: vérifier les données envoyées');
  console.log('');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showInstructions();
    process.exit(0);
  }

  if (args.includes('--instructions')) {
    showInstructions();
    process.exit(0);
  }

  runCompleteTest()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Système de biens fonctionnel!');
      } else {
        console.log('\n❌ Des problèmes ont été détectés.');
        console.log('Exécutez: node test-complete-properties.js --instructions');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Erreur lors des tests:', error);
      console.log('\nExécutez: node test-complete-properties.js --instructions');
      process.exit(1);
    });
}

module.exports = { runCompleteTest, showInstructions };