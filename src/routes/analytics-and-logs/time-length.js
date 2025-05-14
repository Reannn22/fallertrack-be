const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    // Get home setup time as start time
    const homeDoc = await db.collection('homes').doc('current').get();

    if (!homeDoc.exists) {
      return res.status(404).json({ 
        error: 'No home location found',
        time: new Date().toISOString()
      });
    }

    // Get latest destination arrival time
    const endTimeDoc = await db.collection('arrival_times').doc('current').get();

    if (!endTimeDoc.exists) {
      return res.status(404).json({
        error: 'Navigation not yet completed',
        time: new Date().toISOString() 
      });
    }

    const homeData = homeDoc.data();
    const endTimeData = endTimeDoc.data();

    // Convert Firestore Timestamp to Date string
    const startTimeStr = homeData.timestamp instanceof admin.firestore.Timestamp 
      ? homeData.timestamp.toDate().toISOString()
      : homeData.timestamp || homeData.time;
    
    const endTimeStr = endTimeData.timestamp instanceof admin.firestore.Timestamp
      ? endTimeData.timestamp.toDate().toISOString()
      : endTimeData.timestamp || endTimeData.time;

    if (!startTimeStr || !endTimeStr) {
      return res.status(500).json({
        error: 'Missing timestamp data',
        time: new Date().toISOString()
      });
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('Invalid timestamps:', { startTimeStr, endTimeStr });
      return res.status(500).json({
        error: 'Invalid timestamp format',
        details: { start: startTimeStr, end: endTimeStr },
        time: new Date().toISOString()
      });
    }

    const durationMs = endTime - startTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    let durationStr = '';
    if (hours > 0) {
      durationStr += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      durationStr += `${minutes} minute${minutes > 1 ? 's' : ''} `;
    }
    if (seconds > 0 || durationStr === '') {
      durationStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    res.json({
      time_arrival: startTime.toISOString(),
      time_end: endTime.toISOString(), 
      hour: durationStr.trim(),
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error calculating time length: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

// Add GET endpoint that does the same calculation
router.get('/', async (req, res) => {
  try {
    const homeDoc = await db.collection('homes').doc('current').get();
    const endTimeDoc = await db.collection('arrival_times').doc('current').get();

    if (!homeDoc.exists) {
      return res.status(404).json({ 
        error: 'No home location found',
        time: new Date().toISOString()
      });
    }

    if (!endTimeDoc.exists) {
      return res.status(404).json({
        error: 'Navigation not yet completed',
        time: new Date().toISOString() 
      });
    }

    const homeData = homeDoc.data();
    const endTimeData = endTimeDoc.data();

    // Convert Firestore Timestamp to Date string
    const startTimeStr = homeData.timestamp instanceof admin.firestore.Timestamp 
      ? homeData.timestamp.toDate().toISOString()
      : homeData.timestamp || homeData.time;
    
    const endTimeStr = endTimeData.timestamp instanceof admin.firestore.Timestamp
      ? endTimeData.timestamp.toDate().toISOString()
      : endTimeData.timestamp || endTimeData.time;

    if (!startTimeStr || !endTimeStr) {
      return res.status(500).json({
        error: 'Missing timestamp data',
        time: new Date().toISOString()
      });
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('Invalid timestamps:', { startTimeStr, endTimeStr });
      return res.status(500).json({
        error: 'Invalid timestamp format',
        details: { start: startTimeStr, end: endTimeStr },
        time: new Date().toISOString()
      });
    }

    const durationMs = endTime - startTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    let durationStr = '';
    if (hours > 0) {
      durationStr += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      durationStr += `${minutes} minute${minutes > 1 ? 's' : ''} `;
    }
    if (seconds > 0 || durationStr === '') {
      durationStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    res.json({
      time_arrival: startTime.toISOString(),
      time_end: endTime.toISOString(), 
      hour: durationStr.trim(),
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error calculating time length: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

module.exports = router;
