import { useState } from 'react';
import EventTypeForm from './EventTypeForm';
import ConfirmationModal from './ConfirmationModal';

export default function EventTypesSection({ 
  eventTypes, 
  onCreateEventType, 
  onDeleteEventType, 
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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tighter">Types d'événements</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Définissez les catégories d'événements que vous organisez</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-3"
        >
          <i className="fas fa-plus"></i>
          Nouveau type
        </button>
      </div>
      
      {eventTypes.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fas fa-tags text-gray-400 text-2xl"></i>
          </div>
          <p className="text-gray-500 text-lg font-medium mb-8">Aucun type d'événement créé</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Créer le premier type
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-8 py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Type</th>
                  <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Description</th>
                  <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Créé le</th>
                  <th className="text-right px-8 py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-4">
                          <i className="fas fa-tag"></i>
                        </div>
                        <span className="font-bold text-gray-900">{type.nom}</span>
                      </div>
                    </td>
                    <td className="py-5 font-medium text-gray-500 max-w-md truncate">
                      {type.description || 'Aucune description'}
                    </td>
                    <td className="py-5 text-gray-400 font-medium text-sm">
                      {new Date(type.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(type)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(type)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <i className="fas fa-trash"></i>
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
    </div>
  );
}