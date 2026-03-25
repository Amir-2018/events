const Client = require('../models/client.model');
const jwt = require('jsonwebtoken');
const AuthToken = require('../models/auth.model'); 

class AuthService {
  async register(nom, prenom, email, tel, password) {
    try {
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        throw new Error('Client already exists');
      }

      const client = new Client({ nom, prenom, email, tel, password });
      await client.save();

      const token = jwt.sign(
        { id: client._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { 
        client: { id: client._id, nom, prenom, email, tel },
        token 
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const client = await Client.findOne({ email });
      if (!client || !(await client.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: client._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { 
        client: { id: client._id, nom: client.nom, prenom: client.prenom, email, tel: client.tel },
        token 
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
