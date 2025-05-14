const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

// Get speech file by filename
router.get('/:filename', async (req, res) => {
  try {
    const doc = await db.collection('speech_files').doc(req.params.filename).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Speech file not found' });
    }

    const { audioContent } = doc.data();
    
    if (!audioContent) {
      throw new Error('No audio content found in speech file');
    }

    const audioBuffer = Buffer.from(audioContent, 'base64');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    res.send(audioBuffer);

  } catch (error) {
    console.error('Error retrieving speech file:', error);
    res.status(500).json({ error: 'Error retrieving speech file: ' + error.message });
  }
});

module.exports = router;
