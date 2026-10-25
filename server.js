const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the Message model and email service
const Message = require('./models/Message');
const { verifyTransporter, sendContactEmails } = require('./services/emailService');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Portfolio backend is up and running!' });
});

// POST Route for Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Simple validation check
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required!' });
        }

        // Create and save the new message to MongoDB Atlas
        const newMessage = new Message({ name, email, message });
        await newMessage.save();

        // Send notification email to admin and thank-you email to user
        try {
            await sendContactEmails({ name, email, message });
            console.log(`Notification and thank-you emails sent successfully for ${email}`);
        } catch (emailError) {
            console.error('Error sending email notifications:', emailError);
            // Message was saved to database, so proceed without failing the user submission
        }

        res.status(201).json({ success: true, message: 'Message sent and saved successfully!' });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
    }
});

// Diagnostic Route - Test email sending (REMOVE after debugging)
app.get('/api/test-email', async (req, res) => {
    const diagnostics = {
        RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
        RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 6) + '***' : 'NOT SET',
        EMAIL_USER_SET: !!process.env.EMAIL_USER,
        EMAIL_USER_VALUE: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : 'NOT SET',
        FROM_EMAIL: process.env.FROM_EMAIL || 'onboarding@resend.dev (default)',
    };

    try {
        // Step 1: Verify API key
        await verifyTransporter();
        diagnostics.API_KEY_VERIFY = 'SUCCESS';
    } catch (verifyErr) {
        diagnostics.API_KEY_VERIFY = 'FAILED';
        diagnostics.VERIFY_ERROR = verifyErr.message;
        return res.json({ success: false, diagnostics });
    }

    try {
        // Step 2: Try sending a test email to yourself
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.FROM_EMAIL || 'Dipesh Chaudhary <onboarding@resend.dev>';

        const recipient = process.env.EMAIL_USER || 'chaudharydipesh9765@gmail.com';

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [recipient],
            subject: 'Render Email Test (Resend)',
            text: 'If you receive this, Render + Resend can send emails!',
        });

        if (error) {
            diagnostics.SEND_TEST = 'FAILED';
            diagnostics.SEND_ERROR = error.message;
            return res.json({ success: false, diagnostics });
        }

        diagnostics.SEND_TEST = 'SUCCESS';
        diagnostics.EMAIL_ID = data?.id;
        return res.json({ success: true, diagnostics });
    } catch (sendErr) {
        diagnostics.SEND_TEST = 'FAILED';
        diagnostics.SEND_ERROR = sendErr.message;
        return res.json({ success: false, diagnostics });
    }
});

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully!');

        // Verify Resend API key on startup
        if (process.env.RESEND_API_KEY) {
            verifyTransporter()
                .then(() => console.log('Resend API key is valid and ready to send emails.'))
                .catch((err) => console.error('Resend API key verification failed:', err.message));
        } else {
            console.warn('WARNING: RESEND_API_KEY is not set. Email sending will fail.');
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });