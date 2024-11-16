const express = require('express');
const path = require('path');
const cors = require('cors');
const feedbackHandler = require('./api/feedback'); // Import feedback handler
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON bodies for POST requests

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback-form.html')); // Serve the feedback form
});

// Feedback API Route
app.post('/api/feedback', async (req, res) => {
  const { email, feedback } = req.body;

  // Basic validation
  if (!email || !feedback) {
    return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
  }

  // Setup Nodemailer transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Your email address from .env
      pass: process.env.EMAIL_PASS,  // Your App password from .env
    },
  });

  // Create email message for the owner and user
  const ownerMailOptions = {
    from: process.env.EMAIL_USER,  // Sender email
    to: process.env.EMAIL_USER,  // Recipient email (owner's email)
    subject: 'New Feedback Received',
    text: `You have received new feedback from ${email}:\n\n${feedback}`,
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,  // Sender email
    to: email,  // Recipient email (user's email)
    subject: 'Thank You for Your Feedback',
    text: `Dear ${email},\n\nThank you for your feedback:\n\n"${feedback}"\n\nWe appreciate your thoughts and will consider them to improve our service.`,
  };

  try {
    // Send email to the owner
    await transporter.sendMail(ownerMailOptions);

    // Send email to the user
    await transporter.sendMail(userMailOptions);

    // Send success response
    res.status(200).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
