/**
 * Emergency Location Search Controller
 * Handles finding nearby emergency services based on current location
 */

// Import required utilities and loggers
const { getCurrentLocation } = require('../utils/location.utils');
const { makeGoogleApiRequest } = require('../utils/api.utils');
const { logError } = require('../logs/error.logger');
const { logEmergencySearch } = require('../logs/emergency.logger');

/**
 * Search for emergency services near current location
 * @param {Request} req - Express request object with radius parameter
 * @param {Response} res - Express response object
 * @returns {Object} List of nearby emergency services
 */
const searchEmergencyLocations = async (req, res) => {
  try {
    // Get radius from query params or request body
    const radius = req.query.radius || (req.body && req.body.radius);
    
    // Validate radius parameter
    if (!radius) {
      return res.status(400).json({ 
        error: 'Radius is required',
        time: new Date().toISOString()
      });
    }

    // Get user's current location
    const location = await getCurrentLocation();
    if (!location) {
      throw new Error('Could not get current location');
    }

    // Search for emergency services using Google Places API
    const places = await makeGoogleApiRequest(location, radius);
    
    // Log the emergency search for analytics
    await logEmergencySearch({ location, radius });
    
    // Return found emergency services
    return res.status(200).json(places);

  } catch (error) {
    // Log error with context for debugging
    await logError(error, {
      action: 'searchEmergencyLocations',
      radius: req.query.radius || (req.body && req.body.radius)
    });
    
    // Return error response with timestamp
    return res.status(500).json({
      error: `Error fetching SOS locations: ${error.message}`,
      time: new Date().toISOString()
    });
  }
};

// Export controller function
module.exports = { searchEmergencyLocations };
