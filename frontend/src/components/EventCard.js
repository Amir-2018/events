import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventImage from './EventImage';

export default function EventCard({ event, onDelete, onViewClients }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getInitials = (client) => {
    const first = (client.prenom || '').charAt(0).toUpperCase();
    const last = (client.nom || '').charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  const clients = event.clients || [];
  const displayClients = clients.slice(0, 4);
  const remainingCount = clients.length - displayClients.length;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Background Gradient Detail */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      
      <div className="relative z-10">
        {event.image && (
          <div className="relative h-44 w-full mb-4 overflow-hidden rounded-xl">
            <EventImage 
              src={event.image} 
              alt={event.nom}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {event.nom}
          </h3>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
            title="Supprimer l'événement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2.5 mb-6">
          {event.type_evenement_nom && (
            <div className="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-purple-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
              <span className="font-medium text-purple-600">{event.type_evenement_nom}</span>
            </div>
          )}
          
          {event.bien_nom && (
            <div className="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
              <span className="font-medium text-green-600">{event.bien_nom}</span>
              {event.bien_type && <span className="text-gray-400 ml-1">({event.bien_type})</span>}
            </div>
          )}
          
          <div className="flex items-center text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            {formatDate(event.date)}
          </div>
          
          {event.adresse && (
            <div className="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {event.adresse}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex -space-x-2 overflow-hidden">
            {displayClients.map((client, idx) => (
              <div 
                key={client.id || idx} 
                className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white shadow-sm"
                title={`${client.prenom} ${client.nom}`}
              >
                {getInitials(client)}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-[10px] font-medium text-gray-600">
                +{remainingCount}
              </div>
            )}
            {clients.length === 0 && (
              <span className="text-xs text-gray-400 italic">Aucun inscrit</span>
            )}
          </div>

          <button
            onClick={() => onViewClients(event.id)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center transition-colors group/btn"
          >
            Détails
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}