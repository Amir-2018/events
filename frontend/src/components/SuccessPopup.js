import React from 'react';

export default function SuccessPopup({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-sm transform transition-all animate-in zoom-in-95 duration-200 text-center border border-white/20">
        
        <div className="relative">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3">Succès !</h3>
          
          {/* Message */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6 px-2">
            {message || "L'opération a été effectuée avec succès."}
          </p>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg active:scale-95"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
