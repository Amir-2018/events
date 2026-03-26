import { useState, useEffect } from 'react';
import { eventsAPI } from '../lib/api';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import ClientsList from '../components/ClientsList';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [selectedEventClients, setSelectedEventClients] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // New States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvents();
      setEvents(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (newEvent) => {
    try {
      setIsProcessing(true);
      setShowForm(false);
      
      // Si un nouvel événement est fourni, l'ajouter directement à la liste
      if (newEvent) {
        setEvents(prevEvents => [newEvent, ...prevEvents]);
      }
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteConfirmation = (eventId) => {
    setEventIdToDelete(eventId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventIdToDelete) return;

    try {
      setIsDeleteModalOpen(false);
      setIsProcessing(true);
      
      // Supprimer l'événement côté serveur
      await eventsAPI.deleteEvent(eventIdToDelete);
      
      // Supprimer l'événement de l'état local sans recharger tous les événements
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventIdToDelete));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'événement:', err);
    } finally {
      setIsProcessing(false);
      setEventIdToDelete(null);
    }
  };

  const handleViewClients = async (eventId) => {
    try {
      setLoadingClients(true);
      const event = events.find(e => e.id === eventId);
      setSelectedEvent(event);
      setShowClients(true);
      
      const response = await eventsAPI.getEventClients(eventId);
      setSelectedEventClients(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Events</h1>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Gestion des Événements</h2>
            <p className="text-blue-100 leading-relaxed">
              Créez et gérez vos événements en toute simplicité
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-8">
          <nav className="space-y-2">
            <a href="#" className="flex items-center px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Tous les événements
            </a>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/20">
          <div className="flex items-center text-blue-100 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Système en ligne
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Progress Bar */}
        {isProcessing && (
          <div className="fixed top-0 left-80 right-0 h-1 z-[100] bg-blue-100">
            <div className="h-full bg-blue-600 animate-progress"></div>
          </div>
        )}

        <div className="container mx-auto px-8 py-12 max-w-6xl">

        {events.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <p className="text-gray-500 text-xl font-medium mb-8">Aucun événement n'a encore été créé</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
            >
              Créer votre premier événement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={openDeleteConfirmation}
                onViewClients={handleViewClients}
              />
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 group border-4 border-white"
          title="Créer un nouvel événement"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Modals */}
        {showForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showClients && (
          <ClientsList
            clients={selectedEventClients}
            event={selectedEvent}
            onClose={() => {
              setShowClients(false);
              setSelectedEventClients([]);
              setSelectedEvent(null);
            }}
            loading={loadingClients}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Supprimer l'événement ?"
          message="Cette action est irréversible. Toutes les données liées à cet événement seront supprimées."
          onConfirm={handleDeleteEvent}
          onCancel={() => setIsDeleteModalOpen(false)}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
        </div>
      </div>
    </div>
  );
}