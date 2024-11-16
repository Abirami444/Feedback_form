const nodemailer = require('nodemailer');

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Destructure the email and feedback from the request body
      const { email, feedback } = req.body;

      // Check if both email and feedback are provided
      if (!email || !feedback) {
        return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
      }

      // Create the transporter object for Nodemailer using Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,  // Your Gmail address
          pass: process.env.EMAIL_PASS,  // Your Gmail app password
        },
      });

      // Email options for the owner
      const ownerMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,  // Owner's email (same as EMAIL_USER for this case)
        subject: 'New Feedback Received',
        text: `You have received new feedback from ${email}:\n\n${feedback}`,
      };

      // Email options for the user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,  // User's email
        subject: 'Thank You for Your Feedback',
        text: `Dear ${email},\n\nThank you for your feedback:\n\n"${feedback}"\n\nWe appreciate your thoughts and will consider them to improve our service.`,
      };

      // Send emails
      await transporter.sendMail(ownerMailOptions);
      await transporter.sendMail(userMailOptions);

      // Send response back to the client
      res.status(200).json({ success: true, message: 'Feedback submitted successfully.' });

    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}

// Use module.exports to export the handler function
module.exports = handler;
