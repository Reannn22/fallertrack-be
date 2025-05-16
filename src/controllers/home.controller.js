/**
 * Home Location Controller
 * Handles home location CRUD operations
 */

// Import home location service
const homeService = require('../services/home.service');

/**
 * Initialize new home location
 * @param {Request} req - Express request object with latitude, longitude, radius
 * @param {Response} res - Express response object
 * @returns {Object} Home location data with timestamp
 */
const initializeHome = async (req, res) => {
  try {
    // Extract required parameters from request body
    const { latitude, longitude, radius } = req.body;

    // Validate required fields
    if (!latitude || !longitude || !radius) {
      return res.status(400).json({ 
        error: 'Latitude, longitude, and radius are required' 
      });
    }

    // Initialize home location via service
    const homeData = await homeService.initializeHome(latitude, longitude, radius);

    // Return success response with timestamp
    res.json({
      ...homeData,
      time: new Date().toISOString()
    });

  } catch (error) {
    // Log error for debugging
    console.error('Error details:', error);
    // Return error response with timestamp
    res.status(500).json({ 
      error: 'Error initializing home: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

/**
 * Get current home location
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Object} Current home location data with timestamp
 */
const getHome = async (req, res) => {
  try {
    // Fetch home location from service
    const homeData = await homeService.getHomeLocation();

    // Return success response with timestamp
    res.json({
      ...homeData,
      time: new Date().toISOString()
    });

  } catch (error) {
    // Handle specific case of no home location
    if (error.message === 'No home location found') {
      return res.status(404).json({ 
        error: error.message,
        time: new Date().toISOString()
      });
    }
    // Log other errors for debugging
    console.error('Error details:', error);
    // Return error response with timestamp
    res.status(500).json({ 
      error: 'Error fetching home location: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

/**
 * Delete existing home location
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Object} Success message with timestamp
 */
const deleteHome = async (req, res) => {
  try {
    // Delete home location via service
    await homeService.deleteHome();
    // Return success response with timestamp
    res.json({
      message: 'Home location deleted successfully',
      time: new Date().toISOString()
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error details:', error);
    // Return error response with timestamp
    res.status(500).json({ 
      error: 'Error deleting home location: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

// Export controller functions
module.exports = {
  initializeHome,
  getHome,
  deleteHome
};
