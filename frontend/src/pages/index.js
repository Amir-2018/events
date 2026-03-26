import { useState, useEffect } from 'react';
import { eventsAPI, eventTypesAPI, propertiesAPI } from '../lib/api';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import EventTypeForm from '../components/EventTypeForm';
import PropertyForm from '../components/PropertyForm';
import PropertyDetails from '../components/PropertyDetails';
import ClientsList from '../components/ClientsList';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEventTypeForm, setShowEventTypeForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [selectedEventClients, setSelectedEventClients] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [activeSection, setActiveSection] = useState('events');
  
  // New States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);

  // Data states
  const [eventTypes, setEventTypes] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadEvents();
    if (activeSection === 'event-types') {
      loadEventTypes();
    } else if (activeSection === 'properties') {
      loadProperties();
    }
  }, [activeSection]);

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
    } catch (err) {
      console.error('Erreur lors du chargement des types d\'événements:', err);
    } finally {
      setLoading(false);
    }
  };
  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getProperties();
      setProperties(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des biens:', err);
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
  const handleCreateEventType = async (eventTypeData) => {
    try {
      setIsProcessing(true);
      const response = await eventTypesAPI.createEventType(eventTypeData);
      setEventTypes(prev => [response.data.data, ...prev]);
      setShowEventTypeForm(false);
    } catch (err) {
      console.error('Erreur lors de la création du type d\'événement:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateProperty = async (propertyData) => {
    try {
      setIsProcessing(true);
      const response = await propertiesAPI.createProperty(propertyData);
      setProperties(prev => [response.data.data, ...prev]);
      setShowPropertyForm(false);
    } catch (err) {
      console.error('Erreur lors de la création du bien:', err);
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

  const handleDeleteProperty = async (id) => {
    try {
      setIsProcessing(true);
      await propertiesAPI.deleteProperty(id);
      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du bien:', err);
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
            <button
              onClick={() => setActiveSection('events')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'events' 
                  ? 'bg-white/20 backdrop-blur-sm text-white' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Tous les événements
            </button>
            
            <button
              onClick={() => setActiveSection('event-types')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'event-types' 
                  ? 'bg-white/20 backdrop-blur-sm text-white' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
              Types d'événements
            </button>
            
            <button
              onClick={() => setActiveSection('properties')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'properties' 
                  ? 'bg-white/20 backdrop-blur-sm text-white' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
              Biens
            </button>
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
          {/* Contenu des événements */}
          {activeSection === 'events' && (
            <>
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
            </>
          )}
          {/* Contenu des types d'événements */}
          {activeSection === 'event-types' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Types d'événements</h1>
                <button
                  onClick={() => setShowEventTypeForm(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Nouveau type
                </button>
              </div>
              
              {eventTypes.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-xl font-medium mb-8">Aucun type d'événement créé</p>
                  <button
                    onClick={() => setShowEventTypeForm(true)}
                    className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg"
                  >
                    Créer le premier type
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventTypes.map((type) => (
                    <div key={type.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                          </svg>
                        </div>
                        <button
                          onClick={() => handleDeleteEventType(type.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{type.nom}</h3>
                      {type.description && (
                        <p className="text-gray-600 text-sm">{type.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {/* Contenu des biens */}
          {activeSection === 'properties' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Biens</h1>
                <button
                  onClick={() => setShowPropertyForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Nouveau bien
                </button>
              </div>
              
              {properties.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-xl font-medium mb-8">Aucun bien enregistré</p>
                  <button
                    onClick={() => setShowPropertyForm(true)}
                    className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-all shadow-lg"
                  >
                    Ajouter le premier bien
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
                          </svg>
                        </div>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{property.nom}</h3>
                      <p className="text-purple-600 font-medium text-sm mb-2">{property.type}</p>
                      
                      {property.adresse && (
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                          {property.adresse}
                        </div>
                      )}

                      {(property.horaire_ouverture || property.horaire_fermeture) && (
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          {property.horaire_ouverture && property.horaire_fermeture 
                            ? `${property.horaire_ouverture} - ${property.horaire_fermeture}`
                            : property.horaire_ouverture || property.horaire_fermeture
                          }
                          {property.jours_ouverture && property.jours_ouverture !== 'Lundi-Dimanche' && (
                            <span className="ml-1 text-xs text-gray-500">({property.jours_ouverture})</span>
                          )}
                        </div>
                      )}

                      {(property.latitude && property.longitude) && (
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                          </svg>
                          <a 
                            href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}&zoom=15`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Voir sur la carte
                          </a>
                        </div>
                      )}

                      {property.description && (
                        <p className="text-gray-600 text-sm mt-3">{property.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {/* Floating Action Button */}
        {activeSection === 'events' && (
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 group border-4 border-white"
            title="Créer un nouvel événement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}

        {/* Modals */}
        {showForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showEventTypeForm && (
          <EventTypeForm
            onSubmit={handleCreateEventType}
            onCancel={() => setShowEventTypeForm(false)}
          />
        )}

        {showPropertyForm && (
          <PropertyForm
            onSubmit={handleCreateProperty}
            onCancel={() => setShowPropertyForm(false)}
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
  );
}