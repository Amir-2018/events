import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// API publique (sans token)
const publicAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API protégée (avec token)
const protectedAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'authentification aux requêtes protégées
protectedAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
protectedAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => publicAPI.post('/api/auth/login', credentials),
  register: (userData) => publicAPI.post('/api/auth/register', userData),
  registerAdmin: (userData) => publicAPI.post('/api/auth/register-admin', userData),
};

export const eventsAPI = {
  // Endpoints publics (Landing page, etc)
  getEvents: () => publicAPI.get('/api/events'),
  getPublicEvents: () => publicAPI.get('/api/events?public=true'),
  getEventDetails: (eventId) => publicAPI.get(`/api/events/${eventId}`),
  getEventClients: (eventId) => protectedAPI.get(`/api/events/${eventId}/clients`),
  getEventParticipants: (eventId) => protectedAPI.get(`/api/events/${eventId}/participants`),
  
  // Endpoints de gestion (Dashboard)
  getManagedEvents: () => protectedAPI.get('/api/events?managed=true'),
  getRevenueStats: () => protectedAPI.get('/api/revenue-stats'),
  createEvent: (eventData) => protectedAPI.post('/api/events', eventData),
  updateEvent: (eventId, eventData) => protectedAPI.put(`/api/events/${eventId}`, eventData),
  deleteEvent: (eventId) => protectedAPI.delete(`/api/events/${eventId}`),
  bulkDeleteEvents: (ids) => protectedAPI.delete('/api/events/bulk-delete', { data: { ids } }),
  
  // Inscriptions
  registerToEvent: (eventId) => protectedAPI.post(`/api/events/${eventId}/register`),
  getMyRegistrations: () => protectedAPI.get('/api/events/my-registrations'),
  unregisterFromEvent: (eventId) => protectedAPI.delete(`/api/events/${eventId}/register`),
  
  // Souvenirs
  getSouvenirs: (eventId) => publicAPI.get(`/api/events/${eventId}/souvenirs`),
  addSouvenir: (eventId, data) => protectedAPI.post(`/api/events/${eventId}/souvenirs`, data),
  deleteSouvenir: (souvenirId) => protectedAPI.delete(`/api/souvenirs/${souvenirId}`),
};

export const eventTypesAPI = {
  getEventTypes: () => publicAPI.get('/api/event-types'),
  getEventType: (id) => publicAPI.get(`/api/event-types/${id}`),
  createEventType: (data) => protectedAPI.post('/api/event-types', data),
  updateEventType: (id, data) => protectedAPI.put(`/api/event-types/${id}`, data),
  deleteEventType: (id) => protectedAPI.delete(`/api/event-types/${id}`),
  bulkDeleteEventTypes: (ids) => protectedAPI.delete('/api/event-types/bulk-delete', { data: { ids } }),
};

export const clientsAPI = {
  getAllClients: () => protectedAPI.get('/api/clients'),
  getClient: (id) => protectedAPI.get(`/api/clients/${id}`),
  createClient: (data) => protectedAPI.post('/api/clients', data),
  updateClient: (id, data) => protectedAPI.put(`/api/clients/${id}`, data),
  deleteClient: (id) => protectedAPI.delete(`/api/clients/${id}`),
  cancelRegistration: (clientId, eventId) => protectedAPI.delete(`/api/clients/${clientId}/events/${eventId}/registration`),
};

export const propertiesAPI = {
  getProperties: () => publicAPI.get('/api/properties'),
  getProperty: (id) => publicAPI.get(`/api/properties/${id}`),
  createProperty: (data) => protectedAPI.post('/api/properties', data),
  updateProperty: (id, data) => protectedAPI.put(`/api/properties/${id}`, data),
  deleteProperty: (id) => protectedAPI.delete(`/api/properties/${id}`),
};

export const typeBiensAPI = {
  getTypeBiens: () => protectedAPI.get('/api/type-biens'),
  getTypeBien: (id) => publicAPI.get(`/api/type-biens/${id}`),
  createTypeBien: (data) => protectedAPI.post('/api/type-biens', data),
  updateTypeBien: (id, data) => protectedAPI.put(`/api/type-biens/${id}`, data),
  deleteTypeBien: (id) => protectedAPI.delete(`/api/type-biens/${id}`),
  bulkDeleteTypeBiens: (ids) => protectedAPI.delete('/api/type-biens/bulk-delete', { data: { ids } }),
};

export const usersAPI = {
  getUsers: () => protectedAPI.get('/api/users'),
  createUser: (userData) => protectedAPI.post('/api/users', userData),
  updateUser: (id, userData) => protectedAPI.put(`/api/users/${id}`, userData),
  updateUserStatus: (id, status) => protectedAPI.patch(`/api/users/${id}/status`, { status }),
  deleteUser: (id) => protectedAPI.delete(`/api/users/${id}`),
  getRoles: () => protectedAPI.get('/api/roles'),
};

export const reclamationsAPI = {
  getReclamations: () => protectedAPI.get('/api/reclamations'),
  updateReclamationStatus: (id, status) => protectedAPI.put(`/api/reclamations/${id}/status`, { status }),
  createReclamation: (data) => protectedAPI.post('/api/reclamations', data),
};

export const invitationsAPI = {
  getMyInvitations: () => protectedAPI.get('/api/invitations/my-invitations'),
  respondToInvitation: (invitationId, response) => protectedAPI.post(`/api/invitations/${invitationId}/respond`, { response }),
};

export const uploadAPI = {
  uploadImage: (formData) => publicAPI.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Créer un événement avec image base64 (comme sur mobile)
  createEventWithImage: async (eventData, imageFile) => {
    try {
      let imageBase64 = null;
      
      // Upload de l'image si fournie et récupération du base64
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await uploadAPI.uploadImage(formData);
        imageBase64 = uploadResponse.data.data.base64;
      }
      
      // Créer l'événement avec l'image en base64
      return await protectedAPI.post('/api/events', {
        ...eventData,
        image: imageBase64,
      });
    } catch (error) {
      throw error;
    }
  },
};

export const profileAPI = {
  getProfile: (userId = null) => {
    const endpoint = userId ? `/api/profile/${userId}` : '/api/profile';
    return protectedAPI.get(endpoint);
  },
  updateProfile: (userId = null, data) => {
    const endpoint = userId ? `/api/profile/${userId}` : '/api/profile';
    return protectedAPI.put(endpoint, data);
  },
};
export const passwordResetAPI = {
  requestReset: (email) => publicAPI.post('/api/password-reset/request', { email }),
  verifyCode: (email, code) => publicAPI.post('/api/password-reset/verify', { email, code }),
  resetPassword: (email, code, newPassword) => publicAPI.post('/api/password-reset/reset', { email, code, newPassword }),
};

export const ticketsAPI = {
  getMyTickets: () => protectedAPI.get('/api/my-tickets'),
  getTicket: (ticketNumber) => publicAPI.get(`/api/tickets/${ticketNumber}`),
  verifyTicket: (ticketNumber) => protectedAPI.post(`/api/tickets/${ticketNumber}/verify`),
  cancelTicket: (ticketId) => protectedAPI.put(`/api/tickets/${ticketId}/cancel`),
  getEventTicketsStats: () => protectedAPI.get('/api/event-tickets-stats'),
  getEventTicketsList: (eventId) => protectedAPI.get(`/api/events/${eventId}/tickets`),
  getFraudAttempts: () => protectedAPI.get('/api/fraud-attempts'),
};

export default api;