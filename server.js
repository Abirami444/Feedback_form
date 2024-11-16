const express = require('express');
const path = require('path');
const feedbackHandler = require('./api/feedback').default;  // API handler
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., your feedback form HTML)
app.use(express.static(path.join(__dirname, 'public')));

// API route to handle feedback submissions
app.post('/api/feedback', feedbackHandler);

// Catch-all route for other requests (e.g., page requests)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feedback-form.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
