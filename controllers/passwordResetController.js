const PasswordResetService = require('../services/passwordResetService');

class PasswordResetController {
  // Demander une réinitialisation de mot de passe
  static async requestReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'L\'adresse email est requise'
        });
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide'
        });
      }

      const result = await PasswordResetService.requestPasswordReset(email);
      
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erreur demande réinitialisation:', error);
      
      // Messages d'erreur spécifiques
      if (error.message.includes('Aucun compte')) {
        return res.status(404).json({
          success: false,
          message: 'Aucun compte associé à cette adresse email'
        });
      }

      if (error.message.includes('super-administrateur')) {
        return res.status(403).json({
          success: false,
          message: 'La réinitialisation de mot de passe n\'est pas disponible pour votre compte'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du code de vérification'
      });
    }
  }

  // Vérifier le code de réinitialisation
  static async verifyCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'L\'email et le code sont requis'
        });
      }

      // Validation du code (6 chiffres)
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({
          success: false,
          message: 'Le code doit contenir exactement 6 chiffres'
        });
      }

      const result = await PasswordResetService.verifyResetCode(email, code);
      
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erreur vérification code:', error);
      
      if (error.message.includes('invalide') || error.message.includes('expiré')) {
        return res.status(400).json({
          success: false,
          message: 'Code de vérification invalide ou expiré'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du code'
      });
    }
  }

  // Réinitialiser le mot de passe
  static async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Validation du mot de passe
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }

      const result = await PasswordResetService.resetPassword(email, code, newPassword);
      
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error);
      
      if (error.message.includes('Session') || error.message.includes('expirée')) {
        return res.status(400).json({
          success: false,
          message: 'Session de réinitialisation expirée. Veuillez recommencer le processus'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation du mot de passe'
      });
    }
  }
}

module.exports = PasswordResetController;