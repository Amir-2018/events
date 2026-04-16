import { useState, useEffect } from 'react';
import EventTypeForm from './EventTypeForm';
import ConfirmationModal from './ConfirmationModal';
import BulkSelectionToolbar from './BulkSelectionToolbar';
import SuccessPopup from './SuccessPopup';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { eventTypesAPI } from '../lib/api';

export default function EventTypesSection({ 
  eventTypes, 
  onCreateEventType, 
  onDeleteEventType,
  onBulkDeleteEventTypes, // Nouvelle prop pour la suppression multiple
  isProcessing 
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  // Hook pour la sélection multiple
  const {
    selectedItems: selectedTypes,
    isDeleting,
    successPopup,
    handleSelectItem: handleSelectType,
    handleSelectAll,
    handleClearSelection,
    handleBulkDelete,
    cleanupSelection,
    closeSuccessPopup,
    isSelected,
    isAllSelected
  } = useBulkSelection();

  // Nettoyer les sélections quand la liste de types change
  useEffect(() => {
    cleanupSelection(eventTypes);
  }, [eventTypes, cleanupSelection]);

  const handleCreateEventType = async (eventTypeData) => {
    if (selectedType) {
      // Si on est en mode édition, on demande confirmation AU MOMENT de soumettre le formulaire
      setPendingData(eventTypeData);
      setConfirmModal({
        show: true,
        title: 'Modifier le type ?',
        message: `Voulez-vous vraiment enregistrer les modifications pour le type "${selectedType.nom}" ?`,
        type: 'primary',
        onConfirm: async () => {
          // Utiliser les données stockées
          await onCreateEventType(eventTypeData, selectedType.id);
          setShowForm(false);
          setSelectedType(null);
          setPendingData(null);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      });
    } else {
      // Mode création : direct
      await onCreateEventType(eventTypeData);
      setShowForm(false);
    }
  };

  const handleEditClick = (type) => {
    // Plus de confirmation avant d'ouvrir le formulaire
    setSelectedType(type);
    setShowForm(true);
  };

  const handleDeleteClick = (type) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer le type ?',
      message: `Êtes-vous sûr de vouloir supprimer le type "${type.nom}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        await onDeleteEventType(type.id);
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Gestion de la suppression multiple
  const handleBulkDeleteTypes = async () => {
    try {
      await handleBulkDelete(
        eventTypesAPI.bulkDeleteEventTypes, 
        (result) => {
          // Appeler la fonction de callback du parent avec les IDs supprimés
          if (onBulkDeleteEventTypes && result.success && result.success.length > 0) {
            onBulkDeleteEventTypes(result.success);
          }
        },
        "type d'événement",
        "types d'événements"
      );
    } catch (error) {
      alert('Erreur lors de la suppression des types d\'événements');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Types d'événements</h1>
          <p className="text-xs text-gray-500">Définissez les catégories d'événements que vous organisez</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 shadow-lg transition-all flex items-center gap-2"
          style={{ backgroundColor: '#31a7df' }}
        >
          <i className="fas fa-plus text-xs"></i>
          Nouveau type
        </button>
      </div>
      
      {/* Toolbar de sélection multiple */}
      <BulkSelectionToolbar
        selectedItems={selectedTypes}
        onBulkDelete={handleBulkDeleteTypes}
        onClearSelection={handleClearSelection}
        itemName="type d'événement"
        itemNamePlural="types d'événements"
        isDeleting={isDeleting}
      />
      
      {eventTypes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <i className="fas fa-tags text-gray-400 text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-6">Aucun type d'événement créé</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: '#31a7df' }}
          >
            Créer le premier type
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected(eventTypes)}
                      onChange={() => handleSelectAll(eventTypes)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700 text-xs">Type</th>
                  <th className="text-left py-3 font-semibold text-gray-700 text-xs">Créé le</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected(type.id)}
                        onChange={() => handleSelectType(type.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2596d1] text-sm mr-3">
                          <i className="fas fa-tag"></i>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{type.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(type.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right flex justify-end gap-1">
                      <button 
                        onClick={() => handleEditClick(type)}
                        className="p-1.5 text-[#31a7df] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(type)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
      />

      {/* Modal Form */}
      {showForm && (
        <EventTypeForm
          initialData={selectedType}
          onSubmit={handleCreateEventType}
          onCancel={() => {
            setShowForm(false);
            setSelectedType(null);
          }}
        />
      )}

      {/* Success Popup */}
      <SuccessPopup
        isOpen={successPopup.show}
        message={successPopup.message}
        onClose={closeSuccessPopup}
      />
    </div>
  );
}