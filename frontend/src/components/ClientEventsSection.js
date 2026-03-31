import React from 'react';

export default function ClientEventsSection({ events, onUnregister, isProcessing }) {
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-2 italic">Mes <span className="text-[#31a7df]">Inscriptions</span></h2>
          <p className="text-gray-500 font-medium tracking-wide">Gérez vos participations aux événements à venir.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-100 p-16 rounded-[40px] text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#31a7df] shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zM15 12h.008v.008H15v-.008zM15 15h.008v.008H15v-.008zM9 12h.008v.008H9v-.008zM9 15h.008v.008H9V15z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-3 italic">Aucune inscription</h3>
          <p className="text-gray-500 font-medium">Vous n'êtes inscrit à aucun événement pour le moment. Découvrez nos prochains événements sur la page d'accueil !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all group flex flex-col">
              {/* Event Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {event.image ? (
                  <img src={event.image} alt={event.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/50">
                  <span className="text-xs font-black uppercase tracking-widest text-[#31a7df]">
                    {event.type_evenement_nom || 'Événement'}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{event.nom}</h3>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start text-sm text-gray-500 gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <span className="font-medium leading-relaxed">{formatDate(event.date)}</span>
                  </div>
                  
                  {event.adresse && (
                    <div className="flex items-start text-sm text-gray-500 gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      <span className="font-medium leading-relaxed">{event.adresse}</span>
                    </div>
                  )}

                  {event.bien_nom && (
                     <div className="flex items-start text-sm text-gray-500 gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" /></svg>
                        <span className="font-medium leading-relaxed">{event.bien_nom}</span>
                     </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 mt-auto">
                  {isUpcoming(event.date) ? (
                    <button 
                      onClick={() => onUnregister(event.id)}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 hover:shadow-lg disabled:opacity-50"
                    >
                      Annuler l'inscription
                    </button>
                  ) : (
                    <div className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center bg-gray-50 text-gray-400 border border-gray-100">
                      Événement passé
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
