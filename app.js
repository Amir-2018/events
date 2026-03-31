require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db/pool');
const initDb = require('./db/init');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const eventTypeRoutes = require('./routes/eventTypeRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const typeBienRoutes = require('./routes/typeBienRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const reclamationRoutes = require('./routes/reclamationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
let server;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK' });
  } catch (err) {
    res.status(500).json({ status: 'DB_ERROR', message: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    routes: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      events: 'GET /api/events (Bearer token)',
      registerToEvent: 'POST /api/events/:eventId/register (Bearer token)',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', uploadRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/type-biens', typeBienRoutes);
app.use('/api', userRoutes);
app.use('/api', reclamationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api', ticketRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

async function start() {
  await initDb();
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT} and http://192.168.43.219:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server');
  if (!server) process.exit(0);

  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
});
