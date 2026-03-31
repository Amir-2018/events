import React from 'react';

export default function SuccessPopup({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md transform transition-all animate-in zoom-in-95 duration-300 text-center relative overflow-hidden border border-gray-100">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-50 animate-bounce cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          
          <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">Succès !</h3>
          <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg px-2">
            {message || "L'événement a été enregistré avec succès dans le système."}
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95 group flex items-center justify-center gap-3"
          >
            <span>Continuer</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
