const pool = require('./pool');

async function seedData() {
  try {
    console.log('🌱 Insertion des données de test...');

    // Insérer des types d'événements
    const eventTypes = [
      { nom: 'Conférence', description: 'Événements de présentation et de partage de connaissances' },
      { nom: 'Concert', description: 'Spectacles musicaux et performances artistiques' },
      { nom: 'Formation', description: 'Sessions d\'apprentissage et de développement des compétences' },
      { nom: 'Séminaire', description: 'Réunions professionnelles et éducatives' },
      { nom: 'Festival', description: 'Célébrations culturelles et événements communautaires' },
      { nom: 'Compétition', description: 'Événements sportifs et concours' }
    ];

    for (const type of eventTypes) {
      await pool.query(
        'INSERT INTO types_evenements (nom, description) VALUES ($1, $2) ON CONFLICT (nom) DO NOTHING',
        [type.nom, type.description]
      );
    }

    // Insérer des biens
    const properties = [
      { 
        nom: 'Stade Municipal', 
        type: 'Stade', 
        adresse: '123 Avenue du Sport, Ville', 
        description: 'Grand stade avec capacité de 15000 places',
        latitude: 48.8566,
        longitude: 2.3522,
        horaire_ouverture: '08:00',
        horaire_fermeture: '22:00',
        jours_ouverture: 'Lundi-Dimanche'
      },
      { 
        nom: 'Salle des Fêtes Centre-Ville', 
        type: 'Salle', 
        adresse: '45 Rue de la Mairie, Ville', 
        description: 'Salle polyvalente de 300 places avec équipement audiovisuel',
        latitude: 48.8606,
        longitude: 2.3376,
        horaire_ouverture: '09:00',
        horaire_fermeture: '23:00',
        jours_ouverture: 'Lundi-Samedi'
      },
      { 
        nom: 'Maison des Jeunes Nord', 
        type: 'Maison de jeunes', 
        adresse: '78 Boulevard de la Jeunesse, Ville', 
        description: 'Espace dédié aux activités jeunesse avec salles modulables',
        latitude: 48.8738,
        longitude: 2.3448,
        horaire_ouverture: '14:00',
        horaire_fermeture: '20:00',
        jours_ouverture: 'Lundi-Vendredi'
      },
      { 
        nom: 'École Primaire Saint-Martin', 
        type: 'École', 
        adresse: '12 Rue de l\'Éducation, Ville', 
        description: 'Établissement scolaire avec gymnase et cour de récréation',
        latitude: 48.8499,
        longitude: 2.3654,
        horaire_ouverture: '08:30',
        horaire_fermeture: '18:30',
        jours_ouverture: 'Lundi-Vendredi'
      },
      { 
        nom: 'Centre Communautaire Est', 
        type: 'Centre communautaire', 
        adresse: '90 Place de la Communauté, Ville', 
        description: 'Centre polyvalent pour événements communautaires',
        latitude: 48.8534,
        longitude: 2.3488,
        horaire_ouverture: '10:00',
        horaire_fermeture: '22:00',
        jours_ouverture: 'Lundi-Dimanche'
      },
      { 
        nom: 'Parc Municipal des Loisirs', 
        type: 'Parc', 
        adresse: 'Avenue des Tilleuls, Ville', 
        description: 'Grand parc avec espaces verts et aires de jeux',
        latitude: 48.8642,
        longitude: 2.3387,
        horaire_ouverture: '06:00',
        horaire_fermeture: '20:00',
        jours_ouverture: 'Lundi-Dimanche'
      },
      { 
        nom: 'Théâtre Municipal', 
        type: 'Théâtre', 
        adresse: '33 Rue des Arts, Ville', 
        description: 'Théâtre historique de 500 places avec scène professionnelle',
        latitude: 48.8589,
        longitude: 2.3469,
        horaire_ouverture: '19:00',
        horaire_fermeture: '23:30',
        jours_ouverture: 'Lundi-Samedi'
      },
      { 
        nom: 'Auditorium Universitaire', 
        type: 'Auditorium', 
        adresse: 'Campus Universitaire, Ville', 
        description: 'Auditorium moderne de 800 places avec équipement high-tech',
        latitude: 48.8445,
        longitude: 2.3737,
        horaire_ouverture: '08:00',
        horaire_fermeture: '20:00',
        jours_ouverture: 'Lundi-Vendredi'
      }
    ];

    for (const property of properties) {
      await pool.query(
        'INSERT INTO biens (nom, type, adresse, description, latitude, longitude, horaire_ouverture, horaire_fermeture, jours_ouverture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          property.nom, 
          property.type, 
          property.adresse, 
          property.description, 
          property.latitude, 
          property.longitude, 
          property.horaire_ouverture, 
          property.horaire_fermeture, 
          property.jours_ouverture
        ]
      );
    }

    console.log('✅ Données de test insérées avec succès!');
    console.log(`📊 ${eventTypes.length} types d'événements ajoutés`);
    console.log(`🏢 ${properties.length} biens ajoutés`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedData();
}

module.exports = seedData;