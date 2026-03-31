export default function SimpleEventMap({ 
  latitude, 
  longitude, 
  bienNom, 
  bienType, 
  adresse,
  className = "h-96 w-full rounded-2xl overflow-hidden"
}) {
  // Convertir les coordonnées en nombres et vérifier leur validité
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  const isValidCoordinates = !isNaN(lat) && !isNaN(lng) && 
                            lat >= -90 && lat <= 90 && 
                            lng >= -180 && lng <= 180;

  if (!isValidCoordinates) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <p className="text-gray-500 font-medium">{adresse || 'Adresse non disponible'}</p>
          <p className="text-gray-400 text-sm mt-2">Coordonnées GPS non disponibles</p>
          {latitude && longitude && (
            <p className="text-gray-400 text-xs mt-1">
              (Reçu: {latitude}, {longitude})
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {/* Carte statique avec design moderne */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 border-2 border-blue-300 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-blue-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-200 rounded-full"></div>
        </div>
        
        {/* Contenu principal */}
        <div className="text-center p-8 relative z-10">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          
          <h3 className="text-blue-900 font-black text-xl mb-2 uppercase tracking-tight">
            {bienNom || 'Localisation'}
          </h3>
          
          {bienType && (
            <p className="text-[#2596d1] text-sm font-semibold mb-2 uppercase tracking-wide">
              {bienType}
            </p>
          )}
          
          <p className="text-[#31a7df] text-sm mb-4 leading-relaxed">
            {adresse || ''}
          </p>
          
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 inline-block">
            <p className="text-blue-800 text-xs font-mono">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#31a7df] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#2596d1] transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Voir sur la carte
            </a>
            
            <a 
              href={`https://www.google.com/maps?q=${lat},${lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}