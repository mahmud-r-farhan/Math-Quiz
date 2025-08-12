const express = require('express');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { content, rating } = req.body;
    if (!content || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid feedback data' });
    }

    // Check if user has already submitted feedback
    const existingFeedback = await Feedback.findOne({ user: req.user.id });
    if (existingFeedback) {
      return res.status(403).json({ message: 'You have already submitted feedback' });
    }

    const feedback = new Feedback({
      user: req.user.id,
      content,
      rating,
    });
    await feedback.save();
    res.status(201).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// New endpoint to check if user has submitted feedback
router.get('/hasSubmitted', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ user: req.user.id });
    res.json({ hasSubmitted: !!feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;