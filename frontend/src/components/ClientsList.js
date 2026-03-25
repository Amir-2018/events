export default function ClientsList({ clients, eventName, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Clients inscrits - {eventName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {clients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun client inscrit à cet événement
          </p>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium text-gray-700">Nom:</span>
                    <span className="ml-2">{client.nom} {client.prenom}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2">{client.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Téléphone:</span>
                    <span className="ml-2">{client.tel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}