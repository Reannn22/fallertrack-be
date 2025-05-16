/**
 * Speech File Router
 * Handles retrieval of generated speech audio files
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * GET /api/speech/:filename
 * Download generated speech audio file
 * @param {string} filename - Name of the audio file to retrieve
 */
router.get('/:filename', async (req, res) => {
  try {
    // Fetch speech file document from Firestore
    const doc = await db.collection('speech_files').doc(req.params.filename).get();
    
    // Handle case when file doesn't exist
    if (!doc.exists) {
      return res.status(404).json({ error: 'Speech file not found' });
    }

    // Extract audio content
    const { audioContent } = doc.data();
    
    // Validate audio content exists
    if (!audioContent) {
      throw new Error('No audio content found in speech file');
    }

    // Convert base64 to buffer and send response
    const audioBuffer = Buffer.from(audioContent, 'base64');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    res.send(audioBuffer);

  } catch (error) {
    // Log and return error
    console.error('Error retrieving speech file:', error);
    res.status(500).json({ error: 'Error retrieving speech file: ' + error.message });
  }
});

// Export router
module.exports = router;
