const express = require('express');
const router = express.Router();
const ttsController = require('../../controllers/textToSpeech.controller');

router.post('/', ttsController.generateSpeech);
router.get('/', ttsController.getLatestSpeech);

module.exports = router;
