import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadAPI } from '../services/api';
import EventImage from './EventImage';

const TestBase64Image = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test avec une image base64 simple (carré rouge 1x1 pixel)
  const testWithSimpleBase64 = async () => {
    const simpleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    setLoading(true);
    try {
      const eventData = {
        nom: 'Test Simple Base64',
        date: '2024-12-25',
        adresse: 'Test Address'
      };
      
      const response = await uploadAPI.testCreateEventWithBase64(eventData, simpleBase64);
      
      Alert.alert('Succès', 'Événement créé avec image base64 simple!');
      console.log('✅ Réponse:', response.data);
      
    } catch (error) {
      console.error('❌ Erreur test simple:', error);
      Alert.alert('Erreur', 'Test simple échoué: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const testImageUpload = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setLoading(true);
        try {
          const imageUri = response.assets[0].uri;
          const uploadResponse = await uploadAPI.uploadImage(imageUri);
          
          const base64Image = uploadResponse.data.data.base64;
          setUploadedImage(base64Image);
          
          Alert.alert(
            'Succès', 
            `Image convertie en base64!\nTaille: ${Math.round(uploadResponse.data.data.size / 1024)} KB`
          );
        } catch (error) {
          console.error('Erreur upload:', error);
          Alert.alert('Erreur', 'Impossible d\'uploader l\'image');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const testCreateEventWithImage = async () => {
    if (!uploadedImage) {
      Alert.alert('Erreur', 'Veuillez d\'abord uploader une image');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        nom: 'Test Event avec Image',
        date: '2024-12-26',
        adresse: 'Test Address avec Image'
      };

      const response = await uploadAPI.testCreateEventWithBase64(eventData, uploadedImage);
      
      Alert.alert('Succès', 'Événement créé avec image!');
      console.log('✅ Événement créé:', response.data);
      
    } catch (error) {
      console.error('❌ Erreur création événement:', error);
      Alert.alert('Erreur', 'Création échouée: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test Base64 Image</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.testButton, loading && styles.disabledButton]} 
        onPress={testWithSimpleBase64}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          🧪 Test avec image base64 simple
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={testImageUpload}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Upload en cours...' : '📷 Sélectionner et uploader une image'}
        </Text>
      </TouchableOpacity>
      
      {uploadedImage && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Image uploadée (Base64):</Text>
          
          <EventImage
            imageBase64={uploadedImage}
            style={styles.uploadedImage}
          />
          
          <Text style={styles.base64Info}>
            Taille base64: {Math.round(uploadedImage.length / 1024)} KB
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.createButton, loading && styles.disabledButton]}
            onPress={testCreateEventWithImage}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              ✨ Créer événement avec cette image
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.base64Preview} numberOfLines={3}>
            Base64: {uploadedImage.substring(0, 100)}...
          </Text>
          
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setUploadedImage(null)}
          >
            <Text style={styles.clearButtonText}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  createButton: {
    backgroundColor: '#ffc107',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  base64Info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  base64Preview: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
    marginBottom: 15,
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TestBase64Image;