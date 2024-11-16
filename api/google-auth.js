const { google } = require('googleapis');
const { readFileSync } = require('fs');

// Load credentials from the credentials.json file
const credentials = JSON.parse(readFileSync('./credentials.json', 'utf8'));
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
    access_type: 'offline', // Request a refresh token
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
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
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
    .replace(/=+$/, ''); // URL-safe base64 encode

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    console.log('Email sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  getAuthUrl,
  getTokens,
  sendEmail,
};
