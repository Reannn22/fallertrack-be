const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { accelero, gyro } = req.body;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // Fall detection logic
    const hasFallen = accelero[0] > 20 || Math.abs(gyro[0]) > 100;
    
    // Store fall detection status
    await db.collection('fall_detections').add({
      accelero,
      gyro,
      status: hasFallen,
      timestamp
    });

    // If fall detected, create/update notification
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

    const response = {
      accelero,      // Add accelero from input
      gyro,          // Add gyro from input
      status: hasFallen,
      message: hasFallen ? "Elderly person has fallen" : "Elderly person is safe",
      timestamp: new Date().toISOString()
    };

    // Add logging with response
    await db.collection('logs').add({
      type: 'fall-detection',
      endpoint: '/api/fall-detection',
      method: 'POST',
      requestBody: { accelero, gyro },
      responseBody: response,
      detectedFall: hasFallen,
      status: 'success',
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json(response);

  } catch (error) {
    // Log error
    await db.collection('logs').add({
      type: 'fall-detection',
      endpoint: '/api/fall-detection',
      method: 'POST',
      requestBody: req.body,
      status: 'error',
      error: error.message,
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
