const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('../config/firebaseAdmin');

const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername.replace(/[^a-zA-Z0-9]/g, '');
  let suffix = 1;
  while (await User.findOne({ username })) {
    username = `${baseUsername}_${suffix}`;
    suffix++;
  }
  return username;
};

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password, isGuest } = req.body;
      if (isGuest) {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const user = new User({ username: guestId, email: `${guestId}@guest.com`, password: 'guest', isGuest: true });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ token, user: { id: user._id, username: guestId, email: user.email, isGuest: true } });
      }

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user._id, username, email, badges: user.badges } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || (user.isGuest && password !== 'guest') || (!user.isGuest && !await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, username: user.username, email, isGuest: user.isGuest, badges: user.badges } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      const username = await generateUniqueUsername(name || `user_${Date.now()}`);
      user = new User({
        username,
        email,
        password: 'google-auth',
        profilePicture: picture || 'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg',
        isGuest: false,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isGuest: user.isGuest,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

router.post('/convert-guest', async (req, res) => {
  try {
    const { guestId, username, email, password } = req.body;
    const user = await User.findById(guestId);
    if (!user || !user.isGuest) {
      return res.status(400).json({ message: 'Invalid guest account' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.isGuest = false;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email, badges: user.badges } });
  } catch (error) {
    console.error('Convert guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;