const { sendEmail } = require('./email'); // Import the Nodemailer function

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, feedback } = req.body;

    if (!email || !feedback) {
      return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
    }

    console.log('Received Feedback:', { email, feedback });

    const userMessage = `Thank you for your feedback!\n\nHere’s what you submitted:\n${feedback}`;
    const ownerMessage = `New feedback submitted:\n\nUser Email: ${email}\nFeedback: ${feedback}`;
    const ownerEmail = 'utube2763@gmail.com'; // Owner's email address

    try {
      // Send email to the user
      console.log('Sending confirmation email to:', email);
      await sendEmail(email, 'Thank you for your feedback!', userMessage);

      // Send email to the owner
      console.log('Sending feedback notification to owner:', ownerEmail);
      await sendEmail(ownerEmail, 'New Feedback Submitted', ownerMessage);

      return res.status(200).json({ success: true, message: 'Feedback submitted and emails sent!' });
    } catch (error) {
      console.error('Error while sending email:', error);
      return res.status(500).json({ success: false, message: 'Error submitting feedback and sending emails.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}
