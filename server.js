const express = require('express');
const path = require('path');
const cors = require('cors');
const feedbackHandler = require('./api/feedback'); // Import feedback handler
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback-form.html')); // Serve the feedback form
});

app.post('/api/feedback', feedbackHandler); // Feedback API route

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);  // Log the error details
  res.status(500).send('Something went wrong. Please try again later.');
});
