import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { clientsAPI } from '../lib/api';

export default function RegistrantsList({ clients, loading = false, onClose, onRefresh }) {
  const [cancellingRegistration, setCancellingRegistration] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getInitials = (client) => {
    const first = (client.prenom || '').charAt(0).toUpperCase();
    const last = (client.nom || '').charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  const handleCancelRegistration = async (clientId, eventId, clientName, eventName) => {
    if (!confirm(`Êtes-vous sûr de vouloir annuler l'inscription de ${clientName} à l'événement "${eventName}" ?\n\nCette action supprimera également le ticket associé.`)) {
      return;
    }

    try {
      setCancellingRegistration(`${clientId}-${eventId}`);
      await clientsAPI.cancelRegistration(clientId, eventId);
      
      // Actualiser la liste
      if (onRefresh) {
        onRefresh();
      }
      
      alert('Inscription annulée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'annulation de l\'inscription');
    } finally {
      setCancellingRegistration(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des inscrits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Liste des Inscrits</h1>
          <p className="text-xs text-gray-500">Tous les clients et les événements auxquels ils sont inscrits</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-[#31a7df] text-white rounded-lg font-medium text-sm hover:bg-[#2596d1] transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt text-xs"></i>
            Actualiser
          </button>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-users text-gray-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun inscrit</h3>
          <p className="text-sm text-gray-500">Il n'y a actuellement aucun inscrit dans le système.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm mt-1 shadow-sm">
                  {getInitials(client)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {client.prenom} {client.nom}
                    </h3>
                    <span className="px-2 py-1 bg-blue-50 text-[#2596d1] text-xs font-bold rounded-md">
                      <i className="fas fa-calendar-check mr-1"></i>
                      {client.events.length} événement{client.events.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
                    <div className="flex items-center">
                      <i className="fas fa-envelope w-3 h-3 mr-2 text-gray-400"></i>
                      {client.email}
                    </div>
                    {client.tel && (
                      <div className="flex items-center">
                        <i className="fas fa-phone w-3 h-3 mr-2 text-gray-400"></i>
                        {client.tel}
                      </div>
                    )}
                  </div>

                  {client.events.length > 0 ? (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                        <i className="fas fa-calendar-alt w-4 h-4 mr-2 text-[#31a7df]"></i>
                        Événements inscrits
                      </h4>
                      <div className="space-y-2">
                        {client.events.map((event) => (
                          <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              <i className="fas fa-calendar-alt"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate text-sm">{event.nom}</p>
                              <p className="text-xs text-gray-500">
                                <i className="fas fa-clock mr-1"></i>
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelRegistration(client.id, event.id, `${client.prenom} ${client.nom}`, event.nom)}
                              disabled={cancellingRegistration === `${client.id}-${event.id}`}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              title="Annuler l'inscription"
                            >
                              {cancellingRegistration === `${client.id}-${event.id}` ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                                  Annulation...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-times"></i>
                                  Annuler
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
                      <i className="fas fa-calendar-times text-gray-400 text-lg mb-2"></i>
                      <p className="text-gray-500 font-medium text-xs">Aucun événement inscrit</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}