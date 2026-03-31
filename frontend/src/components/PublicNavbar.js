import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function PublicNavbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/', icon: 'fas fa-home' },
    { name: 'À propos', href: '/about', icon: 'fas fa-info-circle' },
    { name: 'Services', href: '/services', icon: 'fas fa-concierge-bell' },
    { name: 'Inscrits', href: '/inscrits', icon: 'fas fa-users' },
    { name: 'Réclamations', href: '/reclamations', icon: 'fas fa-exclamation-triangle' },
    { name: 'Contact', href: '/contact', icon: 'fas fa-envelope' },
  ];

  // Logic for initials: First letter of Prenom + First letter of Nom
  const userInitials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '??';

  // Identify if we are in dashboard
  const isDashboard = router.pathname.startsWith('/dashboard');
  
  // Identify if user is an admin/superadmin
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  
  // Check if we are on the login page
  const isLoginPage = router.pathname === '/login';

  return (
    <nav className={`fixed top-0 right-0 bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm transition-all duration-300 ${isDashboard ? 'left-72' : 'left-0'}`}>
      <div className="w-full px-[10px]">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left Section: Logo + Links */}
          <div className="flex items-center space-x-6">
            <Link href={isAdmin ? "/dashboard" : "/"} className="flex items-center group">
               <div className="bg-[#31a7df] p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                  </svg>
               </div>
            </Link>

            {!isAdmin && (
              <div className="hidden lg:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-[#31a7df] flex items-center gap-2 ${router.pathname === link.href ? 'text-[#31a7df]' : 'text-gray-400'}`}
                  >
                    {link.icon && <i className={`${link.icon} text-sm`}></i>}
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
            {!isDashboard && isAuthenticated && isAdmin && (
              <Link 
                href="/dashboard"
                className={`ml-4 text-[10px] font-black uppercase tracking-widest transition-all text-[#31a7df] hover:text-[#2596d1] bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                </svg>
                Dashboard
              </Link>
            )}
          </div>
          
          {/* Right Section: Auth / User */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 group focus:outline-none"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-gray-100 border-2 border-white ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start translate-y-[-1px]">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">{user?.prenom} {user?.nom}</span>
                    <div className="flex items-center gap-1.5">
                       <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'superadmin' ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">{user?.role}</span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 text-gray-400 group-hover:text-gray-900 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Informations</p>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 hover:text-[#31a7df] transition-colors gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                      </svg>
                      Tableau de bord
                    </Link>

                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isLoginPage && (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/login" 
                    className="bg-[#31a7df] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2596d1] transition-all hover:shadow-xl hover:shadow-gray-200 active:scale-95"
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/register-admin" 
                    className="border-2 border-gray-900 text-gray-900 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                  >
                    S'inscrire
                  </Link>
                </div>
              )
            )}

            <div className="md:hidden flex items-center">
              <button className="text-gray-900 p-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                 </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
