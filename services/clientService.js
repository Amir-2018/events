const pool = require('../db/pool');
const Client = require('../models/client.model');

class ClientService {
  static async getAllClientsWithEvents() {
    console.log('🔍 ClientService.getAllClientsWithEvents() appelé');
    
    try {
      // Récupérer tous les clients
      console.log('   1. Récupération des clients...');
      const clientsResult = await pool.query(`
        SELECT id, nom, prenom, email, tel, created_at
        FROM clients
        ORDER BY created_at DESC
      `);
      const clients = clientsResult.rows;
      
      console.log(`   → ${clients.length} client(s) trouvé(s)`);
      clients.forEach((client, index) => {
        console.log(`      ${index + 1}. ${client.prenom} ${client.nom} (ID: ${client.id})`);
      });

      // Pour chaque client, récupérer ses événements
      console.log('   2. Récupération des événements par client...');
      const clientsWithEvents = await Promise.all(
        clients.map(async (client) => {
          console.log(`      Traitement client: ${client.prenom} ${client.nom}`);
          
          const eventsResult = await pool.query(`
            SELECT e.id, e.nom, e.date, e.adresse
            FROM events e
            INNER JOIN event_registrations er ON er.event_id = e.id
            WHERE er.client_id = ?
            ORDER BY e.date DESC
          `, [client.id]);
          const events = eventsResult.rows;

          console.log(`      → ${events.length} événement(s) trouvé(s)`);
          events.forEach(event => {
            console.log(`         * ${event.nom} (${event.date})`);
          });

          return {
            ...client,
            events: events || []
          };
        })
      );

      console.log('   3. Résultat final:');
      console.log(`   → ${clientsWithEvents.length} client(s) avec événements`);
      const totalEvents = clientsWithEvents.reduce((sum, client) => sum + client.events.length, 0);
      console.log(`   → ${totalEvents} événement(s) au total`);

      return clientsWithEvents;
    } catch (error) {
      console.error('❌ Erreur dans getAllClientsWithEvents:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
}

module.exports = ClientService;

