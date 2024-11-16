const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Your feedback route
app.post('/api/feedback', (req, res) => {
    try {
        const { email, feedback } = req.body;
        if (!email || !feedback) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }
        // Process feedback...
        res.status(200).json({ success: true, message: 'Feedback received!' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
