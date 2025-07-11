const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const GameResult = require('../models/GameResult');
const router = express.Router();

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const history = await GameResult.find({ user: req.params.id })
      .sort({ completedAt: -1 })
      .limit(10);
    res.json({ user, history });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, profession, socialLinks, profilePicture } = req.body;
    const user = await User.findById(req.user.id);
    
    if (username) user.username = username;
    if (profession) user.profession = profession;
    if (socialLinks) user.socialLinks = socialLinks;
    if (profilePicture) user.profilePicture = profilePicture;
    
    await user.save();
    res.json({ user: user.toObject({ getters: true }) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ points: -1 })
      .limit(10)
      .select('username points profilePicture');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;