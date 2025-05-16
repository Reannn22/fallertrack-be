const admin = require('../../config/firebase');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const getAccessToken = require('../../config/getAccessToken');

const db = admin.firestore();
const storage = new Storage({
  keyFilename: path.join(__dirname, '../../credentials/gesp-459003-aabf1ee34b71.json'),
});
const bucket = storage.bucket('fallertrack-navigation-sound');

async function generateSpeech(text) {
  const accessToken = await getAccessToken();
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
        name: "en-US-Chirp3-HD-Achernar"
      },
      audioConfig: {
        audioEncoding: "MP3"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`TTS API error! status: ${response.status}, message: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.audioContent) {
    throw new Error('No audio content received from Google TTS API');
  }

  return data.audioContent;
}

async function triggerNavInstruction(instruction, location) {
  try {
    const filename = `speech_${Date.now()}.mp3`;
    const audioContent = await generateSpeech(instruction);
    
    const file = bucket.file(filename);
    const audioBuffer = Buffer.from(audioContent, 'base64');
    
    await file.save(audioBuffer, {
      metadata: {
        contentType: 'audio/mpeg',
      }
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    
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

    await Promise.all([
      db.collection('latest_tts').doc('current').set(ttsData),
      db.collection('speech_files').doc(filename).set(ttsData)
    ]);

  } catch (error) {
    console.error('Error in triggerNavInstruction:', error);
    throw error;
  }
}

module.exports = {
  generateSpeech,
  triggerNavInstruction,
  bucket,
  db
};
