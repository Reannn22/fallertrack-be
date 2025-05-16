/**
 * Home Location Router
 * Handles CRUD operations for elderly home location
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/home.controller');

// Define routes with their corresponding controller methods
router.post('/', homeController.initializeHome);    // Create new home location
router.get('/', homeController.getHome);           // Retrieve home location
router.delete('/', homeController.deleteHome);     // Remove home location

// Export router
module.exports = router;