const express = require('express');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { content, rating } = req.body;
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

module.exports = router;