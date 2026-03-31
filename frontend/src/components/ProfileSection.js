import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../lib/api';
import ConfirmationModal from './ConfirmationModal';

export default function ProfileSection() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    username: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmModal({
      show: true,
      title: 'Enregistrer les modifications ?',
      message: 'Voulez-vous vraiment mettre à jour vos informations de profil ?',
      type: 'primary',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        await handleSave();
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await usersAPI.updateUser(user.id, {
        ...formData,
        role_id: user.role_id // Preserve role_id
      });
      
      if (response.data.success) {
        // Update local auth context with new data
        setUser({
          ...user,
          ...formData
        });
        alert('Profil mis à jour avec succès');
      }
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-200 mx-auto mb-6 border-4 border-white ring-8 ring-blue-50/50">
          {user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '??'}
        </div>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">{user?.prenom} {user?.nom}</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-3">{user?.role} • {user?.username}</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                <input 
                  type="text" 
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 placeholder-gray-300"
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                <input 
                  type="text" 
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 placeholder-gray-300"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identifiant (Login)</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 placeholder-gray-300"
                placeholder="nom.utilisateur"
              />
            </div>

            <div className="space-y-2 bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200 opacity-60">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1 cursor-not-allowed">Rôle (Non modifiable)</label>
              <div className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">
                {user?.role}
              </div>
              <p className="text-[9px] text-gray-300 font-bold uppercase mt-2 italic">* Seul un super-administrateur peut modifier votre rôle.</p>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Mettre à jour le profil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
        type={confirmModal.type}
      />
    </div>
  );
}
