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
    // Get latest notification from Firestore
    const notificationSnapshot = await db.collection('fall_notifications')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    // Handle case when no notifications exist
    if (notificationSnapshot.empty) {
      return res.status(404).json({ error: 'No fall notifications found' });
    }

    // Extract notification data
    const notification = notificationSnapshot.docs[0].data();
    
    // Format response data
    // Status messages depend on fall detection status
    const response = {
      latitude: notification.latitude,
      longitude: notification.longitude,
      elderlyInfo: {
        name: notification.elderlyName,
        emergencyContact: {
          // Only show emergency contact status if fall detected
          callStatus: notification.fallStatus ? notification.callStatus : false,
          messageStatus: notification.fallStatus ? notification.messageStatus : false
        }
      },
      notificationStatus: {
        // Status messages based on fall detection
        call: notification.fallStatus ? "Emergency call has been made" : "No emergency call needed",
        message: notification.fallStatus ? "Emergency message has been sent" : "No emergency message needed"
      },
      fallDetectionStatus: {
        status: notification.fallStatus,
        detectionData: notification.detectionData,
        message: notification.fallStatus ? "Elderly person has fallen" : "Elderly person is safe",
        timestamp: notification.timestamp
      },
      timestamp: new Date().toISOString()
    };

    // Return formatted response
    res.json(response);

  } catch (error) {
    // Log and return error
    console.error('Error details:', error);
    res.status(500).json({ error: 'Error fetching fall notification: ' + error.message });
  }
});

// Export router
module.exports = router;
