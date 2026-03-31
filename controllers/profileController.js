const bcrypt = require('bcrypt');
const User = require('../models/user.model');

class ProfileController {
  static async getProfile(req, res) {
    try {
      const userId = req.params.id || req.user?.id;
      const requestingUserRole = req.user?.role;
      const requestingUserId = req.user?.id;
      
      // Vérifier les permissions
      if (requestingUserRole !== 'superadmin' && requestingUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de voir ce profil'
        });
      }
      
      const user = await User.getById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Retirer le mot de passe de la réponse
      const { password, ...userProfile } = user;
      
      res.json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil'
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.params.id || req.user?.id;
      const requestingUserRole = req.user?.role;
      const requestingUserId = req.user?.id;
      const { nom, prenom, email, currentPassword, newPassword } = req.body;
      
      // Vérifier les permissions
      if (requestingUserRole !== 'superadmin' && requestingUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de modifier ce profil'
        });
      }
      
      const user = await User.getById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Préparer les données à mettre à jour
      const updateData = {};
      
      if (nom) updateData.nom = nom;
      if (prenom) updateData.prenom = prenom;
      if (email) updateData.email = email;
      
      // Gestion du changement de mot de passe
      if (newPassword) {
        // Si c'est un superadmin qui modifie un autre utilisateur, pas besoin du mot de passe actuel
        if (requestingUserRole === 'superadmin' && requestingUserId !== userId) {
          const hashedPassword = await bcrypt.hash(newPassword, 12);
          updateData.password = hashedPassword;
        } else {
          // Sinon, vérifier le mot de passe actuel
          if (!currentPassword) {
            return res.status(400).json({
              success: false,
              message: 'Le mot de passe actuel est requis pour changer le mot de passe'
            });
          }
          
          const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isCurrentPasswordValid) {
            return res.status(400).json({
              success: false,
              message: 'Mot de passe actuel incorrect'
            });
          }
          
          const hashedPassword = await bcrypt.hash(newPassword, 12);
          updateData.password = hashedPassword;
        }
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await User.update(userId, updateData);
      
      // Retirer le mot de passe de la réponse
      const { password, ...userProfile } = updatedUser;
      
      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: userProfile
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      if (error.message.includes('email')) {
        return res.status(400).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil'
      });
    }
  }
}

module.exports = ProfileController;