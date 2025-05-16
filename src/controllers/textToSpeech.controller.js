/**
 * Text-to-Speech Controller
 * Handles speech generation and retrieval for navigation instructions
 */

// Import required dependencies
const admin = require('../../config/firebase');
const ttsService = require('../services/textToSpeech.service');

/**
 * Generate speech from text input
 * @param {Request} req - Express request object with text in body
 * @param {Response} res - Express response object
 * @returns {Object} Speech data with download URLs
 */
const generateSpeech = async (req, res) => {
  try {
    // Extract text from request body
    const { text } = req.body;

    // Validate required text input
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Generate speech audio from text
    const audioContent = await ttsService.generateSpeech(text);
    
    // Create unique filename with timestamp
    const filename = `speech_${Date.now()}.mp3`;
    
    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioContent, 'base64');

    const file = ttsService.bucket.file(filename);
    await file.save(audioBuffer, {
      metadata: { contentType: 'audio/mpeg' }
    });

    const publicUrl = `https://storage.googleapis.com/${ttsService.bucket.name}/${filename}`;
    
    const speechData = {
      audioContent,
      filename,
      text,
      publicUrl,
      bucketPath: `gs://${ttsService.bucket.name}/${filename}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await Promise.all([
      ttsService.db.collection('speech_files').doc(filename).set(speechData),
      ttsService.db.collection('latest_tts').doc('current').set(speechData)
    ]);

    res.json({
      message: 'Speech generated successfully',
      downloadUrl: `/api/speech/${filename}`,
      publicUrl,
      text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error converting text to speech: ' + error.message 
    });
  }
};

/**
 * Get latest navigation instruction as speech
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Object} Latest navigation instruction with audio
 */
const getLatestSpeech = async (req, res) => {
  try {
    // Get most recent location update
    const currentLocationSnapshot = await ttsService.db.collection('current_locations')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    // Handle case when no location is found
    if (currentLocationSnapshot.empty) {
      return res.status(404).json({ 
        error: 'No current location found',
        time: new Date().toISOString()
      });
    }

    // Extract location data and navigation status
    const currentLocation = currentLocationSnapshot.docs[0].data();
    
    // Get navigation instruction or default message
    const instruction = currentLocation.instruction || 
                       currentLocation.navigationStatus?.instruction || 
                       "Lost, press button to return to home";
    
    // Get distance to destination
    const meters = currentLocation.navigationStatus?.distanceToEnd || 0;
    
    // Determine if user is following route
    const status = currentLocation.navigationStatus ? "on_route" : "off_route";

    const filename = `speech_${Date.now()}.mp3`;
    const audioContent = await ttsService.generateSpeech(instruction);
    
    const file = ttsService.bucket.file(filename);
    await file.save(Buffer.from(audioContent, 'base64'), {
      metadata: { contentType: 'audio/mpeg' }
    });

    const publicUrl = `https://storage.googleapis.com/${ttsService.bucket.name}/${filename}`;
    
    const speechData = {
      audioContent,
      filename,
      text: instruction,
      publicUrl,
      bucketPath: `gs://${ttsService.bucket.name}/${filename}`,
      meters,
      status,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await Promise.all([
      ttsService.db.collection('speech_files').doc(filename).set(speechData),
      ttsService.db.collection('latest_tts').doc('current').set(speechData)
    ]);

    let bucketStatus = { exists: true, isPublic: false, url: publicUrl };
    
    res.json({
      text: instruction,
      downloadUrl: `/api/speech/${filename}`,
      bucketStatus,
      time: new Date().toISOString(),
      meters,
      status
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error fetching text-to-speech data: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

// Export controller functions
module.exports = {
  generateSpeech,
  getLatestSpeech
};
