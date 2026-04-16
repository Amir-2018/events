# Guide d'utilisation - Suppression Multiple

Ce système permet d'ajouter facilement la fonctionnalité de suppression multiple à n'importe quelle entité.

## Backend

### 1. Ajouter la méthode au contrôleur

```javascript
async bulkDeleteXXX(req, res) {
  try {
    const { ids } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La liste des IDs ne peut pas être vide'
      });
    }

    const BulkDeleteService = require('../services/bulkDeleteService');
    
    const result = await BulkDeleteService.bulkDeleteXXX(ids, {
      userId,
      userRole
    });

    res.json({
      success: true,
      message: `${result.deleted} XXX supprimé(s) avec succès`,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

### 2. Ajouter la route

⚠️ **IMPORTANT** : La route `/bulk-delete` doit être placée AVANT les routes avec paramètres (`:id`) pour éviter les conflits.

```javascript
// ✅ CORRECT - bulk-delete avant :id
router.delete('/bulk-delete', authMiddleware, Controller.bulkDeleteXXX);
router.delete('/:id', authMiddleware, Controller.deleteXXX);

// ❌ INCORRECT - :id capture "bulk-delete" comme un ID
router.delete('/:id', authMiddleware, Controller.deleteXXX);
router.delete('/bulk-delete', authMiddleware, Controller.bulkDeleteXXX);
```

### 3. Ajouter la méthode spécialisée au BulkDeleteService (optionnel)

```javascript
static async bulkDeleteXXX(ids, permissions = {}) {
  return await this.bulkDelete('table_name', ids, {
    permissions,
    beforeDelete: async (itemIds) => {
      // Vérifications spécifiques avant suppression
    },
    afterDelete: async (deletedIds) => {
      // Actions après suppression
    }
  });
}
```

## Frontend

### 1. Ajouter la fonction API

```javascript
export const xxxAPI = {
  // ... autres méthodes
  bulkDeleteXXX: (ids) => protectedAPI.delete('/api/xxx/bulk-delete', { data: { ids } }),
};
```

### 2. Utiliser dans le composant

```javascript
import BulkSelectionToolbar from './BulkSelectionToolbar';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { xxxAPI } from '../lib/api';

export default function XXXSection({ items, onBulkDeleteXXX }) {
  // Hook pour la sélection multiple
  const {
    selectedItems,
    isDeleting,
    handleSelectItem,
    handleSelectAll,
    handleClearSelection,
    handleBulkDelete,
    isSelected,
    isAllSelected
  } = useBulkSelection();

  // Gestion de la suppression multiple
  const handleBulkDeleteItems = async () => {
    try {
      await handleBulkDelete(xxxAPI.bulkDeleteXXX, (result) => {
        // Appeler la fonction de callback du parent avec les IDs supprimés
        if (onBulkDeleteXXX && result.success && result.success.length > 0) {
          onBulkDeleteXXX(result.success);
        }
      });
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div>
      {/* Toolbar de sélection */}
      <BulkSelectionToolbar
        selectedItems={selectedItems}
        onBulkDelete={handleBulkDeleteItems}
        onClearSelection={handleClearSelection}
        itemName="élément"
        itemNamePlural="éléments"
        isDeleting={isDeleting}
      />

      {/* Tableau avec checkboxes */}
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isAllSelected(items)}
                onChange={() => handleSelectAll(items)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            {/* autres colonnes */}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={isSelected(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              {/* autres cellules */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 3. Gérer dans le composant parent

```javascript
// Dans le composant parent (ex: Dashboard)
const [items, setItems] = useState([]);

const handleBulkDeleteItems = async (deletedIds) => {
  // Mettre à jour l'état local en supprimant les éléments supprimés
  setItems(prevItems => 
    prevItems.filter(item => !deletedIds.includes(item.id))
  );
  
  // Afficher un message de succès
  const count = deletedIds.length;
  setSuccessMessage(`${count} élément${count > 1 ? 's' : ''} supprimé${count > 1 ? 's' : ''} avec succès`);
  setShowSuccess(true);
};

// Passer la fonction au composant enfant
<XXXSection 
  items={items}
  onBulkDeleteXXX={handleBulkDeleteItems}
/>
```

## Fonctionnalités incluses

- ✅ Modal de confirmation avec design cohérent
- ✅ Gestion des permissions utilisateur
- ✅ Validation des contraintes métier
- ✅ Messages d'erreur personnalisés
- ✅ Interface utilisateur intuitive
- ✅ Sélection "Tout/Rien"
- ✅ Feedback visuel (loading, compteurs)
- ✅ Service générique réutilisable

## Messages de confirmation personnalisés

Le système adapte automatiquement les messages selon le type d'élément :

- **Événements** : Mentionne les inscriptions et souvenirs
- **Types** : Avertit sur les dépendances
- **Autres** : Message générique

## Permissions

- **Superadmin** : Peut supprimer tous les éléments
- **Admin** : Peut supprimer ses propres créations + celles du superadmin
- **Validation automatique** : Le service vérifie les permissions avant suppression

## Avantages de cette approche

### ✅ Performance optimisée
- **Pas de rechargement de page** : Mise à jour instantanée de l'interface
- **Pas de requête supplémentaire** : Utilise les données déjà en mémoire
- **Expérience utilisateur fluide** : Transitions visuelles sans interruption

### ✅ Gestion automatique de la sélection
- **Vidage immédiat** : La sélection est vidée dès la suppression réussie
- **Nettoyage automatique** : Les sélections d'éléments supprimés sont automatiquement retirées
- **Toolbar réactive** : Disparaît instantanément quand la sélection est vide
- **Pas de clignotement** : Interface fluide sans artefacts visuels

### ✅ Réutilisabilité maximale
- **Composants génériques** : Même code pour toutes les entités
- **Configuration flexible** : Messages et comportements personnalisables
- **Maintenance simplifiée** : Un seul endroit pour les modifications