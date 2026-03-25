import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventCard({ event, onDelete, onViewClients }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {event.image && (
        <img 
          src={event.image} 
          alt={event.nom}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.nom}</h3>
      
      <div className="space-y-2 text-gray-600 mb-4">
        <p><span className="font-medium">Date:</span> {formatDate(event.date)}</p>
        <p><span className="font-medium">Adresse:</span> {event.adresse || 'Non spécifiée'}</p>
        <p><span className="font-medium">Inscrits:</span> {event.clients?.length || 0} client(s)</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewClients(event.id)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Voir les inscrits
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}