import { useState, useEffect } from 'react';
import { propertiesAPI } from '../lib/api';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';
import CalendarView from './CalendarView';
import ConfirmationModal from './ConfirmationModal';

export default function PropertyList({ 
  events = [], 
  bienTypes = [],
  onCreateProperty, 
  onUpdateProperty, 
  onDeleteProperty,
  isProcessing
}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [propertySchedule, setPropertySchedule] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  // Icônes FontAwesome pour les types de biens
  const getPropertyTypeIcon = (type) => {
    const iconMap = {
      'Stade': 'fas fa-running',
      'Salle': 'fas fa-door-open',
      'Maison de jeunes': 'fas fa-home',
      'École': 'fas fa-school',
      'Centre communautaire': 'fas fa-users',
      'Parc': 'fas fa-tree',
      'Théâtre': 'fas fa-theater-masks',
      'Auditorium': 'fas fa-microphone',
      'Gymnase': 'fas fa-dumbbell',
      'Autre': 'fas fa-building'
    };
    return iconMap[type] || 'fas fa-building';
  };

  const PROPERTY_TYPES = [
    'Stade',
    'Salle',
    'Maison de jeunes',
    'École',
    'Centre communautaire',
    'Parc',
    'Théâtre',
    'Auditorium',
    'Gymnase',
    'Autre'
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getProperties();
      setProperties(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement biens:', err);
      setError('Erreur lors du chargement des biens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePropertySubmit = async (propertyData) => {
    try {
      if (editingProperty) {
        // Confirmation avant de sauvegarder les modifications
        setConfirmModal({
          show: true,
          title: 'Modifier le bien ?',
          message: `Voulez-vous vraiment enregistrer les modifications pour "${editingProperty.nom}" ?`,
          type: 'primary',
          onConfirm: async () => {
            try {
              const updated = await onUpdateProperty(editingProperty.id, propertyData);
              setProperties(prev => prev.map(p => p.id === editingProperty.id ? updated : p));
              setEditingProperty(null);
              setShowForm(false);
              setConfirmModal(prev => ({ ...prev, show: false }));
            } catch (err) {
              console.error('Erreur lors de la mise à jour:', err);
              setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
              setConfirmModal(prev => ({ ...prev, show: false }));
            }
          }
        });
      } else {
        const created = await onCreateProperty(propertyData);
        setProperties(prev => [created, ...prev]);
        setShowForm(false);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleDeleteClick = (property) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer le bien ?',
      message: `Êtes-vous sûr de vouloir supprimer "${property.nom}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await onDeleteProperty(property.id);
          setProperties(prev => prev.filter(p => p.id !== property.id));
          setSelectedProperty(null);
          setConfirmModal(prev => ({ ...prev, show: false }));
        } catch (err) {
          console.error('Erreur lors de la suppression:', err);
          setError(err.response?.data?.message || 'Erreur lors de la suppression');
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.type_bien_nom && property.type_bien_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (property.adresse && property.adresse.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filterType || property.type_bien_nom === filterType;
    
    return matchesSearch && matchesType;
  });

  const getEventsForProperty = (propId) => {
    return events.filter(e => e.bien_id === propId || e.property_id === propId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des biens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Gestion des biens</h1>
          <p className="text-xs text-gray-500">Gérez les lieux et salles disponibles pour vos événements</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={viewMode === 'list' ? { backgroundColor: '#31a7df' } : {}}
            >
              <i className="fas fa-list"></i>
              Liste
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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
            style={{ backgroundColor: '#31a7df' }}
          >
            <i className="fas fa-plus text-xs"></i>
            Ajouter un bien
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
      {/* Filters Bar - Same as EventsSection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rechercher</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, type ou adresse..."
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
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 text-sm transition-all"
              style={{ '--tw-ring-color': '#31a7df', '--tw-ring-opacity': '0.2' }}
              onFocus={(e) => e.target.style.borderColor = '#31a7df'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Tous</option>
              {bienTypes.map(type => (
                <option key={type.id} value={type.nom}>{type.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Biens</label>
            <div className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <i className="fas fa-building text-[#31a7df] mr-2"></i>
              <span className="font-bold text-[#2596d1] text-sm">{filteredProperties.length}</span>
            </div>
          </div>
        </div>
      </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-building mr-2"></i>
                      Bien / Lieu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-tag mr-2"></i>
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      Localisation
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i className={`${getPropertyTypeIcon(property.type_bien_nom || 'Autre')} text-[#31a7df]`}></i>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{property.nom}</div>
                            <div className="text-sm text-gray-500">ID: {property.id.toString().slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-tag text-gray-400"></i>
                          <span className="text-sm text-gray-600">{property.type_bien_nom || 'Non défini'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-map-marker-alt text-gray-400"></i>
                          <span className="text-sm text-gray-600 line-clamp-1">{property.adresse || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setPropertySchedule(property)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#31a7df] text-white rounded-lg text-xs font-bold hover:bg-[#2596d1] transition-colors"
                            title="Agenda"
                          >
                            <i className="fas fa-calendar-alt"></i>
                          </button>
                          <button 
                            onClick={() => setSelectedProperty(property)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                            title="Détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            onClick={() => setEditingProperty(property)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 transition-colors"
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(property)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <CalendarView items={events} type="property" />
      )}

      {propertySchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-in-center">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Agenda : {propertySchedule.nom}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Occupations et réservations du lieu</p>
                 </div>
                 <button 
                  onClick={() => setPropertySchedule(null)}
                  className="p-4 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all shadow-sm border border-gray-100"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-white">
                 <CalendarView items={getEventsForProperty(propertySchedule.id)} type="property" />
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
      />

      {showForm && (
        <PropertyForm
          onSubmit={handleCreatePropertySubmit}
          onCancel={() => setShowForm(false)}
          bienTypes={bienTypes}
        />
      )}

      {editingProperty && (
        <PropertyForm
          initialData={editingProperty}
          onSubmit={handleCreatePropertySubmit}
          onCancel={() => setEditingProperty(null)}
          bienTypes={bienTypes}
        />
      )}

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={() => {
            setEditingProperty(selectedProperty);
            setSelectedProperty(null);
          }}
          onDelete={() => handleDeleteClick(selectedProperty)}
        />
      )}
    </div>
  );
}
