# Gestion des Biens - Documentation

## Vue d'ensemble

Le système de gestion des biens permet de créer, modifier, afficher et supprimer des lieux où peuvent se dérouler des événements. Chaque bien peut avoir des horaires d'ouverture, une localisation GPS et être associé à des événements.

## Architecture

### Backend

#### Modèle (`models/property.model.js`)
- **Fonctions CRUD complètes** : create, getAll, getById, update, delete
- **Validation des données** au niveau base de données
- **Support des coordonnées GPS** (latitude/longitude)
- **Gestion des horaires** d'ouverture et jours de fonctionnement

#### Service (`services/propertyService.js`)
- **Validation métier** des données
- **Logique de recherche** et filtrage
- **Gestion des erreurs** avec messages explicites
- **Validation des coordonnées GPS** (-90/90 pour latitude, -180/180 pour longitude)
- **Validation des horaires** (ouverture < fermeture)

#### Contrôleur (`controllers/propertyController.js`)
- **API REST complète** avec codes de statut appropriés
- **Gestion des erreurs** HTTP
- **Utilisation du service** pour la logique métier
- **Réponses JSON standardisées**

#### Routes (`routes/propertyRoutes.js`)
```
POST   /api/properties      - Créer un bien
GET    /api/properties      - Lister tous les biens
GET    /api/properties/:id  - Récupérer un bien
PUT    /api/properties/:id  - Modifier un bien
DELETE /api/properties/:id  - Supprimer un bien
```

### Frontend

#### Composants

1. **PropertyList** (`frontend/src/components/PropertyList.js`)
   - Liste complète des biens avec recherche et filtres
   - Statistiques en temps réel
   - Gestion des états de chargement et d'erreur

2. **PropertyCard** (`frontend/src/components/PropertyCard.js`)
   - Affichage compact d'un bien
   - Actions rapides (voir, modifier, supprimer)
   - Icônes par type de bien

3. **PropertyForm** (`frontend/src/components/PropertyForm.js`)
   - Formulaire de création/modification
   - Intégration OpenStreetMap avec Leaflet
   - Validation côté client
   - Sélection interactive de coordonnées GPS

4. **PropertyDetails** (`frontend/src/components/PropertyDetails.js`)
   - Vue détaillée d'un bien
   - Carte interactive
   - Actions de modification/suppression

5. **PropertyMap** (`frontend/src/components/PropertyMap.js`)
   - Composant carte réutilisable
   - Intégration OpenStreetMap
   - Marqueurs personnalisés

## Fonctionnalités

### Types de biens supportés
- Stade
- Salle
- Maison de jeunes
- École
- Centre communautaire
- Parc
- Théâtre
- Auditorium
- Gymnase
- Autre

### Informations stockées
- **Nom** (obligatoire)
- **Type** (obligatoire)
- **Adresse** (optionnel)
- **Description** (optionnel)
- **Coordonnées GPS** (latitude/longitude, optionnel)
- **Horaires d'ouverture** (heure début/fin, optionnel)
- **Jours d'ouverture** (Lundi-Dimanche par défaut)
- **Dates de création/modification** (automatique)

### Fonctionnalités avancées
- **Recherche textuelle** dans nom, type et adresse
- **Filtrage par type** de bien
- **Carte interactive** avec OpenStreetMap
- **Validation en temps réel** des coordonnées
- **Sélection GPS** par clic sur carte
- **Statistiques** (total, types différents, avec localisation)

## Utilisation

### Créer un bien

1. Cliquer sur "Nouveau bien" dans l'interface
2. Remplir le formulaire :
   - Nom du bien (obligatoire)
   - Type (sélection dans la liste)
   - Adresse (optionnel)
   - Horaires d'ouverture (optionnel)
   - Position GPS via la carte interactive
   - Description (optionnel)
3. Cliquer sur "Créer"

### Modifier un bien

1. Cliquer sur l'icône "Modifier" sur une carte de bien
2. Modifier les informations dans le formulaire
3. Cliquer sur "Modifier"

### Supprimer un bien

1. Cliquer sur l'icône "Supprimer" sur une carte de bien
2. Confirmer la suppression

### Rechercher des biens

1. Utiliser la barre de recherche pour filtrer par nom, type ou adresse
2. Utiliser le filtre par type pour afficher seulement certains types
3. Les résultats se mettent à jour en temps réel

## API

### Créer un bien
```javascript
const response = await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nom: 'Stade Municipal',
    type: 'Stade',
    adresse: '123 Rue du Sport',
    latitude: 48.8566,
    longitude: 2.3522,
    horaire_ouverture: '08:00',
    horaire_fermeture: '20:00',
    jours_ouverture: 'Lundi-Dimanche',
    description: 'Stade avec terrain de football'
  })
});
```

### Récupérer tous les biens
```javascript
const response = await fetch('/api/properties');
const data = await response.json();
console.log(data.data); // Array des biens
```

## Base de données

### Table `biens`
```sql
CREATE TABLE biens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  adresse TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  horaire_ouverture TIME,
  horaire_fermeture TIME,
  jours_ouverture VARCHAR(50) DEFAULT 'Lundi-Dimanche',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Relations
- Les événements peuvent être associés à un bien via `bien_id`
- Relation optionnelle (ON DELETE SET NULL)

## Tests

Exécuter les tests des biens :
```bash
node test-properties.js
```

Les tests couvrent :
- Création, lecture, modification, suppression
- Validation des données
- Recherche et filtrage
- Gestion des erreurs

## Intégration OpenStreetMap

Le système utilise Leaflet.js pour l'intégration avec OpenStreetMap :
- Carte interactive dans le formulaire
- Sélection de coordonnées par clic
- Marqueurs déplaçables
- Liens vers OpenStreetMap pour navigation

## Sécurité

- Validation côté serveur de toutes les données
- Sanitisation des entrées utilisateur
- Gestion des erreurs sans exposition d'informations sensibles
- Validation des coordonnées GPS dans les limites géographiques

## Performance

- Chargement paresseux des cartes
- Mise en cache des données côté client
- Requêtes optimisées avec index sur les colonnes fréquemment utilisées
- Pagination automatique pour les grandes listes (à implémenter si nécessaire)

## Évolutions futures

- **Géofencing** : Alertes basées sur la localisation
- **Import/Export** : CSV, Excel pour gestion en lot
- **Photos** : Ajout d'images pour chaque bien
- **Réservations** : Système de réservation de créneaux
- **Capacité** : Gestion du nombre de places disponibles
- **Équipements** : Liste des équipements disponibles par bien