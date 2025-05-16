/**
 * Emergency Alert Router
 * Handles emergency SOS alerts and status checks
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * POST /api/alert
 * Create new emergency alert
 */
router.post('/', async (req, res) => {
  try {
    // Extract SOS status from request body
    const { sos } = req.body;

    // Validate SOS parameter is boolean
    if (typeof sos !== 'boolean') {
      return res.status(400).json({
        error: 'SOS must be boolean (true/false)',
        time: new Date().toISOString()
      });
    }

    // Store alert in Firestore with timestamp
    await db.collection('emergency_alerts').add({
      sos,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Return success response
    res.json({
      sos: sos,  // Return actual input value
      time: new Date().toISOString()
    });

  } catch (error) {
    // Log and return error
    console.error('Error:', error);
    res.status(500).json({
      error: error.message,
      time: new Date().toISOString()
    });
  }
});

/**
 * GET /api/alert
 * Retrieve most recent alert status
 */
router.get('/', async (req, res) => {
  try {
    // Get latest alert from Firestore
    const snapshot = await db.collection('emergency_alerts')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    // Handle case when no alerts exist
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No alerts found',
        time: new Date().toISOString()
      });
    }

    // Return latest alert status
    const alert = snapshot.docs[0].data();
    res.json({
      sos: alert.sos,
      time: new Date().toISOString()
    });

  } catch (error) {
    // Log and return error
    console.error('Error:', error);
    res.status(500).json({
      error: error.message,
      time: new Date().toISOString()
    });
  }
});

// Export router
module.exports = router;
