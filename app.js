require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db/pool');
const initDb = require('./db/init');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
let server;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK' });
  } catch (err) {
    res.status(500).json({ status: 'DB_ERROR', message: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * from events');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

async function start() {
  await initDb();
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
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
