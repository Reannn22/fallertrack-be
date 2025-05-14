const { getCurrentLocation } = require('../utils/location.utils');
const { makeGoogleApiRequest } = require('../utils/api.utils');
const { logError } = require('../logs/error.logger');
const { logEmergencySearch } = require('../logs/emergency.logger');

const searchEmergencyLocations = async (req, res) => {
  try {
    const radius = req.query.radius || (req.body && req.body.radius);
    if (!radius) {
      return res.status(400).json({ 
        error: 'Radius is required',
        time: new Date().toISOString()
      });
    }

    const location = await getCurrentLocation();
    if (!location) {
      throw new Error('Could not get current location');
    }

    const places = await makeGoogleApiRequest(location, radius);
    await logEmergencySearch({ location, radius });
    
    return res.status(200).json(places);
  } catch (error) {
    await logError(error, {
      action: 'searchEmergencyLocations',
      radius: req.query.radius || (req.body && req.body.radius)
    });
    
    return res.status(500).json({
      error: `Error fetching SOS locations: ${error.message}`,
      time: new Date().toISOString()
    });
  }
};

module.exports = { searchEmergencyLocations };
