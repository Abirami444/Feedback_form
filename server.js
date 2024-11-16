const express = require('express');
const path = require('path');
const cors = require('cors');
const feedbackHandler = require('./api/feedback'); // Feedback handler module

const app = express();

// CORS configuration to allow specific origins
app.use(
  cors({
    origin: 'http://localhost:3000', // Frontend origin
    methods: ['GET', 'POST'], // Allow only GET and POST
    allowedHeaders: ['Content-Type'], // Permit specific headers
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Route: Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Serve the feedback form
app.get('/feedback-form', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback-form.html'));
});

// Route: Handle feedback submissions (POST-only)
app.post('/api/feedback', feedbackHandler);

// Catch-all route to handle unsupported HTTP methods for `/api/feedback`
app.all('/api/feedback', (req, res) => {
  res.setHeader('Allow', ['POST']); // Inform the client that only POST is allowed
  res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
});

// Route: Google Sign-In callback
app.post('/api/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'No ID token provided.' });
    }

    const userInfo = await verifyGoogleToken(idToken); // Replace with your logic
    res.status(200).json({ success: true, message: 'Google sign-in successful!', userInfo });
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    res.status(500).json({ success: false, message: 'Error during Google sign-in.' });
  }
});

// Catch-all route for unmatched URLs
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Helper function: Verify Google token (replace with actual implementation)
async function verifyGoogleToken(idToken) {
  const { google } = require('googleapis');
  const client = new google.auth.OAuth2();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: '318295042974-knr55l1td7v94ik52lbp6ibcjs88fbtg.apps.googleusercontent.com', // Replace with your Google OAuth Client ID
  });
  return ticket.getPayload();
}
