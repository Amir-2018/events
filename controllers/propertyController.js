const Property = require('../models/property.model');

class PropertyController {
  static async createProperty(req, res) {
    try {
      const property = await Property.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Bien créé avec succès',
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la création du bien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du bien',
        error: error.message
      });
    }
  }

  static async getProperties(req, res) {
    try {
      const properties = await Property.getAll();
      
      res.json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des biens:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des biens',
        error: error.message
      });
    }
  }

  static async getProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await Property.getById(id);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Bien non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du bien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du bien',
        error: error.message
      });
    }
  }

  static async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await Property.update(id, req.body);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Bien non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Bien mis à jour avec succès',
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du bien',
        error: error.message
      });
    }
  }

  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await Property.delete(id);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Bien non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Bien supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du bien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du bien',
        error: error.message
      });
    }
  }
}

module.exports = PropertyController;