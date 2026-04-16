import { useState } from 'react';

export function useBulkSelection() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleBulkDelete = async (deleteFunction, onSuccess) => {
    if (selectedItems.length === 0) return;

    try {
      setIsDeleting(true);
      const response = await deleteFunction(selectedItems);
      
      if (response.data.success) {
        setSelectedItems([]);
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

  const isSelected = (itemId) => selectedItems.includes(itemId);
  
  const isAllSelected = (items) => 
    selectedItems.length === items.length && items.length > 0;

  return {
    selectedItems,
    isDeleting,
    handleSelectItem,
    handleSelectAll,
    handleClearSelection,
    handleBulkDelete,
    isSelected,
    isAllSelected
  };
}