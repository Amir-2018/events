import { useState, useEffect } from 'react';
import { usersAPI } from '../lib/api';

export default function UserModal({ isOpen, onClose, onSubmit, userToEdit = null, isSaving = false }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    username: '',
    role_id: '',
    password: ''
  });
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Use the isSaving prop if it's provided, otherwise fallback to local saving (for reverse compat if needed)
  const isCurrentlySaving = isSaving || saving;

  const isEdit = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      if (userToEdit) {
        setFormData({
          nom: userToEdit.nom || '',
          prenom: userToEdit.prenom || '',
          username: userToEdit.username || '',
          role_id: userToEdit.role_id || '',
          password: '' // Don't show password
        });
      } else {
        setFormData({ nom: '', prenom: '', username: '', role_id: roles[0]?.id || '', password: '' });
      }
    }
  }, [isOpen, userToEdit]);

  const loadRoles = async () => {
    try {
      const response = await usersAPI.getRoles();
      const rolesData = response.data.data || [];
      setRoles(rolesData);
      if (rolesData.length > 0 && !formData.role_id && !userToEdit) {
        setFormData(prev => ({ ...prev, role_id: rolesData[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
      return;
    }
    
    // Fallback if onSubmit is not provided: API call remains local
    setSaving(true);
    setError('');

    try {
      let response;
      if (isEdit) {
        const { password, ...updateData } = formData;
        response = await usersAPI.updateUser(userToEdit.id, updateData);
      } else {
        response = await usersAPI.createUser(formData);
      }
      onUserSaved(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Erreur ${isEdit ? 'modification' : 'création'} membre`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isEdit ? 'Modifier Membre' : 'Nouveau Membre'}
              </h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">
                {isEdit ? `Mise à jour de ${userToEdit.username}` : 'Ajouter à l\'équipe administrative'}
              </p>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-2 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-bold text-gray-900" placeholder="Jean" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-bold text-gray-900" placeholder="DUPONT" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Identifiant (Login)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-bold text-gray-900" placeholder="j.dupont" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Rôle</label>
            <select name="role_id" value={formData.role_id} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-bold text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat">
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.nom}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mot de passe provisoire</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-bold text-gray-900" placeholder="••••••••" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-4 px-6 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCurrentlySaving}
              className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/30 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCurrentlySaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ENREGISTREMENT...
                </>
              ) : (
                isEdit ? 'METTRE À JOUR' : 'VALIDER LE MEMBRE'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
