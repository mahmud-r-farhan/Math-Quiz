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
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { difficulty, score, timeTaken, streak, questions } = req.body;
    const gameResult = new GameResult({
      user: req.user.id,
      difficulty,
      score,
      pointsEarned: 0,
      accuracy: score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0,
      timeTaken,
      streak,
      questions,
    });

    gameResult.pointsEarned = gameResult.calculatePoints();
    await gameResult.save();

    const user = await User.findById(req.user.id);
    user.points += gameResult.pointsEarned;
    user.gameHistory.push(gameResult._id);
    await user.save();

    res.status(201).json({ gameResult });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;