# Guide - Événements avec Types et Biens

## 🎯 Fonctionnalités ajoutées

### Formulaire de création d'événement
- ✅ **Champ "Type d'événement"** : Sélection parmi les types créés
- ✅ **Champ "Bien/Lieu"** : Sélection parmi les biens créés
- ✅ **Chargement automatique** des données depuis l'API
- ✅ **Validation** côté client et serveur

### Backend amélioré
- ✅ **Modèle Event** complet avec relations
- ✅ **Service EventService** avec validation
- ✅ **Contrôleur EventController** mis à jour
- ✅ **Routes étendues** pour filtrage et recherche

### Affichage enrichi
- ✅ **EventCard** affiche type et bien
- ✅ **Informations complètes** avec icônes
- ✅ **Relations visuelles** entre événements, types et biens

## 🚀 Comment tester

### 1. Prérequis
```bash
# S'assurer que la table biens existe avec toutes les colonnes
node fix-biens-table.js

# Démarrer le serveur
npm start
```

### 2. Créer des données de test
1. **Créer des types d'événements :**
   - Aller dans "Types d'événements"
   - Créer : "Concert", "Conférence", "Sport", etc.

2. **Créer des biens :**
   - Aller dans "Biens"
   - Créer : "Stade Municipal", "Salle des Fêtes", etc.

### 3. Créer un événement complet
1. Cliquer sur "Créer un nouvel événement"
2. Remplir :
   - **Nom** : "Concert de Jazz"
   - **Type d'événement** : Sélectionner "Concert"
   - **Bien/Lieu** : Sélectionner "Salle des Fêtes"
   - **Date** : Choisir une date future
   - **Adresse** : Optionnel (peut utiliser celle du bien)
3. Cliquer "Créer l'événement"

### 4. Vérifier l'affichage
L'événement créé devrait afficher :
- 🏷️ **Type** avec icône violette
- 🏢 **Bien** avec icône verte et type de bien
- 📅 **Date** formatée
- 📍 **Adresse**

## 🧪 Tests automatisés

### Test complet
```bash
node test-events-with-relations.js
```

### Test de l'API manuellement
```bash
# Créer un événement avec relations
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test API",
    "date": "2024-12-25T20:00:00Z",
    "type_evenement_id": "UUID_DU_TYPE",
    "bien_id": "UUID_DU_BIEN"
  }'

# Récupérer avec relations
curl http://localhost:3000/api/events/UUID_EVENEMENT
```

## 📊 Nouvelles routes API

### Événements
- `GET /api/events` - Tous les événements avec relations
- `GET /api/events/:id` - Événement avec détails complets
- `POST /api/events` - Créer avec type_evenement_id et bien_id
- `PUT /api/events/:id` - Modifier
- `DELETE /api/events/:id` - Supprimer

### Filtrage et recherche
- `GET /api/events/search?q=terme` - Recherche textuelle
- `GET /api/events/by-type/:typeId` - Événements d'un type
- `GET /api/events/by-property/:propertyId` - Événements d'un bien
- `GET /api/events/stats` - Statistiques

## 🔍 Structure des données

### Événement complet (réponse API)
```json
{
  "id": "uuid",
  "nom": "Concert de Jazz",
  "date": "2024-12-25T20:00:00Z",
  "adresse": "123 Rue de la Musique",
  "image": "base64...",
  "type_evenement_id": "uuid",
  "bien_id": "uuid",
  
  // Relations automatiquement jointes
  "type_evenement_nom": "Concert",
  "type_evenement_description": "Événements musicaux",
  "bien_nom": "Salle des Fêtes",
  "bien_type": "Salle",
  "bien_adresse": "456 Avenue Principale",
  "bien_latitude": 48.8566,
  "bien_longitude": 2.3522,
  "bien_horaire_ouverture": "08:00",
  "bien_horaire_fermeture": "22:00",
  
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

## 🎨 Interface utilisateur

### Formulaire EventForm
- **Chargement automatique** des types et biens
- **Sélection intuitive** avec noms et types
- **Validation** en temps réel
- **État de chargement** pendant la création

### Carte EventCard
- **Badges colorés** pour type et bien
- **Icônes distinctives** pour chaque information
- **Hiérarchie visuelle** claire
- **Informations complètes** en un coup d'œil

## 🐛 Dépannage

### Problèmes courants

1. **"Types d'événements non chargés"**
   - Vérifier que des types existent : `/api/event-types`
   - Créer des types via l'interface

2. **"Biens non chargés"**
   - Vérifier que des biens existent : `/api/properties`
   - Créer des biens via l'interface

3. **"Événement créé sans relations"**
   - Vérifier que les IDs sont valides
   - Regarder les logs du serveur

4. **"Erreur de validation"**
   - Le nom est obligatoire
   - Les IDs doivent être des UUIDs valides
   - La date doit être au bon format

### Logs de débogage
Le serveur affiche des logs détaillés lors de la création :
```
=== CREATE EVENT DEBUG ===
Body received: {
  nom: "Concert de Jazz",
  type_evenement_id: "uuid...",
  bien_id: "uuid..."
}
Event created: { id: "uuid...", ... }
=== END DEBUG ===
```

## 📈 Statistiques disponibles

L'endpoint `/api/events/stats` retourne :
```json
{
  "total": 15,
  "withType": 12,
  "withProperty": 10,
  "withDate": 14,
  "withImage": 8,
  "byType": {
    "Concert": 5,
    "Conférence": 3,
    "Sport": 4
  },
  "byProperty": {
    "Stade Municipal": 4,
    "Salle des Fêtes": 6
  }
}
```

## ✅ Checklist de validation

- [ ] Types d'événements créés
- [ ] Biens créés avec coordonnées GPS
- [ ] Événement créé avec type et bien
- [ ] Affichage correct dans EventCard
- [ ] Relations visibles dans les détails
- [ ] Filtrage par type fonctionne
- [ ] Filtrage par bien fonctionne
- [ ] Recherche textuelle fonctionne

Une fois tous ces points validés, le système est pleinement opérationnel ! 🎉