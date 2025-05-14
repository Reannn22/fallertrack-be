const express = require('express');
const router = express.Router();
const navigationController = require('../../controllers/navigation.controller');
const admin = require('../../config/firebase');

const db = admin.firestore();

// Wrap the controller with logging
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const originalJson = res.json;
  
  // Override res.json to capture response
  res.json = function(data) {
    db.collection('logs').add({
      type: 'navigation',
      endpoint: '/api/navigation',
      method: 'POST',
      requestBody: req.body,
      responseBody: data,
      status: 'success',
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    originalJson.call(this, data);
  };
  
  try {
    await navigationController.computeRoute(req, res);
  } catch (error) {
    await db.collection('logs').add({
      type: 'navigation',
      endpoint: '/api/navigation',
      method: 'POST',
      requestBody: req.body,
      responseBody: { error: error.message },
      status: 'error',
      error: error.message,
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    throw error;
  }
});

module.exports = router;
