/**
 * Firebase Admin SDK Configuration
 * Sets up Firebase Admin connection for backend services
 */

// Import required dependencies
const admin = require('firebase-admin');
const path = require('path');

// Import service account credentials
// Credentials file contains project details and authentication info
const serviceAccount = require(path.join(__dirname, '../credentials/fallertrack-database-firebase-adminsdk-fbsvc-5ed10a17ab.json'));

// Initialize Firebase Admin SDK
// Only initialize if no existing Firebase apps are running
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Export initialized Firebase Admin instance
// Used across the application for Firestore, Auth, and Storage
module.exports = admin;
