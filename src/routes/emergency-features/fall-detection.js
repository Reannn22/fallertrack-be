const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

router.post('/', async (req, res) => {
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

    res.json({
      status: hasFallen,
      message: hasFallen ? "Elderly person has fallen" : "Elderly person is safe",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
