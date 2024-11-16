const { sendEmail } = require('./google-auth');  // Import the email sending function

async function handler(req, res) {
  // Check if the request is a POST request
  if (req.method === 'POST') {
    const { email, feedback } = req.body;

    // Validate if email and feedback are provided
    if (!email || !feedback) {
      return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
    }

    console.log('Received Feedback:', { email, feedback });

    // Prepare the user and owner messages
    const userMessage = `Thank you for your feedback!\n\nHere’s what you submitted:\n${feedback}`;
    const ownerMessage = `New feedback submitted:\n\nUser Email: ${email}\nFeedback: ${feedback}`;
    const ownerEmail = 'utube2763@gmail.com'; // The restaurant owner’s email

    // Get the OAuth2 credentials (Make sure you handle OAuth2 token in your flow)
    const oauth2Client = getOAuth2Client(); // Ensure you get the OAuth client correctly (e.g., saved refresh token or re-authenticate)

    try {
      // Send confirmation email to the user
      console.log('Sending confirmation email to:', email);
      await sendEmail(oauth2Client, email, 'Thank you for your feedback!', userMessage);

      // Send notification email to the owner
      console.log('Sending feedback notification to owner:', ownerEmail);
      await sendEmail(oauth2Client, ownerEmail, 'New Feedback Submitted', ownerMessage);

      // Send success response
      res.status(200).json({ success: true, message: 'Feedback submitted and emails sent!' });
    } catch (error) {
      // Log the error and respond with a failure message
      console.error('Error while sending email:', error);
      res.status(500).json({ success: false, message: 'Error submitting feedback and sending emails' });
    }
  } else {
    // Respond with a 405 if the request method is not POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * This function will return the OAuth2 client that you can use to send emails
 * You will need to implement your logic to get or refresh the OAuth2 credentials (e.g., using a saved refresh token)
 */
function getOAuth2Client() {
  // Implement your token retrieval logic (such as reading from a DB or file where the access token/refresh token is stored)
  // For example:
  const credentials = require('./credentials.json'); // Replace with your correct file path
  const { google } = require('googleapis');

  const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
  );

  // Set the credentials (OAuth tokens from previous login)
  const tokens = getSavedTokens(); // Retrieve saved tokens (e.g., from DB or file)

  if (tokens) {
    oauth2Client.setCredentials(tokens);
  } else {
    // Handle the case where tokens are not available (you may need to redirect user for re-authentication)
    throw new Error('OAuth2 credentials are missing. Please authenticate first.');
  }

  return oauth2Client;
}

/**
 * Retrieve saved OAuth2 tokens from your storage (for example, from a file or database)
 */
function getSavedTokens() {
  // Example: Replace with your actual logic to load tokens
  return {
    access_token: 'your-access-token-here',
    refresh_token: 'your-refresh-token-here',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    token_type: 'Bearer',
    expiry_date: 1615312380659,
  };
}

module.exports = handler;
