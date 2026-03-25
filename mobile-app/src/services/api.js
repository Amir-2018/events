import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API
const API_BASE_URL = 'http://10.0.2.2:3000'; // Pour émulateur Android
// const API_BASE_URL = 'http://localhost:3000'; // Pour iOS Simulator
// const API_BASE_URL = 'http://YOUR_IP:3000'; // Pour appareil physique

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Intercepteur pour ajouter le token aux requêtes protégées
protectedAPI.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
protectedAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => publicAPI.post('/api/auth/login', credentials),
  register: (userData) => publicAPI.post('/api/auth/register', userData),
};

export const eventsAPI = {
  // Endpoints publics
  getEvents: () => publicAPI.get('/api/events'),
  getEventDetails: (eventId) => publicAPI.get(`/api/events/${eventId}`),
  getEventClients: (eventId) => publicAPI.get(`/api/events/${eventId}/clients`),
  
  // Endpoints protégés
  registerToEvent: (eventId) => protectedAPI.post(`/api/events/${eventId}/register`),
};

export const uploadAPI = {
  // Upload d'image et conversion en base64
  uploadImage: (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    return protectedAPI.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Test direct avec base64 (pour déboguer)
  testCreateEventWithBase64: async (eventData, base64Image) => {
    try {
      const eventPayload = {
        ...eventData,
        image: base64Image,
      };
      
      console.log('🧪 Test direct avec base64:', {
        nom: eventPayload.nom,
        hasImage: !!eventPayload.image,
        imageLength: eventPayload.image ? eventPayload.image.length : 0,
        imageStart: eventPayload.image ? eventPayload.image.substring(0, 30) : 'null'
      });
      
      return await publicAPI.post('/api/events/test-base64', eventPayload);
    } catch (error) {
      console.error('❌ Erreur test base64:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Créer un événement avec image base64
  createEventWithImage: async (eventData, imageUri) => {
    try {
      let imageBase64 = null;
      
      // Upload de l'image si fournie et récupération du base64
      if (imageUri) {
        console.log('📤 Upload de l\'image...');
        const uploadResponse = await uploadAPI.uploadImage(imageUri);
        imageBase64 = uploadResponse.data.data.base64;
        console.log('✅ Image convertie en base64, taille:', imageBase64.length);
      }
      
      // Préparer les données de l'événement
      const eventPayload = {
        ...eventData,
        image: imageBase64,
      };
      
      console.log('📤 Création de l\'événement avec:', {
        nom: eventPayload.nom,
        date: eventPayload.date,
        adresse: eventPayload.adresse,
        hasImage: !!eventPayload.image,
        imageLength: eventPayload.image ? eventPayload.image.length : 0
      });
      
      // Créer l'événement avec l'image en base64 (utiliser publicAPI car la route est publique)
      return await publicAPI.post('/api/events', eventPayload);
    } catch (error) {
      console.error('❌ Erreur dans createEventWithImage:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default api;