import { useState } from 'react';

export default function EventTypeForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    description: initialData?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {initialData ? 'Modifier le type d\'événement' : 'Nouveau type d\'événement'}
          </h2>
          <p className="text-gray-500 text-xs">Définissez les caractéristiques du type</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nom du type *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Ex: Conférence, Concert, Formation..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description du type d'événement..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] transition-all resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nom.trim()}
              className="flex-1 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ backgroundColor: '#31a7df' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {initialData ? 'Modification...' : 'Création...'}
                </>
              ) : (
                initialData ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}