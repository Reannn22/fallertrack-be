/**
 * Log Summary Router
 * Handles AI-powered analysis of API activity logs using Google Gemini
 */

// Import required dependencies
const express = require('express');
require('dotenv').config();
const router = express.Router();
const admin = require('../../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initialize Firestore
const db = admin.firestore();

/**
 * POST /api/summarize
 * Generate AI summary of recent system logs
 */
router.post('/', async (req, res) => {
  try {
    // Get optional parameters from request body
    const { limit = 50, startDate, endDate } = req.body;

    // Build query
    let query = db.collection('logs')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    // Add date filters if provided
    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate));
    }

    // Execute query
    const snapshot = await query.get();

    // Handle case when no logs exist
    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found to summarize',
        time: new Date().toISOString()
      });
    }

    // Process and normalize log timestamps
    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      let timestamp = data.timestamp;
      
      // Convert various timestamp formats to ISO string
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate().toISOString();
      } else if (timestamp && timestamp._seconds) {
        timestamp = new Date(timestamp._seconds * 1000).toISOString();
      } else if (timestamp) {
        timestamp = new Date(timestamp).toISOString();
      }

      return {
        ...data,
        id: doc.id,
        timestamp
      };
    });

    // Call Google Gemini API for analysis
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              // Setup prompt for caregiver perspective
              role: "user",
              parts: [{
                text: `Act as a caregiver monitoring elderly in a nursing home. I'll give activity logs. Analyze them and return in json format:
{
  "gps": {
    "summary": "string",
    "steps": ["string"]
  },
  "fallDetection": {
    "summary": "string",
    "steps": ["string"]
  },
  "currentDistance": {
    "summary": "string",
    "steps": ["string"]
  }
}
don't give me markdown format and don't give me \n format`
              }]
            },
            {
              // Send logs for analysis
              role: "user", 
              parts: [{
                text: `These API logs ${JSON.stringify(logs, null, 2)}`
              }]
            }
          ]
        })
      }
    );

    // Handle API errors
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Extract and store summary
    const summary = await response.json();
    const summaryText = summary.candidates[0].content.parts[0].text;

    // Save summary to database
    await db.collection('log_summaries').add({
      text: summaryText,
      logsAnalyzed: logs.length,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Return summary to client
    res.json({ text: summaryText });

  } catch (error) {
    // Log and return error
    console.error('Error summarizing logs:', error);
    res.status(500).json({ 
      error: 'Error summarizing logs: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

// Export router
module.exports = router;
