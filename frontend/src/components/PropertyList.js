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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Gestion des biens</h1>
          <p className="text-gray-500 font-medium tracking-tight">Gérez les lieux et salles disponibles pour vos événements</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="fas fa-list"></i>
              Liste
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="fas fa-calendar-alt"></i>
              Agenda
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Ajouter un bien
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Rechercher</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom, type ou adresse..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold placeholder-gray-300 transition-all"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em]">Filtrer par type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-gray-900 font-bold transition-all appearance-none cursor-pointer"
                >
                  <option value="">Tous les types</option>
                  {bienTypes.map(type => (
                    <option key={type.id} value={type.nom}>{type.nom}</option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-600 rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-blue-100">
                 <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Total Biens</span>
                 <span className="text-2xl font-black text-white tracking-tighter">{filteredProperties.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 mb-12">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-left px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Bien / Lieu</th>
                    <th className="text-left py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Type</th>
                    <th className="text-left py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Localisation</th>
                    <th className="text-right px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold mr-4 border border-blue-100 group-hover:bg-white transition-colors">
                            <i className={getPropertyTypeIcon(property.type_bien_nom || 'Autre')}></i>
                          </div>
                          <div>
                            <span className="font-black text-gray-900 block truncate max-w-[200px]">{property.nom}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {property.id.toString().slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          {property.type_bien_nom || 'Non défini'}
                        </span>
                      </td>
                      <td className="py-6 font-bold text-gray-500 max-w-xs truncate italic">
                        {property.adresse || 'N/A'}
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-3">
                        <button 
                          onClick={() => setPropertySchedule(property)}
                          className="p-3 text-blue-600 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-blue-100"
                          title="Agenda"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setSelectedProperty(property)}
                          className="p-3 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-blue-100"
                          title="Détails"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setEditingProperty(property)}
                          className="p-3 text-gray-400 hover:text-amber-600 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-amber-100"
                          title="Modifier"
                        >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(property)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-red-100"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
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
