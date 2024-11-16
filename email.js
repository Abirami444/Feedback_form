const nodemailer = require('nodemailer');

// Create a transporter for Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail (you can change this to another email provider)
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail app password (not your regular password)
  },
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 * @returns {Promise} - Resolves when email is sent successfully
 */
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email address
    to, // Recipient email address
    subject, // Email subject
    text, // Email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}

module.exports = { sendEmail };
