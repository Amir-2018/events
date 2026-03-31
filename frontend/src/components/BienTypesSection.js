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
  const [formData, setFormData] = useState({ nom: '', description: '' });
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
          setFormData({ nom: '', description: '' });
          setPendingData(null);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      });
    } else {
      await onCreateTypeBien(formData);
      setShowForm(false);
      setFormData({ nom: '', description: '' });
    }
  };

  const handleEdit = (type) => {
    setFormData({ nom: type.nom, description: type.description || '' });
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tighter">Types de biens</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Gérez les catégories de lieux pour vos événements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#31a7df] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2596d1] shadow-lg hover:shadow-gray-200 transition-all flex items-center gap-3"
        >
          <i className="fas fa-plus"></i>
          Nouvelle catégorie
        </button>
      </div>

      {bienTypes.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fas fa-home text-gray-400 text-2xl"></i>
          </div>
          <p className="text-gray-500 text-lg font-medium mb-8">Aucun type de bien enregistré</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#31a7df] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2596d1] transition-all shadow-lg"
          >
            Créer la première catégorie
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-8 py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Catégorie</th>
                  <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Description</th>
                  <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Mise à jour</th>
                  <th className="text-right px-8 py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bienTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2596d1] font-bold mr-4">
                          <i className="fas fa-home"></i>
                        </div>
                        <span className="font-bold text-gray-900">{type.nom}</span>
                      </div>
                    </td>
                    <td className="py-5 font-medium text-gray-500 max-w-md truncate">
                      {type.description || 'Aucune description'}
                    </td>
                    <td className="py-5 text-gray-400 font-medium text-sm">
                      {new Date(type.updated_at || type.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(type)}
                        className="p-2 text-[#31a7df] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(type)}
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

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg transform animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                {editingType ? 'Modifier catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingType(null);
                  setFormData({ nom: '', description: '' });
                }} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Nom du type</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Villa, Bureau, Loft..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-[#31a7df]/10 text-gray-900 font-bold placeholder-gray-300 transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Décrivez ce type de bien..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-[#31a7df]/10 text-gray-900 font-bold placeholder-gray-300 transition-all text-lg resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingType(null);
                    setFormData({ nom: '', description: '' });
                  }}
                  className="flex-1 py-5 px-8 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !formData.nom.trim()}
                  className="flex-[2] bg-[#31a7df] text-white py-5 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#2596d1] shadow-xl shadow-gray-200 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isProcessing ? 'Sauvegarde...' : editingType ? 'Mettre à jour' : 'Confirmer la création'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
