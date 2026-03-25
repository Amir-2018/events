import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { eventsAPI } from '../services/api';
import EventImage from './EventImage';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data.data);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <EventImage
        imageBase64={item.image}
        style={styles.eventImage}
        defaultSource={require('../assets/default-event.png')} // Ajoutez une image par défaut
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventName}>{item.nom}</Text>
        {item.date && (
          <Text style={styles.eventDate}>
            {new Date(item.date).toLocaleDateString('fr-FR')}
          </Text>
        )}
        {item.adresse && (
          <Text style={styles.eventAddress}>{item.adresse}</Text>
        )}
        <Text style={styles.clientsCount}>
          {item.clients?.length || 0} participant(s)
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Chargement des événements...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderEvent}
      keyExtractor={(item) => item.id}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text>Aucun événement trouvé</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  eventAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  clientsCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default EventsList;