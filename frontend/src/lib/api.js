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
});

// API protégée (avec token)
const protectedAPI = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification aux requêtes protégées
protectedAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => publicAPI.post('/api/auth/login', credentials),
  register: (userData) => publicAPI.post('/api/auth/register', userData),
};

export const eventsAPI = {
  // Endpoints publics
  getEvents: () => publicAPI.get('/api/events'),
  getEventDetails: (eventId) => publicAPI.get(`/api/events/${eventId}`),
  getEventClients: (eventId) => publicAPI.get(`/api/events/${eventId}/clients`),
  createEvent: (eventData) => publicAPI.post('/api/events', eventData),
  deleteEvent: (eventId) => publicAPI.delete(`/api/events/${eventId}`),
  
  // Endpoints protégés
  registerToEvent: (eventId) => protectedAPI.post(`/api/events/${eventId}/register`),
};

export default api;