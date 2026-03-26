const PropertyService = require('../services/propertyService');

class PropertyController {
  static async createProperty(req, res) {
    try {
      const property = await PropertyService.createProperty(req.body);
      
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
      const properties = await PropertyService.getAllProperties();
      
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