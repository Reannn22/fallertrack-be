/**
 * Home Location Service
 * Handles home location CRUD operations and geocoding
 */

// Import required dependencies
const admin = require('../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initialize Firestore
const db = admin.firestore();

/**
 * Retrieve current home location
 * @throws {Error} If no home location is found
 * @returns {Object} Home location data
 */
async function getHomeLocation() {
  const doc = await db.collection('homes').doc('current').get();
  if (!doc.exists) {
    throw new Error('No home location found');
  }
  return doc.data();
}

/**
 * Initialize new home location
 * @param {number} latitude - Home latitude coordinate
 * @param {number} longitude - Home longitude coordinate
 * @param {number} radius - Geofence radius in meters
 * @throws {Error} If home already exists or geocoding fails
 * @returns {Object} Created home location data
 */
async function initializeHome(latitude, longitude, radius) {
  const existingHome = await db.collection('homes').doc('current').get();
  if (existingHome.exists) {
    throw new Error('Home location already initialized. Only one initialization is allowed.');
  }

  const geocodeResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?` +
    `latlng=${latitude},${longitude}` +
    `&key=${process.env.GOOGLE_MAP_API_KEY}`
  );

  if (!geocodeResponse.ok) {
    throw new Error(`Geocoding API error! status: ${geocodeResponse.status}`);
  }

  const geocodeData = await geocodeResponse.json();
  const locationName = geocodeData.plus_code.compound_code;

  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('homes').doc('current').set({
    latitude,
    longitude,
    radius,
    nama: locationName,
    timestamp
  });

  return { latitude, longitude, radius, nama: locationName };
}

/**
 * Delete current home location
 * @returns {void}
 */
async function deleteHome() {
  await db.collection('homes').doc('current').delete();
}

// Export service functions and database instance
module.exports = {
  getHomeLocation,
  initializeHome,
  deleteHome,
  db
};
