import { useState, useEffect } from 'react';
import { ticketsAPI } from '../lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TicketsSection() {
  const [eventStats, setEventStats] = useState([]);
  const [fraudAttempts, setFraudAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

  useEffect(() => {
    loadEventStats();
    loadFraudAttempts();
  }, []);

  const loadEventStats = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getEventTicketsStats();
      setEventStats(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFraudAttempts = async () => {
    try {
      const response = await ticketsAPI.getFraudAttempts();
      setFraudAttempts(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des tentatives de fraude:', err);
    }
  };

  const loadEventTickets = async (eventId) => {
    try {
      const response = await ticketsAPI.getEventTicketsList(eventId);
      setEventTickets(response.data.data);
      setShowEventDetails(true);
    } catch (err) {
      console.error('Erreur lors du chargement des tickets:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const handleViewEventTickets = (event) => {
    setSelectedEvent(event);
    loadEventTickets(event.event_id);
  };

  const getFraudCountForEvent = (eventId) => {
    return fraudAttempts.filter(attempt => attempt.event_id === eventId).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-[#2596d1] border-blue-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Vérifié';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Actif';
    }
  };

  if (showEventDetails && selectedEvent) {
    return (
      <div className="w-full">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowEventDetails(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{selectedEvent.event_name}</h1>
            <p className="text-gray-500 font-medium">Tickets de l'événement</p>
          </div>
        </div>

        {/* Liste des tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <i className="fas fa-ticket-alt text-[#31a7df]"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{ticket.client_prenom} {ticket.client_nom}</h3>
                      <p className="text-sm text-gray-500">{ticket.client_email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Numéro de ticket</div>
                  <div className="font-mono font-bold text-sm">{ticket.ticket_number}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Mes Tickets</h1>
          <p className="text-gray-500 font-medium tracking-tight">Gérez les tickets de vos événements</p>
        </div>
        
        {/* Toggle View Mode */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'cards' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="fas fa-th-large"></i>
            Cartes
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'table' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="fas fa-table"></i>
            Tableau
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : eventStats.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-calendar-times text-gray-400 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun événement</h2>
          <p className="text-gray-600 mb-6">Vous n'avez pas encore créé d'événements avec des tickets.</p>
        </div>
      ) : (
        <>
          {/* Vue Cartes */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventStats.map((event) => {
                const fraudCount = getFraudCountForEvent(event.event_id);
                
                return (
                  <div key={event.event_id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                    {/* Event Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
                      {event.event_image ? (
                        <img 
                          src={event.event_image} 
                          alt={event.event_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-calendar-alt text-white text-4xl opacity-50"></i>
                        </div>
                      )}
                      
                      {/* Ticket Icon */}
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <i className="fas fa-ticket-alt text-white text-lg"></i>
                        </div>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 uppercase tracking-tight">
                          {event.event_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {formatDate(event.event_date)}
                        </p>
                        {event.event_address && (
                          <p className="text-gray-500 text-xs line-clamp-2">
                            {event.event_address}
                          </p>
                        )}
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                          <div className="text-xs text-[#31a7df] mb-1">Non vérifiés</div>
                          <div className="font-bold text-[#2596d1]">{event.active_tickets || 0}</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <div className="text-xs text-green-600 mb-1">Vérifiés</div>
                          <div className="font-bold text-green-700">{event.verified_tickets || 0}</div>
                        </div>
                      </div>

                      {/* Fraud Alert */}
                      {fraudCount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-exclamation-triangle text-red-600"></i>
                            <div className="text-xs text-red-600">
                              <span className="font-bold">{fraudCount}</span> tentative{fraudCount > 1 ? 's' : ''} de fraude
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Total Tickets */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">Total tickets</div>
                          <div className="font-bold text-gray-700">{event.total_tickets || 0}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleViewEventTickets(event)}
                        className="w-full bg-[#31a7df] text-white py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#2596d1] transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-eye"></i>
                        Voir les tickets
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Vue Tableau */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Événement
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-clock mr-2"></i>
                        Date
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-ticket-alt mr-2"></i>
                        Total
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-hourglass-half mr-2"></i>
                        Non vérifiés
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-check-circle mr-2"></i>
                        Vérifiés
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Fraudes
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {eventStats.map((event) => {
                      const fraudCount = getFraudCountForEvent(event.event_id);
                      
                      return (
                        <tr key={event.event_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-calendar-alt text-[#31a7df]"></i>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 line-clamp-1">{event.event_name}</div>
                                {event.event_address && (
                                  <div className="text-sm text-gray-500 line-clamp-1">{event.event_address}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(event.event_date)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                              {event.total_tickets || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-[#2596d1]">
                              {event.active_tickets || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                              {event.verified_tickets || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {fraudCount > 0 ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                {fraudCount}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-500">
                                0
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleViewEventTickets(event)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#31a7df] text-white rounded-xl text-sm font-bold hover:bg-[#2596d1] transition-colors"
                            >
                              <i className="fas fa-eye"></i>
                              Voir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}