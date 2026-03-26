require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testPropertiesAPI() {
  console.log('🧪 Test de l\'API des biens...\n');

  try {
    // Test 1: Vérifier que le serveur répond
    console.log('1️⃣ Test de connexion au serveur...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Serveur accessible:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('Assurez-vous que le serveur est démarré avec: npm start');
      return;
    }

    // Test 2: Récupérer tous les biens
    console.log('\n2️⃣ Test GET /api/properties...');
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/api/properties`);
      console.log('✅ GET réussi, statut:', getResponse.status);
      console.log('Nombre de biens:', getResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Erreur GET:', error.response?.status, error.response?.data || error.message);
    }

    // Test 3: Créer un bien
    console.log('\n3️⃣ Test POST /api/properties...');
    const testProperty = {
      nom: 'Test API Bien',
      type: 'Stade',
      adresse: '123 Rue Test API',
      description: 'Bien créé via test API',
      latitude: 48.8566,
      longitude: 2.3522,
      horaire_ouverture: '08:00',
      horaire_fermeture: '20:00',
      jours_ouverture: 'Lundi-Vendredi'
    };

    let createdPropertyId = null;
    try {
      const postResponse = await axios.post(`${API_BASE_URL}/api/properties`, testProperty);
      console.log('✅ POST réussi, statut:', postResponse.status);
      console.log('Bien créé:', postResponse.data.data?.nom);
      createdPropertyId = postResponse.data.data?.id;
    } catch (error) {
      console.log('❌ Erreur POST:', error.response?.status);
      console.log('Message d\'erreur:', error.response?.data?.message || error.message);
      console.log('Données envoyées:', testProperty);
      
      if (error.response?.data) {
        console.log('Réponse complète:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 4: Récupérer le bien créé
    if (createdPropertyId) {
      console.log('\n4️⃣ Test GET /api/properties/:id...');
      try {
        const getByIdResponse = await axios.get(`${API_BASE_URL}/api/properties/${createdPropertyId}`);
        console.log('✅ GET by ID réussi:', getByIdResponse.data.data?.nom);
      } catch (error) {
        console.log('❌ Erreur GET by ID:', error.response?.status, error.response?.data || error.message);
      }

      // Test 5: Modifier le bien
      console.log('\n5️⃣ Test PUT /api/properties/:id...');
      try {
        const updatedData = { ...testProperty, nom: 'Test API Bien - Modifié' };
        const putResponse = await axios.put(`${API_BASE_URL}/api/properties/${createdPropertyId}`, updatedData);
        console.log('✅ PUT réussi:', putResponse.data.data?.nom);
      } catch (error) {
        console.log('❌ Erreur PUT:', error.response?.status, error.response?.data || error.message);
      }

      // Test 6: Supprimer le bien
      console.log('\n6️⃣ Test DELETE /api/properties/:id...');
      try {
        const deleteResponse = await axios.delete(`${API_BASE_URL}/api/properties/${createdPropertyId}`);
        console.log('✅ DELETE réussi, statut:', deleteResponse.status);
      } catch (error) {
        console.log('❌ Erreur DELETE:', error.response?.status, error.response?.data || error.message);
      }
    }

    // Test 7: Vérifier les routes disponibles
    console.log('\n7️⃣ Test des routes disponibles...');
    try {
      const routesResponse = await axios.get(`${API_BASE_URL}/`);
      console.log('✅ Routes disponibles:', Object.keys(routesResponse.data.routes || {}));
    } catch (error) {
      console.log('❌ Erreur routes:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test avec données invalides
async function testValidationAPI() {
  console.log('\n🔍 Test de validation API...\n');

  const invalidTests = [
    {
      name: 'Sans nom',
      data: { type: 'Stade' }
    },
    {
      name: 'Sans type',
      data: { nom: 'Test' }
    },
    {
      name: 'Latitude invalide',
      data: { nom: 'Test', type: 'Stade', latitude: 200 }
    },
    {
      name: 'Longitude invalide',
      data: { nom: 'Test', type: 'Stade', longitude: 200 }
    }
  ];

  for (const test of invalidTests) {
    console.log(`Test: ${test.name}`);
    try {
      await axios.post(`${API_BASE_URL}/api/properties`, test.data);
      console.log('❌ Devrait échouer mais a réussi');
    } catch (error) {
      console.log('✅ Validation correcte:', error.response?.data?.message || 'Erreur de validation');
    }
  }
}

// Exécuter les tests
if (require.main === module) {
  testPropertiesAPI()
    .then(() => testValidationAPI())
    .then(() => {
      console.log('\n✨ Tests API terminés!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec des tests API:', error);
      process.exit(1);
    });
}

module.exports = { testPropertiesAPI, testValidationAPI };