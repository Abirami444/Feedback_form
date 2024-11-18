import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Google Sheets API setup
const sheets = google.sheets('v4');
const spreadsheetId = '1D-DlKlmsARAAtdTj8wmM8_3rVltUJxQR6LMVZyVqeeM'; // Replace with your Google Sheets ID

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, feedback } = req.body;

      // Validate input
      if (!email || !feedback) {
        return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
      }

      // Authenticate Google API using the service account
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY), // Service account key from environment variable
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await auth.getClient();
      google.options({ auth: authClient });

      // Get the current timestamp in IST
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
      const istDate = new Date(now.getTime() + istOffset);
      const timestamp = istDate.toISOString().replace('T', ' ').split('.')[0]; // Format as 'YYYY-MM-DD HH:mm:ss'

      // Write data to Google Sheets
      const values = [[email, feedback, timestamp]]; // Email, Feedback, Timestamp
      const range = 'Sheet1!A:C'; // Adjusted range for three columns: email, feedback, timestamp

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });

      // Set up Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Gmail address
          pass: process.env.EMAIL_PASS, // Gmail app password (App-specific password)
        },
      });

      // Email options for the owner
      const ownerMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Feedback Received',
        text: `You have received new feedback from ${email}:\n\n${feedback}`,
      };

      // Email options for the user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Your Feedback',
        text: `Dear ${email},\n\nThank you for your feedback:\n\n"${feedback}"\n\nWe appreciate your thoughts and will consider them to improve our service.`,
      };

      // Send emails
      await transporter.sendMail(ownerMailOptions);
      await transporter.sendMail(userMailOptions);

      // Respond to the client
      res.status(200).json({ success: true, message: 'Feedback submitted successfully.' });

    } catch (error) {
      console.error('Error processing feedback:', error.message);
      res.status(500).json({ success: false, message: `Internal Server Error: ${error.message}` });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
