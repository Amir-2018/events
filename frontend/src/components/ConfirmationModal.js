export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Supprimer', cancelText = 'Annuler', type = 'danger' }) {
  if (!isOpen) return null;

  const confirmButtonClasses = type === 'danger' 
    ? "bg-red-600 hover:bg-red-700 text-white" 
    : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all animate-in zoom-in-95 duration-200">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${confirmButtonClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
