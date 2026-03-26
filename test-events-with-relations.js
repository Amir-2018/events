require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testEventsWithRelations() {
  console.log('🧪 Test des événements avec types et biens...\n');

  try {
    // 1. Vérifier que le serveur répond
    console.log('1️⃣ Test de connexion au serveur...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Serveur accessible:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('Assurez-vous que le serveur est démarré avec: npm start');
      return;
    }

    // 2. Récupérer les types d'événements
    console.log('\n2️⃣ Récupération des types d\'événements...');
    let eventTypes = [];
    try {
      const typesResponse = await axios.get(`${API_BASE_URL}/api/event-types`);
      eventTypes = typesResponse.data.data;
      console.log(`✅ ${eventTypes.length} type(s) d'événement trouvé(s)`);
      if (eventTypes.length > 0) {
        console.log('   Exemples:', eventTypes.slice(0, 3).map(t => t.nom).join(', '));
      }
    } catch (error) {
      console.log('❌ Erreur types:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 3. Récupérer les biens
    console.log('\n3️⃣ Récupération des biens...');
    let properties = [];
    try {
      const propertiesResponse = await axios.get(`${API_BASE_URL}/api/properties`);
      properties = propertiesResponse.data.data;
      console.log(`✅ ${properties.length} bien(s) trouvé(s)`);
      if (properties.length > 0) {
        console.log('   Exemples:', properties.slice(0, 3).map(p => `${p.nom} (${p.type})`).join(', '));
      }
    } catch (error) {
      console.log('❌ Erreur biens:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 4. Créer un événement avec type et bien
    console.log('\n4️⃣ Création d\'un événement avec type et bien...');
    const testEvent = {
      nom: 'Test Événement Complet',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
      adresse: 'Adresse test événement',
      type_evenement_id: eventTypes.length > 0 ? eventTypes[0].id : null,
      bien_id: properties.length > 0 ? properties[0].id : null
    };

    let createdEventId = null;
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/events`, testEvent);
      console.log('✅ Événement créé:', createResponse.data.data.nom);
      console.log('   Type:', testEvent.type_evenement_id ? 'Associé' : 'Non associé');
      console.log('   Bien:', testEvent.bien_id ? 'Associé' : 'Non associé');
      createdEventId = createResponse.data.data.id;
    } catch (error) {
      console.log('❌ Erreur création événement:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Données envoyées:', testEvent);
    }

    // 5. Récupérer l'événement créé avec ses relations
    if (createdEventId) {
      console.log('\n5️⃣ Récupération de l\'événement avec relations...');
      try {
        const eventResponse = await axios.get(`${API_BASE_URL}/api/events/${createdEventId}`);
        const event = eventResponse.data.data;
        console.log('✅ Événement récupéré avec relations:');
        console.log('   Nom:', event.nom);
        console.log('   Type événement:', event.type_evenement_nom || 'Non défini');
        console.log('   Bien:', event.bien_nom || 'Non défini');
        console.log('   Type de bien:', event.bien_type || 'Non défini');
        console.log('   Adresse du bien:', event.bien_adresse || 'Non définie');
        if (event.bien_latitude && event.bien_longitude) {
          console.log('   GPS du bien:', `${event.bien_latitude}, ${event.bien_longitude}`);
        }
      } catch (error) {
        console.log('❌ Erreur récupération:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    // 6. Récupérer tous les événements
    console.log('\n6️⃣ Récupération de tous les événements...');
    try {
      const allEventsResponse = await axios.get(`${API_BASE_URL}/api/events`);
      const events = allEventsResponse.data.data;
      console.log(`✅ ${events.length} événement(s) total`);
      
      const eventsWithType = events.filter(e => e.type_evenement_nom);
      const eventsWithProperty = events.filter(e => e.bien_nom);
      
      console.log(`   Avec type: ${eventsWithType.length}`);
      console.log(`   Avec bien: ${eventsWithProperty.length}`);
    } catch (error) {
      console.log('❌ Erreur liste événements:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 7. Test des nouvelles routes de filtrage
    if (eventTypes.length > 0) {
      console.log('\n7️⃣ Test filtrage par type...');
      try {
        const filterResponse = await axios.get(`${API_BASE_URL}/api/events/by-type/${eventTypes[0].id}`);
        console.log(`✅ ${filterResponse.data.data.length} événement(s) du type "${eventTypes[0].nom}"`);
      } catch (error) {
        console.log('❌ Erreur filtrage type:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    if (properties.length > 0) {
      console.log('\n8️⃣ Test filtrage par bien...');
      try {
        const filterResponse = await axios.get(`${API_BASE_URL}/api/events/by-property/${properties[0].id}`);
        console.log(`✅ ${filterResponse.data.data.length} événement(s) dans le bien "${properties[0].nom}"`);
      } catch (error) {
        console.log('❌ Erreur filtrage bien:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    // 8. Nettoyer - supprimer l'événement de test
    if (createdEventId) {
      console.log('\n9️⃣ Nettoyage...');
      try {
        await axios.delete(`${API_BASE_URL}/api/events/${createdEventId}`);
        console.log('✅ Événement de test supprimé');
      } catch (error) {
        console.log('❌ Erreur suppression:', error.response?.status, error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Tests terminés!');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test de création sans relations
async function testEventWithoutRelations() {
  console.log('\n🔍 Test événement sans relations...');
  
  try {
    const simpleEvent = {
      nom: 'Événement Simple Test',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      adresse: 'Adresse simple'
    };

    const response = await axios.post(`${API_BASE_URL}/api/events`, simpleEvent);
    console.log('✅ Événement simple créé:', response.data.data.nom);
    
    // Nettoyer
    await axios.delete(`${API_BASE_URL}/api/events/${response.data.data.id}`);
    console.log('✅ Événement simple supprimé');
    
  } catch (error) {
    console.log('❌ Erreur événement simple:', error.response?.data?.message || error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  testEventsWithRelations()
    .then(() => testEventWithoutRelations())
    .then(() => {
      console.log('\n✨ Tous les tests terminés!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec des tests:', error);
      process.exit(1);
    });
}

module.exports = { testEventsWithRelations, testEventWithoutRelations };