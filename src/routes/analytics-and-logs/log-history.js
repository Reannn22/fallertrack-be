/**
 * API Log History Routes
 * Handles retrieval and deletion of API activity logs
 */

// Import dependencies
const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * Helper function to log API activities to Firestore
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request data
 * @param {Object} result - Response data
 */
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

/**
 * GET /api/log-history
 * Retrieve all API activity logs
 */
router.get('/', async (req, res) => {
  try {
    // Get logs ordered by timestamp descending
    const snapshot = await db.collection('logs')
      .orderBy('timestamp', 'desc')
      .get();
    
    // Handle case when no logs exist
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found',
        time: new Date().toISOString()
      });
    }

    // Process and format log entries
    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      // Handle various timestamp formats
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate().toISOString();
      } else if (timestamp && timestamp._seconds) {
        // Convert Firestore timestamp
        timestamp = new Date(timestamp._seconds * 1000).toISOString();
      } else if (timestamp) {
        // Convert string/Date to ISO
        timestamp = new Date(timestamp).toISOString();
      }

      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });

    // Return formatted logs with count
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

/**
 * DELETE /api/log-history
 * Clear all API activity logs
 */
router.delete('/', async (req, res) => {
  try {
    // Get all logs
    const snapshot = await db.collection('logs')
      .get();
    
    // Handle case when no logs exist
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found to delete',
        time: new Date().toISOString()
      });
    }

    // Batch delete all logs
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Return success response
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

// Export router
module.exports = router;
