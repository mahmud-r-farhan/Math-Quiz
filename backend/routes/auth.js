const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('../config/firebaseAdmin');
const { sendResetPasswordEmail } = require('../utils/email');

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
        return true;
      }
      if (!value || value.length < 6) {
        throw new Error('Password must be at least 6 characters for non-guest accounts');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { username, email, password, isGuest } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.isGuest && isGuest && existingUser.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          await User.deleteOne({ _id: existingUser._id });
        } else {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      if (isGuest) {
        const generatedUsername = await generateUniqueUsername(username || `guest_${Date.now()}`);
        const user = new User({
          username: generatedUsername,
          email,
          password: await bcrypt.hash('guest', 10),
          isGuest: true,
          guestId: uuidv4(),
        });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(201).json({
          token,
          user: { id: user._id, username: user.username, email, isGuest: true, guestId: user.guestId },
        });
      }

      if (await User.findOne({ username })) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword, isGuest: false });
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({
        token,
        user: { id: user._id, username, email, badges: user.badges, isGuest: false },
      });
    } catch (error) {
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
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || (user.isGuest && password !== 'guest') || (!user.isGuest && !await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'No ID token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken).catch((error) => {
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
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });;
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
    res.status(400).json({ message: error.message || 'Google authentication failed' });
  }
});

router.post('/convert-guest', async (req, res) => {
  try {
    const { guestId, username, email, password } = req.body;
    const user = await User.findOne({ guestId });
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
    user.guestId = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username, email, badges: user.badges, isGuest: false },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during guest conversion' });
  }
});

// Request password reset
router.post(
  '/reset-password/request',
  [
    body('email').isEmail().withMessage('Invalid email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user || user.isGuest) {
        return res.status(404).json({ message: 'User not found or is a guest account' });
      }

      // Generate 8-digit OTP
      const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
      const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

      // Store OTP and expiration in user document
      user.resetPasswordOTP = await bcrypt.hash(otp, 10);
      user.resetPasswordExpires = otpExpires;
      await user.save();

      // Send OTP email
      await sendResetPasswordEmail(email, otp);
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
      res.status(500).json({ message: 'Server error during password reset request' });
    }
  }
);

// Verify OTP and reset password
router.post(
  '/reset-password/verify',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('otp').isLength({ min: 8, max: 8 }).withMessage('OTP must be 8 digits'),
    body('newPassword').optional().custom((value, { req }) => {
      if (!value) return true; // Allow empty newPassword for OTP verification only
      if (value.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }
      if (!/[A-Z]/.test(value)) {
        throw new Error('New password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(value)) {
        throw new Error('New password must contain at least one lowercase letter');
      }
      if (!/\d/.test(value)) {
        throw new Error('New password must contain at least one number');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({ 
        email, 
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      const isValidOTP = await bcrypt.compare(otp, user.resetPasswordOTP);
      if (!isValidOTP) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // If newPassword is provided, update the password
      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email,
            isGuest: user.isGuest,
            badges: user.badges,
          },
        });
      }
      res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error during password reset' });
    }
  }
);

module.exports = router;