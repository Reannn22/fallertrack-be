/**
 * Fall Detection Router
 * Handles fall detection and emergency notifications
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * POST /
 * Process accelerometer and gyroscope data for fall detection
 * Thresholds:
 * - Acceleration > 20 m/s²
 * - Angular velocity > 100 rad/s
 */
router.post('/', async (req, res) => {
  try {
    // Extract sensor data and timestamp
    const { accelero, gyro } = req.body;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // Check fall detection thresholds
    const hasFallen = accelero[0] > 20 || Math.abs(gyro[0]) > 100;
    
    // Store detection data
    await db.collection('fall_detections').add({
      accelero,
      gyro,
      status: hasFallen,
      timestamp
    });

    // Create emergency notification if fall detected
    if (hasFallen) {
      const notificationData = {
        latitude: -5.340154, // Replace with actual location
        longitude: 105.326813,
        elderlyName: "Mrs. Edith Thompson",
        callStatus: true,
        messageStatus: true,
        fallStatus: true,
        timestamp
      };

      await db.collection('fall_notifications').add(notificationData);
    }

    // Return detection status
    res.json({
      status: hasFallen,
      message: hasFallen ? "Elderly person has fallen" : "Elderly person is safe",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Log and return error
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export router
module.exports = router;