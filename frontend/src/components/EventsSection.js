import { useState } from 'react';
import EventCard from './EventCard';
import EventForm from './EventForm';

export default function EventsSection({ 
  events, 
  onCreateEvent, 
  onDeleteEvent, 
  onViewClients, 
  isProcessing 
}) {
  const [showForm, setShowForm] = useState(false);

  const handleCreateEvent = async (eventData) => {
    await onCreateEvent(eventData);
    setShowForm(false);
  };

  if (events.length === 0) {
    return (
      <>
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-gray-500 text-xl font-medium mb-8">Aucun événement n'a encore été créé</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            Créer votre premier événement
          </button>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 group border-4 border-white"
          title="Créer un nouvel événement"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Modal */}
        {showForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowForm(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onDelete={onDeleteEvent}
            onViewClients={onViewClients}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 group border-4 border-white"
        title="Créer un nouvel événement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Modal */}
      {showForm && (
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}