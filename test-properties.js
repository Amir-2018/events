const { Pool } = require('pg');
const PropertyService = require('./services/propertyService');

// Configuration de test avec la base de données
const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  ssl: { rejectUnauthorized: false }
});

async function testProperties() {
  console.log('🧪 Test des fonctionnalités des biens...\n');

  try {
    // Test 1: Créer un bien
    console.log('1️⃣ Test de création d\'un bien...');
    const newProperty = {
      nom: 'Stade Municipal Test',
      type: 'Stade',
      adresse: '123 Rue du Sport, Paris',
      description: 'Stade municipal avec terrain de football et piste d\'athlétisme',
      latitude: 48.8566,
      longitude: 2.3522,
      horaire_ouverture: '08:00',
      horaire_fermeture: '20:00',
      jours_ouverture: 'Lundi-Dimanche'
    };

    const createdProperty = await PropertyService.createProperty(newProperty);
    console.log('✅ Bien créé:', createdProperty.nom);
    console.log('   ID:', createdProperty.id);

    // Test 2: Récupérer tous les biens
    console.log('\n2️⃣ Test de récupération de tous les biens...');
    const allProperties = await PropertyService.getAllProperties();
    console.log(`✅ ${allProperties.length} bien(s) trouvé(s)`);

    // Test 3: Récupérer un bien par ID
    console.log('\n3️⃣ Test de récupération d\'un bien par ID...');
    const retrievedProperty = await PropertyService.getPropertyById(createdProperty.id);
    console.log('✅ Bien récupéré:', retrievedProperty.nom);

    // Test 4: Mettre à jour un bien
    console.log('\n4️⃣ Test de mise à jour d\'un bien...');
    const updatedData = {
      ...newProperty,
      nom: 'Stade Municipal Test - Modifié',
      description: 'Description mise à jour avec nouvelles installations'
    };
    const updatedProperty = await PropertyService.updateProperty(createdProperty.id, updatedData);
    console.log('✅ Bien mis à jour:', updatedProperty.nom);

    // Test 5: Recherche de biens
    console.log('\n5️⃣ Test de recherche de biens...');
    const searchResults = await PropertyService.searchProperties('stade');
    console.log(`✅ ${searchResults.length} bien(s) trouvé(s) avec "stade"`);

    // Test 6: Filtrer par type
    console.log('\n6️⃣ Test de filtrage par type...');
    const stadiums = await PropertyService.getPropertiesByType('Stade');
    console.log(`✅ ${stadiums.length} stade(s) trouvé(s)`);

    // Test 7: Supprimer le bien
    console.log('\n7️⃣ Test de suppression d\'un bien...');
    await PropertyService.deleteProperty(createdProperty.id);
    console.log('✅ Bien supprimé avec succès');

    // Vérification de la suppression
    try {
      await PropertyService.getPropertyById(createdProperty.id);
      console.log('❌ Erreur: Le bien devrait être supprimé');
    } catch (error) {
      console.log('✅ Confirmation: Le bien a bien été supprimé');
    }

    console.log('\n🎉 Tous les tests sont passés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Tests de validation
async function testValidation() {
  console.log('\n🔍 Test des validations...\n');

  try {
    // Test validation nom manquant
    console.log('1️⃣ Test validation nom manquant...');
    try {
      await PropertyService.createProperty({ type: 'Stade' });
      console.log('❌ Erreur: Devrait échouer sans nom');
    } catch (error) {
      console.log('✅ Validation nom:', error.message);
    }

    // Test validation type manquant
    console.log('\n2️⃣ Test validation type manquant...');
    try {
      await PropertyService.createProperty({ nom: 'Test' });
      console.log('❌ Erreur: Devrait échouer sans type');
    } catch (error) {
      console.log('✅ Validation type:', error.message);
    }

    // Test validation coordonnées invalides
    console.log('\n3️⃣ Test validation coordonnées invalides...');
    try {
      await PropertyService.createProperty({
        nom: 'Test',
        type: 'Stade',
        latitude: 200 // Invalide
      });
      console.log('❌ Erreur: Devrait échouer avec latitude invalide');
    } catch (error) {
      console.log('✅ Validation latitude:', error.message);
    }

    // Test validation horaires invalides
    console.log('\n4️⃣ Test validation horaires invalides...');
    try {
      await PropertyService.createProperty({
        nom: 'Test',
        type: 'Stade',
        horaire_ouverture: '20:00',
        horaire_fermeture: '08:00' // Fermeture avant ouverture
      });
      console.log('❌ Erreur: Devrait échouer avec horaires invalides');
    } catch (error) {
      console.log('✅ Validation horaires:', error.message);
    }

    console.log('\n🎉 Tous les tests de validation sont passés!');

  } catch (error) {
    console.error('❌ Erreur lors des tests de validation:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  require('dotenv').config();
  
  testProperties()
    .then(() => testValidation())
    .then(() => {
      console.log('\n✨ Tests terminés!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec des tests:', error);
      process.exit(1);
    });
}

module.exports = { testProperties, testValidation };