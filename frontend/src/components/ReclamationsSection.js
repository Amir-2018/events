import { useState, useEffect } from 'react';
import { reclamationsAPI } from '../lib/api';

const STATUS_COLORS = {
  'En attente': 'bg-amber-100 text-amber-700 border-amber-200',
  'En cours': 'bg-blue-50 text-[#2596d1] border-blue-200',
  'Terminé': 'bg-green-100 text-green-700 border-green-200',
  'Résolu': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejeté': 'bg-red-100 text-red-700 border-red-200'
};

export default function ReclamationsSection() {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadReclamations();
  }, []);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await reclamationsAPI.updateReclamationStatus(id, newStatus);
      // Mettre à jour localement pour un feedback immédiat
      setReclamations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingId(null);
    }
  };

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
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">Gestion des Réclamations</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-3">Suivi et résolution des retours clients</p>
        </div>
        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
          <span className="text-[#31a7df] font-black text-sm">{reclamations.length} total</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sujet / Description</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Image</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Statut</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reclamations.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-gray-100 transition-transform group-hover:scale-110">
                        {r.client_prenom?.[0] || '?'}{r.client_nom?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-gray-900 font-black uppercase tracking-tighter italic leading-none mb-1">
                          {r.client_prenom && r.client_nom 
                            ? `${r.client_prenom} ${r.client_nom}` 
                            : 'Client anonyme'
                          }
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 lowercase">
                          {r.client_email || 'Aucun email'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 max-w-md">
                    <p className="text-gray-900 font-black uppercase tracking-tighter text-sm mb-1">{r.sujet}</p>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2">{r.description}</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase mt-2">Reçue le {new Date(r.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-7 text-center">
                    {r.image ? (
                      <div className="flex justify-center">
                        <img 
                          src={r.image} 
                          alt="Image réclamation" 
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(r.image, '_blank')}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-7 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex justify-end gap-2">
                       {updatingId === r.id ? (
                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-b-transparent mx-2"></div>
                       ) : (
                         <>
                            <button 
                              onClick={() => handleStatusChange(r.id, 'En cours')}
                              disabled={r.status === 'En cours'}
                              className={`p-2.5 rounded-xl transition-all border ${
                                r.status === 'En cours' 
                                ? 'bg-gray-50 text-gray-300 border-gray-100' 
                                : 'bg-white text-[#31a7df] border-blue-100 hover:bg-[#31a7df] hover:text-white hover:shadow-lg hover:shadow-gray-100'
                              }`}
                              title="Mettre en cours"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleStatusChange(r.id, 'Résolu')}
                              disabled={r.status === 'Résolu'}
                              className={`p-2.5 rounded-xl transition-all border ${
                                r.status === 'Résolu' 
                                ? 'bg-gray-50 text-gray-300 border-gray-100' 
                                : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-100'
                              }`}
                              title="Marquer comme résolu"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleStatusChange(r.id, 'Rejeté')}
                              disabled={r.status === 'Rejeté'}
                              className={`p-2.5 rounded-xl transition-all border ${
                                r.status === 'Rejeté' 
                                ? 'bg-gray-50 text-gray-300 border-gray-100' 
                                : 'bg-white text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100'
                              }`}
                              title="Rejeter la réclamation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
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
                  <td colSpan="5" className="py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Aucune réclamation à traiter</p>
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
