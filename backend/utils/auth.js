const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

let cachedToken = null;
let tokenExpiry = null; // timestamp in ms

/**
 * Obtain an access token from the test server's auth endpoint.
 * Implements in-memory token caching to avoid repeated auth requests.
 * 
 * @returns {Promise<string>} The JWT access token
 */
async function getAccessToken() {
  const now = Date.now();
  
  // If we have a cached token and it is not expired (with a 30 second grace period), reuse it
  if (cachedToken && tokenExpiry && now < (tokenExpiry - 30000)) {
    return cachedToken;
  }

  const {
    TEST_SERVER_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    FULL_NAME,
    EMAIL,
    ROLL_NO
  } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('CLIENT_ID and CLIENT_SECRET are not defined in the environment. Please run the registration script first.');
  }

  const authUrl = `${TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service'}/auth`;

  // Payload structure expected by the Affordmed Test Server
  const payload = {
    companyName: 'Affordmed',
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    ownerName: FULL_NAME || 'Applicant',
    ownerEmail: EMAIL,
    rollNo: ROLL_NO
  };

  try {
    const response = await axios.post(authUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('Auth server did not return access_token');
    }

    cachedToken = access_token;
    
    // expires_in is typically in seconds. Set tokenExpiry timestamp.
    const expiresInSeconds = expires_in || 3600; // default to 1 hour if not provided
    tokenExpiry = Date.now() + (expiresInSeconds * 1000);

    return cachedToken;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.response?.data || error.message;
    throw new Error(`Authentication with Test Server failed: ${errMsg}`);
  }
}

module.exports = {
  getAccessToken
};
