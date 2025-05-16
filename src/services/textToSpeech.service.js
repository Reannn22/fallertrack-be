/**
 * Text-to-Speech Service
 * Handles speech generation and audio file management
 */

// Import required dependencies
const admin = require('../../config/firebase');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const getAccessToken = require('../../config/getAccessToken');

// Initialize Firebase and Google Cloud Storage
const db = admin.firestore();
const storage = new Storage({
  keyFilename: path.join(__dirname, '../../credentials/gesp-459003-aabf1ee34b71.json'),
});
const bucket = storage.bucket('fallertrack-navigation-sound');

/**
 * Generate speech audio from text using Google TTS API
 * @param {string} text - Text to convert to speech
 * @returns {string} Base64 encoded audio content
 */
async function generateSpeech(text) {
  // Get authentication token
  const accessToken = await getAccessToken();

  // Call Google TTS API
  const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-User-Project': 'gesp-459003',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Chirp3-HD-Achernar" // HD quality voice
      },
      audioConfig: {
        audioEncoding: "MP3" // Standard audio format
      }
    })
  });

  // Handle API errors
  if (!response.ok) {
    throw new Error(`TTS API error! status: ${response.status}, message: ${await response.text()}`);
  }

  // Extract and validate audio content
  const data = await response.json();
  if (!data.audioContent) {
    throw new Error('No audio content received from Google TTS API');
  }

  return data.audioContent;
}

/**
 * Generate and store navigation instruction audio
 * @param {string} instruction - Navigation instruction text
 * @param {Object} location - Current location data
 */
async function triggerNavInstruction(instruction, location) {
  try {
    // Generate unique filename with timestamp
    const filename = `speech_${Date.now()}.mp3`;
    
    // Generate speech audio
    const audioContent = await generateSpeech(instruction);
    
    // Save audio file to Cloud Storage
    const file = bucket.file(filename);
    const audioBuffer = Buffer.from(audioContent, 'base64');
    
    await file.save(audioBuffer, {
      metadata: { contentType: 'audio/mpeg' }
    });

    // Generate public URL for file access
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    
    // Prepare data for database
    const ttsData = {
      text: instruction,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      filename,
      location,
      meters: location.distanceToEnd,
      audioContent,
      publicUrl,
      bucketPath: `gs://${bucket.name}/${filename}`
    };

    // Store data in Firestore
    await Promise.all([
      db.collection('latest_tts').doc('current').set(ttsData),
      db.collection('speech_files').doc(filename).set(ttsData)
    ]);

  } catch (error) {
    console.error('Error in triggerNavInstruction:', error);
    throw error;
  }
}

// Export service functions and resources
module.exports = {
  generateSpeech,
  triggerNavInstruction,
  bucket,
  db
};
