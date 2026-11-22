const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const { connectDB, getDbStatus } = require('./config/db');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminCertificateRoutes = require('./routes/adminCertificateRoutes');
const adminHistoryRoutes = require('./routes/adminHistoryRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminSettingsRoutes = require('./routes/adminSettingsRoutes');
const publicVerificationRoutes = require('./routes/publicVerificationRoutes');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = config.frontendOrigin;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow explicitly configured origins, Render domains, and Vercel domains
    const isExplicit = allowedOrigins.some(o => o.toLowerCase() === cleanOrigin.toLowerCase());
    const isCloudHost = /\.onrender\.com$/i.test(cleanOrigin) || /\.vercel\.app$/i.test(cleanOrigin);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(cleanOrigin);

    if (isExplicit || isCloudHost || isLocalhost) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    skip: (req) => req.url === '/api/health'
  }));
}

// Global API rate limiting
app.use('/api/', apiLimiter);

// Root endpoint (for Render service status and deployment check)
app.get('/', (req, res) => {
  res.json({
    service: 'Code2Conquer Document Generator & Certificate API',
    status: 'ONLINE',
    version: '1.0.0',
    verificationPortal: config.publicVerifyBaseUrl,
    endpoints: {
      health: '/api/health',
      verify: '/api/certificates/verify/:certificateId'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: 'Code2Conquer API is running, but database is disconnected',
      database: 'disconnected',
      dbName: dbStatus.database
    });
  }
  return res.status(200).json({
    success: true,
    message: 'Code2Conquer API is running',
    database: 'connected',
    dbName: dbStatus.database
  });
});

// Mount Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/certificates', adminCertificateRoutes);
app.use('/api/admin/history', adminHistoryRoutes);
app.use('/api/admin/offer-letters', adminHistoryRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

// Public Certificate Verification Endpoint (Rate-limited, strictly filtered)
app.use('/api/certificates', publicVerificationRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.url}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled server error:', err.stack || err.message);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access token.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

// Start Server and establish required database connection
const startServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    logger.error('Fatal: Required database connection failed. Application startup aborted.');
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`=======================================================`);
    logger.info(`Code2Conquer Document Generator Backend API`);
    logger.info(`Running on port: ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/api/health`);
    logger.info(`Public Verify: http://localhost:${config.port}/api/certificates/verify/:id`);
    logger.info(`Allowed Origins: ${config.frontendOrigin.join(', ')}`);
    logger.info(`=======================================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Received shutdown signal, terminating server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

if (require.main === module) {
  startServer();
}

module.exports = app;
