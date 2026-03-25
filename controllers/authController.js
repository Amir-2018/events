const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const { nom, prenom, email, tel, password } = req.body;
      const result = await authService.register(nom, prenom, email, tel, password);
      res.status(201).json({ 
        success: true, 
        message: 'Client registered successfully',
        data: result 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ 
        success: true, 
        message: 'Login successful',
        data: result 
      });
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new AuthController();
