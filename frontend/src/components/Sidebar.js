export default function Sidebar({ activeSection, onSectionChange }) {
  return (
    <div className="w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col shadow-2xl">
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-3">Gestion des Événements</h2>
          <p className="text-blue-100 leading-relaxed">
            Créez et gérez vos événements en toute simplicité
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 px-8">
        <nav className="space-y-2">
          <button
            onClick={() => onSectionChange('events')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'events' 
                ? 'bg-white/20 backdrop-blur-sm text-white' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Tous les événements
          </button>
          
          <button
            onClick={() => onSectionChange('event-types')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'event-types' 
                ? 'bg-white/20 backdrop-blur-sm text-white' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            Types d'événements
          </button>
          
          <button
            onClick={() => onSectionChange('properties')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'properties' 
                ? 'bg-white/20 backdrop-blur-sm text-white' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18M6.75 9.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-16.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
            </svg>
            Biens
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-8 border-t border-white/20">
        <div className="flex items-center text-blue-100 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          Système en ligne
        </div>
      </div>
    </div>
  );
}