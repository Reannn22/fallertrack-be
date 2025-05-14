const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

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
    const snapshot = await db.collection('api_logs')
      .orderBy('timestamp', 'desc')
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found',
        time: new Date().toISOString()
      });
    }

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString()
    }));

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
    const snapshot = await db.collection('api_logs').get();
    
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
