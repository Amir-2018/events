import { useEffect, useState } from 'react';

export default function RoomDetails({ room, onClose }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Charger CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Charger JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setMapLoaded(true);
        };
        document.head.appendChild(script);
      } else if (window.L) {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (mapLoaded && window.L && !map && room) {
      // Initialiser la carte
      const mapInstance = window.L.map('room-details-map').setView([room.latitude, room.longitude], 15);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Ajouter un marqueur avec popup
      const marker = window.L.marker([room.latitude, room.longitude]).addTo(mapInstance);
      
      // Créer un popup personnalisé avec le nom de la salle
      const popupContent = `
        <div style="text-align: center; font-family: system-ui, -apple-system, sans-serif;">
          <div style="font-weight: bold; font-size: 16px; color: #1f2937; margin-bottom: 4px;">
            🏢 ${room.nom}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            📍 ${room.adresse}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent).openPopup();

      setMap(mapInstance);
    }

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [mapLoaded, room, map]);

  if (!room) return null;

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

  const jours = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2 transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3M21 10.5h.75m-.75 3h.75m-.75 3h.75m-3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{room.nom}</h2>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  isOpenNow(room.horaires) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isOpenNow(room.horaires) ? '🟢 Ouvert maintenant' : '🔴 Fermé'}
                </span>
                <span className="inline-block bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                  👥 {room.capaciteMax} personnes max
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            
            {/* Informations générales */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600 text-sm">{room.adresse}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Capacité maximale</p>
                      <p className="text-gray-600 text-sm">{room.capaciteMax} personnes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Aujourd'hui</p>
                      <p className="text-gray-600 text-sm">{getHoraireDisplay(room.horaires)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Coordonnées GPS</p>
                      <p className="text-gray-600 text-sm">{room.latitude.toFixed(6)}, {room.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horaires détaillés */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {jours.map(({ key, label }) => {
                      const horaire = room.horaires[key];
                      const isToday = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase() === key;
                      
                      return (
                        <div key={key} className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                          isToday ? 'bg-green-100 border border-green-200' : 'bg-white'
                        }`}>
                          <span className={`font-medium ${isToday ? 'text-green-800' : 'text-gray-700'}`}>
                            {label}
                            {isToday && <span className="ml-2 text-xs">(Aujourd'hui)</span>}
                          </span>
                          <span className={`text-sm ${isToday ? 'text-green-700' : 'text-gray-600'}`}>
                            {horaire.ouverture && horaire.fermeture 
                              ? `${horaire.ouverture} - ${horaire.fermeture}`
                              : 'Fermé'
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Carte */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
              <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '400px' }}>
                {mapLoaded ? (
                  <div id="room-details-map" style={{ height: '100%', width: '100%' }}></div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Chargement de la carte...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                📍 La salle est marquée sur la carte avec son nom
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const url = `https://www.openstreetmap.org/?mlat=${room.latitude}&mlon=${room.longitude}&zoom=15`;
                window.open(url, '_blank');
              }}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Ouvrir dans OpenStreetMap
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}