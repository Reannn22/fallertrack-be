/**
 * Logger Configuration
 * Sets up application-wide logging middleware and error handlers
 */

// Import logging utilities
const { logError } = require('./error.logger');
const { logAccess } = require('./access.logger');

/**
 * Enable logging middleware for Express application
 * @param {Express} app - Express application instance
 */
const enableLogging = (app) => {
  // Add HTTP request logging middleware
  app.use(logAccess);

  // Add global error handling middleware
  app.use((error, req, res, next) => {
    // Log error with request context
    logError(error, {
      url: req.originalUrl,
      method: req.method
    });

    // Return standardized error response
    res.status(500).json({
      error: 'Internal server error',
      time: new Date().toISOString()
    });
  });
};

// Export configuration function
module.exports = {
  enableLogging
};
