const mongoose = require('mongoose');

// Define the structure of a contact message
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Export the model so server.js can use it
module.exports = mongoose.model('Message', messageSchema);