const express = require('express');
const path = require('path');
const cors = require('cors');  // Import CORS package
const feedbackHandler = require('./api/feedback');  // Import the feedback handler

const app = express();

// Enable CORS for all origins (you can specify origins if you want to restrict it)
app.use(cors({
  origin: 'http://localhost:3000', // Allow only localhost:3000 (if needed)
  methods: ['GET', 'POST'],  // Allow specific methods
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., your feedback form HTML and index.html)
app.use(express.static(path.join(__dirname)));

// Route to serve index.html when the user visits the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Serve index.html from the root
});

// API route to handle feedback submissions
app.post('/api/feedback', feedbackHandler);  // Use feedbackHandler directly

// Route to serve feedback form
app.get('/feedback-form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback-form.html')); // Serve feedback form
});

// Route to handle Google Sign-In callback
app.post('/api/google', (req, res) => {
  // This route will handle the POST request for Google Sign-In (your google.js logic)
  // This assumes you have implemented Google OAuth token verification in your google.js handler
  // Include the logic for token verification (already described in your `google.js`)
  // You can use the same `google.js` logic here, just be sure to import and call your Google verification functions
  res.send('Google sign-in endpoint');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
