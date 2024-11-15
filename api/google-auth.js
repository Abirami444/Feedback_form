const { OAuth2Client } = require('google-auth-library');

// Your Google Client ID
const CLIENT_ID = "318295042974-knr55l1td7v94ik52lbp6ibcjs88fbtg.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

export default async function handler(req, res) {
  // Check if the method is POST
  if (req.method === 'POST') {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ success: false, error: 'ID token is required' });
    }

    try {
      // Verify the ID token with Google's OAuth2Client
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID, // Specify the CLIENT_ID to verify audience
      });

      // Get the payload from the verified ID token
      const payload = ticket.getPayload();
      const email = payload.email; // Extract the email address

      console.log('Payload verified successfully:', payload);

      // Respond with success and the user's email
      res.status(200).json({ success: true, email, redirectUrl: '/feedback.html' });
    } catch (error) {
      console.error("Token verification failed:", error.message, error.stack);
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } else {
    // If the request is not a POST method, reject it
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }
}
