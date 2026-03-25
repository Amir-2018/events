# Frontend - Gestion des Événements

Interface web Next.js pour gérer les événements et consulter les inscriptions.

## Installation

```bash
cd frontend
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3001

## Fonctionnalités

- **Affichage des événements** : Liste tous les événements avec leurs détails
- **Création d'événements** : Formulaire pour ajouter de nouveaux événements
- **Suppression d'événements** : Bouton pour supprimer un événement
- **Consultation des inscrits** : Voir la liste des clients inscrits à chaque événement

## Configuration

Assurez-vous que votre API backend fonctionne sur http://localhost:3000

## Structure

- `src/pages/index.js` - Page principale avec la liste des événements
- `src/components/EventCard.js` - Carte d'affichage d'un événement
- `src/components/EventForm.js` - Formulaire de création d'événement
- `src/components/ClientsList.js` - Modal d'affichage des clients inscrits
- `src/lib/api.js` - Configuration des appels API