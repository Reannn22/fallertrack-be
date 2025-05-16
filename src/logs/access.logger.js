/**
 * Access Logger Middleware
 * Logs HTTP request details and response times to Firestore
 */

// Import Firebase Admin and get Firestore instance
const admin = require('../../config/firebase');
const db = admin.firestore();

/**
 * Log API access details
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const logAccess = async (req, res, next) => {
  try {
    // Record request start time
    const startTime = Date.now();

    // Setup logging after response is sent to client
    res.on('finish', async () => {
      // Prepare access log entry
      const accessLog = {
        method: req.method,        // HTTP method used
        url: req.originalUrl,      // Requested URL path
        status: res.statusCode,    // HTTP response status
        responseTime: Date.now() - startTime,  // Request duration in ms
        userAgent: req.get('user-agent'),     // Client info
        ip: req.ip,               // Client IP address
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      // Store log in Firestore
      await db.collection('access_logs').add(accessLog);
    });

    // Continue to next middleware
    next();
  } catch (error) {
    // Log error but don't block request processing
    console.error('Access logging failed:', error);
    next();
  }
};

// Export middleware
module.exports = {
  logAccess
};
