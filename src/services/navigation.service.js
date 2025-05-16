const admin = require('../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const db = admin.firestore();

async function getCurrentLocation() {
  const snapshot = await db.collection('current_locations')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error('No current location found');
  }
  return snapshot.docs[0].data();
}

async function computeRoute(origin, destination) {
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
      travelMode: "WALK",
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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const navigationData = await response.json();
  await db.collection('navigation_data').add({
    routes: navigationData.routes,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return navigationData;
}

module.exports = {
  getCurrentLocation,
  computeRoute,
  db
};
