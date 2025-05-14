const admin = require('../config/firebase');
const ttsService = require('../services/textToSpeech.service');

const generateSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioContent = await ttsService.generateSpeech(text);
    const filename = `speech_${Date.now()}.mp3`;
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

const getLatestSpeech = async (req, res) => {
  try {
    const currentLocationSnapshot = await ttsService.db.collection('current_locations')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (currentLocationSnapshot.empty) {
      return res.status(404).json({ 
        error: 'No current location found',
        time: new Date().toISOString()
      });
    }

    const currentLocation = currentLocationSnapshot.docs[0].data();
    const instruction = currentLocation.instruction || currentLocation.navigationStatus?.instruction || "Lost, press button to return to home";
    const meters = currentLocation.navigationStatus?.distanceToEnd || 0;
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

module.exports = {
  generateSpeech,
  getLatestSpeech
};
