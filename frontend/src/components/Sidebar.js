import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Sidebar({ activeSection, onSectionChange }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleUserClick = (userId) => {
    router.push(`/profile?id=${userId}`);
  };

  return (
    <div className="w-72 h-screen fixed top-0 left-0 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col shadow-2xl overflow-y-auto z-40">
      {/* Brand Section Simplified */}
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter text-white">Gestion</h1>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 px-8">
        <nav className="space-y-2">
          <button
            onClick={() => onSectionChange('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'dashboard' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-chart-bar w-5 h-5 mr-3 text-center"></i>
            {user?.role === 'client' ? 'Mes Inscriptions' : 'Dashboard'}
          </button>
          
          {user?.role !== 'client' && (
            <>
          <button
            onClick={() => onSectionChange('events')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'events' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-calendar-alt w-5 h-5 mr-3 text-center"></i>
            Tous les événements
          </button>
          
          <button
            onClick={() => onSectionChange('event-types')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'event-types' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-tags w-5 h-5 mr-3 text-center"></i>
            Types d'événements
          </button>
          
          <button
            onClick={() => onSectionChange('properties')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'properties' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-building w-5 h-5 mr-3 text-center"></i>
            Biens
          </button>

          <button
            onClick={() => onSectionChange('bien-types')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'bien-types' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-layer-group w-5 h-5 mr-3 text-center"></i>
            Types de biens
          </button>
          
          <button
            onClick={() => onSectionChange('inscrits')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'inscrits' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012 .447-.037 .666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74 .477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0a3 3 0 016 0Zm6 3a2.25 2.25 0 11-4.5 0a2.25 2.25 0 04.5 0Zm-13.5 0a2.25 2.25 0 11-4.5 0a2.25 2.25 0 04.5 0Z" />
            </svg>
            Inscrits
          </button>

          <button
            onClick={() => onSectionChange('tickets')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'tickets' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            Mes Tickets
          </button>

          <button
            onClick={() => onSectionChange('ticket-scanner')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'ticket-scanner' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h4.5v4.5h-4.5v-4.5Z" />
            </svg>
            Scanner QR
          </button>

          <button
            onClick={() => onSectionChange('revenue-stats')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'revenue-stats' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-chart-line w-5 h-5 mr-3"></i>
            Statistiques Revenus
          </button>

          {user?.role === 'superadmin' && (
            <button
              onClick={() => onSectionChange('utilisateurs')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'utilisateurs' 
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0  4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              Menu Utilisateurs
            </button>
          )}

          {user?.role === 'superadmin' && (
            <button
              onClick={() => onSectionChange('reclamations')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'reclamations' 
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              Réclamations
            </button>
          )}
          </>
        )}
        </nav>
      </div>

      {/* Footer Simplified */}
      <div className="p-8 border-t border-white/20 bg-black/5">
        <p className="text-[10px] text-blue-200 uppercase tracking-[0.2em] font-black text-center opacity-50">EventPro v1.0</p>
      </div>
    </div>
  );
}