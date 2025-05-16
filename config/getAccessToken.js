const { GoogleAuth } = require('google-auth-library');
const path = require('path');

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: path.join(__dirname, '../credentials/gesp-459003-aabf1ee34b71.json'),
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

module.exports = getAccessToken;
