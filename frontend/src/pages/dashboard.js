import { useState, useEffect } from 'react';
import { eventsAPI, eventTypesAPI, clientsAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import EventsSection from '../components/EventsSection';
import EventTypesSection from '../components/EventTypesSection';
import PropertyList from '../components/PropertyList';
import ClientsList from '../components/ClientsList';
import ConfirmationModal from '../components/ConfirmationModal';
import RegistrantsList from '../components/RegistrantsList';
import UsersSection from '../components/UsersSection';
import ReclamationsSection from '../components/ReclamationsSection';
import BienTypesSection from '../components/BienTypesSection';
import EventDetailsModal from '../components/EventDetailsModal';
import DashboardSection from '../components/DashboardSection';
import SuccessPopup from '../components/SuccessPopup';
import TicketsSection from '../components/TicketsSection';
import TicketScannerSection from '../components/TicketScannerSection';
import { useAuth } from '../context/AuthContext';
import ClientEventsSection from '../components/ClientEventsSection';
import InvitationsSection from '../components/InvitationsSection';
import EventEditModal from '../components/EventEditModal';

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClients, setShowClients] = useState(false);
  const [selectedEventClients, setSelectedEventClients] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // New States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsWithEvents, setClientsWithEvents] = useState([]);
  const [loadingInscrits, setLoadingInscrits] = useState(false);

  // Details Modal States
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [eventForMap, setEventForMap] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Data states - chargées une seule fois
  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypesLoaded, setEventTypesLoaded] = useState(false);
  const [bienTypes, setBienTypes] = useState([]);
  const [bienTypesLoaded, setBienTypesLoaded] = useState(false);

  // Charger les événements au démarrage seulement
  useEffect(() => {
    loadEvents();
  }, []);

  // Charger les types d'événements seulement quand nécessaire
  useEffect(() => {
    if ((activeSection === 'event-types' || activeSection === 'events') && !eventTypesLoaded) {
      loadEventTypes();
    }
  }, [activeSection, eventTypesLoaded]);

  // Charger les types de biens seulement quand nécessaire
  useEffect(() => {
    if ((activeSection === 'bien-types' || activeSection === 'properties') && !bienTypesLoaded) {
      loadBienTypes();
    }
  }, [activeSection, bienTypesLoaded]);

  // Charger les inscrits pour la section 'inscrits'
  useEffect(() => {
    if (activeSection === 'inscrits') {
      loadClientsWithEvents();
    }
  }, [activeSection]);

  const loadClientsWithEvents = async () => {
    try {
      setLoadingInscrits(true);
      const response = await clientsAPI.getAllClients();
      setClientsWithEvents(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des inscrits:', err);
    } finally {
      setLoadingInscrits(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      if (user?.role === 'client') {
        const response = await eventsAPI.getMyRegistrations();
        setEvents(response.data.data);
      } else {
        const response = await eventsAPI.getManagedEvents();
        setEvents(response.data.data);
      }
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

  const loadBienTypes = async () => {
    const { typeBiensAPI } = require('../lib/api');
    try {
      setLoading(true);
      const response = await typeBiensAPI.getTypeBiens();
      setBienTypes(response.data.data || []);
      setBienTypesLoaded(true);
    } catch (err) {
      console.error('Erreur lors du chargement des types de biens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (newEvent) => {
    try {
      setIsProcessing(true);
      
      // Recharger tous les événements depuis le serveur pour être sûr d'avoir les données à jour
      await loadEvents();
      
      // Afficher le message de succès
      setSuccessMessage(eventToEdit ? "L'événement a été mis à jour avec succès." : "L'événement a été créé avec succès.");
      setShowSuccess(true);
      
      // Réinitialiser l'état d'édition
      if (eventToEdit) {
        setEventToEdit(null);
      }
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      setIsProcessing(true);
      await eventsAPI.unregisterFromEvent(eventId);
      await loadEvents();
      setSuccessMessage("Votre inscription a été annulée avec succès.");
      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de l\'annulation de l\'inscription:', err);
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
      
      // Afficher le message de succès
      setSuccessMessage("L'événement a été supprimé avec succès.");
      setShowSuccess(true);
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

  const handleViewDetails = (event) => {
    setSelectedEventForDetails(event);
    setShowDetails(true);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setShowEditModal(true);
  };

  const handleSaveEditedEvent = async (updatedEvent) => {
    try {
      setIsProcessing(true);
      
      // Recharger tous les événements depuis le serveur pour être sûr d'avoir les données à jour
      await loadEvents();
      
      // Afficher le message de succès
      setSuccessMessage("L'événement a été mis à jour avec succès.");
      setShowSuccess(true);
      
      // Réinitialiser l'état d'édition
      setEventToEdit(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'événement:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewMap = (event) => {
    setEventForMap(event);
    setShowMap(true);
  };
  // Test de l'authentification
  const testAuthentication = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token dans localStorage:', token ? token.substring(0, 20) + '...' : 'Aucun token');
      
      const { testAPI } = require('../lib/api');
      const response = await testAPI.testAuth();
      console.log('Test d\'authentification réussi:', response.data);
      alert('Authentification OK');
    } catch (err) {
      console.error('Erreur de test d\'authentification:', err);
      alert(`Erreur d'authentification: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateEventType = async (eventTypeData, id = null) => {
    try {
      setIsProcessing(true);
      if (id) {
        // Mode édition
        const response = await eventTypesAPI.updateEventType(id, eventTypeData);
        setEventTypes(prev => prev.map(type => type.id === id ? response.data.data : type));
        setSuccessMessage("Le type d'événement a été mis à jour avec succès.");
      } else {
        // Mode création
        const response = await eventTypesAPI.createEventType(eventTypeData);
        setEventTypes(prev => [response.data.data, ...prev]);
        setSuccessMessage("Le type d'événement a été créé avec succès.");
      }
      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la gestion du type d\'événement:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la gestion du type d\'événement';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEventType = async (id) => {
    try {
      setIsProcessing(true);
      await eventTypesAPI.deleteEventType(id);
      setEventTypes(prev => prev.filter(type => type.id !== id));
      setSuccessMessage("Le type d'événement a été supprimé avec succès.");
      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la suppression du type d\'événement:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTypeBien = async (typeBienData, id = null) => {
    const { typeBiensAPI } = require('../lib/api');
    try {
      setIsProcessing(true);
      if (id) {
        const response = await typeBiensAPI.updateTypeBien(id, typeBienData);
        setBienTypes(prev => prev.map(t => t.id === id ? response.data.data : t));
        setSuccessMessage("La catégorie de bien a été mise à jour avec succès.");
      } else {
        const response = await typeBiensAPI.createTypeBien(typeBienData);
        setBienTypes(prev => [response.data.data, ...prev]);
        setSuccessMessage("La catégorie de bien a été créée avec succès.");
      }
      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la gestion du type de bien:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la gestion du type de bien';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTypeBien = async (id) => {
    const { typeBiensAPI } = require('../lib/api');
    try {
      setIsProcessing(true);
      await typeBiensAPI.deleteTypeBien(id);
      setBienTypes(prev => prev.filter(t => t.id !== id));
      setSuccessMessage("La catégorie de bien a été supprimée avec succès.");
      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la suppression du type de bien:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateProperty = async (propertyData) => {
    const { propertiesAPI } = require('../lib/api');
    try {
      setIsProcessing(true);
      const response = await propertiesAPI.createProperty(propertyData);
      // Nous rechargeons les événements car la création d'un bien peut changer l'état global
      // Mais ici on pourrait juste mettre à jour l'état si on en avait un pour les propriétés
      // Pour l'instant on laisse le composant PropertyList gérer son propre état ou on en crée un
      setSuccessMessage("Le bien a été créé avec succès.");
      setShowSuccess(true);
      return response.data.data;
    } catch (err) {
      console.error('Erreur lors de la création du bien:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProperty = async (id, propertyData) => {
    const { propertiesAPI } = require('../lib/api');
    try {
      setIsProcessing(true);
      const response = await propertiesAPI.updateProperty(id, propertyData);
      setSuccessMessage("Le bien a été mis à jour avec succès.");
      setShowSuccess(true);
      return response.data.data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du bien:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    const { propertiesAPI } = require('../lib/api');
    try {
      setIsProcessing(true);
      await propertiesAPI.deleteProperty(id);
      setSuccessMessage("Le bien a été supprimé avec succès.");
      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la suppression du bien:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-50 flex">
      {/* Sidebar Component - ALWAYS VISIBLE */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Main Content */}
      <div className="flex-1 relative bg-gray-50/50 ml-72">
        {/* Progress Bar for secondary operations */}
        {isProcessing && (
          <div className="fixed top-0 left-80 right-0 h-1 z-[100] bg-blue-50">
            <div className="h-full bg-[#31a7df] animate-progress"></div>
          </div>
        )}

        {/* LOADING STATE - Only for the main content area */}
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center p-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 bg-[#31a7df] rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-8 text-lg font-black text-gray-900 uppercase tracking-tighter">Initialisation du système...</p>
            <p className="mt-2 text-gray-500 font-medium">Chargement des données en cours...</p>
            
            <button 
              onClick={() => window.location.reload()}
              className="mt-12 px-8 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-400"
            >
              Forcer le rechargement
            </button>
          </div>
        ) : (
          <div className="w-full px-12 py-12 max-w-none animate-in fade-in duration-500">
            {/* Bouton de test temporaire */}
            <div className="mb-4">
              <button 
                onClick={testAuthentication}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-all"
              >
                🔧 Test Auth (Debug)
              </button>
            </div>
            
            {/* Render Active Section */}
            {activeSection === 'dashboard' && (
              user?.role === 'client' ? (
                <ClientEventsSection
                  events={events}
                  onUnregister={handleUnregister}
                  isProcessing={isProcessing}
                />
              ) : (
                <DashboardSection 
                  events={events}
                  onNavigate={setActiveSection}
                />
              )
            )}
            
            {activeSection === 'events' && (
              <EventsSection
                events={events}
                eventTypes={eventTypes}
                onCreateEvent={handleCreateEvent}
                onDeleteEvent={openDeleteConfirmation}
                onViewClients={handleViewClients}
                onViewDetails={handleViewDetails}
                onEdit={handleEditEvent}
                onViewMap={handleViewMap}
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
              <PropertyList 
                events={events}
                eventTypes={eventTypes}
                bienTypes={bienTypes}
                onCreateProperty={handleCreateProperty}
                onUpdateProperty={handleUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                isProcessing={isProcessing}
              />
            )}
            {activeSection === 'bien-types' && (
              <BienTypesSection 
                bienTypes={bienTypes}
                onCreateTypeBien={handleCreateTypeBien}
                onDeleteTypeBien={handleDeleteTypeBien}
                isProcessing={isProcessing}
              />
            )}
            {activeSection === 'inscrits' && (
              <RegistrantsList 
                clients={clientsWithEvents}
                loading={loadingInscrits}
                onRefresh={loadClientsWithEvents}
              />
            )}
            {activeSection === 'utilisateurs' && (
              <UsersSection />
            )}
            {activeSection === 'reclamations' && (
              <ReclamationsSection />
            )}
            {activeSection === 'tickets' && (
              <TicketsSection />
            )}
            {activeSection === 'ticket-scanner' && (
              <TicketScannerSection />
            )}
            {activeSection === 'invitations' && user?.role === 'client' && (
              <InvitationsSection />
            )}
          </div>
        )}

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

        {showDetails && selectedEventForDetails && (
          <EventDetailsModal
            event={selectedEventForDetails}
            onClose={() => {
              setShowDetails(false);
              setSelectedEventForDetails(null);
            }}
          />
        )}

        {/* Map Modal */}
        {showMap && eventForMap && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white/20">
                <button 
                  onClick={() => setShowMap(false)}
                  className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur text-gray-900 rounded-2xl shadow-xl hover:bg-white transition-all active:scale-95 border border-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-[100px] bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 max-w-xs text-center flex flex-col items-center">
                   <h3 className="font-black text-gray-900 uppercase tracking-tighter italic text-lg">{eventForMap.bien_nom || eventForMap.nom}</h3>
                   <p className="text-gray-500 text-xs font-medium mt-1 leading-tight">{eventForMap.adresse || eventForMap.bien_adresse}</p>
                   <div className="mt-2 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#31a7df] animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#31a7df]">Position en direct</span>
                   </div>
                </div>

                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(eventForMap.bien_longitude || 10)-0.005}%2C${parseFloat(eventForMap.bien_latitude || 36.8)-0.005}%2C${parseFloat(eventForMap.bien_longitude || 10)+0.005}%2C${parseFloat(eventForMap.bien_latitude || 36.8)+0.005}&layer=mapnik&marker=${eventForMap.bien_latitude || 36.8}%2C${eventForMap.bien_longitude || 10}`}
                  className="w-full h-full grayscale-[0.2] contrast-[1.1]"
                ></iframe>
             </div>
          </div>
        )}

        {eventToEdit && (
          <EventEditModal
            event={eventToEdit}
            events={events}
            onSave={handleSaveEditedEvent}
            onClose={() => {
              setEventToEdit(null);
              setShowEditModal(false);
            }}
            isOpen={showEditModal}
          />
        )}
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

        <SuccessPopup
          isOpen={showSuccess}
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      </div>
    </div>
  );
}