/**
 * SOS Location Router
 * Handles routes for emergency service location search
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const sosLocationController = require('../../controllers/sosLocation.controller');

// Register routes
// Both GET and POST methods supported for flexibility
router.get('/', sosLocationController.searchEmergencyLocations);  // Search using query parameters
router.post('/', sosLocationController.searchEmergencyLocations); // Search using request body

// Export router
module.exports = router;
