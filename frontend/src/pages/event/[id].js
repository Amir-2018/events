import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { eventsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PublicNavbar from '../../components/PublicNavbar';
import SimpleEventMap from '../../components/SimpleEventMap';
import TicketModal from '../../components/TicketModal';

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  useEffect(() => {
    if (id) {
      loadEventDetails();
    }
  }, [id]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventDetails(id);
      setEvent(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'événement:', err);
      setMessage('Événement non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setRegistering(true);
      const response = await eventsAPI.registerToEvent(event.id);
      
      // Vérifier si un ticket a été généré
      if (response.data.data.ticket) {
        setGeneratedTicket(response.data.data.ticket);
        setShowTicket(true);
        setMessage('Inscription réussie ! Votre ticket a été généré.');
      } else {
        setMessage('Inscription réussie !');
      }
      
      // Recharger les détails pour mettre à jour le nombre de participants
      await loadEventDetails();
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setMessage(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h1>
            <Link href="/" className="text-[#31a7df] hover:text-blue-800">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEventFull = event.max_participants > 0 && event.current_participants >= event.max_participants;
  const eventDate = new Date(event.date);
  const isEventPassed = eventDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        {event.image ? (
          <img src={event.image} alt={event.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-gray-900"></div>
        )}
        
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-[#31a7df] text-white rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-lg">
                {event.type_evenement_nom || 'Événement Spécial'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-tight mb-4 italic drop-shadow-2xl">
                {event.nom}
              </h1>
              <p className="text-xl text-gray-200 font-medium">
                {formatDate(event.date)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Event Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Détails de l'événement</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Date et heure</h3>
                      <p className="text-gray-600">{formatDate(event.date)}</p>
                      {event.date_fin && (
                        <p className="text-gray-500 text-sm">Fin : {formatDate(event.date_fin)}</p>
                      )}
                    </div>
                  </div>

                  {event.adresse && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Adresse</h3>
                        <p className="text-gray-600">{event.adresse}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Participants</h3>
                      <p className="text-gray-600">
                        {event.current_participants || 0} inscrits
                        {event.max_participants > 0 && ` / ${event.max_participants} places`}
                      </p>
                    </div>
                  </div>

                  {event.bien_nom && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-orange-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Bien associé</h3>
                        <p className="text-gray-600">{event.bien_nom}</p>
                        {event.bien_type && (
                          <p className="text-gray-500 text-sm">Type : {event.bien_type}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Section */}
              {(event.bien_latitude && event.bien_longitude) || event.adresse && (
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Localisation</h2>
                  
                  <SimpleEventMap
                    latitude={event.bien_latitude}
                    longitude={event.bien_longitude}
                    bienNom={event.bien_nom}
                    bienType={event.bien_type}
                    adresse={event.bien_adresse || event.adresse}
                    className="h-96 w-full rounded-2xl overflow-hidden"
                  />
                  
                  {/* Informations supplémentaires sur le bien */}
                  {event.bien_nom && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                      <h3 className="font-bold text-gray-900 mb-2">À propos du lieu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Nom du bien :</span>
                          <span className="ml-2 font-medium">{event.bien_nom}</span>
                        </div>
                        {event.bien_type && (
                          <div>
                            <span className="text-gray-500">Type :</span>
                            <span className="ml-2 font-medium">{event.bien_type}</span>
                          </div>
                        )}
                        {event.bien_adresse && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Adresse :</span>
                            <span className="ml-2 font-medium">{event.bien_adresse}</span>
                          </div>
                        )}
                        {(event.bien_horaire_ouverture || event.bien_horaire_fermeture) && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Horaires :</span>
                            <span className="ml-2 font-medium">
                              {event.bien_horaire_ouverture || 'N/A'} - {event.bien_horaire_fermeture || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Registration Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8">
                <h2 className="text-xl font-black uppercase tracking-tight mb-6">Inscription</h2>
                
                {message && (
                  <div className={`p-4 rounded-2xl mb-6 text-sm font-medium ${
                    message.includes('réussie') 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Prix</span>
                    <span className="font-bold text-green-600">Gratuit</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Places disponibles</span>
                    <span className="font-bold">
                      {event.max_participants > 0 
                        ? Math.max(0, event.max_participants - (event.current_participants || 0))
                        : 'Illimitées'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Statut</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isEventPassed 
                        ? 'bg-gray-100 text-gray-600'
                        : isEventFull 
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                    }`}>
                      {isEventPassed ? 'Terminé' : isEventFull ? 'Complet' : 'Ouvert'}
                    </span>
                  </div>
                </div>

                {isEventPassed ? (
                  <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed">
                    Événement terminé
                  </button>
                ) : isEventFull ? (
                  <button disabled className="w-full bg-red-100 text-red-400 py-4 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed">
                    Complet
                  </button>
                ) : (
                  <button 
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-[#31a7df] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#2596d1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? 'Inscription...' : 'S\'inscrire maintenant'}
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link 
                    href="/"
                    className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Modal */}
      <TicketModal 
        ticket={generatedTicket}
        isOpen={showTicket}
        onClose={() => setShowTicket(false)}
      />
    </div>
  );
}