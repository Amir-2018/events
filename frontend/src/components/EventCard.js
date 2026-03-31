import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventImage from './EventImage';
import { useAuth } from '../context/AuthContext';

export default function EventCard({ event, onDelete, onViewClients, onViewDetails, onEdit, onViewMap }) {
  const { user } = useAuth();
  
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

  const getStatus = () => {
    const now = new Date();
    const startDate = event.date ? new Date(event.date) : null;
    const endDate = event.date_fin ? new Date(event.date_fin) : (startDate ? new Date(startDate.getTime() + 2 * 60 * 60 * 1000) : null);
    
    if (endDate && endDate < now) return { label: 'Terminé', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    if (startDate && startDate <= now && (!endDate || endDate >= now)) return { label: 'En cours', color: 'bg-green-100 text-green-700 border-green-200 animate-pulse' };
    return { label: 'À venir', color: 'bg-blue-50 text-[#2596d1] border-blue-200' };
  };

  const status = getStatus();

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
      {/* Background Gradient Detail */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="relative mb-4">
          {event.image ? (
            <div className="relative h-44 w-full overflow-hidden rounded-xl shadow-inner border border-gray-100">
              <EventImage 
                src={event.image} 
                alt={event.nom}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="h-44 w-full bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-100">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
               </svg>
            </div>
          )}
          
          {/* Action Overlay for Admin */}
          {user?.role === 'superadmin' && (
            <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit && onEdit(event); }}
                className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-lg hover:bg-white transition-colors border border-gray-50"
                title="Modifier l'événement"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewMap && onViewMap(event); }}
                className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-lg hover:bg-white transition-colors border border-gray-50"
                title="Voir sur la carte"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
            </div>
          )}

          {/* Status Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${status.color}`}>
            {status.label}
          </div>
        </div>
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#31a7df] transition-colors line-clamp-1 pr-2">
            {event.nom}
          </h3>
          {user?.role === 'superadmin' && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(event.id); }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
              title="Supprimer l'événement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="space-y-2.5 mb-6 flex-grow">
          <div className="flex items-center text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-purple-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <span className="font-bold text-gray-700">{event.type_evenement_nom || 'Événement'}</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-[#31a7df]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          
          {event.adresse && (
            <div className="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-[#31a7df]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="line-clamp-1">{event.adresse}</span>
            </div>
          )}

          <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">
            <div className="flex items-center px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
               <span className={clients.length >= (event.max_participants || 100) ? 'text-red-500' : 'text-[#31a7df]'}>
                 {clients.length}
               </span>
               <span className="mx-1">/</span>
               <span>{event.max_participants || '∞'}</span>
               <span className="ml-2">Inscrits</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          <div className="flex -space-x-2 overflow-hidden items-center">
            {displayClients.length > 0 ? (
              <>
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
              </>
            ) : (
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic ml-1">Zéro Participant</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails && onViewDetails(event); }}
               className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center gap-1.5"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
               </svg>
               Détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}