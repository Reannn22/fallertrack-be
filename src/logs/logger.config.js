const { logError } = require('./error.logger');
const { logAccess } = require('./access.logger');

const enableLogging = (app) => {
  // Add access logging middleware
  app.use(logAccess);

  // Add global error handler
  app.use((error, req, res, next) => {
    logError(error, {
      url: req.originalUrl,
      method: req.method
    });

    res.status(500).json({
      error: 'Internal server error',
      time: new Date().toISOString()
    });
  });
};

module.exports = {
  enableLogging
};
