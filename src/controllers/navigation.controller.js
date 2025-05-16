/**
 * Navigation Controller
 * Handles route computation between current location and home
 */

// Import required services
const navigationService = require('../services/navigation.service');
const homeService = require('../services/home.service');

/**
 * Compute navigation route
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Object} Navigation data with routes and geocoding results
 */
const computeRoute = async (req, res) => {
  try {
    // Get user's current location from database
    const currentLocation = await navigationService.getCurrentLocation();
    
    // Get registered home location
    const home = await homeService.getHomeLocation();
    
    // Calculate route between current location and home
    const navigationData = await navigationService.computeRoute(currentLocation, home);

    // Return computed route with timestamp
    res.json({
      routes: navigationData.routes,
      geocodingResults: navigationData.geocodingResults,
      time: new Date().toISOString()
    });

  } catch (error) {
    // Log error for debugging
    console.error('Error details:', error);
    // Return error response with timestamp
    res.status(500).json({ 
      error: 'Error computing navigation: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

// Export controller functions 
module.exports = {
  computeRoute
};
