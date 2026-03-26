import PropertyMap from './PropertyMap';

export default function PropertyDetails({ property, onClose }) {
  if (!property) return null;

  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 5); // Format HH:MM
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{property.nom}</h2>
            <p className="text-purple-600 font-medium">{property.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
              
              {property.adresse && (
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adresse</p>
                    <p className="text-sm text-gray-600">{property.adresse}</p>
                  </div>
                </div>
              )}

              {property.description && (
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Description</p>
                    <p className="text-sm text-gray-600">{property.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Horaires */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Horaires d'ouverture</h3>
              
              {property.jours_ouverture && (
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Jours d'ouverture</p>
                    <p className="text-sm text-gray-600">{property.jours_ouverture}</p>
                  </div>
                </div>
              )}

              {(property.horaire_ouverture || property.horaire_fermeture) && (
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Heures d'ouverture</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(property.horaire_ouverture)} - {formatTime(property.horaire_fermeture)}
                    </p>
                  </div>
                </div>
              )}

              {(property.latitude && property.longitude) && (
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Coordonnées GPS</p>
                    <p className="text-sm text-gray-600">
                      {property.latitude}, {property.longitude}
                    </p>
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}&zoom=15`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Ouvrir dans OpenStreetMap
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Carte */}
          {(property.latitude && property.longitude) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
              <PropertyMap 
                latitude={parseFloat(property.latitude)}
                longitude={parseFloat(property.longitude)}
                nom={property.nom}
                className="h-64"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}