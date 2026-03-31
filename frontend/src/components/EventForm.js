import { useState, useEffect } from 'react';
import { uploadAPI, eventsAPI, eventTypesAPI, propertiesAPI } from '../lib/api';
import ClientSelectionSection from './ClientSelectionSection';

export default function EventForm({ event = null, events = [], onSubmit, onCancel, isEditMode = false }) {
  // Safe date parser to avoid RangeError
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      // Offset timezone to keep local date/time correctly format
      const tzOffset = d.getTimezoneOffset() * 60000; 
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch(e) { return ''; }
  };

  const [formData, setFormData] = useState({
    nom: event?.nom || '',
    date: formatDateTimeLocal(event?.date),
    date_fin: formatDateTimeLocal(event?.date_fin),
    adresse: event?.adresse || '',
    type_evenement_id: event?.type_evenement_id || '',
    bien_id: event?.bien_id || '',
    max_participants: event?.max_participants || 0,
    prix: event?.prix || 0.00,
    is_private: event?.is_private || false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showConflictPopup, setShowConflictPopup] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [conflictEvent, setConflictEvent] = useState(null);
  const [showClientSelection, setShowClientSelection] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [eventTypesResponse, propertiesResponse, clientsResponse] = await Promise.all([
        eventTypesAPI.getEventTypes(),
        propertiesAPI.getProperties(),
        fetch('/api/clients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ]);
      
      setEventTypes(eventTypesResponse.data.data || []);
      setProperties(propertiesResponse.data.data || []);
      setClients(clientsResponse.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification des conflits de réservation avancée
    // Utiliser la comparaison de chaînes direct car les IDs sont des UUIDs
    const selectedBien = properties.find(p => String(p.id) === String(formData.bien_id));
    const startDateTime = new Date(formData.date);
    const endDateTime = formData.date_fin ? new Date(formData.date_fin) : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

    // 1. Vérification des jours d'ouverture (Gestion des plages comme "Lundi-Vendredi")
    if (selectedBien && selectedBien.jours_ouverture) {
      const daysOrder = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const selectedDayIndex = startDateTime.getDay();
      const selectedDayName = daysOrder[selectedDayIndex];
      
      const checkDayInOpenness = (openness, dayIdx) => {
          const lowerOpenness = openness.toLowerCase();
          if (lowerOpenness.includes('lundi-dimanche')) return true;
          if (lowerOpenness.includes('lundi-vendredi')) return dayIdx >= 1 && dayIdx <= 5;
          if (lowerOpenness.includes('lundi-samedi')) return dayIdx >= 1 && dayIdx <= 6;
          if (lowerOpenness.includes('samedi-dimanche')) return dayIdx === 0 || dayIdx === 6;
          // Si c'est un nom de jour spécifique ou une liste (ex: "Lundi, Mardi")
          return lowerOpenness.includes(daysOrder[dayIdx].toLowerCase());
      };

      if (!checkDayInOpenness(selectedBien.jours_ouverture, selectedDayIndex)) {
         setConflictMessage(`Le bien "${selectedBien.nom}" est fermé le ${selectedDayName}. Jours d'ouverture : ${selectedBien.jours_ouverture}.`);
         setShowConflictPopup(true);
         return;
      }
    }

    // 2. Vérification des horaires d'ouverture
    if (selectedBien && (selectedBien.horaire_ouverture || selectedBien.horaire_fermeture)) {
       const startLocalHour = startDateTime.getHours().toString().padStart(2, '0') + ':' + startDateTime.getMinutes().toString().padStart(2, '0');
       const endLocalHour = endDateTime.getHours().toString().padStart(2, '0') + ':' + endDateTime.getMinutes().toString().padStart(2, '0');
       
       // S'assurer que les horaires sont au format HH:mm pour la comparaison (enlever les secondes si présentes)
       const openHour = selectedBien.horaire_ouverture ? selectedBien.horaire_ouverture.split(':').slice(0, 2).join(':') : '00:00';
       const closeHour = selectedBien.horaire_fermeture ? selectedBien.horaire_fermeture.split(':').slice(0, 2).join(':') : '23:59';

       if (startLocalHour < openHour || endLocalHour > closeHour) {
          setConflictMessage(`L'événement (${startLocalHour} - ${endLocalHour}) est hors des horaires d'ouverture de "${selectedBien.nom}" (${openHour} - ${closeHour}).`);
          setShowConflictPopup(true);
          return;
       }
    }

    // 3. Vérification des chevauchements avec d'autres événements
    const existingConflict = events.find(e => {
      // Ignorer l'événement en cours de modification (vérification par ID string)
      if (event?.id && String(e.id) === String(event.id)) return false;

      const existingStart = new Date(e.date);
      // Durée par défaut de 2h si date_fin absente
      const existingEnd = e.date_fin ? new Date(e.date_fin) : new Date(existingStart.getTime() + 2 * 60 * 60 * 1000);
      
      const isSameBien = (String(e.bien_id) === String(formData.bien_id) || String(e.property_id) === String(formData.bien_id));
      const isOverlapping = startDateTime < existingEnd && existingStart < endDateTime;
      
      return isSameBien && isOverlapping;
    });

    if (existingConflict) {
      setConflictEvent(existingConflict);
      const conflictStart = new Date(existingConflict.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
      const conflictEnd = new Date(existingConflict.date_fin || (new Date(existingConflict.date).getTime() + 7200000)).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
      
      setConflictMessage(`Ce bien est déjà réservé pour l'événement "${existingConflict.nom}" sur cette période (${conflictStart} - ${conflictEnd}). Veuillez choisir un autre créneau.`);
      setShowConflictPopup(true);
      return;
    }

    // 4. Vérification pour les événements privés
    if (formData.is_private && selectedClients.length === 0) {
      setConflictMessage('Veuillez sélectionner au moins un client pour cet événement privé.');
      setShowConflictPopup(true);
      return;
    }

    try {
      setUploading(true);
      let response;
      
      // Si un nouvel événement est fourni, l'ajouter directement à la liste
      if (imageFile) {
        response = await uploadAPI.createEventWithImage(formData, imageFile);
      } else if (event?.id) {
        response = await eventsAPI.updateEvent(event.id, formData);
      } else {
        // Créer l'événement sans image
        response = await eventsAPI.createEvent(formData);
      }
      
      // Si c'est un événement privé et qu'on a des clients sélectionnés, envoyer les invitations
      if (formData.is_private && selectedClients.length > 0 && response.data.data?.id) {
        try {
          const clientEmails = selectedClients.map(clientId => {
            const client = clients.find(c => c.id === clientId);
            return client?.email;
          }).filter(Boolean);
          
          await fetch(`/api/events/${response.data.data.id}/invite`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ clientEmails })
          });
        } catch (inviteError) {
          console.error('Erreur lors de l\'envoi des invitations:', inviteError);
          // Ne pas bloquer la création de l'événement si les invitations échouent
        }
      }
      
      // Passer les données de l'événement créé au parent
      onSubmit(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Si on passe en mode privé, afficher la sélection des clients
    if (name === 'is_private' && checked) {
      setShowClientSelection(true);
    } else if (name === 'is_private' && !checked) {
      setShowClientSelection(false);
      setSelectedClients([]);
    }
  };

  const handleClientToggle = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl p-0 w-full max-w-4xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel?.();
          }}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all duration-200 backdrop-blur-sm border hover:border-gray-200 active:scale-95"
          title="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Conflict Popup */}
        {showConflictPopup && (
          <div className="absolute inset-0 z-[80] bg-white/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
             <div className="max-w-md text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 text-red-600 animate-bounce">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                   </svg>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">Réservation Refusée</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                   {conflictMessage}
                </p>
                <button 
                   onClick={() => setShowConflictPopup(false)}
                   className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                >
                   D'accord, je modifie
                </button>
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Main Form Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#31a7df]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {isEditMode ? 'Modifier l\'événement' : 'Nouvel événement'}
                </h2>
                <p className="text-gray-500 text-xs">
                  {isEditMode ? 'Apportez les modifications nécessaires' : 'Créez une expérience mémorable'}
                </p>
              </div>
            </div>
            
            {loadingData ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-400 font-medium">Récupération des données...</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Nom de l'événement
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Soirée Gala, Conférence..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Date et Heure (Début)
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Date et Heure (Fin)
                  </label>
                  <input
                    type="datetime-local"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Type d'événement
                  </label>
                  <select
                    name="type_evenement_id"
                    value={formData.type_evenement_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat"
                  >
                    <option value="">Choisir un type</option>
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Lieu / Bien
                  </label>
                  <select
                    name="bien_id"
                    value={formData.bien_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat"
                  >
                    <option value="">Sélectionnez un bien</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.nom} — {property.adresse}
                      </option>
                    ))}
                  </select>
                </div>

                {!formData.bien_id && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      Adresse précise
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        placeholder="Adresse physique de l'événement"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Nombre maximal d'inscrits
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleChange}
                    min="0"
                    placeholder="0 pour illimité"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Prix du ticket (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="prix"
                      value={formData.prix}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00 pour gratuit"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      €
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Laissez 0.00 pour un événement gratuit
                  </p>
                </div>

                {/* Section Événement Privé */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="is_private"
                      name="is_private"
                      checked={formData.is_private}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#31a7df] bg-gray-50 border-gray-200 rounded focus:ring-[#31a7df] focus:ring-2"
                    />
                    <label htmlFor="is_private" className="text-xs font-semibold text-gray-700">
                      Événement privé (sur invitation uniquement)
                    </label>
                  </div>
                  
                  {formData.is_private && (
                    <ClientSelectionSection 
                      clients={clients}
                      selectedClients={selectedClients}
                      onClientToggle={handleClientToggle}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !formData.nom.trim() || !formData.type_evenement_id || (!formData.bien_id && !formData.adresse) || !formData.date}
                  className="flex-[2] text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:opacity-90 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#31a7df' }}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    isEditMode ? 'Confirmer les modifications' : 'Confirmer la création'
                  )}
                </button>
              </div>
            </form>
            )}
          </div>

          {/* Right Column: Visual / Image Upload */}
          <div className="w-full md:w-[280px] bg-gray-50 border-l border-gray-100 p-6 flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="w-full max-w-[200px] aspect-[3/4] rounded-2xl overflow-hidden relative group shadow-xl border-3 border-white">
              {!imagePreview ? (
                <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#31a7df]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <p className="text-blue-950 font-bold text-sm mb-1">Image cover</p>
                  <p className="text-xs text-[#31a7df] font-medium">PNG, JPG ou WebP</p>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <p className="text-white text-xs font-bold px-2 py-1 bg-white/20 rounded-full border border-white/30">Changer l'image</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500/90 text-white rounded-lg p-1.5 hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="mt-4 text-center px-3">
              <h4 className="text-xs font-bold text-gray-800">Visuel cliquable</h4>
              <p className="text-[9px] text-gray-400 mt-1 font-medium leading-relaxed italic">
                L'image sera utilisée sur les cartes de la page principale et sur l'application mobile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}