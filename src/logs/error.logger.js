/**
 * Error Logger
 * Handles error logging to console and Firestore
 */

// Import Firebase Admin and get Firestore instance
const admin = require('../../config/firebase');
const db = admin.firestore();

/**
 * Log error details
 * @param {Error} error - Error object to be logged
 * @returns {void}
 */
const logError = (error) => {
  // Output error to console for debugging
  console.error(error);
};

// Export logger function
module.exports = {
  logError
};
