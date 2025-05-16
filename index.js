const express = require('express'); 
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const getAccessToken = require('./config/getAccessToken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });

// Import initialized Firebase
const admin = require('./config/firebase');
const homeRoutes = require('./src/routes/home-management/home');
const currentDistanceRoutes = require('./src/routes/navigation-and-tracking/current-distance');
const navigationRoutes = require('./src/routes/navigation-and-tracking/navigation');
const textToSpeechRoutes = require('./src/routes/navigation-and-tracking/text-to-speech');
const speechRoutes = require('./src/routes/navigation-and-tracking/speech');
const fallDetectionRoutes = require('./src/routes/emergency-features/fall-detection');
const fallNotificationRoutes = require('./src/routes/emergency-features/fall-notification');
const alertRoutes = require('./src/routes/emergency-features/alert');
const sosLocationRoutes = require('./src/routes/emergency-features/sos-location');
const timeLengthRoutes = require('./src/routes/analytics-and-logs/time-length');
const logHistoryRoutes = require('./src/routes/analytics-and-logs/log-history');
const summarizeRoutes = require('./src/routes/analytics-and-logs/summarize');
const { enableLogging } = require('./src/logs/logger.config');

// Remove Firebase initialization code and just get Firestore instance
const db = admin.firestore();

// Inisialisasi Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'credentials/gesp-459003-aabf1ee34b71.json'),
});
const bucket = storage.bucket('fallertrack-navigation-sound');

const app = express();

// Import middleware
const corsMiddleware = require('./src/middleware/cors');
const basicMiddleware = require('./src/middleware/basic');

// Apply middleware
app.use(corsMiddleware);
app.use(basicMiddleware);

// Enable logging
enableLogging(app);

// Update express settings to prettify JSON responses
app.set('json spaces', 2);

// Enable proxy support and handle HTTPS redirection
app.enable('trust proxy');
app.use((req, res, next) => {
  if (req.secure || process.env.NODE_ENV !== 'production') {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

// Use routes
app.use('/api/home', homeRoutes);
app.use('/api/current-distance', currentDistanceRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/fall-detection', fallDetectionRoutes);
app.use('/api/fall-notification', fallNotificationRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/sos-location', sosLocationRoutes);
app.use('/api/time-length', timeLengthRoutes);
app.use('/api/log-history', logHistoryRoutes);
app.use('/api/summarize', summarizeRoutes);

// Export the Express API
module.exports = app;

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 404 handler (make sure this is the last middleware)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
