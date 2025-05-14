const admin = require('firebase-admin');
const path = require('path');

// Use existing service account file
const serviceAccount = require(path.join(__dirname, '../../credentials/fallertrack-database-firebase-adminsdk-fbsvc-5ed10a17ab.json'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
