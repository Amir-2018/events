import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { eventsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardSection({ events, onNavigate }) {
  const { user } = useAuth();
  const [revenueStats, setRevenueStats] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // Load revenue stats for admins
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      loadRevenueStats();
    }
  }, [user]);

  const loadRevenueStats = async () => {
    try {
      setLoadingRevenue(true);
      const response = await eventsAPI.getRevenueStats();
      setRevenueStats(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques de revenus:', err);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) > now);
    const pastEvents = events.filter(e => new Date(e.date_fin || e.date) < now);
    const inProgressEvents = events.filter(e => {
        const start = new Date(e.date);
        const end = e.date_fin ? new Date(e.date_fin) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
        return start <= now && end >= now;
    });
    
    // Total inscriptions
    const totalInscriptions = events.reduce((acc, event) => acc + (event.clients ? event.clients.length : 0), 0);

    return {
      total: events.length,
      upcoming: upcomingEvents.length,
      past: pastEvents.length,
      inProgress: inProgressEvents.length,
      totalInscriptions,
      nextEvents: upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)
    };
  }, [events]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Tableau de bord</h1>
          <p className="text-gray-500 font-medium tracking-tight">Aperçu général de votre activité</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 relative z-10 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Événements</p>
            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 relative z-10 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Événements à venir</p>
            <p className="text-3xl font-black text-gray-900">{stats.upcoming}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 relative z-10 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Événements terminés</p>
            <p className="text-3xl font-black text-gray-900">{stats.past}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 relative z-10 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0  4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Inscriptions</p>
            <p className="text-3xl font-black text-gray-900">{stats.totalInscriptions}</p>
          </div>
        </div>
      </div>

      {/* Revenue Stats for Admins */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Statistiques de Revenus</h2>
            <button 
              onClick={() => onNavigate('revenue-stats')}
              className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
            >
              Voir détails
            </button>
          </div>
          
          {loadingRevenue ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : revenueStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-calendar-alt text-2xl opacity-80"></i>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Événements</span>
                </div>
                <div className="text-3xl font-black mb-1">{revenueStats.totals.totalEvents}</div>
                <div className="text-sm opacity-80">
                  {revenueStats.totals.paidEvents} payants • {revenueStats.totals.freeEvents} gratuits
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-ticket-alt text-2xl opacity-80"></i>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tickets</span>
                </div>
                <div className="text-3xl font-black mb-1">{revenueStats.totals.totalTickets}</div>
                <div className="text-sm opacity-80">
                  {revenueStats.totals.verifiedTickets} vérifiés • {revenueStats.totals.activeTickets} actifs
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-euro-sign text-2xl opacity-80"></i>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Revenus Potentiels</span>
                </div>
                <div className="text-2xl font-black mb-1">{formatCurrency(revenueStats.totals.potentialRevenue)}</div>
                <div className="text-sm opacity-80">Tous les tickets vendus</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-check-circle text-2xl opacity-80"></i>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Revenus Confirmés</span>
                </div>
                <div className="text-2xl font-black mb-1">{formatCurrency(revenueStats.totals.confirmedRevenue)}</div>
                <div className="text-sm opacity-80">Tickets vérifiés uniquement</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
              <i className="fas fa-chart-line text-gray-300 text-3xl mb-4"></i>
              <p className="text-gray-500 font-medium">Impossible de charger les statistiques de revenus</p>
              <button 
                onClick={loadRevenueStats}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Prochains Événements</h2>
            <button 
              onClick={() => onNavigate('events')}
              className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
            >
              Voir tout
            </button>
          </div>
          
          {stats.nextEvents.length > 0 ? (
            <div className="space-y-4">
              {stats.nextEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-inner">
                      {new Date(event.date).getDate()}
                      <span className="text-[10px] block opacity-80 uppercase -mt-1">{format(new Date(event.date), 'MMM', { locale: fr })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{event.nom}</h4>
                      <p className="text-sm text-gray-500 font-medium">{formatDate(event.date)} - {event.adresse || event.bien_nom}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                     <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                        {event.clients?.length || 0} inscrits
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">Aucun événement à venir.</p>
              <button 
                onClick={() => onNavigate('events')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md"
              >
                Créer un événement
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-xl shadow-blue-200 p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <h2 className="text-xl font-bold mb-8 relative z-10">Statut en direct</h2>
           
           <div className="space-y-6 relative z-10">
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <p className="text-sm text-blue-100 font-medium">Événements en cours</p>
                    <p className="text-2xl font-black">{stats.inProgress}</p>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: stats.total ? `${(stats.inProgress / stats.total) * 100}%` : '0%' }}></div>
                 </div>
              </div>
              
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <p className="text-sm text-blue-100 font-medium">Événements réalisés</p>
                    <p className="text-2xl font-black">{stats.past}</p>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: stats.total ? `${(stats.past / stats.total) * 100}%` : '0%' }}></div>
                 </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/20">
                 <p className="text-xs text-blue-200 font-medium mb-1">Résumé</p>
                 <p className="text-sm font-medium leading-relaxed max-w-[200px]">
                    Vous avez un total de <span className="font-bold">{stats.total} événements</span> dans la base de données, générant <span className="font-bold">{stats.totalInscriptions} inscriptions</span>.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
