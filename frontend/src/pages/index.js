import { useState, useEffect } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import Link from 'next/link';
import { eventsAPI, eventTypesAPI, propertiesAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadEvents();
    loadFilters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, selectedEventType, selectedPropertyType]);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getPublicEvents();
      // Only get events that are in the future
      const upcomingEvents = (response.data.data || []).filter(
        event => new Date(event.date) > new Date()
      ).sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Erreur de chargement des événements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [eventTypesResponse, propertiesResponse] = await Promise.all([
        eventTypesAPI.getEventTypes(),
        propertiesAPI.getProperties()
      ]);
      
      setEventTypes(eventTypesResponse.data.data || []);
      
      // Extract unique property types
      const properties = propertiesResponse.data.data || [];
      const uniquePropertyTypes = [...new Set(properties.map(p => p.type_bien_nom).filter(Boolean))];
      setPropertyTypes(uniquePropertyTypes);
    } catch (err) {
      console.error('Erreur de chargement des filtres:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.adresse && event.adresse.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.type_evenement_nom && event.type_evenement_nom.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Event type filter
    if (selectedEventType) {
      filtered = filtered.filter(event => event.type_evenement_id === selectedEventType);
    }

    // Property type filter
    if (selectedPropertyType) {
      filtered = filtered.filter(event => event.bien_type_nom === selectedPropertyType);
    }

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEventType('');
    setSelectedPropertyType('');
    setCurrentPage(1);
  };

  const top3Events = events.slice(0, 3);
  
  // Pagination logic
  const displayEvents = showAllEvents ? filteredEvents : events.slice(0, 6);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = showAllEvents ? displayEvents.slice(indexOfFirstEvent, indexOfLastEvent) : displayEvents;
  const totalPages = showAllEvents ? Math.ceil(displayEvents.length / eventsPerPage) : 1;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (top3Events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % top3Events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [top3Events.length]);


  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'client') {
      alert("Seuls les clients peuvent s'inscrire aux événements.");
      return;
    }

    try {
      await eventsAPI.registerToEvent(eventId);
      setMessage("Inscription réussie !");
      loadEvents(); // Reload to update participant count
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'inscription";
      alert(errorMsg);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <PublicNavbar />
      
      {/* Toast Message */}
      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm animate-in fade-in slide-in-from-top-4">
          {message}
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-[600px] flex items-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '4s' }}></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 animate-bounce" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '6s' }}></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-15 animate-ping" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '3s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 rounded-full opacity-10 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '5s' }}></div>
          </div>
          
          <div className="absolute inset-0 bg-gray-900 z-0">
            {top3Events.map((event, index) => (
              <div 
                key={event.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                {event.image ? (
                  <img src={event.image} alt={event.nom} className="w-full h-full object-cover scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-gray-900"></div>
                )}
                
                {/* Slide Content */}
                <div className="absolute inset-0 z-20 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="text-center md:text-left md:max-w-3xl">
                      <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl text-sm font-bold uppercase tracking-wider mb-8 shadow-xl border border-white/30">
                        {event.type_evenement_nom || 'Événement Spécial'}
                      </div>
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-tight mb-10 drop-shadow-2xl">
                        {event.nom}
                      </h1>
                      
                      <div className="flex flex-col md:flex-row gap-4 mb-12 text-white font-semibold text-base">
                        <div className="flex items-center justify-center md:justify-start gap-3 bg-white/15 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/25 shadow-lg hover:bg-white/20 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                          <span className="text-sm font-medium">{formatDate(event.date)}</span>
                        </div>
                        {event.adresse && (
                          <div className="flex items-center justify-center md:justify-start gap-3 bg-white/15 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/25 shadow-lg hover:bg-white/20 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                            <span className="text-sm font-medium">{event.adresse}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        {event.current_participants >= event.max_participants && event.max_participants > 0 ? (
                          <button disabled className="bg-red-500/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center shadow-xl border border-red-400/50 min-w-[200px]">
                            <i className="fas fa-times-circle mr-2"></i>
                            Complet
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRegister(event.id)}
                            className="bg-gradient-to-r from-[#31a7df] to-[#2596d1] text-white px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider hover:from-[#2596d1] hover:to-[#1e7ba8] transition-all hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center border border-blue-400/50 backdrop-blur-sm min-w-[200px] group"
                          >
                            <i className="fas fa-ticket-alt mr-2 group-hover:scale-110 transition-transform"></i>
                            S'inscrire maintenant
                          </button>
                        )}
                        <Link 
                          href={`/event/${event.id}`}
                          className="bg-white/15 backdrop-blur-lg border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-white/25 hover:border-white/50 transition-all active:scale-95 flex items-center justify-center cursor-pointer min-w-[160px] group"
                        >
                          <i className="fas fa-info-circle mr-2 group-hover:scale-110 transition-transform"></i>
                          Détails
                        </Link>
                        <a 
                          href="#events-section" 
                          onClick={() => setShowAllEvents(true)}
                          className="bg-white/10 backdrop-blur-lg border-2 border-white/25 text-white px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 flex items-center justify-center cursor-pointer min-w-[160px] group"
                        >
                          <i className="fas fa-th-large mr-2 group-hover:scale-110 transition-transform"></i>
                          Voir tout
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Dots */}
            {top3Events.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-4 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                {top3Events.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-[#31a7df]' : 'bg-white/50 hover:bg-white'}`}
                  aria-label={`Aller au slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Fallback when no events */}
            {top3Events.length === 0 && (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-300 mb-4 italic">
                    Event<span className="text-blue-200">Pro</span>
                  </h1>
                  <p className="text-gray-400 font-medium">Restez à l'écoute pour nos prochains événements.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Project Description Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Background Animation Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full opacity-5 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '6s' }}></div>
            <div className="absolute bottom-1/4 right-10 w-24 h-24 rounded-full opacity-8 animate-bounce" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '4s' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic mb-6">
                Qu'est-ce qu'<span className="text-[#31a7df]">EventPro</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                EventPro est une plateforme événementielle intelligente conçue pour simplifier la gestion complète de vos événements, 
                de la planification initiale au suivi post-événement.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-8">
                <div className="group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <i className="fas fa-lightbulb text-[#31a7df] text-xl group-hover:scale-110 transition-transform"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#31a7df] transition-colors">Innovation & Simplicité</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Une interface moderne et intuitive qui rend la gestion d'événements accessible à tous, 
                        des débutants aux professionnels expérimentés.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                      <i className="fas fa-sync-alt text-green-600 text-xl group-hover:scale-110 transition-transform"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Gestion Centralisée</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Tous vos événements, participants, biens et statistiques réunis dans une seule plateforme 
                        pour une vision globale et un contrôle total.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                      <i className="fas fa-chart-line text-purple-600 text-xl group-hover:scale-110 transition-transform"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Analyses Avancées</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Des rapports détaillés et des statistiques en temps réel pour optimiser vos événements 
                        et prendre des décisions éclairées.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[40px] p-8 border border-gray-200 hover:shadow-2xl transition-all duration-500 group">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm group-hover:shadow-lg transition-all">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-calendar-check text-[#31a7df]"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">500+</h4>
                      <p className="text-sm text-gray-600">Événements Créés</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm group-hover:shadow-lg transition-all">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-users text-green-600"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">1K+</h4>
                      <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm group-hover:shadow-lg transition-all">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-building text-purple-600"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">50+</h4>
                      <p className="text-sm text-gray-600">Lieux Partenaires</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm group-hover:shadow-lg transition-all">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-star text-orange-600"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">4.9/5</h4>
                      <p className="text-sm text-gray-600">Satisfaction Client</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-[#31a7df] to-[#2596d1] rounded-[50px] p-12 lg:p-16 text-white text-center">
              <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6">
                Notre Mission
              </h3>
              <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
                Démocratiser l'organisation d'événements en fournissant des outils professionnels accessibles à tous. 
                Nous croyons que chaque événement, qu'il soit petit ou grand, mérite d'être parfaitement orchestré.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#events-section" 
                  className="bg-white text-[#31a7df] px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-eye"></i>
                  Découvrir nos Événements
                </a>
                <a 
                  href="/about" 
                  className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-[#31a7df] transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-info-circle"></i>
                  En Savoir Plus
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Events Preview Section */}
        <section id="events-section" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-4">
                Événements <span className="text-[#31a7df]">à Venir</span>
              </h2>
              <p className="text-gray-500 font-medium">Découvrez et inscrivez-vous à nos prochains événements exclusifs.</p>
            </div>

            {/* Filters Section */}
            {showAllEvents && (
              <div className="mb-12 bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Rechercher un événement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-medium pl-14"
                    />
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>

                  {/* Event Type Filter */}
                  <div className="w-full lg:w-64">
                    <select
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                      <option value="">Tous les types</option>
                      {eventTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.nom}</option>
                      ))}
                    </select>
                  </div>

                  {/* Property Type Filter */}
                  <div className="w-full lg:w-64">
                    <select
                      value={selectedPropertyType}
                      onChange={(e) => setSelectedPropertyType(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                    >
                      <option value="">Tous les biens</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={clearFilters}
                    className="px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-times"></i>
                    Effacer
                  </button>
                </div>

                {/* Results Count */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 font-medium">
                    {displayEvents.length} événement{displayEvents.length !== 1 ? 's' : ''} trouvé{displayEvents.length !== 1 ? 's' : ''}
                    {(searchTerm || selectedEventType || selectedPropertyType) && (
                      <span className="text-[#31a7df]"> avec les filtres appliqués</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : currentEvents.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
                <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 font-bold tracking-widest uppercase mb-2">
                  {showAllEvents && (searchTerm || selectedEventType || selectedPropertyType) 
                    ? 'Aucun événement ne correspond à vos critères'
                    : 'Aucun événement disponible pour le moment'
                  }
                </p>
                {showAllEvents && (searchTerm || selectedEventType || selectedPropertyType) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-3 bg-[#31a7df] text-white rounded-2xl font-bold hover:bg-[#2596d1] transition-all"
                  >
                    Voir tous les événements
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-[30px] border border-gray-100 shadow-lg hover:shadow-xl transition-all overflow-hidden group flex flex-col">
                      <div className="h-48 bg-gray-100 relative overflow-hidden">
                        {event.image ? (
                          <img src={event.image} alt={event.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#31a7df]">
                          {event.type_evenement_nom || 'Événement'}
                        </div>
                        {/* Price Badge */}
                        <div className="absolute top-4 right-4">
                          {parseFloat(event.prix || 0) > 0 ? (
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(event.prix)}
                            </div>
                          ) : (
                            <div className="bg-[#31a7df] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <i className="fas fa-gift"></i>
                              Gratuit
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="text-xl font-black mb-2 line-clamp-2 leading-tight">{event.nom}</h3>
                        <p className="text-sm text-gray-500 font-medium mb-4 flex-grow">
                          {formatDate(event.date)} <br/> 
                          {event.adresse || event.bien_nom}
                          {event.bien_type_nom && (
                            <span className="block text-xs text-[#31a7df] font-bold mt-1">
                              <i className="fas fa-building mr-1"></i>
                              {event.bien_type_nom}
                            </span>
                          )}
                        </p>
                        
                        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
                           <div className="text-xs font-bold text-gray-600">
                             <i className="fas fa-users mr-1"></i>
                             <span className="text-gray-900">{event.current_participants || 0}</span> inscrits
                           </div>
                           {event.max_participants > 0 && (
                             <div className="text-xs font-bold text-gray-600">
                               Max <span className="text-gray-900">{event.max_participants}</span>
                             </div>
                           )}
                        </div>

                        <div className="flex gap-3">
                          <Link 
                            href={`/event/${event.id}`}
                            className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all text-center"
                          >
                            Détails
                          </Link>
                          <button 
                            onClick={() => handleRegister(event.id)}
                            disabled={event.max_participants > 0 && event.current_participants >= event.max_participants}
                            className="flex-1 bg-blue-50 text-[#31a7df] hover:bg-[#31a7df] hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed group-hover:shadow-md"
                          >
                            {event.max_participants > 0 && event.current_participants >= event.max_participants 
                              ? 'Complet' 
                              : 'S\'inscrire'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {showAllEvents && totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => paginate(index + 1)}
                          className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            currentPage === index + 1
                              ? 'bg-[#31a7df] text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Show All/Show Less Toggle */}
                {!showAllEvents && events.length > 6 && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => setShowAllEvents(true)}
                      className="px-8 py-4 bg-[#31a7df] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#2596d1] transition-all shadow-lg hover:shadow-xl"
                    >
                      Voir tous les {events.length} événements
                    </button>
                  </div>
                )}

                {showAllEvents && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => {
                        setShowAllEvents(false);
                        setCurrentPage(1);
                        clearFilters();
                      }}
                      className="px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-300 transition-all"
                    >
                      Voir moins
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Features Preview */}
        <section className="bg-gray-50 py-24 relative overflow-hidden">
           {/* Background Animation Elements */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-20 left-20 w-40 h-40 rounded-full opacity-5 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '4s' }}></div>
             <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full opacity-8 animate-bounce" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '6s' }}></div>
           </div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 {[
                   { title: "Gestion Intuitive", desc: "Une interface fluide pour créer et modifier vos événements en quelques clics.", icon: "fas fa-magic" },
                   { title: "Suivi en Temps Réel", desc: "Gardez un oeil sur vos inscrits et vos biens grâce à notre tableau de bord.", icon: "fas fa-chart-line" },
                   { title: "Statistiques Avancées", desc: "Analysez la performance de vos événements avec des données précises.", icon: "fas fa-analytics" }
                 ].map((feature, i) => (
                   <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 group">
                      <div className="text-[#31a7df] mb-6 font-black text-4xl italic opacity-20 group-hover:opacity-40 transition-opacity">0{i+1}</div>
                      <div className="mb-4">
                        <i className={`${feature.icon} text-2xl text-[#31a7df] group-hover:scale-110 transition-transform`}></i>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-[#31a7df] transition-colors">{feature.title}</h3>
                      <p className="text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">{feature.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 text-center text-xs font-black uppercase tracking-widest text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>&copy; 2026 EventPro System. Tous droits réservés.</div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 opacity-60 hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              Amir Maalaoui
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              amir.maalaoui27@gmail.com
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.54-4.24-7.136-7.136l1.292-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
              +216 93379344
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
