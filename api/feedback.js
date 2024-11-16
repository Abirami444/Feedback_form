const { sendEmail } = require('./google-auth'); // Assuming this is your email-sending logic

async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, feedback } = req.body;

    const userMessage = `Thank you for your feedback!\n\nHere’s what you submitted:\n${feedback}`;
    const ownerMessage = `New feedback submitted:\n\nUser Email: ${email}\nFeedback: ${feedback}`;
    const ownerEmail = 'utube2763@gmail.com'; // Change to the restaurant owner’s email

    try {
      // Send confirmation email to the user
      await sendEmail(email, 'Thank you for your feedback!', userMessage);

      // Send notification email to the owner
      await sendEmail(ownerEmail, 'New Feedback Submitted', ownerMessage);

      res.status(200).json({ success: true, message: 'Feedback submitted and emails sent!' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Error submitting feedback and sending emails' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

module.exports = handler;  // Export the handler function
