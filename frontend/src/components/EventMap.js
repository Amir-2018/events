import { useEffect, useRef, useState } from 'react';

export default function EventMap({ 
  latitude, 
  longitude, 
  bienNom, 
  bienType, 
  adresse,
  className = "h-96 w-full rounded-2xl overflow-hidden"
}) {
  const [mapError, setMapError] = useState(false);

  // Convertir les coordonnées en nombres et vérifier leur validité
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  const isValidCoordinates = !isNaN(lat) && !isNaN(lng) && 
                            lat >= -90 && lat <= 90 && 
                            lng >= -180 && lng <= 180;

  // Debug: afficher les valeurs dans la console
  useEffect(() => {
    console.log('EventMap Debug:', {
      latitude: latitude,
      longitude: longitude,
      lat: lat,
      lng: lng,
      isValidCoordinates: isValidCoordinates
    });
  }, [latitude, longitude, lat, lng, isValidCoordinates]);

  if (!isValidCoordinates) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <p className="text-gray-500 font-medium">{adresse || 'Adresse non disponible'}</p>
          <p className="text-gray-400 text-sm mt-2">
            Coordonnées GPS non disponibles
            {latitude && longitude && (
              <span className="block mt-1 text-xs">
                (Reçu: {latitude}, {longitude})
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Si il y a une erreur de carte ou pour simplifier, afficher une carte statique avec lien
  if (mapError) {
    return (
      <div className={`${className} relative`}>
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h3 className="text-blue-800 font-bold text-lg mb-2">{bienNom || 'Localisation'}</h3>
            {bienType && <p className="text-blue-600 text-sm mb-2">{bienType}</p>}
            <p className="text-blue-600 text-sm mb-4">{adresse || ''}</p>
            <p className="text-blue-500 text-xs mb-6 font-mono">
              Coordonnées: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
            <a 
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Voir sur OpenStreetMap
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Créer l'URL de la carte
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className={`${className} relative`}>
      {/* Carte OpenStreetMap */}
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Carte de localisation - ${bienNom || 'Événement'}`}
        onLoad={() => console.log('Carte chargée avec succès')}
        onError={() => {
          console.error('Erreur de chargement de la carte');
          setMapError(true);
        }}
      />
      
      {/* Étiquette avec informations du bien */}
      {bienNom && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200 max-w-xs z-10">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mt-1 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{bienNom}</p>
              {bienType && (
                <p className="text-xs text-gray-500 mt-1">{bienType}</p>
              )}
              {adresse && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{adresse}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Coordonnées GPS en bas à droite */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs font-mono z-10">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
        </div>
      </div>
      
      {/* Bouton pour ouvrir dans OpenStreetMap */}
      <div className="absolute top-4 right-4 z-10">
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          title="Ouvrir dans OpenStreetMap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}