export default function RoomCard({ room, onDelete, onViewMap }) {
  const getHoraireDisplay = (horaires) => {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const todayHoraire = horaires[today];
    
    if (!todayHoraire || !todayHoraire.ouverture || !todayHoraire.fermeture) {
      return 'Fermé aujourd\'hui';
    }
    
    return `${todayHoraire.ouverture} - ${todayHoraire.fermeture}`;
  };

  const isOpenNow = (horaires) => {
    const now = new Date();
    const today = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const todayHoraire = horaires[today];
    
    if (!todayHoraire || !todayHoraire.ouverture || !todayHoraire.fermeture) {
      return false;
    }
    
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= todayHoraire.ouverture && currentTime <= todayHoraire.fermeture;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Background Gradient Detail */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
              {room.nom}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                isOpenNow(room.horaires) 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isOpenNow(room.horaires) ? '🟢 Ouvert' : '🔴 Fermé'}
              </span>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                👥 {room.capaciteMax} pers. max
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(room.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
            title="Supprimer la salle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {room.adresse}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Aujourd'hui: {getHoraireDisplay(room.horaires)}
          </div>
        </div>

        {/* Horaires de la semaine */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Horaires de la semaine</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(room.horaires).map(([jour, horaire]) => (
              <div key={jour} className="flex justify-between">
                <span className="capitalize font-medium text-gray-600">
                  {jour.slice(0, 3)}
                </span>
                <span className="text-gray-500">
                  {horaire.ouverture && horaire.fermeture 
                    ? `${horaire.ouverture}-${horaire.fermeture}`
                    : 'Fermé'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            {room.latitude.toFixed(4)}, {room.longitude.toFixed(4)}
          </div>

          <button
            onClick={() => onViewMap(room)}
            className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center transition-colors group/btn"
          >
            Détails
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}