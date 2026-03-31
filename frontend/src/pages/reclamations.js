import { useState } from 'react';
import { reclamationsAPI } from '../lib/api';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Reclamations() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    sujet: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Rediriger vers login si pas authentifié
  if (!isAuthenticated) {
    return (
      <>
        <PublicNavbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                Connexion requise
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Vous devez être connecté pour déposer une réclamation. 
                Cela nous permet de vous contacter et de suivre votre demande.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Préparer les données avec l'image en base64 si présente
      let imageBase64 = null;
      if (selectedImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(selectedImage);
        });
      }

      const reclamationData = {
        client_id: user.id, // Utiliser l'ID de l'utilisateur connecté
        client_email: user.email, // Ajouter l'email pour les notifications
        client_nom: user.nom,
        client_prenom: user.prenom,
        ...formData,
        image: imageBase64
      };

      await reclamationsAPI.createReclamation(reclamationData);
      setSuccess(true);
      setFormData({ sujet: '', description: '' });
      setSelectedImage(null);
      setImagePreview(null);
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la réclamation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-xl">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                  Déposer une réclamation
                </h1>
                <p className="text-gray-500 font-medium">
                  Connecté en tant que {user?.prenom} {user?.nom}
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Vous avez une préoccupation ou un problème à signaler ? 
              Utilisez ce formulaire pour nous faire part de votre réclamation. 
              Notre équipe traitera votre demande dans les plus brefs délais.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <div>
                  <h3 className="font-bold text-green-800">Réclamation envoyée avec succès</h3>
                  <p className="text-green-700 text-sm">Votre réclamation a été transmise à notre équipe. Vous recevrez une réponse sous 48h.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <div>
                  <h3 className="font-bold text-red-800">Erreur</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sujet de la réclamation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sujet}
                  onChange={(e) => handleInputChange('sujet', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Résumé de votre réclamation"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Image (optionnelle)
                </label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      <p className="text-gray-600 font-medium">Cliquez pour ajouter une image</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG jusqu'à 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu" 
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Ajoutez une image pour illustrer votre réclamation (optionnel)
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Décrivez votre problème en détail..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plus vous fournirez de détails, plus nous pourrons vous aider efficacement
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer la réclamation'
                )}
              </button>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Informations importantes</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h3 className="font-bold mb-2">Délai de traitement</h3>
                <p>Nous nous engageons à traiter votre réclamation dans un délai de 48 heures ouvrables.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Suivi de votre réclamation</h3>
                <p>Vous recevrez une confirmation par email avec un numéro de suivi pour votre réclamation.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Images jointes</h3>
                <p>Les images aident notre équipe à mieux comprendre votre problème et à vous proposer une solution adaptée.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Confidentialité</h3>
                <p>Toutes les réclamations sont traitées de manière confidentielle par notre équipe spécialisée.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}