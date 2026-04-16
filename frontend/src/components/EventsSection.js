import { useState, useMemo } from 'react';
import EventCard from './EventCard';
import EventForm from './EventForm';
import CalendarView from './CalendarView';
import Pagination from './Pagination';
import BulkSelectionToolbar from './BulkSelectionToolbar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { eventsAPI } from '../lib/api';
import { useBulkSelection } from '../hooks/useBulkSelection';

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
  const [viewMode, setViewMode] = useState('table'); // 'grid', 'table' or 'calendar' - Default to table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // '', 'futur', 'en_cours', 'termine'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Hook pour la sélection multiple
  const {
    selectedItems: selectedEvents,
    isDeleting,
    handleSelectItem: handleSelectEvent,
    handleSelectAll,
    handleClearSelection,
    handleBulkDelete,
    isSelected,
    isAllSelected
  } = useBulkSelection();

  const handleCreateEvent = async (eventData) => {
    await onCreateEvent(eventData);
    setShowForm(false);
  };

  // Gestion de la suppression multiple
  const handleBulkDeleteEvents = async () => {
    try {
      await handleBulkDelete(eventsAPI.bulkDeleteEvents, () => {
        // Recharger les événements après suppression
        window.location.reload();
      });
    } catch (error) {
      alert('Erreur lors de la suppression des événements');
    }
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
      return { status: 'futur', label: 'À venir', color: 'bg-blue-50 text-[#2596d1]' };
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    const filtered = events.filter(event => {
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

    setTotalItems(filtered.length);
    return filtered;
  }, [events, searchTerm, filterType, filterStatus]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to first page when filters change
  const handleFilterChange = (filterFn) => {
    setCurrentPage(1);
    filterFn();
  };

  // Pagination logic - moved here to be accessible in all functions
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, itemsPerPage]);

  return (
    <div className="w-full">
      {/* Header Section - Optimized */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Événements</h1>
          <p className="text-sm text-gray-500">Gestion des événements</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
            style={{ backgroundColor: '#31a7df' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter
          </button>
          
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={viewMode === 'grid' ? { backgroundColor: '#31a7df' } : {}}
          >
            <i className="fas fa-th-large"></i>
            Cartes
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={viewMode === 'table' ? { backgroundColor: '#31a7df' } : {}}
          >
            <i className="fas fa-table"></i>
            Tableau
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={viewMode === 'calendar' ? { backgroundColor: '#31a7df' } : {}}
          >
            <i className="fas fa-calendar-alt"></i>
            Agenda
          </button>
        </div>
        </div>
      </div>

      {/* Filters Bar - Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rechercher</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                placeholder="Nom ou adresse..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-gray-400 text-sm transition-all"
                style={{ '--tw-ring-color': '#31a7df', '--tw-ring-opacity': '0.2' }}
                onFocus={(e) => e.target.style.borderColor = '#31a7df'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(() => setFilterType(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 text-sm transition-all"
              style={{ '--tw-ring-color': '#31a7df', '--tw-ring-opacity': '0.2' }}
              onFocus={(e) => e.target.style.borderColor = '#31a7df'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Tous</option>
              {eventTypes?.map(type => (
                <option key={type.id} value={type.nom}>{type.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(() => setFilterStatus(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 text-sm transition-all"
              style={{ '--tw-ring-color': '#31a7df', '--tw-ring-opacity': '0.2' }}
              onFocus={(e) => e.target.style.borderColor = '#31a7df'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Tous</option>
              <option value="futur">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar de sélection multiple */}
      <BulkSelectionToolbar
        selectedItems={selectedEvents}
        onBulkDelete={handleBulkDeleteEvents}
        onClearSelection={handleClearSelection}
        itemName="événement"
        itemNamePlural="événements"
        isDeleting={isDeleting}
      />

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
              onClick={() => {handleFilterChange(() => {setSearchTerm(''); setFilterType(''); setFilterStatus('');})}} 
              className="text-[#31a7df] font-bold hover:underline uppercase text-xs tracking-widest"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {paginatedEvents.map((event) => (
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </>
        )
      ) : viewMode === 'table' ? (
        filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in duration-500">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i className="fas fa-calendar-times text-gray-300 text-2xl"></i>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-4">Aucun événement ne correspond à vos critères</p>
            <button 
              onClick={() => {handleFilterChange(() => {setSearchTerm(''); setFilterType(''); setFilterStatus('');})}} 
              className="text-[#31a7df] font-bold hover:underline uppercase text-xs tracking-widest"
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
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected(paginatedEvents)}
                        onChange={() => handleSelectAll(paginatedEvents)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
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
                      <i className="fas fa-coins mr-2"></i>
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
                  {paginatedEvents.map((event) => {
                    const eventStatus = getEventStatus(event);
                    
                    return (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected(event.id)}
                            onChange={() => handleSelectEvent(event.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-calendar-alt text-[#31a7df]"></i>
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
                              <i className="fas fa-coins mr-1"></i>
                              {parseFloat(event.prix).toFixed(2)} TND
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-[#2596d1]">
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
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#31a7df] text-white rounded-lg text-xs font-bold hover:bg-[#2596d1] transition-colors"
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )
      ) : (
        <CalendarView items={paginatedEvents} onItemClick={(item) => console.log('Click on', item)} />
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