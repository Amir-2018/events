const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Client = require('../models/client.model');

class AuthService {
  async register(nom, prenom, email, tel, password) {
    if (!nom || !prenom || !email || !tel || !password) {
      throw new Error('Missing required fields');
    }

    const existingClient = await Client.findByEmail(email);
    if (existingClient) {
      throw new Error('Client already exists');
    }

    // Store a bcrypt hash in the `password` column.
    const passwordHash = await bcrypt.hash(password, 12);
    const client = await Client.create({ nom, prenom, email, tel, password: passwordHash });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET in environment');
    }

    const token = jwt.sign({ id: client.id }, jwtSecret, { expiresIn: '24h' });

    return { client, token };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Missing email or password');
    }

    const client = await Client.findByEmail(email);
    if (!client) {
      throw new Error('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(password, client.password);
    if (!passwordOk) {
      throw new Error('Invalid credentials');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET in environment');
    }

    const token = jwt.sign({ id: client.id }, jwtSecret, { expiresIn: '24h' });

    return {
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        tel: client.tel,
      },
      token,
    };
  }
  async getUserById(id) {
    const client = await Client.getById(id);
    if (!client) {
      throw new Error('User not found');
    }
    return client;
  }
}

module.exports = new AuthService();
