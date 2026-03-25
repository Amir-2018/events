class EventService {
  async getEvents() {
    // Dummy events list
    return [
      { id: 1, name: 'Concert Rock', date: '2024-12-01', location: 'Paris' },
      { id: 2, name: 'Conférence Tech', date: '2024-12-15', location: 'Lyon' },
      { id: 3, name: 'Festival Art', date: '2024-12-20', location: 'Marseille' }
    ];
  }
}

module.exports = new EventService();
