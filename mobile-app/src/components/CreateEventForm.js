import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadAPI } from '../services/api';

const CreateEventForm = ({ onEventCreated }) => {
  const [eventData, setEventData] = useState({
    nom: '',
    date: '',
    adresse: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const createEvent = async () => {
    if (!eventData.nom.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'événement est requis');
      return;
    }

    setLoading(true);
    try {
      const imageUri = selectedImage?.uri;
      const response = await uploadAPI.createEventWithImage(eventData, imageUri);
      
      Alert.alert('Succès', 'Événement créé avec succès');
      
      // Reset form
      setEventData({ nom: '', date: '', adresse: '' });
      setSelectedImage(null);
      
      if (onEventCreated) {
        onEventCreated(response.data.data);
      }
    } catch (error) {
      console.error('Erreur création événement:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un événement</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nom de l'événement"
        value={eventData.nom}
        onChangeText={(text) => setEventData({ ...eventData, nom: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={eventData.date}
        onChangeText={(text) => setEventData({ ...eventData, date: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Adresse"
        value={eventData.adresse}
        onChangeText={(text) => setEventData({ ...eventData, adresse: text })}
      />
      
      <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
        <Text style={styles.imageButtonText}>
          {selectedImage ? 'Changer l\'image' : 'Sélectionner une image'}
        </Text>
      </TouchableOpacity>
      
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          <Text style={styles.imageInfo}>
            Taille: {Math.round(selectedImage.fileSize / 1024)} KB
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.createButton, loading && styles.disabledButton]}
        onPress={createEvent}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Création...' : 'Créer l\'événement'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un événement</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nom de l'événement"
        value={eventData.nom}
        onChangeText={(text) => setEventData({ ...eventData, nom: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={eventData.date}
        onChangeText={(text) => setEventData({ ...eventData, date: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Adresse"
        value={eventData.adresse}
        onChangeText={(text) => setEventData({ ...eventData, adresse: text })}
      />
      
      <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
        <Text style={styles.imageButtonText}>
          {selectedImage ? 'Changer l\'image' : 'Sélectionner une image'}
        </Text>
      </TouchableOpacity>
      
      {selectedImage && (
        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
      )}
      
      <TouchableOpacity
        style={[styles.createButton, loading && styles.disabledButton]}
        onPress={createEvent}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Création...' : 'Créer l\'événement'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 5,
  },
  imageInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEventForm;