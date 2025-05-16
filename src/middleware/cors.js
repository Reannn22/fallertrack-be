/**
 * CORS Middleware Configuration
 * Handles Cross-Origin Resource Sharing settings
 */

// Import CORS package
const cors = require('cors');

/**
 * Configure CORS middleware with settings:
 * - Allow all origins (*)
 * - Allow specified HTTP methods
 * - Allow Content-Type and Authorization headers
 */
const corsMiddleware = cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
});

// Export configured middleware
module.exports = corsMiddleware;
