const Reclamation = require('../models/reclamation.model');
const emailService = require('../services/emailService');

class ReclamationController {
  async getAllReclamations(req, res) {
    try {
      const reclamations = await Reclamation.getAll();
      res.json({ success: true, data: reclamations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const validStatuses = ['En attente', 'En cours', 'Terminé', 'Résolu', 'Rejeté'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      // Récupérer la réclamation avec les infos client avant mise à jour
      const reclamationAvant = await Reclamation.getById(id);
      if (!reclamationAvant) {
        return res.status(404).json({ success: false, message: 'Réclamation non trouvée' });
      }

      // Mettre à jour le statut
      const reclamation = await Reclamation.updateStatus(id, status);

      // Envoyer un email si le client a un email
      if (reclamationAvant.client_email) {
        try {
          const emailResult = await emailService.sendStatusChangeEmail(
            reclamationAvant, 
            status, 
            reclamationAvant.client_email
          );
          
          console.log('Résultat envoi email:', emailResult);
        } catch (emailError) {
          console.error('Erreur envoi email (non bloquante):', emailError);
          // Ne pas faire échouer la requête si l'email échoue
        }
      }

      res.json({ 
        success: true, 
        data: reclamation,
        emailSent: !!reclamationAvant.client_email
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createReclamation(req, res) {
    try {
      const { client_id, client_email, client_nom, client_prenom, sujet, description, image } = req.body;
      
      if (!sujet || !description) {
        return res.status(400).json({ success: false, message: 'Sujet and description are required' });
      }

      let finalClientId = client_id;

      // Si des informations client sont fournies, créer/mettre à jour l'enregistrement client
      if (client_id && client_email && client_nom && client_prenom) {
        try {
          const pool = require('../db/pool');
          
          // Vérifier si le client existe déjà
          const [existingClient] = await pool.query(
            'SELECT id FROM clients WHERE id = ?', 
            [client_id]
          );

          if (existingClient.length === 0) {
            // Créer un nouvel enregistrement client
            await pool.query(`
              INSERT INTO clients (id, nom, prenom, email, tel, password)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [
              client_id,
              client_nom,
              client_prenom,
              client_email,
              'Non renseigné', // Tel par défaut
              'from_user_account' // Mot de passe factice
            ]);
            
            console.log(`Client créé automatiquement: ${client_prenom} ${client_nom}`);
          } else {
            // Mettre à jour les informations si nécessaire
            await pool.query(`
              UPDATE clients 
              SET nom = ?, prenom = ?, email = ?
              WHERE id = ?
            `, [client_nom, client_prenom, client_email, client_id]);
            
            console.log(`Client mis à jour: ${client_prenom} ${client_nom}`);
          }
        } catch (clientError) {
          console.error('Erreur gestion client:', clientError);
          // Continuer même si la création/mise à jour du client échoue
        }
      }

      // Créer la réclamation
      const reclamation = await Reclamation.create({ 
        client_id: finalClientId || null, 
        sujet, 
        description, 
        image: image || null 
      });
      
      res.status(201).json({ success: true, data: reclamation });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReclamationController();
