const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// All routes here are protected by authMiddleware

// @route   GET /api/messages
// @desc    Get all contact messages (newest first)
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching messages.'
        });
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Message not found.'
            });
        }

        await Message.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Message deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting message.'
        });
    }
});

module.exports = router;
