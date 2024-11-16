const nodemailer = require('nodemailer');

// Feedback handler
module.exports = async (req, res) => {
  const { email, feedback } = req.body;

  if (!email || !feedback) {
    return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
  }

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Prepare email for the owner
  const ownerMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,  // Owner's email
    subject: 'New Feedback Received',
    text: `You have received new feedback from ${email}:\n\n${feedback}`,
  };

  // Prepare email for the user
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,  // User's email
    subject: 'Thank You for Your Feedback',
    text: `Dear ${email},\n\nThank you for your feedback:\n\n"${feedback}"\n\nWe appreciate your thoughts and will consider them to improve our service.`,
  };

  try {
    // Send email to the owner
    await transporter.sendMail(ownerMailOptions);

    // Send email to the user
    await transporter.sendMail(userMailOptions);

    // Respond with success message
    res.status(200).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};
