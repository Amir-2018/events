import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI } from '../lib/api';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TicketScanner() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Vérifier que l'utilisateur est admin ou superadmin
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const handleScanTicket = async () => {
    if (!ticketNumber.trim()) {
      setMessage('Veuillez saisir un numéro de ticket');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const response = await ticketsAPI.getTicket(ticketNumber.trim());
      setTicket(response.data.data);
      setMessageType('success');
      setMessage('Ticket trouvé');
    } catch (err) {
      console.error('Erreur lors de la recherche du ticket:', err);
      setTicket(null);
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Ticket non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTicket = async () => {
    if (!ticket) return;

    try {
      setVerifying(true);
      const response = await ticketsAPI.verifyTicket(ticket.ticket_number);
      setTicket(response.data.data);
      setMessageType('success');
      setMessage('Ticket vérifié avec succès ! Accès autorisé.');
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Erreur lors de la vérification');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScanTicket();
    }
  };

  const resetScanner = () => {
    setTicketNumber('');
    setTicket(null);
    setMessage('');
    setMessageType('');
  };

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
            Scanner de Tickets
          </h1>
          <p className="text-gray-600">Vérifiez l'accès des participants aux événements</p>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-[#31a7df]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h4.5v4.5h-4.5v-4.5Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Scanner un QR Code</h2>
            <p className="text-gray-600 text-sm">Saisissez le numéro de ticket ou scannez le QR code</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de ticket
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="TK-20240331-1234"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31a7df] focus:border-transparent text-center font-mono text-lg"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleScanTicket}
              disabled={loading || !ticketNumber.trim()}
              className="w-full bg-[#31a7df] text-white py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#2596d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recherche...' : 'Rechercher le ticket'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {ticket && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Détails du Ticket</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                ticket.status === 'verified' 
                  ? 'bg-green-100 text-green-700'
                  : ticket.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-50 text-[#2596d1]'
              }`}>
                {ticket.status === 'verified' ? 'Vérifié' : 
                 ticket.status === 'cancelled' ? 'Annulé' : 'Actif'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Informations du Ticket</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Numéro :</span>
                    <p className="font-mono font-bold">{ticket.ticket_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Créé le :</span>
                    <p className="font-medium">{formatDate(ticket.created_at)}</p>
                  </div>
                  {ticket.verified_at && (
                    <div>
                      <span className="text-gray-500 text-sm">Vérifié le :</span>
                      <p className="font-medium">{formatDate(ticket.verified_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Événement</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Nom :</span>
                    <p className="font-bold">{ticket.event_nom}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Date :</span>
                    <p className="font-medium">{formatDate(ticket.event_date)}</p>
                  </div>
                  {ticket.event_adresse && (
                    <div>
                      <span className="text-gray-500 text-sm">Lieu :</span>
                      <p className="font-medium">{ticket.event_adresse}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Participant</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Nom :</span>
                    <p className="font-bold">{ticket.client_prenom} {ticket.client_nom}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Email :</span>
                    <p className="font-medium">{ticket.client_email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {ticket.status === 'active' && (
                <button
                  onClick={handleVerifyTicket}
                  disabled={verifying}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Vérification...' : '✓ Vérifier l\'accès'}
                </button>
              )}
              
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-gray-700 transition-colors"
              >
                Scanner un autre ticket
              </button>
            </div>

            {/* Status Messages */}
            {ticket.status === 'verified' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-green-700 font-semibold">Accès autorisé - Ticket déjà vérifié</span>
                </div>
              </div>
            )}

            {ticket.status === 'cancelled' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-red-700 font-semibold">Accès refusé - Ticket annulé</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}