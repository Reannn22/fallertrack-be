/**
 * Navigation Service
 * Handles location tracking and route computation using Google Routes API
 */

// Import required dependencies
const admin = require('../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initialize Firestore
const db = admin.firestore();

/**
 * Get latest recorded location
 * @throws {Error} If no location records found
 * @returns {Object} Location data with coordinates and timestamp
 */
async function getCurrentLocation() {
  // Query most recent location record
  const snapshot = await db.collection('current_locations')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  // Handle case when no locations exist
  if (snapshot.empty) {
    throw new Error('No current location found');
  }
  return snapshot.docs[0].data();
}

/**
 * Compute walking route between two points
 * @param {Object} origin - Starting location coordinates
 * @param {Object} destination - Ending location coordinates
 * @returns {Object} Route data with navigation instructions
 */
async function computeRoute(origin, destination) {
  // Call Google Routes API
  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAP_API_KEY,
      'X-Goog-FieldMask': '*'
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude
          }
        }
      },
      travelMode: "WALK",           // Force walking directions
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: "en-US",
      units: "IMPERIAL"
    })
  });

  // Handle API errors
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Parse and store navigation data
  const navigationData = await response.json();
  await db.collection('navigation_data').add({
    routes: navigationData.routes,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return navigationData;
}

// Export service functions and database instance
module.exports = {
  getCurrentLocation,
  computeRoute,
  db
};
