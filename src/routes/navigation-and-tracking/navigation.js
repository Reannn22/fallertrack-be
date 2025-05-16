/**
 * Navigation Router
 * Handles route computation and activity logging
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const navigationController = require('../../controllers/navigation.controller');
const admin = require('../../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * POST /api/navigation
 * Generate navigation route with activity logging wrapper
 */
router.post('/', async (req, res) => {
  // Track request processing time
  const startTime = Date.now();
  
  // Store original json method
  const originalJson = res.json;
  
  /**
   * Override response json method to add logging
   * Captures all successful responses before they're sent
   */
  res.json = function(data) {
    // Log successful navigation request
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
    
    // Call original json method
    originalJson.call(this, data);
  };
  
  try {
    // Process navigation request
    await navigationController.computeRoute(req, res);
  } catch (error) {
    // Log failed navigation request
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

// Export router
module.exports = router;
