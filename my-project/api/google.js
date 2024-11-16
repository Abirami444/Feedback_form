// Import the Google OAuth2 client library
const { OAuth2Client } = require('google-auth-library');

// Initialize the Google OAuth2 client with your client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Retrieve the ID token from the request body
    const { id_token } = req.body;

    try {
      // Verify the ID token with Google's API
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,  // Make sure this matches your Google Client ID
      });

      // Get the user info from the token's payload
      const payload = ticket.getPayload();
      const email = payload.email;  // Extract the user's email from the token

      // Respond with the user's email if the token is valid
      res.status(200).json({ success: true, email });
    } catch (error) {
      // Handle any errors that occur during verification
      console.error('Error verifying Google token:', error);
      res.status(400).json({ success: false, error: 'Invalid token' });
    }
  } else {
    // Handle unsupported methods (GET, PUT, etc.)
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
