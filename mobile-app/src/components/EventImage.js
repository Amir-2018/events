import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

const EventImage = ({ imageBase64, style, defaultSource, ...props }) => {
  // Si l'image est en base64, l'utiliser directement
  if (imageBase64 && imageBase64.startsWith('data:image')) {
    return (
      <Image
        source={{ uri: imageBase64 }}
        style={[styles.image, style]}
        onError={(error) => {
          console.warn('Erreur de chargement d\'image base64:', error.nativeEvent.error);
        }}
        {...props}
      />
    );
  }

  // Si pas d'image, afficher l'image par défaut ou placeholder
  if (defaultSource) {
    return (
      <Image source={defaultSource} style={[styles.image, style]} {...props} />
    );
  }

  return <View style={[styles.placeholder, style]} />;
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  placeholder: {
    width: 200,
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default EventImage;