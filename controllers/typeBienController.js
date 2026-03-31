const typeBienService = require('../services/typeBienService');

class TypeBienController {
  async createTypeBien(req, res) {
    try {
      const { nom, description } = req.body;
      const user_id = req.user?.role === 'superadmin' ? null : req.user?.id;
      const status = req.user?.role === 'superadmin' ? 'accepted' : 'pending';
      
      const typeBienData = {
        nom,
        description,
        user_id,
        status
      };
      
      const typeBien = await typeBienService.createTypeBien(typeBienData);
      res.status(201).json({
        success: true,
        data: typeBien
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllTypeBiens(req, res) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const typeBiens = await typeBienService.getAllTypeBiens(userId, userRole);
      res.json({
        success: true,
        data: typeBiens
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTypeBienById(req, res) {
    try {
      const { id } = req.params;
      const typeBien = await typeBienService.getTypeBienById(id);
      if (!typeBien) {
        return res.status(404).json({
          success: false,
          message: 'Type de bien not found'
        });
      }
      res.json({
        success: true,
        data: typeBien
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateTypeBien(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      console.log('🔍 DEBUG UPDATE TYPE BIEN:');
      console.log('- Type ID:', id);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);
      
      // Vérifier les permissions
      const existingTypeBien = await typeBienService.getTypeBienById(id);
      if (!existingTypeBien) {
        return res.status(404).json({
          success: false,
          message: 'Type de bien not found'
        });
      }
      
      console.log('- Existing Type user_id:', existingTypeBien?.user_id);
      console.log('- Permission check:', userRole === 'superadmin' ? 'SUPERADMIN - ALLOWED' : existingTypeBien?.user_id === userId ? 'OWNER - ALLOWED' : 'DENIED');
      
      // Seul le superadmin peut modifier tous les types, les admins ne peuvent modifier que les leurs
      if (userRole !== 'superadmin' && existingTypeBien.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de modifier ce type de bien'
        });
      }
      
      const typeBienData = req.body;
      const typeBien = await typeBienService.updateTypeBien(id, typeBienData);
      
      res.json({
        success: true,
        data: typeBien
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteTypeBien(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      console.log('🔍 DEBUG DELETE TYPE BIEN:');
      console.log('- Type ID:', id);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);
      
      // Vérifier les permissions
      const existingTypeBien = await typeBienService.getTypeBienById(id);
      if (!existingTypeBien) {
        return res.status(404).json({
          success: false,
          message: 'Type de bien not found'
        });
      }
      
      console.log('- Existing Type user_id:', existingTypeBien?.user_id);
      console.log('- Permission check:', userRole === 'superadmin' ? 'SUPERADMIN - ALLOWED' : existingTypeBien?.user_id === userId ? 'OWNER - ALLOWED' : 'DENIED');
      
      // Seul le superadmin peut supprimer tous les types, les admins ne peuvent supprimer que les leurs
      if (userRole !== 'superadmin' && existingTypeBien.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de supprimer ce type de bien'
        });
      }
      
      const typeBien = await typeBienService.deleteTypeBien(id);
      
      res.json({
        success: true,
        message: 'Type de bien deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TypeBienController();
