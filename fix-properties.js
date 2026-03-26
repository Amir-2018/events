require('dotenv').config();

console.log('🔧 DIAGNOSTIC ET RÉPARATION - SYSTÈME DE BIENS');
console.log('=' .repeat(60));
console.log('');

async function runDiagnostic() {
  const steps = [
    {
      name: '1. Base de données',
      test: async () => {
        const pool = require('./db/pool');
        await pool.query('SELECT 1');
        
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'biens'
          );
        `);
        
        if (!tableExists.rows[0].exists) {
          throw new Error('Table biens n\'existe pas');
        }
        
        // Test insertion
        const result = await pool.query(`
          INSERT INTO biens (nom, type) VALUES ('Test Fix', 'Stade') RETURNING id
        `);
        await pool.query('DELETE FROM biens WHERE id = $1', [result.rows[0].id]);
        await pool.end();
        
        return 'Table biens OK, insertion/suppression OK';
      },
      fix: 'Exécutez: node db/migrate.js'
    },
    {
      name: '2. Modèle Property',
      test: async () => {
        const Property = require('./models/property.model');
        const test = await Property.create({ nom: 'Test Modèle Fix', type: 'Salle' });
        await Property.delete(test.id);
        return 'Modèle Property OK';
      },
      fix: 'Vérifiez models/property.model.js'
    },
    {
      name: '3. Service PropertyService',
      test: async () => {
        const PropertyService = require('./services/propertyService');
        const test = await PropertyService.createProperty({ nom: 'Test Service Fix', type: 'École' });
        await PropertyService.deleteProperty(test.id);
        return 'Service PropertyService OK';
      },
      fix: 'Vérifiez services/propertyService.js'
    },
    {
      name: '4. API REST (nécessite serveur démarré)',
      test: async () => {
        const axios = require('axios');
        try {
          const response = await axios.get('http://localhost:3000/api/properties');
          return `API OK - ${response.data.data?.length || 0} bien(s)`;
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            throw new Error('Serveur non démarré');
          }
          throw error;
        }
      },
      fix: 'Démarrez le serveur: npm start'
    }
  ];

  let allPassed = true;

  for (const step of steps) {
    process.stdout.write(`${step.name}... `);
    
    try {
      const result = await step.test();
      console.log(`✅ ${result}`);
    } catch (error) {
      console.log(`❌ ${error.message}`);
      console.log(`   💡 Solution: ${step.fix}`);
      allPassed = false;
    }
  }

  console.log('');
  if (allPassed) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS!');
    console.log('');
    console.log('Le système de biens devrait fonctionner.');
    console.log('Si vous avez encore des problèmes:');
    console.log('1. Ouvrez http://localhost:3000');
    console.log('2. Allez dans la section "Biens"');
    console.log('3. Cliquez sur "🧪 Test API"');
    console.log('4. Regardez la console du navigateur (F12)');
  } else {
    console.log('❌ DES PROBLÈMES ONT ÉTÉ DÉTECTÉS');
    console.log('');
    console.log('Suivez les solutions proposées ci-dessus.');
    console.log('Puis relancez: node fix-properties.js');
  }
}

// Instructions détaillées
function showDetailedInstructions() {
  console.log('📋 INSTRUCTIONS DÉTAILLÉES');
  console.log('=' .repeat(60));
  console.log('');
  console.log('ÉTAPE 1: Vérifier la base de données');
  console.log('  node quick-debug.js');
  console.log('');
  console.log('ÉTAPE 2: Démarrer le serveur');
  console.log('  npm start');
  console.log('');
  console.log('ÉTAPE 3: Tester l\'API (dans un autre terminal)');
  console.log('  node test-api-properties.js');
  console.log('');
  console.log('ÉTAPE 4: Tester le frontend');
  console.log('  1. Ouvrir http://localhost:3000');
  console.log('  2. Aller dans "Biens"');
  console.log('  3. Cliquer "🧪 Test API"');
  console.log('  4. Ouvrir la console (F12)');
  console.log('');
  console.log('ÉTAPE 5: Créer un bien complet');
  console.log('  1. Cliquer "Nouveau bien"');
  console.log('  2. Remplir: Nom="Test" Type="Stade"');
  console.log('  3. Cliquer "Créer"');
  console.log('  4. Vérifier les logs dans la console');
  console.log('');
  console.log('PROBLÈMES COURANTS:');
  console.log('  - Table manquante → node db/migrate.js');
  console.log('  - Serveur arrêté → npm start');
  console.log('  - Erreur CORS → Vérifier les ports');
  console.log('  - Validation → Vérifier nom + type requis');
  console.log('');
}

// Exécution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showDetailedInstructions();
  process.exit(0);
}

runDiagnostic()
  .then(() => {
    console.log('');
    console.log('Pour plus d\'aide: node fix-properties.js --help');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur lors du diagnostic:', error.message);
    process.exit(1);
  });