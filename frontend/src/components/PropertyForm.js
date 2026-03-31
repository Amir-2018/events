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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-6 z-[110] animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto transform animate-in zoom-in duration-300 border border-white/20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">
                {initialData ? 'Modifier le bien' : 'Nouveau bien'}
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Configuration de l'emplacement et des horaires</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
               <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Nom du bien *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Stade Municipal, Salle des Fêtes..."
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold placeholder-gray-300 transition-all text-lg shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Catégorie *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold transition-all text-lg shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un type</option>
                      {bienTypes.map(type => (
                        <option key={type.id} value={type.nom}>{type.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Adresse physique</label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Adresse complète du lieu"
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold placeholder-gray-300 transition-all text-lg shadow-sm"
                    />
                  </div>
               </div>

               <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Horaires de fonctionnement</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">Disponibilité hebdomadaire</label>
                      <select
                        name="jours_ouverture"
                        value={formData.jours_ouverture}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-white font-bold transition-all appearance-none cursor-pointer"
                      >
                        {JOURS_SEMAINE.map(jour => (
                          <option key={jour} value={jour}>{jour}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">Ouverture</label>
                        <input
                          type="time"
                          name="horaire_ouverture"
                          value={formData.horaire_ouverture}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-white font-bold transition-all [color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">Fermeture</label>
                        <input
                          type="time"
                          name="horaire_fermeture"
                          value={formData.horaire_fermeture}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-white font-bold transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white p-2 rounded-[2.5rem] border-4 border-gray-50 shadow-inner relative group">
                  <div 
                    id="property-map" 
                    className="w-full h-[400px] rounded-[2rem] overflow-hidden grayscale-[0.2] contrast-[1.1] z-10"
                  >
                    {!mapLoaded && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-[2rem]">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement de la carte...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-gray-100 shadow-xl">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Coordonnées GPS</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleCoordinateChange}
                      placeholder="36.8065"
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold placeholder-gray-300 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleCoordinateChange}
                      placeholder="10.1815"
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold placeholder-gray-300 transition-all shadow-sm"
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50">
            <label className="block text-[10px] font-black text-blue-400 mb-4 ml-1 uppercase tracking-[0.2em]">Description & Equipements</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez le lieu, sa capacité, ses équipements spécifiques..."
              className="w-full px-8 py-6 bg-white border-none rounded-3xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold placeholder-gray-300 transition-all text-lg shadow-sm resize-none"
            />
          </div>

          <div className="flex gap-6 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-6 px-10 bg-gray-50 text-gray-400 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nom.trim() || !formData.type}
              className="flex-[2] bg-blue-600 text-white py-6 px-10 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 shadow-2xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-b-white"></div>
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>{initialData ? 'Mettre à jour le bien' : 'Confirmer la création'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
