const express = require('express');
require('dotenv').config();
const router = express.Router();
const admin = require('../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const db = admin.firestore();

// Get AI summary of recent logs
router.post('/', async (req, res) => {
  try {
    const snapshot = await db.collection('logs')  // Changed from 'api_logs' to 'logs'
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No logs found to summarize',
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{
                text:  `Act as a caregiver monitoring elderly in a nursing home. I’ll give activity logs. Analyze them and return in json format:
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
              role: "user", 
              parts: [{
                text: `These API logs ${JSON.stringify(logs, null, 2)}`
              }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const summary = await response.json();
    const summaryText = summary.candidates[0].content.parts[0].text;

    await db.collection('log_summaries').add({
      text: summaryText,
      logsAnalyzed: logs.length,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ text: summaryText });

  } catch (error) {
    console.error('Error summarizing logs:', error);
    res.status(500).json({ 
      error: 'Error summarizing logs: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

module.exports = router;
