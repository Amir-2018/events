require('dotenv').config();
const pool = require('./db/pool');

async function debugProperties() {
  console.log('🔍 Diagnostic des biens...\n');

  try {
    // 1. Vérifier la connexion à la base de données
    console.log('1️⃣ Test de connexion à la base de données...');
    await pool.query('SELECT 1');
    console.log('✅ Connexion réussie');

    // 2. Vérifier si la table biens existe
    console.log('\n2️⃣ Vérification de l\'existence de la table biens...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'biens'
      );
    `);
    console.log('✅ Table biens existe:', tableExists.rows[0].exists);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La table biens n\'existe pas!');
      return;
    }

    // 3. Vérifier la structure de la table
    console.log('\n3️⃣ Structure de la table biens...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'biens'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colonnes de la table biens:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 4. Tester une insertion simple
    console.log('\n4️⃣ Test d\'insertion simple...');
    try {
      const result = await pool.query(`
        INSERT INTO biens (nom, type, adresse, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, ['Test Bien Debug', 'Stade', 'Adresse test', 'Description test']);
      
      console.log('✅ Insertion réussie:', result.rows[0]);
      
      // Supprimer le bien de test
      await pool.query('DELETE FROM biens WHERE id = $1', [result.rows[0].id]);
      console.log('✅ Bien de test supprimé');
      
    } catch (insertError) {
      console.log('❌ Erreur lors de l\'insertion:', insertError.message);
      console.log('Détails:', insertError);
    }

    // 5. Vérifier les biens existants
    console.log('\n5️⃣ Biens existants...');
    const existingProperties = await pool.query('SELECT * FROM biens ORDER BY created_at DESC LIMIT 5');
    console.log(`Nombre de biens: ${existingProperties.rows.length}`);
    existingProperties.rows.forEach(property => {
      console.log(`  - ${property.nom} (${property.type})`);
    });

    // 6. Tester le modèle Property
    console.log('\n6️⃣ Test du modèle Property...');
    const Property = require('./models/property.model');
    
    try {
      const testProperty = await Property.create({
        nom: 'Test Modèle',
        type: 'Salle',
        adresse: 'Test adresse',
        description: 'Test description'
      });
      console.log('✅ Modèle Property fonctionne:', testProperty.nom);
      
      // Supprimer
      await Property.delete(testProperty.id);
      console.log('✅ Suppression via modèle réussie');
      
    } catch (modelError) {
      console.log('❌ Erreur avec le modèle Property:', modelError.message);
      console.log('Détails:', modelError);
    }

    // 7. Tester le service PropertyService
    console.log('\n7️⃣ Test du service PropertyService...');
    const PropertyService = require('./services/propertyService');
    
    try {
      const testProperty = await PropertyService.createProperty({
        nom: 'Test Service',
        type: 'École',
        adresse: 'Test adresse service'
      });
      console.log('✅ Service PropertyService fonctionne:', testProperty.nom);
      
      // Supprimer
      await PropertyService.deleteProperty(testProperty.id);
      console.log('✅ Suppression via service réussie');
      
    } catch (serviceError) {
      console.log('❌ Erreur avec le service PropertyService:', serviceError.message);
      console.log('Détails:', serviceError);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Exécuter le diagnostic
debugProperties()
  .then(() => {
    console.log('\n✨ Diagnostic terminé!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec du diagnostic:', error);
    process.exit(1);
  });