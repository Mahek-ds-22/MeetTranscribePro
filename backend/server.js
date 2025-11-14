const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database');
const errorHandler = require('./middleware/errorHandler');

const profileRoutes = require('./routes/profiles');
const transcriptRoutes = require('./routes/transcripts');
const attendeesRoutes = require('./routes/attendees');
const tasksRoutes = require('./routes/tasks');
const summaryRoutes = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/attendees', attendeesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/summary', summaryRoutes);

// Frontend index fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handler
app.use(errorHandler);

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
module.exports = app;
