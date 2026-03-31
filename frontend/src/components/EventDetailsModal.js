import { useState, useEffect } from 'react';
import { eventsAPI } from '../lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventDetailsModal({ event, onClose }) {
  const [activeTab, setActiveTab] = useState('infos');
  const [souvenirs, setSouvenirs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingSouvenirs, setLoadingSouvenirs] = useState(false);
  const [newSouvenir, setNewSouvenir] = useState({ url: '', type: 'image' });
  const [isSubmittingSouvenir, setIsSubmittingSouvenir] = useState(false);

  useEffect(() => {
    if (activeTab === 'souvenirs') {
      fetchSouvenirs();
    }
    // We already have some event data, but clients might need to be fetched if not fully populated.
    // For now, we assume event.clients is available or we fetch them if needed.
    // Assuming event.clients is passed from the parent if we need it, or we use the local state.
    setClients(event.clients || []);
  }, [activeTab, event]);

  const fetchSouvenirs = async () => {
    try {
      setLoadingSouvenirs(true);
      const response = await eventsAPI.getSouvenirs(event.id);
      if (response.data.success) {
        setSouvenirs(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des souvenirs:', error);
    } finally {
      setLoadingSouvenirs(false);
    }
  };

  const handleAddSouvenir = async (e) => {
    e.preventDefault();
    if (!newSouvenir.url) return;

    try {
      setIsSubmittingSouvenir(true);
      const response = await eventsAPI.addSouvenir(event.id, newSouvenir);
      if (response.data.success) {
        setSouvenirs([response.data.data, ...souvenirs]);
        setNewSouvenir({ url: '', type: 'image' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du souvenir:', error);
    } finally {
      setIsSubmittingSouvenir(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const hasMap = !!event.bien_latitude && !!event.bien_longitude;

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.date);
    const endDate = event.date_fin ? new Date(event.date_fin) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    if (now < startDate) return { label: 'À venir', classes: 'border-amber-200 text-amber-700 bg-amber-50' };
    if (now >= startDate && now <= endDate) return { label: 'En cours', classes: 'border-green-200 text-green-700 bg-green-50 animate-pulse' };
    return { label: 'Terminé', classes: 'border-blue-200 text-blue-700 bg-blue-50' };
  };

  const status = getEventStatus();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                {event.type_evenement_nom}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none border ${status.classes}`}>
                 {status.label}
              </span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{event.nom}</h2>
            <div className="flex items-center text-gray-500 text-sm mt-3 font-medium">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2 text-blue-500">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
               </svg>
               {formatDate(event.date)}
               {event.date_fin && ` - ${formatDate(event.date_fin)}`}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-200 rounded-2xl transition-all text-gray-400 hover:text-gray-900 bg-white shadow-sm border border-gray-100 ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-8 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('infos')}
            className={`py-4 px-6 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'infos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
          >
            Informations & Inscrits
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-4 px-6 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
          >
            Emplacement
          </button>
          <button
            onClick={() => setActiveTab('souvenirs')}
            className={`py-4 px-6 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'souvenirs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
          >
            Souvenirs
          </button>
        </div>

        <div className="flex-grow overflow-y-auto bg-white">
          
          {/* TAB: INFOS & CLIENTS */}
          {activeTab === 'infos' && (
             <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Event details */}
                <div className="space-y-6">
                   <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Lieu de l'événement</h4>
                      {event.bien_nom ? (
                         <>
                            <p className="font-bold text-gray-900 text-lg">{event.bien_nom}</p>
                            <p className="text-gray-500 text-sm mt-1">{event.adresse || event.bien_adresse}</p>
                         </>
                      ) : (
                         <p className="font-medium text-gray-900 text-base">{event.adresse || 'Adresse non spécifiée'}</p>
                      )}
                   </div>
                   
                   <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Capacité</h4>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-blue-600 leading-none">{clients.length}</span>
                         <span className="text-blue-400 font-bold mb-1">/ {event.max_participants || '∞'} participants</span>
                      </div>
                   </div>
                </div>

                {/* Right Col: Clients */}
                <div className="lg:col-span-2">
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0  4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                       </svg>
                       Liste des Inscrits
                   </h3>
                   
                   {clients.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                         <p className="text-gray-400 font-medium">Aucun participant n'est encore inscrit.</p>
                      </div>
                   ) : (
                      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                         <ul className="divide-y divide-gray-50">
                            {clients.map(client => (
                               <li key={client.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm shadow-inner">
                                        {client.prenom[0]}{client.nom[0]}
                                     </div>
                                     <div>
                                        <p className="font-bold text-gray-900">{client.prenom} {client.nom}</p>
                                        <p className="text-xs text-gray-500 font-medium">{client.email || 'Aucun email'}</p>
                                     </div>
                                  </div>
                                  <p className="text-xs text-gray-400 font-medium">{client.telephone || ''}</p>
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* TAB: MAP */}
          {activeTab === 'map' && (
             <div className="p-8 h-full flex flex-col">
                {hasMap ? (
                   <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-[100px] bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 max-w-xs text-center">
                         <h3 className="font-black text-gray-900 uppercase tracking-tighter italic text-lg line-clamp-1">{event.bien_nom}</h3>
                         <p className="text-gray-500 text-xs font-medium mt-1 leading-tight line-clamp-2">{event.adresse || event.bien_adresse}</p>
                         <div className="mt-2 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Position</span>
                         </div>
                      </div>
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(event.bien_longitude)-0.005}%2C${parseFloat(event.bien_latitude)-0.005}%2C${parseFloat(event.bien_longitude)+0.005}%2C${parseFloat(event.bien_latitude)+0.005}&layer=mapnik&marker=${event.bien_latitude}%2C${event.bien_longitude}`}
                        className="w-full h-full grayscale-[0.2] contrast-[1.1]"
                      ></iframe>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                         </svg>
                      </div>
                      <p className="text-gray-900 font-bold text-lg mb-2">Aucune coordonnée GPS</p>
                      <p className="text-gray-500 font-medium max-w-sm text-center">
                         Cet événement n'est pas lié à un bien ou ne possède pas de coordonnées GPS.
                      </p>
                      <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
                         <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Adresse Textuelle</p>
                         <p className="font-bold text-gray-900">{event.adresse || 'Non spécifiée'}</p>
                      </div>
                   </div>
                )}
             </div>
          )}

          {/* TAB: SOUVENIRS */}
          {activeTab === 'souvenirs' && (
             <div className="p-8">
                <form onSubmit={handleAddSouvenir} className="mb-10 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Ajouter une image souvenir</h3>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-grow w-full">
                      <label 
                        className="flex flex-col items-center justify-center w-full h-24 bg-white border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-50/50 transition-all group overflow-hidden relative"
                      >
                        {newSouvenir.url ? (
                          <div className="absolute inset-0 z-10">
                            <img src={newSouvenir.url} className="w-full h-full object-cover opacity-50" alt="Preview" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-blue-700 font-bold text-sm bg-white/80 px-3 py-1 rounded-lg">Image sélectionnée</span>
                              <span className="text-xs text-blue-500 mt-1">Cliquez pour changer</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-6 h-6 text-blue-400 group-hover:text-blue-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Choisir une image depuis votre appareil</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewSouvenir({ url: reader.result, type: 'image' });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        type="submit"
                        disabled={isSubmittingSouvenir || !newSouvenir.url}
                        className="px-8 py-4 h-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
                      >
                        {isSubmittingSouvenir ? 'Envoi...' : 'Partager'}
                      </button>
                    </div>
                  </div>
                </form>

                {loadingSouvenirs ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Chargement des souvenirs...</p>
                  </div>
                ) : souvenirs.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Aucun souvenir partagé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          )}
        </div>
      </div>
    </div>
  );
}
