import { addFeedbackToSheet } from '../google-sheets'; // Ensure this is your path

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, feedback } = req.body;

    if (!name || !email || !feedback) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Prepare the row to append to the sheet
    const rowData = [name, email, feedback];

    try {
      const spreadsheetId = '1nAt7R5BYbxZClHRvurnIfjhp41rjH8k-dTBOZ1gA-Nk'; // Your Google Sheet ID
      await addFeedbackToSheet(spreadsheetId, rowData);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error adding feedback:', error);
      res.status(500).json({ success: false, message: 'Error submitting feedback' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
