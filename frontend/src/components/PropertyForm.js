import { useState, useEffect } from 'react';

const PROPERTY_TYPES = [
  'Stade',
  'Salle',
  'Maison de jeunes',
  'École',
  'Centre communautaire',
  'Parc',
  'Théâtre',
  'Auditorium',
  'Gymnase',
  'Autre'
];

const JOURS_SEMAINE = [
  'Lundi-Dimanche',
  'Lundi-Vendredi',
  'Lundi-Samedi',
  'Samedi-Dimanche',
  'Personnalisé'
];

export default function PropertyForm({ onSubmit, onCancel, initialData = null }) {
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
      // Charger les CSS et JS de Leaflet
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
      const initialLat = formData.latitude || 48.8566;
      const initialLng = formData.longitude || 2.3522;
      
      const mapInstance = L.map('property-map').setView([initialLat, initialLng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
  }, [mapLoaded, map, formData.latitude, formData.longitude]);

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

    // Mettre à jour la position du marqueur si les coordonnées sont valides
    if (marker && formData.latitude && formData.longitude) {
      const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
      const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], map.getZoom());
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {initialData ? 'Modifier le bien' : 'Nouveau bien'}
          </h2>
          <p className="text-gray-500">Ajoutez un lieu pour vos événements</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du bien *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Ex: Stade Municipal, Salle des Fêtes..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type de bien *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionnez un type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Adresse complète du bien"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Horaires */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jours d'ouverture
                </label>
                <select
                  name="jours_ouverture"
                  value={formData.jours_ouverture}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  {JOURS_SEMAINE.map(jour => (
                    <option key={jour} value={jour}>{jour}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heure d'ouverture
                </label>
                <input
                  type="time"
                  name="horaire_ouverture"
                  value={formData.horaire_ouverture}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heure de fermeture
                </label>
                <input
                  type="time"
                  name="horaire_fermeture"
                  value={formData.horaire_fermeture}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleCoordinateChange}
                  placeholder="48.8566"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleCoordinateChange}
                  placeholder="2.3522"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Cliquez sur la carte ou déplacez le marqueur pour définir la position
              </p>
              <div 
                id="property-map" 
                className="w-full h-64 rounded-xl border border-gray-200"
                style={{ minHeight: '256px' }}
              >
                {!mapLoaded && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Chargement de la carte...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description du bien, équipements disponibles..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nom.trim() || !formData.type}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {initialData ? 'Modification...' : 'Création...'}
                </>
              ) : (
                initialData ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}