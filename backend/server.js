const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();

// Liste des origines autorisées
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  // Production - add from environment variable
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  // Default production domains
  'https://africavet.com',
  'https://www.africavet.com',
  'https://admin.africavet.com',
  'https://manager.africavet.com',
  'http://www.africavet.com',
  'http://manager.africavet.com',
  // Temporary IP-based access
  'http://83.228.241.6',
  'http://83.228.241.6:8080'
];

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Configuration CORS dynamique
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// ROUTES
// =====================================================

// Auth & Users
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/permissions', require('./routes/permissions'));

// Content
app.use('/api/posts', require('./routes/posts'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/media', require('./routes/media'));
app.use('/api/comments', require('./routes/comments'));

// Structure
app.use('/api/menus', require('./routes/menus'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/sliders', require('./routes/sliders'));
app.use('/api/homepage', require('./routes/homepage'));

// Appearance
app.use('/api/themes', require('./routes/themes'));
app.use('/api/settings', require('./routes/settings'));

// Dashboard
app.use('/api/dashboard', require('./routes/dashboard'));

// Analytics
app.use('/api/analytics', require('./routes/analytics'));

// OHWR-Mapping
app.use('/api/mapping', require('./routes/mapping'));

// Ads
app.use('/api/ads', require('./routes/ads'));

// E-Learning
app.use('/api/elearning', require('./routes/elearning'));

// Upload
app.use('/api/upload', require('./routes/upload'));

// COHRM - Cameroon One Health Rumor Management (Legacy - kept for backward compatibility)
app.use('/api/cohrm', require('./routes/cohrm'));

// VET Alert - Veterinary Alert System (replaces COHRM)
app.use('/api/vet-alerts', require('./routes/vetAlerts'));

// Opportunities - Jobs, Tenders, Markets
app.use('/api/opportunities', require('./routes/opportunities'));

// Newsletter
app.use('/api/newsletter', require('./routes/newsletter'));

// Notifications
app.use('/api/notifications', require('./routes/notifications'));

// Document Manager
app.use('/api/documents', require('./routes/documents'));

// Contact
app.use('/api/contact', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AfricaVET CMS Server running on port ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log(`💾 Health: http://localhost:${PORT}/api/health`);

  // Start newsletter scheduler (check every minute for scheduled campaigns)
  const newsletterEmailService = require('./services/newsletterEmailService');
  setInterval(async () => {
    try {
      const count = await newsletterEmailService.processScheduledCampaigns();
      if (count > 0) {
        console.log(`📧 Started ${count} scheduled newsletter(s)`);
      }
    } catch (error) {
      console.error('Newsletter scheduler error:', error);
    }
  }, 60000); // Check every minute
  console.log(`📧 Newsletter scheduler started`);
});

module.exports = app;
// force reload Thu, Jan  8, 2026 12:56:20 AM

// trigger restart
