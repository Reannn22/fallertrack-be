const navigationService = require('../services/navigation.service');
const homeService = require('../services/home.service');

const computeRoute = async (req, res) => {
  try {
    const currentLocation = await navigationService.getCurrentLocation();
    const home = await homeService.getHomeLocation();
    
    const navigationData = await navigationService.computeRoute(currentLocation, home);

    res.json({
      routes: navigationData.routes,
      geocodingResults: navigationData.geocodingResults,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error computing navigation: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

module.exports = {
  computeRoute
};
