const axios = require('axios');

// Image base64 de test (petit carré rouge)
const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

async function testBase64Upload() {
  try {
    console.log('🧪 Test de création d\'événement avec image base64...');
    
    const eventData = {
      nom: 'Test Event Base64',
      date: '2024-12-25',
      adresse: 'Test Address',
      image: testBase64
    };
    
    console.log('📤 Envoi des données:', {
      nom: eventData.nom,
      date: eventData.date,
      adresse: eventData.adresse,
      imageType: typeof eventData.image,
      imageLength: eventData.image.length,
      imageStart: eventData.image.substring(0, 50) + '...'
    });
    
    const response = await axios.post('http://localhost:3000/api/events', eventData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Succès! Réponse:', response.data);
    
    // Vérifier que l'image est bien stockée
    if (response.data.data.image) {
      console.log('✅ Image stockée avec succès!');
      console.log('📏 Taille de l\'image stockée:', response.data.data.image.length, 'caractères');
      console.log('🔍 Début de l\'image:', response.data.data.image.substring(0, 50) + '...');
    } else {
      console.log('❌ Image non stockée (NULL)');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

async function testNormalUpload() {
  try {
    console.log('\n🧪 Test de création d\'événement normal (sans image)...');
    
    const eventData = {
      nom: 'Test Event Sans Image',
      date: '2024-12-26',
      adresse: 'Test Address 2'
    };
    
    const response = await axios.post('http://localhost:3000/api/events', eventData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Succès! Réponse:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

async function testGetEvents() {
  try {
    console.log('\n🧪 Test de récupération des événements...');
    
    const response = await axios.get('http://localhost:3000/api/events');
    
    console.log('✅ Succès! Nombre d\'événements:', response.data.data.length);
    
    // Afficher les détails des événements avec images
    response.data.data.forEach((event, index) => {
      console.log(`📋 Événement ${index + 1}:`, {
        nom: event.nom,
        hasImage: !!event.image,
        imageLength: event.image ? event.image.length : 0,
        imageType: event.image ? (event.image.startsWith('data:image') ? 'BASE64' : 'URL') : 'NONE'
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter les tests
async function runTests() {
  await testBase64Upload();
  await testNormalUpload();
  await testGetEvents();
}

runTests();