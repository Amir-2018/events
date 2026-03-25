require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add cors for testing
const { Pool } = require('pg'); // PostgreSQL client
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Routes with dependency injection via imports (singletons for loose coupling)
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);

const {PGHOST, PGDATABASE, PGUSER, PGPASSWORD} = process.env; 
const  pool  = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true
  }
});


app.get('/', async (req,res) => {
    const client  = await pool.connect()

    try {
        const result = await client.query('SELECT * from events');
        res.json(result.rows);
    }catch (err) {
        console.error(err);
    }finally {
        client.release();
    }
    res.status(404)
  
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Copy .env.example to .env and update MONGO_URI & JWT_SECRET`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server');
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
