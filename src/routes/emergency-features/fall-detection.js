/**
 * Fall Detection Router
 * Handles fall detection data processing and notifications
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const admin = require('../../../config/firebase');

// Initialize Firestore
const db = admin.firestore();

/**
 * Validate and sanitize fall detection input data
 * @param {Object} data - Request body containing accelerometer and gyroscope data
 * @returns {Object} Sanitized data with numeric values
 * @throws {Error} If data format is invalid
 */
const validateInput = (data) => {
  // Validate data structure and array lengths
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

/**
 * POST /api/fall-detection
 * Process accelerometer and gyroscope data to detect falls
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Log incoming data for debugging
    console.log('Received body:', JSON.stringify(req.body));
    
    // Validate sensor data
    const { accelero, gyro } = validateInput(req.body);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // Check fall conditions:
    // - Acceleration > 20 m/s² OR
    // - Angular velocity > 100 rad/s
    const hasFallen = accelero[0] > 20 || Math.abs(gyro[0]) > 100;
    
    // Store detection data in Firestore
    const detectionRef = await db.collection('fall_detections').add({
      accelero,
      gyro,
      status: hasFallen,
      timestamp
    });

    // Prepare notification data with location and elderly info
    const notificationData = {
      latitude: -5.340154,
      longitude: 105.326813,
      elderlyName: "Mrs. Edith Thompson",
      callStatus: hasFallen,
      messageStatus: hasFallen,
      fallStatus: hasFallen,
      detectionId: detectionRef.id,
      detectionData: { accelero, gyro },
      timestamp
    };

    // Store notification in Firestore
    await db.collection('fall_notifications').add(notificationData);

    // Prepare API response
    const response = {
      accelero,
      gyro,
      status: hasFallen,
      message: hasFallen ? "Elderly person has fallen" : "Elderly person is safe",
      timestamp: new Date().toISOString()
    };

    // Log successful detection
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

    // Return detection results
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

// Export router
module.exports = router;
