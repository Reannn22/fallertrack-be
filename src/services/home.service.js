const admin = require('../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const db = admin.firestore();

async function getHomeLocation() {
  const doc = await db.collection('homes').doc('current').get();
  if (!doc.exists) {
    throw new Error('No home location found');
  }
  return doc.data();
}

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

async function deleteHome() {
  await db.collection('homes').doc('current').delete();
}

module.exports = {
  getHomeLocation,
  initializeHome,
  deleteHome,
  db
};
