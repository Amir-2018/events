import PropertyMap from './PropertyMap';

export default function PropertyDetails({ property, onClose, onEdit, onDelete }) {
  if (!property) return null;

  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 5); // Format HH:MM
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-200">
        {/* Header Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#31a7df] flex items-center justify-center text-white shadow-lg">
               <i className="fas fa-building"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{property.nom}</h2>
              <p className="text-[#31a7df] text-xs font-medium">{property.type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all border border-gray-200"
                title="Modifier"
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-200"
                title="Supprimer"
              >
                <i className="fas fa-trash text-sm"></i>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-info-circle text-[#31a7df]"></i>
                  <h3 className="text-sm font-semibold text-gray-700">À propos du bien</h3>
                </div>
                
                <div className="space-y-3">
                  {property.adresse && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#31a7df] shadow-sm">
                        <i className="fas fa-map-marker-alt text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Localisation exacte</p>
                        <p className="text-gray-900 text-sm font-medium">{property.adresse}</p>
                      </div>
                    </div>
                  )}

                  {property.description && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#31a7df] shadow-sm">
                        <i className="fas fa-file-alt text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Informations détaillées</p>
                        <p className="text-gray-900 text-sm font-medium">{property.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-clock text-[#31a7df]"></i>
                  <h3 className="text-sm font-semibold text-gray-700">Disponibilités & Accès</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
                      <p className="text-xs font-semibold text-blue-400 mb-2">Jours ouverts</p>
                      <p className="text-white text-sm font-medium">{property.jours_ouverture || 'Tous les jours'}</p>
                    </div>
                    <div className="p-4 rounded-lg shadow-lg flex flex-col justify-center" style={{ backgroundColor: '#31a7df' }}>
                      <p className="text-xs font-semibold text-blue-100 mb-2">Plage horaire</p>
                      <p className="text-white text-sm font-medium">
                        {formatTime(property.horaire_ouverture)} - {formatTime(property.horaire_fermeture)}
                      </p>
                    </div>
                  </div>

                  {property.latitude && property.longitude && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-3">Navigation GPS</p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-medium text-[#31a7df] bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          {property.latitude.toString().slice(0, 8)}, {property.longitude.toString().slice(0, 8)}
                        </code>
                        <a 
                          href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}&zoom=15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-gray-900 hover:text-[#31a7df] transition-colors"
                        >
                          Ouvrir la carte
                          <i className="fas fa-external-link-alt text-xs"></i>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Interactive Map Section */}
          {(property.latitude && property.longitude) && (
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-map text-[#31a7df]"></i>
                <h3 className="text-sm font-semibold text-gray-700">Visualisation spatiale</h3>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 relative group">
                <PropertyMap 
                  latitude={parseFloat(property.latitude)}
                  longitude={parseFloat(property.longitude)}
                  nom={property.nom}
                  className="h-64"
                />
                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-xs font-semibold text-gray-900">{property.nom}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
