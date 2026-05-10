const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { protect } = require('../middleware/auth');

// Create a new support ticket
router.post('/tickets', protect, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      message,
      category,
      priority
    });

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's own tickets
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
