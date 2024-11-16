const express = require('express');
const path = require('path');
const cors = require('cors');  // Import CORS package
const feedbackHandler = require('./api/feedback');  // Import the feedback handler

const app = express();

// Enable CORS for all origins (can be customized for specific origins)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., your feedback form HTML)
app.use(express.static(path.join(__dirname, 'public')));

// API route to handle feedback submissions
app.post('/api/feedback', feedbackHandler);  // Use feedbackHandler directly

// Catch-all route for other requests (e.g., page requests)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,  'feedback-form.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
