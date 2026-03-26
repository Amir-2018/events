# Guide de débogage - Problème d'insertion des biens

## Étapes de diagnostic

### 1. 🗄️ Vérifier la base de données
```bash
node quick-debug.js
```
**Résultat attendu :** ✅ Tous les tests passent

**Si ça échoue :**
- Vérifier que la base de données est accessible
- Exécuter `node db/migrate.js` pour initialiser les tables

### 2. 🚀 Vérifier le serveur backend
```bash
npm start
```
**Résultat attendu :** Serveur démarre sans erreur

**Dans un autre terminal :**
```bash
node test-api-properties.js
```
**Résultat attendu :** ✅ Tous les tests API passent

### 3. 🌐 Vérifier l'API manuellement
Ouvrir http://localhost:3000/api/properties dans le navigateur
**Résultat attendu :** `{"success":true,"data":[...]}`

### 4. 🖥️ Vérifier le frontend
1. Ouvrir http://localhost:3000
2. Aller dans la section "Biens"
3. Ouvrir les outils de développement (F12)
4. Cliquer sur le bouton "🧪 Test API"
5. Regarder la console pour les logs

**Résultat attendu :** Alert "Test API réussi!"

### 5. 🔍 Vérifier le formulaire complet
1. Cliquer sur "Nouveau bien"
2. Remplir le formulaire minimal :
   - Nom : "Test Bien"
   - Type : "Stade"
3. Cliquer sur "Créer"
4. Regarder la console pour les logs détaillés

## Messages d'erreur courants

### ❌ "Table biens n'existe pas"
**Solution :** `node db/migrate.js`

### ❌ "Serveur non accessible"
**Solution :** `npm start`

### ❌ "CORS error"
**Solution :** Vérifier que le serveur backend est sur le bon port

### ❌ "Validation error"
**Solution :** Vérifier que nom et type sont fournis

### ❌ "Network error"
**Solution :** Vérifier que l'URL de l'API est correcte

## Logs de débogage

Le composant PropertyList affiche maintenant des logs détaillés :
- 🔄 Début d'opération
- 📡 Réponse serveur
- 📦 Données reçues
- ✅ Succès
- ❌ Erreur

## Tests disponibles

1. **Test base de données :** `node quick-debug.js`
2. **Test API :** `node test-api-properties.js`
3. **Test complet :** `node test-complete-properties.js`
4. **Test frontend :** Bouton "🧪 Test API" dans l'interface

## Vérifications manuelles

### Base de données
```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables WHERE table_name = 'biens';

-- Vérifier la structure
\d biens

-- Tester une insertion
INSERT INTO biens (nom, type) VALUES ('Test Manuel', 'Stade');
SELECT * FROM biens WHERE nom = 'Test Manuel';
DELETE FROM biens WHERE nom = 'Test Manuel';
```

### API avec curl
```bash
# GET - Lister les biens
curl http://localhost:3000/api/properties

# POST - Créer un bien
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test Curl","type":"Stade"}'
```

## Problèmes spécifiques

### Les types d'événements fonctionnent mais pas les biens
**Causes possibles :**
1. Route mal configurée
2. Contrôleur différent
3. Validation différente
4. Table non créée

**Vérifications :**
1. Comparer `eventTypeController.js` et `propertyController.js`
2. Vérifier les routes dans `app.js`
3. Comparer les modèles
4. Vérifier l'ordre de création des tables

### Frontend ne reçoit pas de réponse
**Causes possibles :**
1. URL incorrecte
2. CORS
3. Serveur non démarré
4. Erreur de parsing JSON

**Vérifications :**
1. Ouvrir l'onglet Network dans les outils de développement
2. Vérifier les requêtes HTTP
3. Regarder les codes de statut
4. Vérifier les headers

## Contact et support

Si le problème persiste après ces vérifications :
1. Copier les logs d'erreur complets
2. Indiquer quelle étape échoue
3. Partager les résultats des tests