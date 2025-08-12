const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('../config/firebaseAdmin');

const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername.replace(/[^a-zA-Z0-9]/g, '') || `guest_${Date.now()}`;
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
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('isGuest').optional().isBoolean().withMessage('isGuest must be a boolean'),
    body('password').custom((value, { req }) => {
      if (req.body.isGuest) {
        // For guest accounts, password is optional and ignored
        return true;
      }
      // For non-guest accounts, password must be at least 6 characters
      if (!value || value.length < 6) {
        throw new Error('Password must be at least 6 characters for non-guest accounts');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array(), { body: req.body });
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { username, email, password, isGuest } = req.body;

      // Check for existing user (guest or non-guest) with the same email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.isGuest && isGuest && existingUser.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          await User.deleteOne({ _id: existingUser._id });
          console.log('Deleted expired guest account:', email);
        } else {
          console.warn('Registration failed: Email already exists', { email, isGuest });
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      if (isGuest) {
        const generatedUsername = await generateUniqueUsername(username || `guest_${Date.now()}`);
        const user = new User({
          username: generatedUsername,
          email,
          password: await bcrypt.hash('guest', 10), // Hash default guest password
          isGuest: true,
          guestId: uuidv4(),
        });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Guest registered:', { userId: user._id, username: user.username, email, guestId: user.guestId });
        return res.status(201).json({
          token,
          user: { id: user._id, username: user.username, email, isGuest: true, guestId: user.guestId },
        });
      }

      // Non-guest registration
      if (await User.findOne({ username })) {
        console.warn('Registration failed: Username already exists', { username });
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword, isGuest: false });
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      console.log('User registered:', { userId: user._id, username, email });
      res.status(201).json({
        token,
        user: { id: user._id, username, email, badges: user.badges, isGuest: false },
      });
    } catch (error) {
      console.error('Registration error:', error.message, error.stack, { body: req.body });
      res.status(500).json({ message: 'Server error during registration' });
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
      console.error('Login validation errors:', errors.array(), { body: req.body });
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || (user.isGuest && password !== 'guest') || (!user.isGuest && !await bcrypt.compare(password, user.password))) {
        console.warn('Login failed: Invalid credentials', { email });
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      console.log('User logged in:', { userId: user._id, username: user.username, email });
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email,
          isGuest: user.isGuest,
          badges: user.badges,
          ...(user.isGuest && { guestId: user.guestId }),
        },
      });
    } catch (error) {
      console.error('Login error:', error.message, error.stack, { body: req.body });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      console.warn('Google auth failed: No ID token provided');
      return res.status(400).json({ message: 'No ID token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken).catch((error) => {
      console.error('Token verification error:', error.message, error.stack);
      throw new Error('Invalid or expired ID token');
    });

    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      const username = await generateUniqueUsername(name || `user_${Date.now()}`);
      user = new User({
        username,
        email,
        password: await bcrypt.hash('google-auth', 10),
        profilePicture: picture,
        isGuest: false,
      });
      await user.save();
      console.log('Google auth user created:', { userId: user._id, username, email });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Google auth successful:', { userId: user._id, username: user.username, email });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email,
        profilePicture: user.profilePicture,
        isGuest: user.isGuest,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error.message, error.stack, { body: req.body });
    res.status(400).json({ message: error.message || 'Google authentication failed' });
  }
});

router.post('/convert-guest', async (req, res) => {
  try {
    const { guestId, username, email, password } = req.body;
    const user = await User.findOne({ guestId });
    if (!user || !user.isGuest) {
      console.warn('Convert guest failed: Invalid guest account', { guestId });
      return res.status(400).json({ message: 'Invalid guest account' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.warn('Convert guest failed: Username or email already exists', { username, email });
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.isGuest = false;
    user.guestId = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Guest account converted:', { userId: user._id, username, email });
    res.json({
      token,
      user: { id: user._id, username, email, badges: user.badges, isGuest: false },
    });
  } catch (error) {
    console.error('Convert guest error:', error.message, error.stack, { body: req.body });
    res.status(500).json({ message: 'Server error during guest conversion' });
  }
});

module.exports = router;