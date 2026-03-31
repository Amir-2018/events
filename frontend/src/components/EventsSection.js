import { useState, useMemo } from 'react';
import EventCard from './EventCard';
import EventForm from './EventForm';
import CalendarView from './CalendarView';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventsSection({ 
  events, 
  eventTypes,
  onCreateEvent, 
  onDeleteEvent, 
  onViewClients, 
  onViewDetails,
  onEdit,
  onViewMap,
  isProcessing 
}) {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // '', 'futur', 'en_cours', 'termine'

  const handleCreateEvent = async (eventData) => {
    await onCreateEvent(eventData);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = event.date ? new Date(event.date) : null;
    const endDate = event.date_fin ? new Date(event.date_fin) : (startDate ? new Date(startDate.getTime() + 2 * 60 * 60 * 1000) : null);
    
    if (endDate && endDate < now) {
      return { status: 'termine', label: 'Terminé', color: 'bg-gray-100 text-gray-700' };
    } else if (startDate && startDate <= now && (!endDate || endDate >= now)) {
      return { status: 'en_cours', label: 'En cours', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'futur', label: 'À venir', color: 'bg-blue-100 text-blue-700' };
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    return events.filter(event => {
      // Calcul du statut
      const startDate = event.date ? new Date(event.date) : null;
      const endDate = event.date_fin ? new Date(event.date_fin) : (startDate ? new Date(startDate.getTime() + 2 * 60 * 60 * 1000) : null);
      
      let status = 'futur';
      if (endDate && endDate < now) {
        status = 'termine';
      } else if (startDate && startDate <= now && (!endDate || endDate >= now)) {
        status = 'en_cours';
      }

      const matchesSearch = event.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.adresse?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || event.type_evenement_nom === filterType;
      const matchesStatus = !filterStatus || status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchTerm, filterType, filterStatus]);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Événements</h1>
          <p className="text-gray-500 font-medium tracking-tight">Gérez et suivez tous vos événements en un coup d'œil</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl font-semibold text-sm uppercase tracking-wide hover:from-blue-700 hover:to-blue-900 transition-all shadow-xl shadow-blue-200/50 active:scale-95 border border-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter un événement
          </button>
          
          <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <i className="fas fa-th-large"></i>
            Cartes
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <i className="fas fa-table"></i>
            Tableau
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <i className="fas fa-calendar-alt"></i>
            Agenda
          </button>
        </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-10 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Rechercher</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou adresse de l'événement..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-medium placeholder-gray-400 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Type d'événement</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-medium transition-all"
            >
              <option value="">Tous les types</option>
              {eventTypes?.map(type => (
                <option key={type.id} value={type.nom}>{type.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-medium transition-all"
            >
              <option value="">Tous les statuts</option>
              <option value="futur">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in duration-500">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-4">Aucun événement ne correspond à vos critères</p>
            <button 
              onClick={() => {setSearchTerm(''); setFilterType('');}} 
              className="text-blue-600 font-bold hover:underline uppercase text-xs tracking-widest"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={onDeleteEvent}
                onViewClients={onViewClients}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onViewMap={onViewMap}
              />
            ))}
          </div>
        )
      ) : viewMode === 'table' ? (
        filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in duration-500">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i className="fas fa-calendar-times text-gray-300 text-2xl"></i>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-4">Aucun événement ne correspond à vos critères</p>
            <button 
              onClick={() => {setSearchTerm(''); setFilterType('');}} 
              className="text-blue-600 font-bold hover:underline uppercase text-xs tracking-widest"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      Événement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-tag mr-2"></i>
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-clock mr-2"></i>
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      Lieu
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-users mr-2"></i>
                      Participants
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-euro-sign mr-2"></i>
                      Prix
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-info-circle mr-2"></i>
                      Statut
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => {
                    const eventStatus = getEventStatus(event);
                    
                    return (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-calendar-alt text-blue-600"></i>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 line-clamp-1">{event.nom}</div>
                              <div className="text-sm text-gray-500">ID: {event.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-tag text-gray-400"></i>
                            <span className="text-sm text-gray-600">{event.type_evenement_nom || 'Non défini'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(event.date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-map-marker-alt text-gray-400"></i>
                            <span className="text-sm text-gray-600 line-clamp-1">{event.adresse || 'Non défini'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                            {event.current_participants || 0} / {event.max_participants || '∞'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {parseFloat(event.prix) > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                              <i className="fas fa-euro-sign mr-1"></i>
                              {parseFloat(event.prix).toFixed(2)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                              <i className="fas fa-gift mr-1"></i>
                              Gratuit
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${eventStatus.color}`}>
                            {eventStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onViewDetails(event)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                              title="Voir détails"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => onViewClients(event)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                              title="Voir participants"
                            >
                              <i className="fas fa-users"></i>
                            </button>
                            <button
                              onClick={() => onEdit(event)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 transition-colors"
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => onDeleteEvent(event.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <CalendarView items={filteredEvents} onItemClick={(item) => console.log('Click on', item)} />
      )}

      {/* Modal Form */}
      {showForm && (
        <EventForm
          events={events}
          onSubmit={handleCreateEvent}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}