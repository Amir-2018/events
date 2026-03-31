-- Ajouter la colonne is_private à la table events
ALTER TABLE events ADD COLUMN is_private BOOLEAN DEFAULT FALSE;

-- Créer la table event_invitations pour gérer les invitations aux événements privés
CREATE TABLE IF NOT EXISTS event_invitations (
  id VARCHAR(36) PRIMARY KEY,
  event_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  invited_by VARCHAR(36) NOT NULL,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  CONSTRAINT fk_invitation_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_invitation_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_invitation_inviter FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_client (event_id, client_id)
) ENGINE=InnoDB;

-- Index pour améliorer les performances
CREATE INDEX idx_event_invitations_event_id ON event_invitations(event_id);
CREATE INDEX idx_event_invitations_client_id ON event_invitations(client_id);
CREATE INDEX idx_event_invitations_status ON event_invitations(status);