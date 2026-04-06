import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function PublicNavbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    { 
      name: 'Accueil', 
      href: '/', 
      icon: 'fas fa-home',
      description: 'Découvrez nos événements'
    },
    { 
      name: 'À propos', 
      href: '/about', 
      icon: 'fas fa-info-circle',
      description: 'Notre histoire et mission'
    },
    { 
      name: 'Services', 
      href: '/services', 
      icon: 'fas fa-concierge-bell',
      description: 'Nos solutions événementielles'
    },
    { 
      name: 'Contact', 
      href: '/contact', 
      icon: 'fas fa-envelope',
      description: 'Nous contacter'
    },
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
    <nav className={`fixed top-0 right-0 bg-white/95 backdrop-blur-xl z-50 border-b border-gray-100/50 shadow-lg transition-all duration-300 ${isDashboard ? 'left-72' : 'left-0'}`}>
      <div className="w-full px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left Section: Logo + Brand */}
          <div className="flex items-center space-x-8">
            <Link href={isAdmin ? "/dashboard" : "/"} className="flex items-center group">
               <div className="relative">
                 <div className="bg-gradient-to-br from-[#31a7df] to-[#2596d1] p-3 rounded-2xl group-hover:rotate-12 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                    </svg>
                 </div>
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
               </div>
               <div className="ml-4 hidden sm:block">
                 <h1 className="text-xl font-black text-gray-900 group-hover:text-[#31a7df] transition-colors">EventPro</h1>
                 <p className="text-xs text-gray-500 font-medium -mt-1">Plateforme événementielle intelligente</p>
               </div>
            </Link>

            {/* Navigation Links */}
            {!isAdmin && (
              <div className="hidden xl:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`group relative px-4 py-2 rounded-xl transition-all duration-300 hover:bg-gray-50 ${router.pathname === link.href ? 'bg-blue-50 text-[#31a7df]' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <div className="flex items-center gap-2">
                      <i className={`${link.icon} text-sm group-hover:scale-110 transition-transform`}></i>
                      <span className="text-sm font-semibold">{link.name}</span>
                    </div>
                    <div className="absolute left-4 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Admin Dashboard Link */}
            {!isDashboard && isAuthenticated && isAdmin && (
              <Link 
                href="/dashboard"
                className="ml-4 bg-gradient-to-r from-[#31a7df] to-[#2596d1] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
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
                  className="flex items-center gap-3 group focus:outline-none bg-gray-50 hover:bg-gray-100 rounded-2xl p-2 pr-4 transition-all"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}>
                      {userInitials}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user?.role === 'superadmin' ? 'bg-amber-400' : user?.role === 'admin' ? 'bg-blue-500' : 'bg-green-400'}`}></div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-900">{user?.prenom} {user?.nom}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Enhanced Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                       <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}>
                           {userInitials}
                         </div>
                         <div>
                           <p className="font-bold text-gray-900">{user?.prenom} {user?.nom}</p>
                           <p className="text-sm text-gray-500">{user?.email}</p>
                           <div className="flex items-center gap-1 mt-1">
                             <div className={`w-2 h-2 rounded-full ${user?.role === 'superadmin' ? 'bg-amber-400' : user?.role === 'admin' ? 'bg-blue-500' : 'bg-green-400'}`}></div>
                             <span className="text-xs text-gray-400 capitalize font-medium">{user?.role}</span>
                           </div>
                         </div>
                       </div>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#31a7df] transition-colors gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#31a7df]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold">Tableau de bord</div>
                        <div className="text-xs text-gray-500">Gérer vos événements</div>
                      </div>
                    </Link>

                    <Link 
                      href="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#31a7df] transition-colors gap-3"
                    >
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold">Mon Profil</div>
                        <div className="text-xs text-gray-500">Paramètres du compte</div>
                      </div>
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors gap-3"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">Déconnexion</div>
                          <div className="text-xs text-red-400">Quitter la session</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !isLoginPage && (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/login" 
                    className="bg-gradient-to-r from-[#31a7df] to-[#2596d1] text-white px-8 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    Connexion
                  </Link>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
               </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && !isAdmin && (
          <div className="xl:hidden border-t border-gray-100 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${router.pathname === link.href ? 'bg-blue-50 text-[#31a7df]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <i className={`${link.icon} text-sm`}></i>
                  <div>
                    <div className="font-semibold">{link.name}</div>
                    <div className="text-xs text-gray-500">{link.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}