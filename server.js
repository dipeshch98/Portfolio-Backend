// Force Node.js to use Google DNS to bypass local network lookup blocks
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the Message model and email service
const Message = require('./models/Message');
const { transporter, sendContactEmails } = require('./services/emailService');

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

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully!');

        // Verify Nodemailer transporter configuration
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter.verify((error, success) => {
                if (error) {
                    console.error('Nodemailer configuration error:', error);
                } else {
                    console.log('Nodemailer is configured and ready to send emails.');
                }
            });
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });