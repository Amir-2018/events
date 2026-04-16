import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function BulkSelectionToolbar({ 
  selectedItems, 
  onBulkDelete, 
  onClearSelection,
  itemName = 'élément',
  itemNamePlural = 'éléments',
  isDeleting = false 
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleBulkDelete = async () => {
    setShowConfirmModal(true);
  };

  const confirmBulkDelete = async () => {
    setShowConfirmModal(false);
    await onBulkDelete(selectedItems);
  };

  const cancelBulkDelete = () => {
    setShowConfirmModal(false);
  };

  const itemText = selectedItems.length === 1 ? itemName : itemNamePlural;
  const confirmTitle = `Supprimer ${selectedItems.length} ${itemText} ?`;
  
  // Message personnalisé selon le type d'élément
  let confirmMessage;
  if (itemName === 'événement') {
    confirmMessage = selectedItems.length === 1 
      ? "Cette action est irréversible. Toutes les données liées à cet événement (inscriptions, souvenirs, etc.) seront supprimées."
      : `Cette action est irréversible. Toutes les données liées à ces ${selectedItems.length} événements (inscriptions, souvenirs, etc.) seront supprimées.`;
  } else if (itemName === 'type de bien' || itemName === "type d'événement") {
    confirmMessage = selectedItems.length === 1
      ? "Cette action est irréversible. Assurez-vous qu'aucun élément n'utilise ce type."
      : `Cette action est irréversible. Assurez-vous qu'aucun élément n'utilise ces ${selectedItems.length} types.`;
  } else {
    confirmMessage = `Cette action est irréversible. Toutes les données liées à ${selectedItems.length === 1 ? 'cet' : 'ces'} ${itemText} seront supprimées.`;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div>
            <p className="text-blue-800 font-bold text-sm">
              {selectedItems.length} {selectedItems.length === 1 ? itemName : itemNamePlural} sélectionné(s)
            </p>
            <p className="text-blue-600 text-xs">
              Choisissez une action à effectuer sur la sélection
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClearSelection}
            className="px-3 py-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Désélectionner tout
          </button>
          
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                Suppression...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Supprimer ({selectedItems.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        show={showConfirmModal}
        title={confirmTitle}
        message={confirmMessage}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
      />
    </div>
  );
}