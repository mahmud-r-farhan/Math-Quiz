const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'normal', 'hard', 'genius'],
  },
  score: {
    correct: { type: Number, required: true, min: 0 },
    wrong: { type: Number, required: true, min: 0 },
    skipped: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  pointsEarned: { type: Number, required: true, min: 0 },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  timeTaken: { type: Number, required: true, min: 0 },
  streak: { type: Number, required: true, min: 0 },
  questions: [{
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String },
    isCorrect: { type: Boolean },
  }],
  createdAt: { type: Date, default: Date.now},
});

gameResultSchema.pre('save', function (next) {
  if (this.score.total > 0) {
    this.accuracy = Math.round((this.score.correct / this.score.total) * 100);
  } else {
    this.accuracy = 0;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log('Validating GameResult:', {
      user: this.user,
      difficulty: this.difficulty,
      score: this.score,
      accuracy: this.accuracy,
      questionsLength: this.questions.length,
    });
  }
  next();
});

gameResultSchema.methods.calculatePoints = function () {
  const difficultyMultipliers = {
    easy: 1,
    normal: 1.1,
    hard: 1.3,
    genius: 1.5,
  };
  const points = this.score.correct * (difficultyMultipliers[this.difficulty] || 1);
  return Math.round(points);
};

module.exports = mongoose.model('GameResult', gameResultSchema);