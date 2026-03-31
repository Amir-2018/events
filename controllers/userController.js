const User = require('../models/user.model');
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createUser(req, res) {
    try {
      const { username, password, nom, prenom, role_id } = req.body;
      
      if (!username || !password || !role_id) {
        return res.status(400).json({ success: false, message: 'Username, password and role are required' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const user = await User.create({ 
        username, 
        password: hashedPassword, 
        nom, 
        prenom, 
        role_id,
        status: req.body.status || 'pending'
      });

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, nom, prenom, role_id, status } = req.body;
      
      const user = await User.update(id, { username, nom, prenom, role_id, status });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'accepted', 'refused'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status invalide' });
      }

      const result = await User.updateStatus(id, status);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      if (id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte.' });
      }

      await User.delete(id);
      res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRoles(req, res) {
    try {
      const result = await pool.query('SELECT * FROM roles ORDER BY nom ASC');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
