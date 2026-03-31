const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const Client = require('../models/client.model');
const User = require('../models/user.model');

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

    const token = jwt.sign({ id: client.id, role: 'client' }, jwtSecret, { expiresIn: '24h' });

    return { client, token };
  }

  async registerAdmin(username, password, nom, prenom, email) {
    if (!username || !password || !nom || !prenom || !email) {
      throw new Error('Missing required fields');
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Vérifier si l'email existe déjà
    const { rows: existingEmailUsers } = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmailUsers.length > 0) {
      throw new Error('Email already exists');
    }

    const { rows: roles } = await pool.query('SELECT id FROM roles WHERE nom = ?', ['admin']);
    const adminRole = roles[0];
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      username, 
      password: hashedPassword, 
      nom, 
      prenom, 
      email,
      role_id: adminRole.id,
      status: 'pending' 
    });

    return user;
  }

  async login(loginId, password) {
    if (!loginId || !password) {
      throw new Error('Missing credentials');
    }

    // Attempt to find user by username OR email (Staff/Admin) first
    let user = await User.findByUsername(loginId);
    let isClient = false;

    // Si pas trouvé par username, chercher par email dans la table users
    if (!user) {
      const { rows: usersByEmail } = await pool.query(`
        SELECT u.*, r.nom as role_nom 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `, [loginId]);
      
      if (usersByEmail.length > 0) {
        user = usersByEmail[0];
      }
    }

    if (!user) {
      // Then attempt to find client by email
      user = await Client.findByEmail(loginId);
      isClient = true;
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw new Error('Invalid credentials');
    }

    // Check status for staff/admin users
    if (!isClient && user.status !== 'accepted') {
      if (user.status === 'pending') {
        throw new Error('Votre compte est en attente d\'approbation par un administrateur.');
      } else if (user.status === 'refused') {
        throw new Error('Votre demande d\'accès a été refusée.');
      }
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET in environment');
    }

    const role = isClient ? 'client' : user.role_nom;
    const token = jwt.sign({ id: user.id, role }, jwtSecret, { expiresIn: '24h' });

    const initials = `${(user.prenom || '').substring(0, 2)}${(user.nom || '').substring(0, 2)}`.toUpperCase();

    return {
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email || null,
        username: user.username || null,
        role: role,
        initials
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
