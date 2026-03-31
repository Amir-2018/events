import { useState } from 'react';
import EventForm from './EventForm';

export default function EventEditModal({ event, events, onSave, onClose, isOpen }) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="px-6 py-4 text-white" style={{ background: 'linear-gradient(to right, #31a7df, #2596d1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Modifier l'événement</h2>
              <p className="text-blue-100 text-xs mt-1">
                Apportez les modifications nécessaires à votre événement
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Event Form */}
        <div className="p-0">
          <EventForm
            event={event}
            events={events}
            onSubmit={(updatedEvent) => {
              onSave(updatedEvent);
              onClose();
            }}
            onCancel={onClose}
            isEditMode={true}
          />
        </div>
      </div>
    </div>
  );
}