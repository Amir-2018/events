import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TicketModal({ ticket, isOpen, onClose }) {
  if (!isOpen || !ticket) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${ticket.event_nom}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .ticket {
              background: white;
              max-width: 400px;
              margin: 0 auto;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .ticket-header {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .ticket-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .ticket-number {
              font-size: 18px;
              font-weight: bold;
              background: rgba(255,255,255,0.2);
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              margin-top: 10px;
            }
            .ticket-body {
              padding: 30px 20px;
            }
            .event-info {
              margin-bottom: 30px;
            }
            .event-name {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .event-date {
              color: #6b7280;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .event-address {
              color: #6b7280;
              font-size: 14px;
            }
            .qr-section {
              text-align: center;
              border-top: 2px dashed #e5e7eb;
              padding-top: 30px;
            }
            .qr-code {
              max-width: 200px;
              height: auto;
              margin: 0 auto 20px;
            }
            .qr-instructions {
              color: #6b7280;
              font-size: 12px;
              line-height: 1.5;
            }
            .ticket-footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              body { background: white; }
              .ticket { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-title">Ticket d'Événement</div>
              <div class="ticket-number">${ticket.ticket_number}</div>
            </div>
            <div class="ticket-body">
              <div class="event-info">
                <div class="event-name">${ticket.event_nom}</div>
                <div class="event-date">${formatDate(ticket.event_date)}</div>
                <div class="event-address">${ticket.event_adresse || ''}</div>
              </div>
              <div class="qr-section">
                <img src="${ticket.qr_code_data}" alt="QR Code" class="qr-code" />
                <div class="qr-instructions">
                  Présentez ce QR code à l'entrée de l'événement.<br>
                  Gardez ce ticket jusqu'à la fin de l'événement.
                </div>
              </div>
            </div>
            <div class="ticket-footer">
              Ticket généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    // Créer un canvas pour générer une image du ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensions du ticket
    canvas.width = 400;
    canvas.height = 600;
    
    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header bleu
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 100);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 120);
    
    // Texte du header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TICKET D\'ÉVÉNEMENT', canvas.width / 2, 40);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText(ticket.ticket_number, canvas.width / 2, 80);
    
    // Informations de l'événement
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ticket.event_nom, canvas.width / 2, 160);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText(formatDate(ticket.event_date), canvas.width / 2, 185);
    
    if (ticket.event_adresse) {
      ctx.fillText(ticket.event_adresse, canvas.width / 2, 205);
    }
    
    // QR Code (si on peut le dessiner)
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, (canvas.width - 150) / 2, 250, 150, 150);
      
      // Instructions
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Présentez ce QR code à l\'entrée', canvas.width / 2, 430);
      ctx.fillText('de l\'événement', canvas.width / 2, 450);
      
      // Télécharger l'image
      const link = document.createElement('a');
      link.download = `ticket-${ticket.ticket_number}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = ticket.qr_code_data;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">
            Ticket d'Événement
          </h2>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
            <span className="font-bold text-lg">{ticket.ticket_number}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Event Info */}
          <div className="mb-8">
            <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">
              {ticket.event_nom}
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span className="font-medium">{formatDate(ticket.event_date)}</span>
              </div>
              {ticket.event_adresse && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="font-medium">{ticket.event_adresse}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="border-t-2 border-dashed border-gray-200 pt-8 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 inline-block mb-6">
              <img 
                src={ticket.qr_code_data} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Présentez ce QR code à l'entrée de l'événement.<br />
              Gardez ce ticket jusqu'à la fin de l'événement.
            </p>
            
            {/* Status */}
            <div className="mb-6">
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
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center text-xs text-gray-500">
          Ticket généré le {format(new Date(ticket.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-[#31a7df] text-white py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#2596d1] transition-colors"
            >
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-green-700 transition-colors"
            >
              Télécharger
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}