import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const sheets = google.sheets('v4');
const spreadsheetId = '1LDf333IzboA9IpMHqJQvGgFXU9vVmhMVER_Ug1Ym2I4'; // Replace with your Google Sheets ID

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, feedback } = req.body;

      // Check if both email and feedback are provided
      if (!email || !feedback) {
        return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
      }

      // Authenticate Google API using the service account
      const auth = new google.auth.GoogleAuth({
        keyFile: './service-account-key.json', // Path to your service account JSON key file
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await auth.getClient();
      google.options({ auth: authClient });

      // Prepare the data to write to Google Sheets
      const timestamp = new Date().toISOString();
      const values = [[email, feedback, timestamp]];

      // Specify the range where data will be added
      const range = 'Sheet1!A:C'; // Adjust as per your sheet

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });

      // Create Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS, // Your Gmail app password
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
      console.error('Error processing feedback:', error);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
