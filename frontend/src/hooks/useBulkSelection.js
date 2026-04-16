import { useState, useEffect, useCallback } from 'react';

export function useBulkSelection() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });

  // Fonction pour nettoyer les sélections d'éléments qui n'existent plus
  const cleanupSelection = useCallback((currentItems) => {
    if (!currentItems || currentItems.length === 0) {
      // Si aucun élément n'est disponible, vider la sélection
      setSelectedItems([]);
      return;
    }
    
    setSelectedItems(prev => {
      const currentIds = currentItems.map(item => item.id);
      const validSelections = prev.filter(id => currentIds.includes(id));
      // Ne mettre à jour que si il y a vraiment un changement
      return validSelections.length !== prev.length ? validSelections : prev;
    });
  }, []);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = (items) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkDelete = async (deleteFunction, onSuccess, itemName = 'élément', itemNamePlural = 'éléments') => {
    if (selectedItems.length === 0) return;

    try {
      setIsDeleting(true);
      const response = await deleteFunction(selectedItems);
      
      if (response.data.success) {
        const deletedCount = response.data.success.length;
        const itemText = deletedCount === 1 ? itemName : itemNamePlural;
        
        // Vider la sélection AVANT d'appeler onSuccess
        setSelectedItems([]);
        
        // Afficher le popup de succès
        setSuccessPopup({
          show: true,
          message: `${deletedCount} ${itemText} supprimé${deletedCount > 1 ? 's' : ''} avec succès.`
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const closeSuccessPopup = () => {
    setSuccessPopup({ show: false, message: '' });
  };

  const isSelected = (itemId) => selectedItems.includes(itemId);
  
  const isAllSelected = (items) => 
    selectedItems.length === items.length && items.length > 0;

  return {
    selectedItems,
    isDeleting,
    successPopup,
    handleSelectItem,
    handleSelectAll,
    handleClearSelection,
    handleBulkDelete,
    cleanupSelection,
    closeSuccessPopup,
    isSelected,
    isAllSelected
  };
}