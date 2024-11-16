const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { googleAuth } = require('google-auth-library');

// Set up Google Sheets API
const sheets = google.sheets('v4');
const spreadsheetId = '1LDf333IzboA9IpMHqJQvGgFXU9vVmhMVER_Ug1Ym2I4'; // Replace with your actual Google Sheets ID

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Destructure the email and feedback from the request body
      const { email, feedback } = req.body;

      // Check if both email and feedback are provided
      if (!email || !feedback) {
        return res.status(400).json({ success: false, message: 'Email and feedback are required.' });
      }

      // Authenticate Google API using the service account
      const auth = new google.auth.GoogleAuth({
        keyFile: './service-account-key.json',  // Path to your service account JSON key file
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Get an authenticated client
      const authClient = await auth.getClient();
      google.options({ auth: authClient });

      // Prepare the data to be written to the Google Sheet
      const timestamp = new Date().toISOString();
      const values = [
        [email, feedback, timestamp]  // Adding email, feedback, and timestamp to the sheet
      ];

      // Specify the range where the data should be inserted (e.g., Sheet1!A:C)
      const range = 'Sheet1!A:C'; // Adjust the range according to your sheet structure

      // Write data to the Google Sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });

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
      console.error('Error processing feedback:', error);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}

// Export the handler function
module.exports = handler;
