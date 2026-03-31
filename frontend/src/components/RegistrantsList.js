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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Liste des Inscrits</h1>
          <p className="text-gray-500 font-medium">Tous les clients et les événements auxquels ils sont inscrits</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-6 py-3 bg-[#31a7df] text-white rounded-2xl font-bold hover:bg-[#2596d1] transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            Actualiser
          </button>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-users text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun inscrit</h3>
          <p className="text-gray-500">Il n'y a actuellement aucun inscrit dans le système.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mt-1 shadow-lg">
                  {getInitials(client)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-2xl font-black text-gray-900">
                      {client.prenom} {client.nom}
                    </h3>
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 text-sm font-bold rounded-full">
                      <i className="fas fa-calendar-check mr-1"></i>
                      {client.events.length} événement{client.events.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <i className="fas fa-envelope w-4 h-4 mr-2 text-gray-400"></i>
                      {client.email}
                    </div>
                    {client.tel && (
                      <div className="flex items-center">
                        <i className="fas fa-phone w-4 h-4 mr-2 text-gray-400"></i>
                        {client.tel}
                      </div>
                    )}
                  </div>

                  {client.events.length > 0 ? (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-calendar-alt w-5 h-5 mr-2 text-[#31a7df]"></i>
                        Événements inscrits
                      </h4>
                      <div className="space-y-3">
                        {client.events.map((event) => (
                          <div key={event.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              <i className="fas fa-calendar-alt"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{event.nom}</p>
                              <p className="text-sm text-gray-500">
                                <i className="fas fa-clock mr-1"></i>
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelRegistration(client.id, event.id, `${client.prenom} ${client.nom}`, event.nom)}
                              disabled={cancellingRegistration === `${client.id}-${event.id}`}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              title="Annuler l'inscription"
                            >
                              {cancellingRegistration === `${client.id}-${event.id}` ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
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
                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                      <i className="fas fa-calendar-times text-gray-400 text-3xl mb-3"></i>
                      <p className="text-gray-500 font-medium">Aucun événement inscrit</p>
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