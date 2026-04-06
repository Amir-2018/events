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
    return `${parseFloat(amount || 0).toFixed(2)} TND`;
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
      {/* Header Section - Optimized */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tableau de bord</h1>
          <p className="text-xs text-gray-500">Aperçu général de votre activité</p>
        </div>
      </div>

      {/* Stats Cards - Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#31a7df]">
            <i className="fas fa-calendar-alt text-lg"></i>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Total Événements</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <i className="fas fa-clock text-lg"></i>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Événements à venir</p>
            <p className="text-xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <i className="fas fa-check-circle text-lg"></i>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Événements terminés</p>
            <p className="text-xl font-bold text-gray-900">{stats.past}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <i className="fas fa-users text-lg"></i>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Total Inscriptions</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalInscriptions}</p>
          </div>
        </div>
      </div>

      {/* Revenue Stats for Admins - Optimized */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Statistiques de Revenus</h2>
          </div>
          
          {loadingRevenue ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : revenueStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg p-4 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}>
                <div className="flex items-center justify-between mb-3">
                  <i className="fas fa-calendar-alt text-lg opacity-80"></i>
                  <span className="text-xs font-medium opacity-80">Événements</span>
                </div>
                <div className="text-xl font-bold mb-1">{revenueStats.totals.totalEvents}</div>
                <div className="text-xs opacity-80">
                  {revenueStats.totals.paidEvents} payants • {revenueStats.totals.freeEvents} gratuits
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-4 text-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <i className="fas fa-ticket-alt text-lg opacity-80"></i>
                  <span className="text-xs font-medium opacity-80">Tickets</span>
                </div>
                <div className="text-xl font-bold mb-1">{revenueStats.totals.totalTickets}</div>
                <div className="text-xs opacity-80">
                  {revenueStats.totals.verifiedTickets} vérifiés • {revenueStats.totals.activeTickets} actifs
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-4 text-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <i className="fas fa-coins text-lg opacity-80"></i>
                  <span className="text-xs font-medium opacity-80">Revenus Potentiels</span>
                </div>
                <div className="text-lg font-bold mb-1">{formatCurrency(revenueStats.totals.potentialRevenue)}</div>
                <div className="text-xs opacity-80">Tous les tickets vendus</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg p-4 text-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <i className="fas fa-check-circle text-lg opacity-80"></i>
                  <span className="text-xs font-medium opacity-80">Revenus Confirmés</span>
                </div>
                <div className="text-lg font-bold mb-1">{formatCurrency(revenueStats.totals.confirmedRevenue)}</div>
                <div className="text-xs opacity-80">Tickets vérifiés uniquement</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
              <i className="fas fa-chart-line text-gray-300 text-2xl mb-3"></i>
              <p className="text-gray-500 font-medium text-sm">Impossible de charger les statistiques de revenus</p>
              <button 
                onClick={loadRevenueStats}
                className="mt-3 px-4 py-2 bg-[#31a7df] text-white rounded-lg text-xs font-medium hover:bg-[#2596d1] transition-all"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Events Revenue Table for Admins */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && revenueStats && revenueStats.events && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <i className="fas fa-list"></i>
                Détail par Événement
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      Événement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-clock mr-2"></i>
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-coins mr-2"></i>
                      Prix
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-ticket-alt mr-2"></i>
                      Tickets
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-check mr-2"></i>
                      Vérifiés
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <i className="fas fa-coins mr-2"></i>
                      Revenus
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {revenueStats.events.map((event) => (
                    <tr key={event.event_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-calendar-alt text-[#31a7df]"></i>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1 text-sm">{event.event_name}</div>
                            <div className="text-xs text-gray-500">ID: {event.event_id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDate(event.event_date)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {parseFloat(event.ticket_price) > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                            {formatCurrency(event.ticket_price)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#2596d1]">
                            <i className="fas fa-gift mr-1"></i>
                            Gratuit
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900 text-sm">{event.total_tickets}</span>
                          <div className="text-xs text-gray-500">
                            {event.active_tickets} actifs
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                          {event.verified_tickets}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-green-700 text-sm">
                            {formatCurrency(event.confirmed_revenue)}
                          </span>
                          {parseFloat(event.potential_revenue) > parseFloat(event.confirmed_revenue) && (
                            <div className="text-xs text-gray-500">
                              / {formatCurrency(event.potential_revenue)} max
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Row - Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Prochains Événements</h2>
            <button 
              onClick={() => onNavigate('events')}
              className="text-xs font-medium text-[#31a7df] hover:text-[#2596d1] transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Voir tout
            </button>
          </div>
          
          {stats.nextEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.nextEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#31a7df] font-bold shrink-0 text-sm">
                      {new Date(event.date).getDate()}
                      <span className="text-[9px] block opacity-80 uppercase -mt-1">{format(new Date(event.date), 'MMM', { locale: fr })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#31a7df] transition-colors text-sm">{event.nom}</h4>
                      <p className="text-xs text-gray-500 font-medium">{formatDate(event.date)} - {event.adresse || event.bien_nom}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                     <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">
                        {event.clients?.length || 0} inscrits
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium text-sm">Aucun événement à venir.</p>
              <button 
                onClick={() => onNavigate('events')}
                className="mt-3 px-4 py-2 bg-[#31a7df] text-white rounded-lg text-xs font-medium hover:bg-[#2596d1] transition-all shadow-sm"
              >
                Créer un événement
              </button>
            </div>
          )}
        </div>
        
        <div className="rounded-lg shadow-sm p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <h2 className="text-lg font-bold mb-6 relative z-10">Statut en direct</h2>
           
           <div className="space-y-4 relative z-10">
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <p className="text-xs text-white/80 font-medium">Événements en cours</p>
                    <p className="text-lg font-bold">{stats.inProgress}</p>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-1.5">
                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: stats.total ? `${(stats.inProgress / stats.total) * 100}%` : '0%' }}></div>
                 </div>
              </div>
              
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <p className="text-xs text-white/80 font-medium">Événements réalisés</p>
                    <p className="text-lg font-bold">{stats.past}</p>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-1.5">
                    <div className="bg-white/60 h-1.5 rounded-full" style={{ width: stats.total ? `${(stats.past / stats.total) * 100}%` : '0%' }}></div>
                 </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/20">
                 <p className="text-xs text-white/70 font-medium mb-1">Résumé</p>
                 <p className="text-xs font-medium leading-relaxed">
                    Vous avez un total de <span className="font-bold">{stats.total} événements</span> dans la base de données, générant <span className="font-bold">{stats.totalInscriptions} inscriptions</span>.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
