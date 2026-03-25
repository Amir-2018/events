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
  const [error, setError] = useState('');
  
  // New States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvents();
      setEvents(response.data.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des événements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      setIsProcessing(true);
      await eventsAPI.createEvent(eventData);
      setShowForm(false);
      await loadEvents();
      setError('');
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
      console.error(err);
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
      await eventsAPI.deleteEvent(eventIdToDelete);
      await loadEvents();
      setError('');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'événement');
      console.error(err);
    } finally {
      setIsProcessing(false);
      setEventIdToDelete(null);
    }
  };

  const handleViewClients = async (eventId) => {
    try {
      const response = await eventsAPI.getEventClients(eventId);
      const event = events.find(e => e.id === eventId);
      setSelectedEventClients(response.data.data);
      setSelectedEvent(event);
      setShowClients(true);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des clients');
      console.error(err);
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
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      {/* Progress Bar */}
      {isProcessing && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-blue-100">
          <div className="h-full bg-blue-600 animate-progress"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Gestion des Événements
          </h1>
          <p className="text-gray-500 text-lg">
            Créez et gérez vos événements en toute simplicité.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-xl mb-8 flex items-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

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
            onClose={() => setShowClients(false)}
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
  );
}