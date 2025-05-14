const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { sos } = req.body;

    // Validate sos is boolean
    if (typeof sos !== 'boolean') {
      return res.status(400).json({
        error: 'SOS must be boolean (true/false)',
        time: new Date().toISOString()
      });
    }

    // Store alert in database
    await db.collection('emergency_alerts').add({
      sos,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      sos: sos,  // Return the actual input value instead of hardcoded true
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message,
      time: new Date().toISOString()
    });
  }
});

// Get latest alert
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('emergency_alerts')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No alerts found',
        time: new Date().toISOString()
      });
    }

    const alert = snapshot.docs[0].data();
    res.json({
      sos: alert.sos,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message,
      time: new Date().toISOString()
    });
  }
});

module.exports = router;
