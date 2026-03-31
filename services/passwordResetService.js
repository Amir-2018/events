const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

class PasswordResetService {
  // Générer un code à 6 chiffres
  static generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Demander une réinitialisation de mot de passe
  static async requestPasswordReset(email) {
    try {
      let user = null;
      let userType = null;

      // D'abord, chercher dans la table users
      const userResult = await pool.query(`
        SELECT u.id, u.nom, u.prenom, u.email, u.username, r.nom as role
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `, [email]);

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        userType = 'user';

        // Vérifier que ce n'est pas un superadmin
        if (user.role === 'superadmin') {
          throw new Error('La réinitialisation de mot de passe n\'est pas disponible pour les super-administrateurs');
        }
      } else {
        // Si pas trouvé dans users, chercher dans la table clients
        const clientResult = await pool.query(`
          SELECT id, nom, prenom, email
          FROM clients
          WHERE email = ?
        `, [email]);

        if (clientResult.rows.length > 0) {
          user = clientResult.rows[0];
          userType = 'client';
        }
      }

      // Si aucun compte trouvé dans les deux tables
      if (!user) {
        throw new Error('Aucun compte associé à cette adresse email');
      }

      // Supprimer les anciens codes non utilisés pour cet email
      await pool.query(
        'DELETE FROM password_resets WHERE email = ? AND (used = TRUE OR expires_at < NOW())',
        [email]
      );

      // Générer un nouveau code
      const resetCode = this.generateResetCode();
      const resetId = uuidv4();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Sauvegarder le code en base avec le type d'utilisateur
      await pool.query(
        'INSERT INTO password_resets (id, email, code, expires_at, user_type) VALUES (?, ?, ?, ?, ?)',
        [resetId, email, resetCode, expiresAt, userType]
      );

      // Envoyer l'email avec le code
      await emailService.sendPasswordResetCode(email, resetCode, user.prenom, user.nom);

      return {
        success: true,
        message: 'Un code de vérification a été envoyé à votre adresse email'
      };

    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      throw error;
    }
  }

  // Vérifier le code de réinitialisation
  static async verifyResetCode(email, code) {
    try {
      // Chercher le code valide
      const resetResult = await pool.query(
        'SELECT id FROM password_resets WHERE email = ? AND code = ? AND expires_at > NOW() AND used = FALSE',
        [email, code]
      );

      if (resetResult.rows.length === 0) {
        throw new Error('Code de vérification invalide ou expiré');
      }

      const resetRecord = resetResult.rows[0];

      // Marquer le code comme utilisé
      await pool.query(
        'UPDATE password_resets SET used = TRUE WHERE id = ?',
        [resetRecord.id]
      );

      return {
        success: true,
        message: 'Code vérifié avec succès'
      };

    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      throw error;
    }
  }

  // Réinitialiser le mot de passe
  static async resetPassword(email, code, newPassword) {
    try {
      // Vérifier que le code a été utilisé récemment (dans les 5 dernières minutes)
      const resetResult = await pool.query(
        'SELECT id, user_type FROM password_resets WHERE email = ? AND code = ? AND used = TRUE AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
        [email, code]
      );

      if (resetResult.rows.length === 0) {
        throw new Error('Session de réinitialisation expirée. Veuillez recommencer le processus');
      }

      const resetRecord = resetResult.rows[0];
      const userType = resetRecord.user_type;

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe dans la bonne table selon le type d'utilisateur
      if (userType === 'client') {
        await pool.query(
          'UPDATE clients SET password = ?, updated_at = NOW() WHERE email = ?',
          [hashedPassword, email]
        );
      } else {
        await pool.query(
          'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
          [hashedPassword, email]
        );
      }

      // Supprimer tous les codes de réinitialisation pour cet email
      await pool.query(
        'DELETE FROM password_resets WHERE email = ?',
        [email]
      );

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      };

    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  }

  // Nettoyer les codes expirés (à appeler périodiquement)
  static async cleanupExpiredCodes() {
    try {
      const result = await pool.query(
        'DELETE FROM password_resets WHERE expires_at < NOW() OR created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)'
      );

      console.log(`Nettoyage: ${result.affectedRows} codes expirés supprimés`);
      return result.affectedRows;

    } catch (error) {
      console.error('Erreur lors du nettoyage des codes expirés:', error);
      throw error;
    }
  }
}

module.exports = PasswordResetService;