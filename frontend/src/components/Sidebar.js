import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Sidebar({ activeSection, onSectionChange }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleUserClick = (userId) => {
    router.push(`/profile?id=${userId}`);
  };

  const handleSectionChange = (section) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Fermer le menu mobile après sélection
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-72 h-screen fixed top-0 left-0 text-white flex flex-col shadow-2xl overflow-y-auto z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: 'linear-gradient(to bottom, #31a7df, #2596d1)' }}>
      {/* Brand Section with Project Title */}
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white italic">
              Event<span style={{ color: '#b3d9f2' }}>Pro</span>
            </h1>
            <p className="text-xs font-medium opacity-75 mt-1" style={{ color: '#b3d9f2' }}>
              Plateforme d'événements
            </p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden ml-auto text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 px-8">
        <nav className="space-y-2">
          <button
            onClick={() => handleSectionChange('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'dashboard' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'dashboard' ? '#ffffff' : '#b3d9f2' }}
          >
            <i className="fas fa-chart-bar w-5 h-5 mr-3 text-center"></i>
            <span className="truncate">{user?.role === 'client' ? 'Mes Inscriptions' : 'Dashboard'}</span>
          </button>
          
          {user?.role === 'client' && (
            <button
              onClick={() => handleSectionChange('invitations')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'invitations' 
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                  : 'hover:bg-white/10'
              }`}
              style={{ color: activeSection === 'invitations' ? '#ffffff' : '#b3d9f2' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <span className="truncate">Mes Invitations</span>
            </button>
          )}
          
          {user?.role !== 'client' && (
            <>
          <button
            onClick={() => handleSectionChange('events')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'events' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'events' ? '#ffffff' : '#b3d9f2' }}
          >
            <i className="fas fa-calendar-alt w-5 h-5 mr-3 text-center"></i>
            <span className="truncate">Tous les événements</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('event-types')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'event-types' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'event-types' ? '#ffffff' : '#b3d9f2' }}
          >
            <i className="fas fa-tags w-5 h-5 mr-3 text-center"></i>
            <span className="truncate">Types d'événements</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('properties')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'properties' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'properties' ? '#ffffff' : '#b3d9f2' }}
          >
            <i className="fas fa-building w-5 h-5 mr-3 text-center"></i>
            <span className="truncate">Biens</span>
          </button>

          <button
            onClick={() => handleSectionChange('bien-types')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'bien-types' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'bien-types' ? '#ffffff' : '#b3d9f2' }}
          >
            <i className="fas fa-layer-group w-5 h-5 mr-3 text-center"></i>
            <span className="truncate">Types de biens</span>
          </button>
          
          <button
            onClick={() => handleSectionChange('inscrits')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'inscrits' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'inscrits' ? '#ffffff' : '#b3d9f2' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012 .447-.037 .666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74 .477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0a3 3 0 016 0Zm6 3a2.25 2.25 0 11-4.5 0a2.25 2.25 0 04.5 0Zm-13.5 0a2.25 2.25 0 11-4.5 0a2.25 2.25 0 04.5 0Z" />
            </svg>
            <span className="truncate">Inscrits</span>
          </button>

          <button
            onClick={() => handleSectionChange('tickets')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'tickets' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'tickets' ? '#ffffff' : '#b3d9f2' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            <span className="truncate">Mes Tickets</span>
          </button>

          <button
            onClick={() => handleSectionChange('ticket-scanner')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'ticket-scanner' 
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: activeSection === 'ticket-scanner' ? '#ffffff' : '#b3d9f2' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h4.5v4.5h-4.5v-4.5Z" />
            </svg>
            <span className="truncate">Scanner QR</span>
          </button>

          {user?.role === 'superadmin' && (
            <button
              onClick={() => handleSectionChange('utilisateurs')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'utilisateurs' 
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                  : 'hover:bg-white/10'
              }`}
              style={{ color: activeSection === 'utilisateurs' ? '#ffffff' : '#b3d9f2' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0  4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              <span className="truncate">Menu Utilisateurs</span>
            </button>
          )}

          {user?.role === 'superadmin' && (
            <button
              onClick={() => handleSectionChange('reclamations')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                activeSection === 'reclamations' 
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                  : 'hover:bg-white/10'
              }`}
              style={{ color: activeSection === 'reclamations' ? '#ffffff' : '#b3d9f2' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span className="truncate">Réclamations</span>
            </button>
          )}
          </>
        )}
        </nav>
      </div>

      {/* Footer Simplified */}
      <div className="p-8 border-t border-white/20 bg-black/5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-center opacity-50" style={{ color: '#b3d9f2' }}>EventPro v1.0</p>
      </div>
    </div>
    </>
  );
}