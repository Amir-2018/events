import { useState, useEffect } from 'react';
import { reclamationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  'En attente': 'bg-amber-100 text-amber-700 border-amber-200',
  'En cours': 'bg-blue-50 text-[#2596d1] border-blue-200',
  'Terminé': 'bg-green-100 text-green-700 border-green-200',
  'Résolu': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejeté': 'bg-red-100 text-red-700 border-red-200'
};

export default function ReclamationsSection() {
  const { user } = useAuth();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // États pour le formulaire d'envoi (admin/client)
  const [formData, setFormData] = useState({
    sujet: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'superadmin') {
      loadReclamations();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  // Fonction pour charger les réclamations (superadmin seulement)
  const loadReclamations = async () => {
    try {
      setLoading(true);
      const response = await reclamationsAPI.getReclamations();
      setReclamations(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement réclamations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le changement de statut (superadmin seulement)
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await reclamationsAPI.updateReclamationStatus(id, newStatus);
      setReclamations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingId(null);
    }
  };

  // Fonctions pour le formulaire d'envoi (admin/client)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sujet.trim() || !formData.description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const reclamationData = {
        client_id: user.id,
        client_email: user.email,
        client_nom: user.nom,
        client_prenom: user.prenom,
        sujet: formData.sujet.trim(),
        description: formData.description.trim()
      };

      await reclamationsAPI.createReclamation(reclamationData);
      
      setSuccess(true);
      setFormData({ sujet: '', description: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la réclamation');
    } finally {
      setSubmitting(false);
    }
  };
  // Interface pour superadmin (gestion des réclamations)
  if (user?.role === 'superadmin') {
    if (loading) {
      return (
        <div className="p-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement des réclamations...</p>
        </div>
      );
    }

    return (
      <div className="w-full animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Gestion des Réclamations</h1>
            <p className="text-xs text-gray-500">Suivi et résolution des retours clients</p>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <span className="text-[#31a7df] font-bold text-sm">{reclamations.length} total</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Sujet / Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Image</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reclamations.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {r.client_prenom?.[0] || '?'}{r.client_nom?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold text-sm mb-1">
                            {r.client_prenom && r.client_nom 
                              ? `${r.client_prenom} ${r.client_nom}` 
                              : 'Client anonyme'
                            }
                          </p>
                          <p className="text-xs text-gray-400">
                            {r.client_email || 'Aucun email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-gray-900 font-bold text-sm mb-1">{r.sujet}</p>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{r.description}</p>
                      <p className="text-xs text-gray-300 mt-1">Reçue le {new Date(r.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.image ? (
                        <div className="flex justify-center">
                          <img 
                            src={r.image} 
                            alt="Image réclamation" 
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => window.open(r.image, '_blank')}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                         {updatingId === r.id ? (
                           <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-b-transparent mx-2"></div>
                         ) : (
                           <>
                              <button 
                                onClick={() => handleStatusChange(r.id, 'En cours')}
                                disabled={r.status === 'En cours'}
                                className={`p-2 rounded-lg transition-all border ${
                                  r.status === 'En cours' 
                                  ? 'bg-gray-50 text-gray-300 border-gray-100' 
                                  : 'bg-white text-[#31a7df] border-blue-100 hover:bg-[#31a7df] hover:text-white hover:shadow-sm'
                                }`}
                                title="Mettre en cours"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleStatusChange(r.id, 'Résolu')}
                                disabled={r.status === 'Résolu'}
                                className={`p-2 rounded-lg transition-all border ${
                                  r.status === 'Résolu' 
                                  ? 'bg-gray-50 text-gray-300 border-gray-100' 
                                  : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:shadow-sm'
                                }`}
                                title="Marquer comme résolu"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleStatusChange(r.id, 'Rejeté')}
                                disabled={r.status === 'Rejeté'}
                                className={`p-2 rounded-lg transition-all border ${
                                  r.status === 'Rejeté' 
                                  ? 'bg-gray-50 text-gray-300 border-gray-100' 
                                  : 'bg-white text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:shadow-sm'
                                }`}
                                title="Rejeter la réclamation"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                           </>
                         )}
                      </div>
                    </td>
                  </tr>
                ))}
                {reclamations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 font-bold text-xs">Aucune réclamation à traiter</p>
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
  // Interface pour admin/client (formulaire d'envoi de réclamation)
  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Envoyer une Réclamation</h1>
          <p className="text-xs text-gray-500">Contactez notre équipe support pour toute question ou problème</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <div>
              <p className="text-green-800 font-bold text-sm">Réclamation envoyée avec succès!</p>
              <p className="text-green-600 text-xs">Notre équipe vous répondra dans les plus brefs délais.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sujet de la réclamation *
            </label>
            <input
              type="text"
              value={formData.sujet}
              onChange={(e) => handleInputChange('sujet', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Décrivez brièvement votre problème..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description détaillée *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Expliquez votre problème en détail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Image (optionnelle)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors relative">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="max-w-full h-48 object-contain mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer l'image
                  </button>
                </div>
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p className="text-gray-600 text-sm mb-2">Cliquez pour ajouter une image</p>
                  <p className="text-gray-400 text-xs">PNG, JPG jusqu'à 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                  Envoi en cours...
                </div>
              ) : (
                'Envoyer la réclamation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}