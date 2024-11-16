const { google } = require('googleapis');

/**
 * Initialize Google Auth using a Service Account key.
 * This is typically used for server-to-server communication, like accessing Google Sheets or Drive APIs.
 * Ensure the `GOOGLE_SERVICE_KEY` environment variable contains the JSON key file content.
 */
function initServiceAccountAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Add scopes as needed
    });
    return auth.getClient(); // Returns an authenticated client for Google APIs
  } catch (error) {
    console.error('Error initializing service account auth:', error.message);
    throw error;
  }
}

/**
 * Initialize Google OAuth2 client for user-based authentication.
 * This requires user consent and tokens, typically used for user-specific actions like sending emails via Gmail.
 */
function initOAuth2Auth() {
  const CLIENT_ID = process.env.CLIENT_ID || '<YOUR_CLIENT_ID>';
  const CLIENT_SECRET = process.env.CLIENT_SECRET || '<YOUR_CLIENT_SECRET>';
  const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/**
 * Generate a Google Auth URL for user consent (OAuth2 flow).
 * Use this URL to get the user's permission for the specified scopes.
 */
function getAuthUrl() {
  const oauth2Client = initOAuth2Auth();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Ensures a refresh token is provided
    scope: ['https://www.googleapis.com/auth/gmail.send'], // Example scope for Gmail API
  });
}

/**
 * Exchange an authorization code for tokens in the OAuth2 flow.
 * @param {string} code - Authorization code from the consent screen.
 */
async function getTokens(code) {
  const oauth2Client = initOAuth2Auth();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Tokens set successfully.');
    return tokens; // Tokens include access and refresh tokens
  } catch (error) {
    console.error('Error getting tokens:', error.message);
    throw error;
  }
}

/**
 * Send an email using Gmail API with OAuth2 authentication.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} body - Email body.
 */
async function sendEmail(to, subject, body) {
  const auth = initOAuth2Auth();
  const gmail = google.gmail({ version: 'v1', auth });

  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\n');

  const raw = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    console.log('Email sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}

module.exports = {
  initServiceAccountAuth, // For service account-based Google API calls (e.g., Sheets)
  initOAuth2Auth,         // For user-based authentication (e.g., Gmail API)
  getAuthUrl,             // Generate an OAuth2 consent URL
  getTokens,              // Exchange authorization code for tokens
  sendEmail,              // Send an email via Gmail API using OAuth2
};
