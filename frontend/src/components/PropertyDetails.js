import PropertyMap from './PropertyMap';

export default function PropertyDetails({ property, onClose, onEdit, onDelete }) {
  if (!property) return null;

  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 5); // Format HH:MM
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform animate-in zoom-in duration-300 border border-white/20">
        {/* Header Section */}
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#31a7df] flex items-center justify-center text-white shadow-xl shadow-gray-100">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18" />
               </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">{property.nom}</h2>
              <p className="text-[#31a7df] font-black uppercase tracking-widest text-[10px] mt-2">{property.type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-gray-400 hover:text-amber-600 hover:shadow-lg transition-all border border-gray-100 group"
                title="Modifier"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-gray-400 hover:text-red-600 hover:shadow-lg transition-all border border-gray-100 group"
                title="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover:rotate-90 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#31a7df] animate-pulse"></div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">À propos du bien</h3>
                </div>
                
                <div className="space-y-6">
                  {property.adresse && (
                    <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#31a7df] shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localisation exacte</p>
                        <p className="text-gray-900 font-bold leading-relaxed">{property.adresse}</p>
                      </div>
                    </div>
                  )}

                  {property.description && (
                    <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#31a7df] shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Informations détaillées</p>
                        <p className="text-gray-900 font-bold leading-relaxed italic">{property.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#31a7df] animate-pulse"></div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Disponibilités & Accès</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-gray-900 rounded-[1.5rem] shadow-xl">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Jours ouverts</p>
                      <p className="text-white font-black uppercase tracking-tighter text-sm italic">{property.jours_ouverture || 'Tous les jours'}</p>
                    </div>
                    <div className="p-6 bg-[#31a7df] rounded-[1.5rem] shadow-xl shadow-gray-100 flex flex-col justify-center">
                      <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-3">Plage horaire</p>
                      <p className="text-white font-black tracking-tighter text-lg leading-none italic">
                        {formatTime(property.horaire_ouverture)} <span className="text-blue-200">➟</span> {formatTime(property.horaire_fermeture)}
                      </p>
                    </div>
                  </div>

                  {property.latitude && property.longitude && (
                    <div className="p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Navigation GPS</p>
                      <div className="flex items-center justify-between">
                        <code className="text-[10px] font-black text-[#31a7df] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase">
                          {property.latitude.toString().slice(0, 8)}, {property.longitude.toString().slice(0, 8)}
                        </code>
                        <a 
                          href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}&zoom=15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-[#31a7df] transition-colors"
                        >
                          Ouvrir la carte
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Interactive Map Section */}
          {(property.latitude && property.longitude) && (
            <section className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#31a7df] animate-pulse"></div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Visualisation spatiale</h3>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-50 relative group">
                <PropertyMap 
                  latitude={parseFloat(property.latitude)}
                  longitude={parseFloat(property.longitude)}
                  nom={property.nom}
                  className="h-96 grayscale-[0.2] contrast-[1.1]"
                />
                <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-5 py-3 rounded-2xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{property.nom}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
