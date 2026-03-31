const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configuration Gmail avec App Password
    // IMPORTANT: Pour Gmail, vous devez:
    // 1. Activer l'authentification à 2 facteurs
    // 2. Générer un "App Password" dans les paramètres Google
    // 3. Utiliser cet App Password au lieu du mot de passe normal
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'amir.maalaoui27@gmail.com',
        pass: process.env.EMAIL_PASS || 'qnbr yjnz owep fiad' // App Password Gmail
      }
    });

    // Configuration alternative pour test (utilise un service de test)
    this.testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // Créer un transporteur de test Ethereal
  async createTestTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (error) {
      console.error('Erreur création transporteur test:', error);
      return null;
    }
  }

  // Template pour changement de statut
  getStatusChangeTemplate(reclamation, newStatus) {
    const statusMessages = {
      'En cours': {
        subject: '🔄 Votre réclamation est en cours de traitement',
        title: 'Réclamation en cours de traitement',
        message: 'Nous avons commencé à traiter votre réclamation. Notre équipe examine votre demande et vous tiendra informé des prochaines étapes.',
        color: '#3B82F6'
      },
      'Résolu': {
        subject: '✅ Votre réclamation a été résolue',
        title: 'Réclamation résolue avec succès',
        message: 'Bonne nouvelle ! Votre réclamation a été résolue. Nous espérons que notre solution répond à vos attentes. N\'hésitez pas à nous contacter si vous avez d\'autres questions.',
        color: '#10B981'
      },
      'Terminé': {
        subject: '✅ Votre réclamation est terminée',
        title: 'Réclamation terminée',
        message: 'Votre réclamation a été traitée et est maintenant terminée. Merci de nous avoir fait confiance pour résoudre votre problème.',
        color: '#059669'
      },
      'Rejeté': {
        subject: '❌ Mise à jour concernant votre réclamation',
        title: 'Réclamation non retenue',
        message: 'Après examen, nous ne pouvons pas donner suite à votre réclamation. Si vous souhaitez plus d\'informations, n\'hésitez pas à nous contacter directement.',
        color: '#EF4444'
      },
      'En attente': {
        subject: '⏳ Votre réclamation est en attente',
        title: 'Réclamation remise en attente',
        message: 'Votre réclamation a été remise en attente. Nous reviendrons vers vous dès que possible avec une mise à jour.',
        color: '#F59E0B'
      }
    };

    const statusInfo = statusMessages[newStatus] || statusMessages['En attente'];

    return {
      subject: statusInfo.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">EventPro</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Gestion des réclamations</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">${statusInfo.title}</h2>
              
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Détails de votre réclamation :</h3>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Sujet :</strong> ${reclamation.sujet}</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Statut :</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus}</span></p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Date de création :</strong> ${new Date(reclamation.created_at).toLocaleDateString('fr-FR')}</p>
              </div>

              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">${statusInfo.message}</p>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>Besoin d'aide ?</strong><br>
                  N'hésitez pas à nous contacter si vous avez des questions concernant votre réclamation.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Cordialement,<br>
                <strong>L'équipe EventPro</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} EventPro. Tous droits réservés.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Envoyer un email de changement de statut
  async sendStatusChangeEmail(reclamation, newStatus, clientEmail) {
    try {
      if (!clientEmail) {
        console.log('Aucun email client fourni, notification non envoyée');
        return { success: false, message: 'Aucun email client' };
      }

      const template = this.getStatusChangeTemplate(reclamation, newStatus);

      // Essayer d'abord avec Gmail, puis avec le transporteur de test
      let transporter = this.transporter;
      let isTestMode = false;

      try {
        // Tester la connexion Gmail
        await this.transporter.verify();
      } catch (gmailError) {
        console.log('Gmail non disponible, utilisation du mode test...');
        transporter = await this.createTestTransporter();
        isTestMode = true;
        
        if (!transporter) {
          throw new Error('Impossible de créer un transporteur email');
        }
      }

      const mailOptions = {
        from: {
          name: 'EventPro - Réclamations',
          address: isTestMode ? 'test@eventpro.com' : 'amir.maalaoui27@gmail.com'
        },
        to: clientEmail,
        subject: template.subject,
        html: template.html
      };

      const result = await transporter.sendMail(mailOptions);
      
      if (isTestMode) {
        console.log('📧 Email de test envoyé!');
        console.log('🔗 Aperçu:', nodemailer.getTestMessageUrl(result));
      } else {
        console.log('📧 Email Gmail envoyé avec succès:', result.messageId);
      }
      
      return { 
        success: true, 
        messageId: result.messageId,
        testUrl: isTestMode ? nodemailer.getTestMessageUrl(result) : null,
        message: isTestMode ? 'Email de test envoyé (voir URL)' : 'Email envoyé avec succès'
      };

    } catch (error) {
      console.error('Erreur envoi email:', error.message);
      return { 
        success: false, 
        error: error.message,
        message: 'Erreur lors de l\'envoi de l\'email'
      };
    }
  }
  // Méthode générique pour envoyer des emails
  async sendEmail(to, subject, textContent, htmlContent) {
    try {
      if (!to) {
        console.log('Aucun destinataire fourni, email non envoyé');
        return { success: false, message: 'Aucun destinataire' };
      }

      // Essayer d'abord avec Gmail, puis avec le transporteur de test
      let transporter = this.transporter;
      let isTestMode = false;

      try {
        // Tester la connexion Gmail
        await this.transporter.verify();
      } catch (gmailError) {
        console.log('Gmail non disponible, utilisation du mode test...');
        transporter = await this.createTestTransporter();
        isTestMode = true;

        if (!transporter) {
          throw new Error('Impossible de créer un transporteur email');
        }
      }

      const mailOptions = {
        from: {
          name: 'EventPro',
          address: isTestMode ? 'test@eventpro.com' : 'amir.maalaoui27@gmail.com'
        },
        to: to,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await transporter.sendMail(mailOptions);

      if (isTestMode) {
        console.log('📧 Email de test envoyé!');
        console.log('🔗 Aperçu:', nodemailer.getTestMessageUrl(result));
      } else {
        console.log('📧 Email Gmail envoyé avec succès:', result.messageId);
      }

      return {
        success: true,
        messageId: result.messageId,
        testUrl: isTestMode ? nodemailer.getTestMessageUrl(result) : null,
        message: isTestMode ? 'Email de test envoyé (voir URL)' : 'Email envoyé avec succès'
      };

    } catch (error) {
      console.error('Erreur envoi email:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'envoi de l\'email'
      };
    }
  }

  // Envoyer un code de réinitialisation de mot de passe
  async sendPasswordResetCode(email, code, prenom, nom) {
    const subject = 'Code de réinitialisation de mot de passe - EventPro';
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
            <p>EventPro - Gestion d'événements</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${prenom} ${nom},</h2>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur EventPro.</p>
            
            <p>Voici votre code de vérification :</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
              <p><small>Ce code est valide pendant 15 minutes</small></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul>
                <li>Ce code expire dans 15 minutes</li>
                <li>Ne partagez jamais ce code avec personne</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
              </ul>
            </div>
            
            <p>Pour continuer, saisissez ce code sur la page de réinitialisation de mot de passe.</p>
            
            <p>Cordialement,<br>L'équipe EventPro</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>EventPro © ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
      Réinitialisation de mot de passe - EventPro
      
      Bonjour ${prenom} ${nom},
      
      Vous avez demandé la réinitialisation de votre mot de passe sur EventPro.
      
      Votre code de vérification : ${code}
      
      Ce code est valide pendant 15 minutes.
      
      IMPORTANT :
      - Ne partagez jamais ce code avec personne
      - Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
      
      Pour continuer, saisissez ce code sur la page de réinitialisation de mot de passe.
      
      Cordialement,
      L'équipe EventPro
    `;

    return this.sendEmail(email, subject, textTemplate, htmlTemplate);
  }

  // Tester la configuration email
  async testEmailConfiguration() {
    try {
      console.log('Test de la configuration Gmail...');
      await this.transporter.verify();
      console.log('✅ Configuration Gmail valide');
      return { success: true, message: 'Configuration Gmail valide' };
    } catch (error) {
      console.log('⚠️  Gmail non disponible:', error.message);
      console.log('🔄 Test du transporteur de secours...');
      
      try {
        const testTransporter = await this.createTestTransporter();
        if (testTransporter) {
          await testTransporter.verify();
          console.log('✅ Transporteur de test disponible');
          return { success: true, message: 'Mode test disponible' };
        }
      } catch (testError) {
        console.error('❌ Erreur transporteur de test:', testError.message);
      }
      
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();