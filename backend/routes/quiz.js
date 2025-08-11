const express = require('express');
const auth = require('../middleware/auth');
const { generateMathQuestion } = require('../utils/questionGenerator');
const GameResult = require('../models/GameResult');
const User = require('../models/User');
const router = express.Router();

router.post('/questions', auth, async (req, res) => {
  try {
    const { difficulty, optionCount } = req.body;
    if (!['easy', 'normal', 'hard', 'genius'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty' });
    }
    if (![4, 6].includes(optionCount)) {
      return res.status(400).json({ message: 'Invalid option count' });
    }

    const questions = Array.from({ length: 10 }, () => generateMathQuestion(difficulty, optionCount));
    res.json({ questions });
  } catch (error) {
    console.error('Quiz questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { difficulty, score, timeTaken, maxStreak, questions } = req.body;
    const gameResult = new GameResult({
      user: req.user.id,
      difficulty,
      score,
      pointsEarned: 0,
      accuracy: score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0,
      timeTaken,
      streak: maxStreak,
      questions,
    });

    gameResult.pointsEarned = gameResult.calculatePoints();
    await gameResult.save();

    const user = await User.findById(req.user.id);
    user.points += gameResult.pointsEarned;
    user.gameHistory.push(gameResult._id);
    await user.save();

    // Emit real-time events
    req.io.to('all').emit('scoreUpdate', { userId: user._id, points: user.points, badges: user.badges });
    const leaderboard = await User.find().sort({ points: -1 }).limit(10).select('username points profilePicture badges');
    req.io.to('all').emit('leaderboardUpdate', { users: leaderboard });

    res.status(201).json({ gameResult });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;