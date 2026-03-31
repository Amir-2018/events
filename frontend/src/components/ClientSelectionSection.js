import { useState, useMemo } from 'react';

export default function ClientSelectionSection({ clients, selectedClients, onClientToggle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Filtrer les clients selon le terme de recherche
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) {
      return clients;
    }
    
    return clients.filter(client => {
      const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
      const email = client.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search);
    });
  }, [clients, searchTerm]);

  // Limiter l'affichage selon l'état showAll
  const displayedClients = useMemo(() => {
    const clientsToShow = filteredClients;
    return showAll ? clientsToShow.slice(0, 10) : clientsToShow.slice(0, 3);
  }, [filteredClients, showAll]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Si on recherche, afficher automatiquement plus de résultats
    if (e.target.value.trim()) {
      setShowAll(true);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#31a7df]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
        <h4 className="font-semibold text-blue-900 text-sm">Inviter des clients</h4>
      </div>
      
      <p className="text-xs text-[#2596d1] mb-3">
        Sélectionnez les clients à inviter. Ils recevront un email d'invitation.
      </p>

      {/* Barre de recherche */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-xs"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowAll(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Liste des clients */}
      <div className="max-h-48 overflow-y-auto space-y-1.5">
        {displayedClients.length === 0 ? (
          <div className="text-center py-6 text-[#31a7df]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto mb-2 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <p className="text-xs font-medium">
              {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
            </p>
          </div>
        ) : (
          displayedClients.map((client) => (
            <div key={client.id} className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
              <input
                type="checkbox"
                id={`client-${client.id}`}
                checked={selectedClients.includes(client.id)}
                onChange={() => onClientToggle(client.id)}
                className="w-3.5 h-3.5 text-[#31a7df] bg-gray-50 border-gray-200 rounded focus:ring-[#31a7df] focus:ring-2"
              />
              <label htmlFor={`client-${client.id}`} className="flex-1 cursor-pointer">
                <div className="font-medium text-gray-900 text-xs">
                  {client.prenom} {client.nom}
                </div>
                <div className="text-xs text-gray-500">
                  {client.email}
                </div>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Bouton pour afficher plus/moins */}
      {!searchTerm && filteredClients.length > 3 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-medium text-[#31a7df] hover:text-[#2596d1] transition-colors flex items-center gap-1 mx-auto"
          >
            {showAll ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
                Afficher moins
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                Afficher plus ({filteredClients.length - 3} autres)
              </>
            )}
          </button>
        </div>
      )}

      {/* Résumé des sélections */}
      {selectedClients.length > 0 && (
        <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 font-medium">
            {selectedClients.length} client(s) sélectionné(s) recevront une invitation par email.
          </p>
        </div>
      )}

      {/* Informations sur la recherche */}
      {searchTerm && (
        <div className="mt-3 p-2.5 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="text-xs text-[#2596d1]">
            {filteredClients.length} résultat(s) pour "{searchTerm}"
            {filteredClients.length > 10 && " (10 premiers affichés)"}
          </p>
        </div>
      )}
    </div>
  );
}