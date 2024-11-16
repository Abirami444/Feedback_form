const { google } = require('googleapis');
const { readFileSync } = require('fs');

// Load credentials from environment variables or a config file
const credentials = JSON.parse(readFileSync('./api/credentials.json', 'utf8'));
const CLIENT_ID = credentials.web.client_id;
const CLIENT_SECRET = credentials.web.client_secret;
const REDIRECT_URI = credentials.web.redirect_uris[0]; // Use the first redirect URI

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

/**
 * Generate the Google Auth URL for user consent
 */
function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token for later use
    scope: ['https://www.googleapis.com/auth/gmail.send'], // Permission to send emails
  });
  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from the consent screen
 */
async function getTokens(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Ensure tokens are set
    if (tokens) {
      oauth2Client.setCredentials(tokens); // Set the credentials on the OAuth2 client
      console.log("Tokens set successfully.");
    } else {
      throw new Error("No tokens received.");
    }
    
    // Optionally, you can save the tokens to a database or file for later use
    // Example: saveTokens(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Send an email using Gmail API
 * @param {OAuth2Client} auth - Authenticated OAuth2 client
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 */
async function sendEmail(auth, to, subject, body) {
  const gmail = google.gmail({ version: 'v1', auth }); // Initialize Gmail API with OAuth2 client

  // Construct the email content
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\n');

  // Encode the email as base64 URL-safe
  const raw = Buffer.from(email)
    .toString('base64') // Standard base64 encode
    .replace(/\+/g, '-') // Base64 to base64url
    .replace(/\//g, '_') // Base64 to base64url
    .replace(/=+$/, ''); // Remove trailing equal signs

  try {
    // Send the email via Gmail API
    const result = await gmail.users.messages.send({
      userId: 'me', // 'me' refers to the authenticated user
      requestBody: { raw },
    });
    console.log('Email sent:', result.data);
    return result.data; // Return the response from Gmail API
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
    throw error; // Re-throw the error for better handling higher up
  }
}

module.exports = {
  getAuthUrl,
  getTokens,
  sendEmail,
};
