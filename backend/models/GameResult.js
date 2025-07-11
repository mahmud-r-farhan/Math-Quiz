const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  difficulty: { type: String, required: true },
  score: {
    correct: Number,
    wrong: Number,
    total: Number,
  },
  pointsEarned: Number,
  accuracy: Number,
  timeTaken: Number,
  streak: Number,
  questions: [{
    questionId: String,
    questionText: String,
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
  }],
  completedAt: { type: Date, default: Date.now },
});

gameResultSchema.methods.calculatePoints = function () {
  const difficultyMultipliers = {
    easy: 1,
    normal: 2,
    hard: 3,
    genius: 5,
  };
  return this.score.correct * difficultyMultipliers[this.difficulty] * 10 + this.streak * 5;
};

module.exports = mongoose.model('GameResult', gameResultSchema);