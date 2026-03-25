import { useState, useEffect } from 'react';
import { eventsAPI } from '../lib/api';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import ClientsList from '../components/ClientsList';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [selectedEventClients, setSelectedEventClients] = useState([]);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [error, setError] = useState('');

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
      await eventsAPI.createEvent(eventData);
      setShowForm(false);
      loadEvents();
      setError('');
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await eventsAPI.deleteEvent(eventId);
      loadEvents();
      setError('');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'événement');
      console.error(err);
    }
  };

  const handleViewClients = async (eventId) => {
    try {
      const response = await eventsAPI.getEventClients(eventId);
      const event = events.find(e => e.id === eventId);
      setSelectedEventClients(response.data.data);
      setSelectedEventName(event?.nom || 'Événement');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Événements</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Créer un événement
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Aucun événement trouvé</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Créer votre premier événement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDeleteEvent}
                onViewClients={handleViewClients}
              />
            ))}
          </div>
        )}

        {showForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showClients && (
          <ClientsList
            clients={selectedEventClients}
            eventName={selectedEventName}
            onClose={() => setShowClients(false)}
          />
        )}
      </div>
    </div>
  );
}