import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CalendarView({ items, type = 'event', onItemClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getItemsForDay = (day) => {
    return items.filter(item => {
      const dateStart = item.date || item.date_debut;
      
      // Pour les événements avec date (ou date_debut) et date_fin
      if (dateStart && item.date_fin) {
        const start = startOfDay(new Date(dateStart));
        const end = endOfDay(new Date(item.date_fin));
        return isWithinInterval(day, { start, end });
      }
      // Pour les événements avec une seule date
      if (dateStart) {
        return isSameDay(day, new Date(dateStart));
      }
      return false;
    }).sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Aujourd'hui
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Événements</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aujourd'hui</span>
           </div>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 bg-white border-b border-gray-100">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="py-4 text-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[100px]">
        {calendarDays.map((day, idx) => {
          const dayItems = getItemsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={idx}
              className={`border-r border-b border-gray-100 p-2 transition-all relative group ${
                !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/30'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isToday 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : !isCurrentMonth ? 'text-gray-300' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayItems.slice(0, 3).map((item, i) => {
                  const startDate = new Date(item.date || item.date_debut);
                  const endDate = item.date_fin ? new Date(item.date_fin) : new Date(startDate.getTime() + 2*3600000);
                  
                  const isFirstDay = isSameDay(day, startDate);
                  const isLastDay = isSameDay(day, endDate);
                  
                  const now = new Date();
                  let statusColor = 'bg-blue-100 text-blue-700 hover:bg-blue-200'; // À venir
                  if (endDate < now) {
                    statusColor = 'bg-gray-200 text-gray-700 hover:bg-gray-300'; // Terminé
                  } else if (startDate <= now && endDate >= now) {
                    statusColor = 'bg-green-100 text-green-700 hover:bg-green-200'; // En cours
                  }

                  let layoutClass = 'mx-0 rounded-md';
                  // margins de -9px pour recouvrir le padding (8px) + la bordure (1px) de la cellule.
                  if (!isFirstDay && !isLastDay) {
                     layoutClass = '-mx-[9px] px-[9px] rounded-none border-y border-transparent z-10 relative';
                  } else if (!isFirstDay && isLastDay) {
                     layoutClass = '-ml-[9px] pl-[9px] mr-1 rounded-r-md border-y border-r border-transparent z-10 relative shadow-sm';
                  } else if (isFirstDay && !isLastDay) {
                     layoutClass = '-mr-[9px] pr-[9px] ml-1 rounded-l-md border-y border-l border-transparent z-10 relative shadow-sm';
                  } else {
                     layoutClass = 'mx-1 rounded-md shadow-sm';
                  }

                  // Title formatting - Remove date range as requested
                  let titleText = item.nom || item.title;

                  // Seulement afficher le titre le premier jour, ou le premier jour de la semaine
                  const showTitle = isFirstDay || day.getDay() === 1;

                  return (
                    <div 
                      key={item.id || i}
                      onClick={() => onItemClick && onItemClick(item)}
                      className={`py-1 text-[11px] font-bold truncate cursor-pointer transition-colors px-2 ${statusColor} ${layoutClass}`}
                      title={`${titleText} (${format(startDate, 'dd/MM HH:mm')} - ${format(endDate, 'dd/MM HH:mm')})`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {isFirstDay && (
                          <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" title="Début de l'événement" />
                        )}
                        <span className="truncate flex-1">{showTitle ? titleText : '\u00A0'}</span>
                        {isLastDay && (
                          <div className="w-1.5 h-1.5 rounded-full border border-current shrink-0 shadow-sm" title="Fin de l'événement" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {dayItems.length > 3 && (
                  <div className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-tighter">
                    + {dayItems.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
