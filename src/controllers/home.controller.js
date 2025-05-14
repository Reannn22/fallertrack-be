const homeService = require('../services/home.service');

const initializeHome = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;

    if (!latitude || !longitude || !radius) {
      return res.status(400).json({ 
        error: 'Latitude, longitude, and radius are required' 
      });
    }

    const homeData = await homeService.initializeHome(latitude, longitude, radius);

    res.json({
      ...homeData,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error initializing home: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

const getHome = async (req, res) => {
  try {
    const homeData = await homeService.getHomeLocation();

    res.json({
      ...homeData,
      time: new Date().toISOString()
    });

  } catch (error) {
    if (error.message === 'No home location found') {
      return res.status(404).json({ 
        error: error.message,
        time: new Date().toISOString()
      });
    }
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error fetching home location: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

const deleteHome = async (req, res) => {
  try {
    await homeService.deleteHome();
    res.json({
      message: 'Home location deleted successfully',
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error deleting home location: ' + error.message,
      time: new Date().toISOString()
    });
  }
};

module.exports = {
  initializeHome,
  getHome,
  deleteHome
};
