/**
 * Fall Notification Router
 * Handles retrieval of fall detection notifications and status
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * GET /api/fall-notification
 * Retrieve most recent fall detection status
 */
router.get('/', async (req, res) => {
  try {
    // Check if request has a body and reject if it does
    if (Object.keys(req.body).length !== 0) {
      return res.status(400).json({
        error: 'GET requests should not include a request body',
        timestamp: new Date().toISOString()
      });
    }

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Get latest notification status
    const latestStatus = await db.collection('fall_notifications')
      .doc('latest_status')
      .get();

    if (!latestStatus.exists) {
      return res.status(404).json({ 
        error: 'No fall notifications found',
        timestamp: new Date().toISOString()
      });
    }

    const notification = latestStatus.data();
    
    // Format response data
    const response = {
      latitude: notification.latitude,
      longitude: notification.longitude,
      elderlyInfo: {
        name: notification.elderlyName,
        emergencyContact: {
          callStatus: notification.callStatus,
          messageStatus: notification.messageStatus
        }
      },
      notificationStatus: {
        call: notification.callStatus ? "Emergency call required" : "No emergency call needed",
        message: notification.messageStatus ? "Emergency message required" : "No emergency message needed"
      },
      fallDetectionStatus: {
        status: notification.fallStatus,
        detectionData: notification.detectionData,
        message: notification.fallStatus ? "Elderly person has fallen" : "Elderly person is safe",
        timestamp: notification.timestamp
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    // Log and return error
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error fetching fall notification: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add OPTIONS handler for CORS preflight
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send();
});

// Export router
module.exports = router;
