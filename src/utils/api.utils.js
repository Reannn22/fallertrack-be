const fetch = require('node-fetch');

const makeGoogleApiRequest = async (location, radius) => {
  try {
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const types = 'hospital|fire_station|police';
    
    const url = `${baseUrl}?location=${location.latitude},${location.longitude}&radius=${radius}&type=${types}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      ...data,
      time: new Date().toISOString()
    };
  } catch (error) {
    console.error('Google Places API Error:', error);
    return { results: [], status: 'ERROR', time: new Date().toISOString() };
  }
};

module.exports = { makeGoogleApiRequest };
