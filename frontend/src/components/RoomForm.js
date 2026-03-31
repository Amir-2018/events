import { useState, useEffect } from 'react';

export default function RoomForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    latitude: 48.8566, // Paris par défaut
    longitude: 2.3522,
    capaciteMax: '',
    horaires: {
      lundi: { ouverture: '08:00', fermeture: '18:00' },
      mardi: { ouverture: '08:00', fermeture: '18:00' },
      mercredi: { ouverture: '08:00', fermeture: '18:00' },
      jeudi: { ouverture: '08:00', fermeture: '18:00' },
      vendredi: { ouverture: '08:00', fermeture: '18:00' },
      samedi: { ouverture: '09:00', fermeture: '17:00' },
      dimanche: { ouverture: '', fermeture: '' }
    }
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

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
    if (mapLoaded && window.L && !map) {
      // Initialiser la carte
      const mapInstance = window.L.map('room-map').setView([formData.latitude, formData.longitude], 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Ajouter un marqueur
      const markerInstance = window.L.marker([formData.latitude, formData.longitude], {
        draggable: true
      }).addTo(mapInstance);

      // Écouter les déplacements du marqueur
      markerInstance.on('dragend', (e) => {
        const position = e.target.getLatLng();
        setFormData(prev => ({
          ...prev,
          latitude: position.lat,
          longitude: position.lng
        }));
      });

      // Écouter les clics sur la carte
      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerInstance.setLatLng([lat, lng]);
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    }
  }, [mapLoaded, map, formData.latitude, formData.longitude]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHoraireChange = (jour, type, value) => {
    setFormData(prev => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          [type]: value
        }
      }
    }));
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200">
        <div className="text-center p-8 border-b border-gray-100">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#31a7df]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3M21 10.5h.75m-.75 3h.75m-.75 3h.75m-3-6h.75m-.75 3h.75m-.75 3h.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ajouter une nouvelle salle</h2>
          <p className="text-gray-500">Configurez les détails de votre salle</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations générales */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la salle *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Salle de conférence A"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31a7df] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  placeholder="123 Rue de la Paix, Paris"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31a7df] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacité maximale *
                </label>
                <input
                  type="number"
                  name="capaciteMax"
                  value={formData.capaciteMax}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="50"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31a7df] focus:border-transparent transition-all"
                />
              </div>

              {/* Coordonnées */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31a7df] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#31a7df] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Carte */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
              <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '300px' }}>
                {mapLoaded ? (
                  <div id="room-map" style={{ height: '100%', width: '100%' }}></div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Chargement de la carte...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Cliquez sur la carte ou déplacez le marqueur pour définir la position exacte
              </p>
            </div>
          </div>

          {/* Horaires */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jours.map(({ key, label }) => (
                <div key={key} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{label}</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Ouverture</label>
                      <input
                        type="time"
                        value={formData.horaires[key].ouverture}
                        onChange={(e) => handleHoraireChange(key, 'ouverture', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#31a7df]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fermeture</label>
                      <input
                        type="time"
                        value={formData.horaires[key].fermeture}
                        onChange={(e) => handleHoraireChange(key, 'fermeture', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#31a7df]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-8 border-t border-gray-100 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!formData.nom.trim() || !formData.adresse.trim() || !formData.capaciteMax}
              className="flex-1 bg-[#31a7df] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#2596d1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer la salle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}