const admin = require('../../config/firebase');
const db = admin.firestore();

const logAccess = async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Log after response is sent
    res.on('finish', async () => {
      const accessLog = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: Date.now() - startTime,
        userAgent: req.get('user-agent'),
        ip: req.ip,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('access_logs').add(accessLog);
    });

    next();
  } catch (error) {
    console.error('Access logging failed:', error);
    next();
  }
};

module.exports = {
  logAccess
};
