import { useState, useEffect } from 'react';
import { eventsAPI, eventTypesAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import EventsSection from '../components/EventsSection';
import EventTypesSection from '../components/EventTypesSection';
import PropertyList from '../components/PropertyList';
import ClientsList from '../components/ClientsList';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClients, setShowClients] = useState(false);
  const [selectedEventClients, setSelectedEventClients] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeSection, setActiveSection] = useState('events');
  
  // New States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);

  // Data states - chargées une seule fois
  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypesLoaded, setEventTypesLoaded] = useState(false);

  // Charger les événements au démarrage seulement
  useEffect(() => {
    loadEvents();
  }, []);

  // Charger les types d'événements seulement quand nécessaire
  useEffect(() => {
    if (activeSection === 'event-types' && !eventTypesLoaded) {
      loadEventTypes();
    }
  }, [activeSection, eventTypesLoaded]);

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

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const response = await eventTypesAPI.getEventTypes();
      setEventTypes(response.data.data);
      setEventTypesLoaded(true);
    } catch (err) {
      console.error('Erreur lors du chargement des types d\'événements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (newEvent) => {
    try {
      setIsProcessing(true);
      
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
  const handleCreateEventType = async (eventTypeData) => {
    try {
      setIsProcessing(true);
      const response = await eventTypesAPI.createEventType(eventTypeData);
      setEventTypes(prev => [response.data.data, ...prev]);
    } catch (err) {
      console.error('Erreur lors de la création du type d\'événement:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEventType = async (id) => {
    try {
      setIsProcessing(true);
      await eventTypesAPI.deleteEventType(id);
      setEventTypes(prev => prev.filter(type => type.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du type d\'événement:', err);
    } finally {
      setIsProcessing(false);
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
      {/* Sidebar Component */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Progress Bar */}
        {isProcessing && (
          <div className="fixed top-0 left-80 right-0 h-1 z-[100] bg-blue-100">
            <div className="h-full bg-blue-600 animate-progress"></div>
          </div>
        )}

        <div className="container mx-auto px-8 py-12 max-w-6xl">
          {/* Render Active Section */}
          {activeSection === 'events' && (
            <EventsSection
              events={events}
              onCreateEvent={handleCreateEvent}
              onDeleteEvent={openDeleteConfirmation}
              onViewClients={handleViewClients}
              isProcessing={isProcessing}
            />
          )}

          {activeSection === 'event-types' && (
            <EventTypesSection
              eventTypes={eventTypes}
              onCreateEventType={handleCreateEventType}
              onDeleteEventType={handleDeleteEventType}
              isProcessing={isProcessing}
            />
          )}

          {activeSection === 'properties' && (
            <PropertyList />
          )}
        </div>

        {/* Modals */}
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
  );
}