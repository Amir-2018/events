import { useState } from 'react';
import { ticketsAPI } from '../lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs SSR
const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false });

export default function TicketScannerSection() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' ou 'camera'

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const handleScanTicket = async (scannedTicketNumber = null) => {
    const numberToScan = scannedTicketNumber || ticketNumber.trim();
    
    if (!numberToScan) {
      setMessage('Veuillez saisir un numéro de ticket');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      // Si c'est un scan QR, extraire le numéro de ticket du JSON
      let ticketNumberToUse = numberToScan;
      try {
        const qrData = JSON.parse(numberToScan);
        if (qrData.ticketNumber) {
          ticketNumberToUse = qrData.ticketNumber;
        }
      } catch (e) {
        // Si ce n'est pas du JSON, utiliser la valeur telle quelle
        ticketNumberToUse = numberToScan;
      }
      
      const response = await ticketsAPI.getTicket(ticketNumberToUse);
      setTicket(response.data.data);
      setMessageType('success');
      setMessage('Ticket trouvé');
      setShowCamera(false); // Fermer la caméra après scan réussi
    } catch (err) {
      console.error('Erreur lors de la recherche du ticket:', err);
      setTicket(null);
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Ticket non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleQrScan = (data) => {
    if (data) {
      console.log('QR Code scanné:', data);
      setTicketNumber(data);
      handleScanTicket(data);
    }
  };

  const handleQrError = (err) => {
    console.error('Erreur de scan QR:', err);
    setMessage('Erreur lors du scan. Vérifiez les permissions de la caméra.');
    setMessageType('error');
  };

  const toggleCamera = () => {
    setShowCamera(!showCamera);
    setScanMode(showCamera ? 'manual' : 'camera');
    if (!showCamera) {
      setMessage('');
      setMessageType('');
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
    setShowCamera(false);
    setScanMode('manual');
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Scanner QR</h1>
          <p className="text-gray-500 font-medium tracking-tight">Vérifiez l'accès des participants aux événements</p>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className={`fas ${showCamera ? 'fa-camera' : 'fa-qrcode'} text-[#31a7df] text-2xl`}></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Scanner un QR Code</h2>
          <p className="text-gray-600 text-sm">Saisissez le numéro de ticket ou scannez le QR code avec la caméra</p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-xl p-1 mb-6 max-w-md mx-auto">
          <button
            onClick={() => {setScanMode('manual'); setShowCamera(false);}}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              scanMode === 'manual' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="fas fa-keyboard"></i>
            Saisie manuelle
          </button>
          <button
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              scanMode === 'camera' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="fas fa-camera"></i>
            Scanner caméra
          </button>
        </div>

        {/* Manual Input */}
        {!showCamera && (
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
              onClick={() => handleScanTicket()}
              disabled={loading || !ticketNumber.trim()}
              className="w-full bg-[#31a7df] text-white py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#2596d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="fas fa-search"></i>
              {loading ? 'Recherche...' : 'Rechercher le ticket'}
            </button>
          </div>
        )}

        {/* Camera Scanner */}
        {showCamera && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl overflow-hidden relative" style={{ height: '300px' }}>
              <QrScanner
                delay={300}
                onError={handleQrError}
                onScan={handleQrScan}
                style={{ width: '100%', height: '100%' }}
                constraints={{
                  video: { facingMode: 'environment' } // Utiliser la caméra arrière sur mobile
                }}
              />
              
              {/* Overlay de scan */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <i className="fas fa-qrcode text-3xl mb-2"></i>
                    <p className="text-sm">Placez le QR code ici</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                Positionnez le QR code du ticket dans le cadre pour le scanner automatiquement
              </p>
              <button
                onClick={toggleCamera}
                className="bg-gray-600 text-white py-2 px-4 rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <i className="fas fa-times"></i>
                Fermer la caméra
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            {message}
          </div>
        )}
      </div>

      {/* Ticket Details */}
      {ticket && (
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
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
  );
}