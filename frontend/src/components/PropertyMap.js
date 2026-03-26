import { useEffect, useState } from 'react';

export default function PropertyMap({ latitude, longitude, nom, className = "" }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);

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
    if (mapLoaded && latitude && longitude && !map) {
      const L = window.L;
      const mapId = `property-map-${latitude}-${longitude}`;
      
      const mapInstance = L.map(mapId).setView([latitude, longitude], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      L.marker([latitude, longitude])
        .addTo(mapInstance)
        .bindPopup(nom || 'Localisation du bien')
        .openPopup();

      setMap(mapInstance);
    }
  }, [mapLoaded, latitude, longitude, nom, map]);

  if (!latitude || !longitude) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-sm">Aucune localisation définie</p>
      </div>
    );
  }

  const mapId = `property-map-${latitude}-${longitude}`;

  return (
    <div className={className}>
      <div 
        id={mapId}
        className="w-full h-full rounded-xl border border-gray-200"
        style={{ minHeight: '200px' }}
      >
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-xs">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}