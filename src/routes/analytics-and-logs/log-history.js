const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

const db = admin.firestore();

// Add API logging helper function
async function logApiActivity(endpoint, data, result) {
  try {
    await db.collection('api_logs').add({
      endpoint,
      requestData: data,
      responseData: result,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging API activity:', error);
  }
}

// Get all API logs
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('logs')  // Changed from 'api_logs' to 'logs'
      .orderBy('timestamp', 'desc')
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found',
        time: new Date().toISOString()
      });
    }

    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      // Handle different timestamp formats
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate().toISOString();
      } else if (timestamp && timestamp._seconds) {
        // Handle Firestore timestamp object
        timestamp = new Date(timestamp._seconds * 1000).toISOString();
      } else if (timestamp) {
        // If it's already a string or Date, convert to ISO string
        timestamp = new Date(timestamp).toISOString();
      }

      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });

    res.json({
      logs,
      count: logs.length,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error fetching logs: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

// Clear all API logs
router.delete('/', async (req, res) => {
  try {
    const snapshot = await db.collection('logs')  // Changed from 'api_logs' to 'logs'
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found to delete',
        time: new Date().toISOString()
      });
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({
      message: `Successfully deleted ${snapshot.size} log entries`,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting logs:', error);
    res.status(500).json({ 
      error: 'Error deleting logs: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

module.exports = router;
