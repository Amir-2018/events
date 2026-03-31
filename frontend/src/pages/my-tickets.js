import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI } from '../lib/api';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TicketModal from '../components/TicketModal';
import PublicNavbar from '../components/PublicNavbar';

export default function MyTickets() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadMyTickets();
  }, [isAuthenticated, router]);

  const loadMyTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getMyTickets();
      setTickets(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des tickets:', err);
    } finally {
      setLoading(false);
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

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
              Mes Tickets
            </h1>
            <p className="text-gray-600">Gérez vos tickets d'événements</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun ticket</h2>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore de tickets d'événements.</p>
              <button
                onClick={() => router.push('/')}
                className="bg-[#31a7df] text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#2596d1] transition-colors"
              >
                Découvrir les événements
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Event Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
                    {ticket.event_image ? (
                      <img 
                        src={ticket.event_image} 
                        alt={ticket.event_nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="white" className="w-16 h-16 opacity-50">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 uppercase tracking-tight">
                        {ticket.event_nom}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {formatDate(ticket.event_date)}
                      </p>
                      {ticket.event_adresse && (
                        <p className="text-gray-500 text-xs line-clamp-2">
                          {ticket.event_adresse}
                        </p>
                      )}
                    </div>

                    {/* Ticket Number */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Numéro de ticket</div>
                      <div className="font-mono font-bold text-sm">{ticket.ticket_number}</div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="w-full bg-[#31a7df] text-white py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#2596d1] transition-colors"
                    >
                      Voir le ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal 
        ticket={selectedTicket}
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
      />
    </div>
  );
}