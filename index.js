/**
 * Main application entry point
 * FallerTrack Backend API Server
 */

// Core dependencies
const express = require('express'); 
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const getAccessToken = require('./config/getAccessToken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });

/**
 * Firebase & Database Setup
 */
const admin = require('./config/firebase');
const db = admin.firestore();

/**
 * Route Imports
 */
// Home Management
const homeRoutes = require('./src/routes/home-management/home');

// Navigation & Tracking
const currentDistanceRoutes = require('./src/routes/navigation-and-tracking/current-distance');
const navigationRoutes = require('./src/routes/navigation-and-tracking/navigation');
const textToSpeechRoutes = require('./src/routes/navigation-and-tracking/text-to-speech');
const speechRoutes = require('./src/routes/navigation-and-tracking/speech');

// Emergency Features
const fallDetectionRoutes = require('./src/routes/emergency-features/fall-detection');
const fallNotificationRoutes = require('./src/routes/emergency-features/fall-notification');
const alertRoutes = require('./src/routes/emergency-features/alert');
const sosLocationRoutes = require('./src/routes/emergency-features/sos-location');

// Analytics & Logging
const timeLengthRoutes = require('./src/routes/analytics-and-logs/time-length');
const logHistoryRoutes = require('./src/routes/analytics-and-logs/log-history');
const summarizeRoutes = require('./src/routes/analytics-and-logs/summarize');
const { enableLogging } = require('./src/logs/logger.config');

/**
 * Google Cloud Storage Setup
 * Used for storing navigation audio files
 */
const storage = new Storage({
  keyFilename: path.join(__dirname, 'credentials/gesp-459003-aabf1ee34b71.json'),
});
const bucket = storage.bucket('fallertrack-navigation-sound');

/**
 * Express App Configuration
 */
const app = express();

// Middleware imports
const corsMiddleware = require('./src/middleware/cors');
const basicMiddleware = require('./src/middleware/basic');

// Apply middleware
app.use(corsMiddleware);
app.use(basicMiddleware);
enableLogging(app);

/**
 * Server Settings
 */
// Prettify JSON responses
app.set('json spaces', 2);

// Security: Enable proxy support and HTTPS redirection
app.enable('trust proxy');
app.use((req, res, next) => {
  if (req.secure || process.env.NODE_ENV !== 'production') {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

/**
 * API Routes Registration
 */
// Home Management
app.use('/api/home', homeRoutes);

// Navigation & Tracking
app.use('/api/current-distance', currentDistanceRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);
app.use('/api/speech', speechRoutes);

// Emergency Features
app.use('/api/fall-detection', fallDetectionRoutes);
app.use('/api/fall-notification', fallNotificationRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/sos-location', sosLocationRoutes);

// Analytics & Logging
app.use('/api/time-length', timeLengthRoutes);
app.use('/api/log-history', logHistoryRoutes);
app.use('/api/summarize', summarizeRoutes);

/**
 * Server Initialization
 */
// Export for testing/external use
module.exports = app;

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * Error Handling
 */
// 404 handler (must be last middleware)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
