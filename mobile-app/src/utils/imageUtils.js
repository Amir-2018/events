import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Convertit une image locale en base64
 * @param {string} imageUri - URI de l'image (file://, content://, etc.)
 * @returns {Promise<string>} - Promise qui résout avec la chaîne base64
 */
export const convertImageToBase64 = async (imageUri) => {
  try {
    // Pour Android, on peut avoir besoin de traiter différents types d'URI
    let filePath = imageUri;
    
    if (Platform.OS === 'android' && imageUri.startsWith('content://')) {
      // Pour les URI content://, on utilise RNFS
      const base64 = await RNFS.readFile(imageUri, 'base64');
      return `data:image/jpeg;base64,${base64}`;
    }
    
    if (imageUri.startsWith('file://')) {
      filePath = imageUri.replace('file://', '');
    }
    
    const base64 = await RNFS.readFile(filePath, 'base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Erreur conversion base64:', error);
    throw new Error('Impossible de convertir l\'image en base64');
  }
};

/**
 * Redimensionne une image base64 (optionnel)
 * @param {string} base64String - Image en base64
 * @param {number} maxWidth - Largeur maximale
 * @param {number} maxHeight - Hauteur maximale
 * @param {number} quality - Qualité (0-1)
 * @returns {Promise<string>} - Image redimensionnée en base64
 */
export const resizeBase64Image = (base64String, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en base64
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedBase64);
    };
    
    img.onerror = reject;
    img.src = base64String;
  });
};

/**
 * Valide si une chaîne est un base64 d'image valide
 * @param {string} base64String - Chaîne à valider
 * @returns {boolean} - true si valide
 */
export const isValidImageBase64 = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }
  
  // Vérifier le format data:image/...;base64,
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(base64String);
};

/**
 * Obtient les informations d'une image base64
 * @param {string} base64String - Image en base64
 * @returns {object} - Informations sur l'image
 */
export const getBase64ImageInfo = (base64String) => {
  if (!isValidImageBase64(base64String)) {
    return null;
  }
  
  const [header] = base64String.split(',');
  const mimeMatch = header.match(/data:image\/([^;]+)/);
  const format = mimeMatch ? mimeMatch[1] : 'unknown';
  
  // Estimer la taille (approximative)
  const base64Data = base64String.split(',')[1];
  const sizeInBytes = Math.round((base64Data.length * 3) / 4);
  
  return {
    format,
    sizeInBytes,
    sizeInKB: Math.round(sizeInBytes / 1024),
    sizeInMB: Math.round(sizeInBytes / (1024 * 1024) * 100) / 100,
  };
};