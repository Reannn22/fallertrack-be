/**
 * Google Cloud Platform Authentication Module
 * Handles access token generation for GCP API calls
 */

// Import required dependencies
const { GoogleAuth } = require('google-auth-library');
const path = require('path');

/**
 * Gets a valid access token for Google Cloud Platform services
 * @returns {Promise<string>} The access token
 */
async function getAccessToken() {
  // Initialize Google Auth with service account credentials
  const auth = new GoogleAuth({
    // Load service account key from credentials directory
    keyFile: path.join(__dirname, '../credentials/gesp-459003-aabf1ee34b71.json'),
    // Request full cloud platform access
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  // Get authenticated client
  const client = await auth.getClient();
  // Generate new access token
  const token = await client.getAccessToken();
  // Return only the token string
  return token.token;
}

// Export the function for use in other modules
module.exports = getAccessToken;
