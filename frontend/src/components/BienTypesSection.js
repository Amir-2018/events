import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function BienTypesSection({ 
  bienTypes, 
  onCreateTypeBien, 
  onDeleteTypeBien, 
  isProcessing 
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ nom: '' });
  const [pendingData, setPendingData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingType) {
      setPendingData(formData);
      setConfirmModal({
        show: true,
        title: 'Modifier la catégorie ?',
        message: `Voulez-vous vraiment enregistrer les modifications pour la catégorie "${editingType.nom}" ?`,
        type: 'primary',
        onConfirm: async () => {
          await onCreateTypeBien(formData, editingType.id);
          setShowForm(false);
          setEditingType(null);
          setFormData({ nom: '' });
          setPendingData(null);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      });
    } else {
      await onCreateTypeBien(formData);
      setShowForm(false);
      setFormData({ nom: '' });
    }
  };

  const handleEdit = (type) => {
    setFormData({ nom: type.nom });
    setEditingType(type);
    setShowForm(true);
  };

  const handleDelete = (type) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer la catégorie ?',
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${type.nom}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        await onDeleteTypeBien(type.id);
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Types de biens</h1>
          <p className="text-xs text-gray-500">Gérez les catégories de lieux pour vos événements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 shadow-lg transition-all flex items-center gap-2"
          style={{ backgroundColor: '#31a7df' }}
        >
          <i className="fas fa-plus text-xs"></i>
          Nouvelle catégorie
        </button>
      </div>

      {bienTypes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <i className="fas fa-home text-gray-400 text-xl"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-6">Aucun type de bien enregistré</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: '#31a7df' }}
          >
            Créer la première catégorie
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-700 text-xs">Catégorie</th>
                  <th className="text-left py-3 font-semibold text-gray-700 text-xs">Mise à jour</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bienTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2596d1] text-sm mr-3">
                          <i className="fas fa-home"></i>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{type.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(type.updated_at || type.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right flex justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(type)}
                        className="p-1.5 text-[#31a7df] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(type)}
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

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg transform animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingType ? 'Modifier catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingType(null);
                  setFormData({ nom: '' });
                }} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom du type *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Villa, Bureau, Loft..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingType(null);
                    setFormData({ nom: '' });
                  }}
                  className="flex-1 py-2.5 px-4 bg-gray-50 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !formData.nom.trim()}
                  className="flex-[2] text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:opacity-90 shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#31a7df' }}
                >
                  {isProcessing ? 'Sauvegarde...' : editingType ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
