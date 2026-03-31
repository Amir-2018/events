import { useState, useEffect } from 'react';
import { eventsAPI } from '../lib/api';

export default function EventSouvenirsModal({ event, onClose }) {
  const [souvenirs, setSouvenirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSouvenir, setNewSouvenir] = useState({ url: '', type: 'image' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSouvenirs();
  }, [event.id]);

  const fetchSouvenirs = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getSouvenirs(event.id);
      if (response.data.success) {
        setSouvenirs(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des souvenirs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSouvenir = async (e) => {
    e.preventDefault();
    if (!newSouvenir.url) return;

    try {
      setIsSubmitting(true);
      const response = await eventsAPI.addSouvenir(event.id, newSouvenir);
      if (response.data.success) {
        setSouvenirs([response.data.data, ...souvenirs]);
        setNewSouvenir({ url: '', type: 'image' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du souvenir:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSouvenir = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce souvenir ?')) return;

    try {
      const response = await eventsAPI.deleteSouvenir(id);
      if (response.data.success) {
        setSouvenirs(souvenirs.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du souvenir:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Souvenirs de l'événement</h2>
            <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">{event.nom}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8">
          {/* Upload Section */}
          <form onSubmit={handleAddSouvenir} className="mb-10 p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Ajouter un souvenir</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="URL de l'image ou de la vidéo..."
                  value={newSouvenir.url}
                  onChange={(e) => setNewSouvenir({ ...newSouvenir, url: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white border border-blue-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={newSouvenir.type}
                  onChange={(e) => setNewSouvenir({ ...newSouvenir, type: e.target.value })}
                  className="px-5 py-3.5 bg-white border border-blue-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <option value="image">Image</option>
                  <option value="video">Vidéo</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting || !newSouvenir.url}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                  {isSubmitting ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </form>

          {/* Gallery Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Chargement de la galerie...</p>
            </div>
          ) : souvenirs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Aucun souvenir partagé pour cet événement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {souvenirs.map((souvenir) => (
                <div key={souvenir.id} className="group relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  {souvenir.type === 'image' ? (
                    <img src={souvenir.url} alt="Souvenir" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <video src={souvenir.url} className="w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                              <path d="M8 5v14l11-7z" />
                           </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button
                        onClick={() => handleDeleteSouvenir(souvenir.id)}
                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all scale-90 group-hover:scale-100 active:scale-90"
                        title="Supprimer"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
