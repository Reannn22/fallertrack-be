const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');

const db = admin.firestore();

// Add validation helper
const validateInput = (data) => {
  if (!data.accelero || !Array.isArray(data.accelero) || data.accelero.length !== 3 ||
      !data.gyro || !Array.isArray(data.gyro) || data.gyro.length !== 3) {
    throw new Error('Invalid input format. Requires accelero and gyro arrays with 3 numbers each');
  }
  
  // Sanitize and convert values to numbers
  const sanitizedData = {
    accelero: data.accelero.map(val => Number(val)),
    gyro: data.gyro.map(val => Number(val))
  };

  // Validate that all values are numbers
  if (sanitizedData.accelero.some(isNaN) || sanitizedData.gyro.some(isNaN)) {
    throw new Error('All values must be numbers');
  }

  return sanitizedData;
};

router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('Received body:', JSON.stringify(req.body)); // Debug log
    
    // Validate and sanitize input
    const { accelero, gyro } = validateInput(req.body);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // Fall detection logic
    const hasFallen = accelero[0] > 20 || Math.abs(gyro[0]) > 100;
    
    // Store fall detection status with unique ID
    const detectionRef = await db.collection('fall_detections').add({
      accelero,
      gyro,
      status: hasFallen,
      timestamp
    });

    // Always create/update notification with latest detection data
    const notificationData = {
      latitude: -5.340154,
      longitude: 105.326813,
      elderlyName: "Mrs. Edith Thompson",
      callStatus: hasFallen,
      messageStatus: hasFallen,
      fallStatus: hasFallen,
      detectionId: detectionRef.id,
      detectionData: {
        accelero,
        gyro
      },
      timestamp
    };

    await db.collection('fall_notifications').add(notificationData);

    const response = {
      accelero,      // Add accelero from input
      gyro,          // Add gyro from input
      status: hasFallen,
      message: hasFallen ? "Elderly person has fallen" : "Elderly person is safe",
      timestamp: new Date().toISOString()
    };

    // Add logging with response
    await db.collection('logs').add({
      type: 'fall-detection',
      endpoint: '/api/fall-detection',
      method: 'POST',
      requestBody: { accelero, gyro },
      responseBody: response,
      detectedFall: hasFallen,
      status: 'success',
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json(response);

  } catch (error) {
    // Enhance error handling
    const errorResponse = {
      error: 'Request processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    };

    // Log error with more details
    await db.collection('logs').add({
      type: 'fall-detection',
      endpoint: '/api/fall-detection',
      method: 'POST',
      requestBody: req.body,
      rawBody: req.body ? JSON.stringify(req.body) : null,
      status: 'error',
      error: error.message,
      stack: error.stack,
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.error('Error:', error);
    res.status(400).json(errorResponse);
  }
});

module.exports = router;
