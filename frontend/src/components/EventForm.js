import { useState } from 'react';
import { uploadAPI } from '../lib/api';

export default function EventForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    date: '',
    image: '',
    adresse: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' ou 'file'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      let finalFormData = { ...formData };
      
      // Si un fichier est sélectionné, utiliser la nouvelle méthode avec base64
      if (uploadMethod === 'file' && imageFile) {
        const response = await uploadAPI.createEventWithImage(formData, imageFile);
        onSubmit(response.data.data);
      } else {
        // Si c'est une URL ou pas d'image, créer l'événement directement
        // Pour les URLs, on les convertit en base64 côté client
        if (uploadMethod === 'url' && formData.image) {
          try {
            // Convertir l'URL en base64
            const base64 = await convertImageUrlToBase64(formData.image);
            finalFormData.image = base64;
          } catch (error) {
            console.warn('Impossible de convertir l\'URL en base64, utilisation de l\'URL directe');
          }
        }
        
        const response = await eventsAPI.createEvent(finalFormData);
        onSubmit(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'événement: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour convertir une URL d'image en base64
  const convertImageUrlToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = url;
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleMethodChange = (method) => {
    setUploadMethod(method);
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Créer un nouvel événement</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'événement *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date et heure
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de l'événement
            </label>
            
            {/* Sélecteur de méthode */}
            <div className="flex gap-4 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="imageMethod"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={() => handleMethodChange('url')}
                  className="mr-2"
                />
                URL d'image
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="imageMethod"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={() => handleMethodChange('file')}
                  className="mr-2"
                />
                Upload depuis l'appareil
              </label>
            </div>

            {/* Champ URL */}
            {uploadMethod === 'url' && (
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* Upload de fichier */}
            {uploadMethod === 'file' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Aperçu de l'image */}
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Aperçu URL */}
            {uploadMethod === 'url' && formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="w-full h-32 object-cover rounded-md border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {uploading ? 'Upload en cours...' : 'Créer l\'événement'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={uploading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}