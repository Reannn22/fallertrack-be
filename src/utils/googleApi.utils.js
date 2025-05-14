const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const makeGoogleApiRequest = async (url, options = {}) => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Google API error! status: ${response.status}`);
  }

  return response.json();
};

const formatLocationString = (location) => 
  `${location.latitude},${location.longitude}`;

module.exports = {
  makeGoogleApiRequest,
  formatLocationString
};
