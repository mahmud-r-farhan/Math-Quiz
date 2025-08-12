const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { generateMathQuestion } = require('../utils/questionGenerator');
const GameResult = require('../models/GameResult');
const User = require('../models/User');
const router = express.Router();

router.post('/questions', auth, async (req, res) => {
  try {
    const { difficulty, optionCount } = req.body;
    if (!['easy', 'normal', 'hard', 'genius'].includes(difficulty)) {
      console.error('Invalid difficulty:', difficulty);
      return res.status(400).json({ message: 'Invalid difficulty' });
    }
    if (![4, 6].includes(optionCount)) {
      console.error('Invalid option count:', optionCount);
      return res.status(400).json({ message: 'Invalid option count' });
    }

    const questions = Array.from({ length: 10 }, () => generateMathQuestion(difficulty, optionCount));
    console.log('Generated questions for user:', req.user.id, {
      count: questions.length,
      questionIds: questions.map(q => q._id),
      firstQuestion: questions[0],
    });
    res.json({ questions });
  } catch (error) {
    console.error('Quiz questions error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { difficulty, score, timeTaken, maxStreak, questions } = req.body;
    const token = req.headers.authorization?.split('Bearer ')[1];

    // Detailed validation
    const missingFields = [];
    if (!difficulty) missingFields.push('difficulty');
    if (!score) missingFields.push('score');
    else {
      if (!score.correct && score.correct !== 0) missingFields.push('score.correct');
      if (!score.wrong && score.wrong !== 0) missingFields.push('score.wrong');
      if (!score.skipped && score.skipped !== 0) missingFields.push('score.skipped');
      if (!score.total && score.total !== 0) missingFields.push('score.total');
    }
    if (timeTaken === undefined) missingFields.push('timeTaken');
    if (maxStreak === undefined) missingFields.push('maxStreak');
    if (!questions || !Array.isArray(questions)) missingFields.push('questions');
    if (score.total !== questions.length) {
      missingFields.push(`score.total (${score.total}) does not match questions length (${questions.length})`);
    }
    if (questions.some(q => !q.questionId)) {
      missingFields.push('questionId missing in some questions');
    }

    if (missingFields.length > 0) {
      console.error('Validation failed:', { missingFields, payload: req.body });
      return res.status(400).json({ message: `Missing or invalid required fields: ${missingFields.join(', ')}` });
    }

    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('Invalid token, treating as guest:', err.message);
      }
    }

    const gameResult = new GameResult({
      user: userId,
      difficulty,
      score: {
        correct: score.correct,
        wrong: score.wrong,
        skipped: score.skipped,
        total: score.total,
      },
      pointsEarned: 0,
      accuracy: 0,
      timeTaken,
      streak: maxStreak,
      questions: questions.map(q => ({
        questionId: String(q.questionId),
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect,
      })),
    });

    gameResult.pointsEarned = gameResult.calculatePoints();
    await gameResult.save();

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.points = (user.points || 0) + gameResult.pointsEarned;
      user.gameHistory = user.gameHistory || [];
      user.gameHistory.push(gameResult._id);
      await user.save();

      if (req.io) {
        try {
          req.io.to('all').emit('scoreUpdate', { userId: user._id, points: user.points, badges: user.badges });
          const leaderboard = await User.find().sort({ points: -1 }).limit(10).select('username points profilePicture badges');
          req.io.to('all').emit('leaderboardUpdate', { users: leaderboard });
        } catch (socketError) {
          console.error('Socket.IO emission error:', socketError.message);
        }
      }
    }

    res.status(201).json({ gameResult });
  } catch (error) {
    console.error('Quiz submission error:', error.message, error.stack, { payload: req.body });
    res.status(500).json({ message: `Failed to submit quiz: ${error.message}` });
  }
});

module.exports = router;