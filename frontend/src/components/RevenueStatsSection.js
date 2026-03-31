import { useState, useEffect } from 'react';
import { eventsAPI } from '../lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RevenueStatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRevenueStats();
  }, []);

  const loadRevenueStats = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getRevenueStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-200">
        <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
        <i className="fas fa-chart-line text-gray-400 text-3xl mb-4"></i>
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Statistiques de Revenus</h1>
          <p className="text-gray-500 font-medium tracking-tight">Analyse des revenus et des tickets par événement</p>
        </div>
        <button
          onClick={loadRevenueStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-sync-alt"></i>
          Actualiser
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-calendar-alt text-2xl opacity-80"></i>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Événements</span>
          </div>
          <div className="text-3xl font-black mb-1">{stats.totals.totalEvents}</div>
          <div className="text-sm opacity-80">
            {stats.totals.paidEvents} payants • {stats.totals.freeEvents} gratuits
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-ticket-alt text-2xl opacity-80"></i>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tickets</span>
          </div>
          <div className="text-3xl font-black mb-1">{stats.totals.totalTickets}</div>
          <div className="text-sm opacity-80">
            {stats.totals.verifiedTickets} vérifiés • {stats.totals.activeTickets} actifs
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-euro-sign text-2xl opacity-80"></i>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Revenus Potentiels</span>
          </div>
          <div className="text-2xl font-black mb-1">{formatCurrency(stats.totals.potentialRevenue)}</div>
          <div className="text-sm opacity-80">Tous les tickets vendus</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-check-circle text-2xl opacity-80"></i>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Revenus Confirmés</span>
          </div>
          <div className="text-2xl font-black mb-1">{formatCurrency(stats.totals.confirmedRevenue)}</div>
          <div className="text-sm opacity-80">Tickets vérifiés uniquement</div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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
                  <i className="fas fa-euro-sign mr-2"></i>
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
              {stats.events.map((event) => (
                <tr key={event.event_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-calendar-alt text-blue-600"></i>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{event.event_name}</div>
                        <div className="text-sm text-gray-500">ID: {event.event_id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(event.event_date)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {parseFloat(event.ticket_price) > 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                        {formatCurrency(event.ticket_price)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                        <i className="fas fa-gift mr-1"></i>
                        Gratuit
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-900">{event.total_tickets}</span>
                      <div className="text-xs text-gray-500">
                        {event.active_tickets} actifs
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                      {event.verified_tickets}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-green-700">
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
  );
}