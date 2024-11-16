const { sendEmail } = require('./google-auth');  // Import the email sending function

async function handler(req, res) {
  // Check if the request is a POST request
  if (req.method === 'POST') {
    const { email, feedback } = req.body;

    // Validate if email and feedback are provided
    if (!email || !feedback) {
      return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
    }

    console.log('Received Feedback:', { email, feedback });

    // Prepare the user and owner messages
    const userMessage = `Thank you for your feedback!\n\nHere’s what you submitted:\n${feedback}`;
    const ownerMessage = `New feedback submitted:\n\nUser Email: ${email}\nFeedback: ${feedback}`;
    const ownerEmail = 'utube2763@gmail.com'; // The restaurant owner’s email

    try {
      // Send confirmation email to the user
      console.log('Sending confirmation email to:', email);
      await sendEmail(email, 'Thank you for your feedback!', userMessage);

      // Send notification email to the owner
      console.log('Sending feedback notification to owner:', ownerEmail);
      await sendEmail(ownerEmail, 'New Feedback Submitted', ownerMessage);

      // Send success response
      res.status(200).json({ success: true, message: 'Feedback submitted and emails sent!' });
    } catch (error) {
      // Log the error and respond with a failure message
      console.error('Error while sending email:', error);
      res.status(500).json({ success: false, message: 'Error submitting feedback and sending emails' });
    }
  } else {
    // Respond with a 405 if the request method is not POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

module.exports = handler;
