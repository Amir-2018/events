import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

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
      console.log('🔄 Chargement des biens...');
      setLoading(true);
      const response = await fetch('/api/properties');
      console.log('📡 Réponse serveur (GET):', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Données reçues (GET):', data);
      
      if (data.success) {
        console.log('✅ Biens chargés:', data.data.length, 'bien(s)');
        setProperties(data.data);
      } else {
        console.error('❌ Erreur serveur (GET):', data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ Erreur réseau (GET):', err);
      setError('Erreur lors du chargement des biens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (propertyData) => {
    try {
      console.log('🔄 Création du bien...', propertyData);
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      console.log('📡 Réponse serveur:', response.status, response.statusText);
      const data = await response.json();
      console.log('📦 Données reçues:', data);
      
      if (data.success) {
        console.log('✅ Bien créé avec succès:', data.data.nom);
        setProperties(prev => [...prev, data.data]);
        setShowForm(false);
        setError(null);
      } else {
        console.error('❌ Erreur serveur:', data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setError('Erreur lors de la création du bien');
    }
  };

  // Fonction de test pour déboguer
  const handleTestAPI = async () => {
    console.log('🧪 Test direct de l\'API...');
    try {
      const testData = {
        nom: 'Test Direct API',
        type: 'Stade',
        adresse: 'Test adresse'
      };
      
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const data = await response.json();
      console.log('Test API résultat:', data);
      
      if (data.success) {
        alert('Test API réussi! Bien créé: ' + data.data.nom);
        fetchProperties(); // Recharger la liste
      } else {
        alert('Test API échoué: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur test API:', error);
      alert('Erreur test API: ' + error.message);
    }
  };

  const handleUpdateProperty = async (propertyData) => {
    try {
      const response = await fetch(`/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();
      
      if (data.success) {
        setProperties(prev => 
          prev.map(p => p.id === editingProperty.id ? data.data : p)
        );
        setEditingProperty(null);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la modification du bien');
      console.error('Erreur:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        setSelectedProperty(null);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la suppression du bien');
      console.error('Erreur:', err);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.adresse && property.adresse.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filterType || property.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des biens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des biens</h1>
          <p className="text-gray-600">Gérez les lieux disponibles pour vos événements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTestAPI}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-all text-sm"
          >
            🧪 Test API
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau bien
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, type ou adresse..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrer par type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="">Tous les types</option>
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total des biens</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Types différents</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(properties.map(p => p.type)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avec localisation</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.latitude && p.longitude).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des biens */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterType ? 'Aucun bien trouvé' : 'Aucun bien enregistré'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre premier bien'
            }
          </p>
          {!searchTerm && !filterType && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
            >
              Ajouter un bien
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={() => setSelectedProperty(property)}
              onEdit={() => setEditingProperty(property)}
              onDelete={() => handleDeleteProperty(property.id)}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <PropertyForm
          onSubmit={handleCreateProperty}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingProperty && (
        <PropertyForm
          initialData={editingProperty}
          onSubmit={handleUpdateProperty}
          onCancel={() => setEditingProperty(null)}
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
          onDelete={() => handleDeleteProperty(selectedProperty.id)}
        />
      )}
    </div>
  );
}