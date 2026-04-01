import { useState, useEffect } from 'react';
import { clientsAPI } from '../lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function InscritsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAllClients();
      setClients(response.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des inscrits:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getInitials = (client) => {
    const first = (client.prenom || '').charAt(0).toUpperCase();
    const last = (client.nom || '').charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  const filteredClients = clients.filter(client => 
    client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (client) => {
    setSelectedClient(client);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = async (client) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${client.prenom} ${client.nom} ?`)) {
      try {
        await clientsAPI.deleteClient(client.id);
        loadClients(); // Recharger la liste
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des inscrits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <i className="fas fa-users text-[#31a7df] mr-3"></i>
              Gestion des Inscrits
            </h1>
            <p className="text-gray-600">Gérez tous les clients inscrits aux événements</p>
          </div>
          
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-[#31a7df] text-white rounded-xl font-semibold hover:bg-[#2596d1] transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Nouvel Inscrit
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Inscrits</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-[#31a7df] text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Inscrits Actifs</p>
                <p className="text-3xl font-bold text-green-600">{clients.filter(c => c.events?.length > 0).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-check text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Nouveaux ce mois</p>
                <p className="text-3xl font-bold text-purple-600">
                  {clients.filter(c => {
                    const created = new Date(c.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-plus text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucun inscrit'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Aucun inscrit ne correspond à votre recherche.' 
                : 'Il n\'y a actuellement aucun inscrit dans le système.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <i className="fas fa-user mr-2"></i>Inscrit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <i className="fas fa-envelope mr-2"></i>Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <i className="fas fa-calendar mr-2"></i>Événements
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <i className="fas fa-clock mr-2"></i>Inscription
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <i className="fas fa-cog mr-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {getInitials(client)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {client.prenom} {client.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {client.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <i className="fas fa-envelope text-gray-400 mr-2"></i>
                          {client.email}
                        </div>
                        {client.tel && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <i className="fas fa-phone text-gray-400 mr-2"></i>
                            {client.tel}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                            <i className="fas fa-calendar-check mr-1"></i>
                            {client.events?.length || 0} événement{(client.events?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <i className="fas fa-calendar-plus mr-2"></i>
                        {formatDate(client.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(client)}
                            className="p-2 text-[#31a7df] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <ClientModal
            client={selectedClient}
            mode={modalMode}
            onClose={closeModal}
            onSave={loadClients}
          />
        )}
      </div>
    </div>
  );
}

// Composant Modal pour les détails/édition/création
function ClientModal({ client, mode, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: client?.nom || '',
    prenom: client?.prenom || '',
    email: client?.email || '',
    tel: client?.tel || '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await clientsAPI.createClient(formData);
      } else if (mode === 'edit') {
        await clientsAPI.updateClient(client.id, formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nouvel Inscrit' : mode === 'edit' ? 'Modifier l\'Inscrit' : 'Détails de l\'Inscrit';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <i className={`fas ${mode === 'create' ? 'fa-user-plus' : mode === 'edit' ? 'fa-user-edit' : 'fa-user'} mr-3`}></i>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-user mr-2"></i>Prénom
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent disabled:bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-user mr-2"></i>Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent disabled:bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-envelope mr-2"></i>Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isReadOnly}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent disabled:bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-phone mr-2"></i>Téléphone
              </label>
              <input
                type="tel"
                value={formData.tel}
                onChange={(e) => setFormData({...formData, tel: e.target.value})}
                disabled={isReadOnly}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-lock mr-2"></i>Mot de passe
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent"
                  required
                  minLength="6"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>
            )}

            {client && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-calendar-check mr-2"></i>
                  Événements inscrits ({client.events?.length || 0})
                </h3>
                {client.events?.length > 0 ? (
                  <div className="space-y-2">
                    {client.events.map((event, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{event.nom}</p>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-calendar mr-1"></i>
                            {event.date ? format(new Date(event.date), 'dd MMM yyyy', { locale: fr }) : 'Date non définie'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <i className="fas fa-check mr-1"></i>Inscrit
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun événement</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-times mr-2"></i>
                {isReadOnly ? 'Fermer' : 'Annuler'}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#31a7df] text-white rounded-xl hover:bg-[#2596d1] transition-colors"
                >
                  <i className="fas fa-save mr-2"></i>
                  {mode === 'create' ? 'Créer' : 'Sauvegarder'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}