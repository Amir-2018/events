const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testNewFeatures() {
  console.log('🧪 Test des nouvelles fonctionnalités...\n');

  try {
    // Test 1: Créer un type d'événement
    console.log('1️⃣ Test création type d\'événement...');
    const eventTypeResponse = await axios.post(`${API_BASE}/event-types`, {
      nom: 'Test Conférence',
      description: 'Type de test pour les conférences'
    });
    console.log('✅ Type d\'événement créé:', eventTypeResponse.data.data.nom);
    const eventTypeId = eventTypeResponse.data.data.id;

    // Test 2: Créer un bien
    console.log('\n2️⃣ Test création bien...');
    const propertyResponse = await axios.post(`${API_BASE}/properties`, {
      nom: 'Salle de Test',
      type: 'Salle',
      adresse: '123 Rue de Test',
      description: 'Salle de test pour les événements'
    });
    console.log('✅ Bien créé:', propertyResponse.data.data.nom);
    const propertyId = propertyResponse.data.data.id;

    // Test 3: Créer un événement avec type et bien
    console.log('\n3️⃣ Test création événement avec type et bien...');
    const eventResponse = await axios.post(`${API_BASE}/events`, {
      nom: 'Événement de Test',
      date: new Date().toISOString(),
      adresse: 'Adresse de test',
      type_evenement_id: eventTypeId,
      bien_id: propertyId
    });
    console.log('✅ Événement créé:', eventResponse.data.data.nom);

    // Test 4: Récupérer tous les événements avec les nouvelles données
    console.log('\n4️⃣ Test récupération événements...');
    const eventsResponse = await axios.get(`${API_BASE}/events`);
    const event = eventsResponse.data.data.find(e => e.id === eventResponse.data.data.id);
    
    if (event) {
      console.log('✅ Événement récupéré avec succès:');
      console.log('   - Nom:', event.nom);
      console.log('   - Type:', event.type_evenement_nom);
      console.log('   - Bien:', event.bien_nom, `(${event.bien_type})`);
    }

    // Test 5: Récupérer les listes
    console.log('\n5️⃣ Test récupération listes...');
    const [typesResponse, propertiesResponse] = await Promise.all([
      axios.get(`${API_BASE}/event-types`),
      axios.get(`${API_BASE}/properties`)
    ]);
    
    console.log('✅ Types d\'événements:', typesResponse.data.data.length);
    console.log('✅ Biens:', propertiesResponse.data.data.length);

    console.log('\n🎉 Tous les tests sont passés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
  }
}

// Exécuter les tests si le serveur est démarré
if (require.main === module) {
  testNewFeatures();
}

module.exports = testNewFeatures;