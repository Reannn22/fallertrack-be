const express = require('express');
const router = express.Router();
const sosLocationController = require('../../controllers/sosLocation.controller');

router.get('/', sosLocationController.searchEmergencyLocations);
router.post('/', sosLocationController.searchEmergencyLocations);

module.exports = router;
