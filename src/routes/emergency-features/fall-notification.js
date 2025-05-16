const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

const db = admin.firestore();

router.get('/', async (req, res) => {
  try {
    const notificationSnapshot = await db.collection('fall_notifications')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (notificationSnapshot.empty) {
      return res.status(404).json({ error: 'No fall notifications found' });
    }

    const notification = notificationSnapshot.docs[0].data();
    
    // Only show emergency status if fall was detected
    const response = {
      latitude: notification.latitude,
      longitude: notification.longitude,
      elderlyInfo: {
        name: notification.elderlyName,
        emergencyContact: {
          callStatus: notification.fallStatus ? notification.callStatus : false,
          messageStatus: notification.fallStatus ? notification.messageStatus : false
        }
      },
      notificationStatus: {
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

    res.json(response);

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'Error fetching fall notification: ' + error.message });
  }
});

module.exports = router;
