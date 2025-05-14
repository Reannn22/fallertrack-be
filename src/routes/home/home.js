const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

// Save home location with timestamp
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, radius, location } = req.body;

    if (!latitude || !longitude || !radius || !location) {
      return res.status(400).json({
        error: 'Latitude, longitude, radius, and location name are required'
      });
    }

    // Save home location with timestamp for time tracking
    const timestamp = admin.firestore.Timestamp.now();
    await db.collection('homes').doc('current').set({
      latitude,
      longitude,
      radius,
      nama: location,
      timestamp: timestamp,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      time: timestamp.toDate().toISOString()
    });

    res.json({
      latitude,
      longitude,
      radius,
      nama: location,
      time: timestamp.toDate().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      error: 'Error saving home location: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

module.exports = router;