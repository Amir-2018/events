const PropertyService = require('../services/propertyService');

class PropertyController {
  static async createProperty(req, res) {
    try {
      const propertyData = {
        ...req.body,
        user_id: req.user?.role === 'superadmin' ? null : req.user?.id,
        status: req.user?.role === 'superadmin' ? 'accepted' : 'pending'
      };
      
      const property = await PropertyService.createProperty(propertyData);
      
      res.status(201).json({
        success: true,
        message: 'Bien créé avec succès',
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la création du bien:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getProperties(req, res) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const properties = await PropertyService.getAllProperties(userId, userRole);
      
      res.json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des biens:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await PropertyService.getPropertyById(id);
      
      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du bien:', error);
      const status = error.message === 'Bien non trouvé' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      console.log('🔍 DEBUG UPDATE PROPERTY:');
      console.log('- Property ID:', id);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);
      
      // Vérifier les permissions
      const existingProperty = await PropertyService.getPropertyById(id);
      console.log('- Existing Property user_id:', existingProperty?.user_id);
      console.log('- Permission check:', userRole === 'superadmin' ? 'SUPERADMIN - ALLOWED' : existingProperty?.user_id === userId ? 'OWNER - ALLOWED' : 'DENIED');
      
      // Seul le superadmin peut modifier tous les biens, les admins ne peuvent modifier que les leurs
      if (userRole !== 'superadmin' && existingProperty.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de modifier ce bien'
        });
      }
      
      const property = await PropertyService.updateProperty(id, req.body);
      
      res.json({
        success: true,
        message: 'Bien mis à jour avec succès',
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bien:', error);
      const status = error.message === 'Bien non trouvé' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      console.log('🔍 DEBUG DELETE PROPERTY:');
      console.log('- Property ID:', id);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);
      
      // Vérifier les permissions
      const existingProperty = await PropertyService.getPropertyById(id);
      console.log('- Existing Property user_id:', existingProperty?.user_id);
      console.log('- Permission check:', userRole === 'superadmin' ? 'SUPERADMIN - ALLOWED' : existingProperty?.user_id === userId ? 'OWNER - ALLOWED' : 'DENIED');
      
      // Seul le superadmin peut supprimer tous les biens, les admins ne peuvent supprimer que les leurs
      if (userRole !== 'superadmin' && existingProperty.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de supprimer ce bien'
        });
      }
      
      await PropertyService.deleteProperty(id);
      
      res.json({
        success: true,
        message: 'Bien supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du bien:', error);
      const status = error.message === 'Bien non trouvé' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = PropertyController;