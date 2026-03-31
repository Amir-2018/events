import { useState, useEffect } from 'react';

const JOURS_SEMAINE = [
  'Lundi-Dimanche',
  'Lundi-Vendredi',
  'Lundi-Samedi',
  'Samedi-Dimanche',
  'Personnalisé'
];

export default function PropertyForm({ onSubmit, onCancel, initialData = null, bienTypes = [] }) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    type: initialData?.type || '',
    adresse: initialData?.adresse || '',
    description: initialData?.description || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    horaire_ouverture: initialData?.horaire_ouverture || '',
    horaire_fermeture: initialData?.horaire_fermeture || '',
    jours_ouverture: initialData?.jours_ouverture || 'Lundi-Dimanche'
  });
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Charger Leaflet dynamiquement
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.L) {
      setMapLoaded(true);
    }
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (mapLoaded && !map) {
      const L = window.L;
      const initialLat = formData.latitude || 36.8065; // Tunis par défaut s'il n'y a rien
      const initialLng = formData.longitude || 10.1815;
      
      const mapInstance = L.map('property-map').setView([initialLat, initialLng], 13);
      
      L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      const markerInstance = L.marker([initialLat, initialLng], { draggable: true })
        .addTo(mapInstance);

      markerInstance.on('dragend', function(e) {
        const position = e.target.getLatLng();
        setFormData(prev => ({
          ...prev,
          latitude: position.lat.toFixed(6),
          longitude: position.lng.toFixed(6)
        }));
      });

      mapInstance.on('click', function(e) {
        const { lat, lng } = e.latlng;
        markerInstance.setLatLng([lat, lng]);
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }));
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    }
  }, [mapLoaded, map]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (marker) {
      const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
      const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], map.getZoom());
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform animate-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#31a7df] flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? 'Modifier le bien' : 'Nouveau bien'}
              </h2>
              <p className="text-gray-500 text-xs">Configuration de l'emplacement et des horaires</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom du bien *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Stade Municipal, Salle des Fêtes..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catégorie *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all appearance-none"
                    >
                      <option value="">Sélectionnez un type</option>
                      {bienTypes.map(type => (
                        <option key={type.id} value={type.nom}>{type.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse physique</label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Adresse complète du lieu"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all"
                    />
                  </div>
               </div>

               <div className="bg-gray-900 p-4 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#31a7df]"></div>
                    <h3 className="text-xs font-semibold text-blue-400">Horaires de fonctionnement</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Disponibilité hebdomadaire</label>
                      <select
                        name="jours_ouverture"
                        value={formData.jours_ouverture}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 text-white text-sm transition-all appearance-none"
                      >
                        {JOURS_SEMAINE.map(jour => (
                          <option key={jour} value={jour}>{jour}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Ouverture</label>
                        <input
                          type="time"
                          name="horaire_ouverture"
                          value={formData.horaire_ouverture}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 text-white text-sm transition-all [color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Fermeture</label>
                        <input
                          type="time"
                          name="horaire_fermeture"
                          value={formData.horaire_fermeture}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 text-white text-sm transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="bg-white p-2 rounded-lg border-2 border-gray-100 relative">
                  <div 
                    id="property-map" 
                    className="w-full h-[300px] rounded-lg overflow-hidden"
                  >
                    {!mapLoaded && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                          <p className="text-gray-400 text-xs font-medium">Chargement de la carte...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-lg">
                    <p className="text-xs font-semibold text-gray-900">Coordonnées GPS</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleCoordinateChange}
                      placeholder="36.8065"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleCoordinateChange}
                      placeholder="10.1815"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all"
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-xs font-semibold text-blue-700 mb-2">Description & Equipements</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez le lieu, sa capacité, ses équipements spécifiques..."
              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] text-sm transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-50 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nom.trim() || !formData.type}
              className="flex-[2] text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ backgroundColor: '#31a7df' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>{initialData ? 'Mettre à jour' : 'Créer'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
