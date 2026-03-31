import { useState, useEffect } from 'react';
import { usersAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import UserModal from './UserModal';
import ConfirmationModal from './ConfirmationModal';

export default function UsersSection() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u) => {
    setUserToEdit(u);
    setShowModal(true);
  };

  const handleCreate = () => {
    setUserToEdit(null);
    setShowModal(true);
  };

  const handleUserSubmit = async (formData) => {
    if (userToEdit) {
      // Mode édition : demande de confirmation
      setConfirmModal({
        show: true,
        title: 'Modifier le membre ?',
        message: `Voulez-vous vraiment enregistrer les modifications pour ${userToEdit.prenom} ${userToEdit.nom} ?`,
        type: 'primary',
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, show: false }));
          await performSave(formData);
        }
      });
    } else {
      // Mode création : direct
      await performSave(formData);
    }
  };

  const performSave = async (formData) => {
    try {
      setIsSaving(true);
      if (userToEdit) {
        const { password, ...updateData } = formData;
        await usersAPI.updateUser(userToEdit.id, updateData);
      } else {
        await usersAPI.createUser(formData);
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (u) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer le membre ?',
      message: `Êtes-vous sûr de vouloir supprimer ${u.prenom} ${u.nom} ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await usersAPI.deleteUser(u.id);
          setConfirmModal(prev => ({ ...prev, show: false }));
          loadUsers();
        } catch (err) {
          alert(err.response?.data?.message || 'Erreur lors de la suppression');
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const handleStatusUpdate = async (u, newStatus) => {
    const actionLabel = newStatus === 'accepted' ? 'accepter' : 'refuser';
    setConfirmModal({
      show: true,
      title: `${newStatus === 'accepted' ? 'Accepter' : 'Refuser'} la demande ?`,
      message: `Voulez-vous vraiment ${actionLabel} la demande d'accès de ${u.prenom} ${u.nom} ?`,
      type: newStatus === 'accepted' ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await usersAPI.updateUserStatus(u.id, newStatus);
          setConfirmModal(prev => ({ ...prev, show: false }));
          loadUsers();
        } catch (err) {
          alert(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  if (loading) {
    return <div className="p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tighter">Gestion de l'équipe</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Gérez les administrateurs et super-administrateurs du système</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouveau membre
        </button>
      </div>

      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleUserSubmit}
        userToEdit={userToEdit}
        isSaving={isSaving}
      />

      <ConfirmationModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
        type={confirmModal.type}
      />

      {/* Users List */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-8 py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Membre</th>
                <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Identifiant</th>
                <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Rôle</th>
                <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Statut</th>
                <th className="text-left py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Créé le</th>
                <th className="text-right px-8 py-5 font-bold text-gray-700 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-4">
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <span className="font-bold text-gray-900">{u.prenom} {u.nom}</span>
                    </div>
                  </td>
                  <td className="py-5 font-medium text-gray-600">{u.username}</td>
                  <td className="py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      u.role_nom === 'superadmin' 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {u.role_nom}
                    </span>
                  </td>
                  <td className="py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.status === 'accepted' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : u.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {u.status === 'accepted' ? 'Accepté' : u.status === 'pending' ? 'En attente' : 'Refusé'}
                    </span>
                  </td>
                  <td className="py-5 text-gray-500 font-medium">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    {u.status === 'pending' && (
                      <div className="flex gap-1 mr-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <button 
                          onClick={() => handleStatusUpdate(u, 'accepted')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                          title="Accepter"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(u, 'refused')}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                          title="Refuser"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => handleEdit(u)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    {u.id !== currentUser?.id && (
                      <button 
                        onClick={() => openDeleteModal(u)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.244 2.077H8.084a2.25 2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="text-gray-300 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aucun membre de l'équipe</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
