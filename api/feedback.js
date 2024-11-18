import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Google Sheets API setup
const sheets = google.sheets('v4');
const spreadsheetId = '1D-DlKlmsARAAtdTj8wmM8_3rVltUJxQR6LMVZyVqeeM'; // Replace with your Google Sheets ID

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, food, service, ambiance, feedback } = req.body;

      // Validate input
      if (!email || !food || !service || !ambiance || !feedback) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields (email, ratings, and feedback) are required.' 
        });
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
      const values = [[email, food, service, ambiance, feedback, timestamp]]; // New columns for ratings
      const range = 'Sheet1!A:F'; // Updated range for six columns: email, food, service, ambiance, feedback, timestamp

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
        text: `You have received new feedback:\n
        Email: ${email}\n
        Food Quality: ${food}/5\n
        Service: ${service}/5\n
        Ambiance: ${ambiance}/5\n
        Feedback:\n${feedback}\n\n
        Submitted on: ${timestamp}`,
      };

      // Email options for the user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Your Feedback',
        text: `Dear ${email},\n\nThank you for your feedback!\n\nHere are the details you submitted:\n
        Food Quality: ${food}/5\n
        Service: ${service}/5\n
        Ambiance: ${ambiance}/5\n
        Your Feedback: "${feedback}"\n\n
        We appreciate your thoughts and will use them to improve our services.\n\nBest regards,\n[Your Restaurant Name]`,
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
