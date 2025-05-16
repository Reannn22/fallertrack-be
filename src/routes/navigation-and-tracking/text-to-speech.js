/**
 * Text-to-Speech Router
 * Handles speech generation and retrieval for navigation instructions
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const ttsController = require('../../controllers/textToSpeech.controller');

// Define routes
router.post('/', ttsController.generateSpeech);  // Generate new speech audio
router.get('/', ttsController.getLatestSpeech); // Get most recent instruction

// Export router
module.exports = router;
