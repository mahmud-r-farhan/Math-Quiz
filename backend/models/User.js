const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg' },
  profession: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
  },
  points: { type: Number, default: 0 },
  gameHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GameResult' }],
  createdAt: { type: Date, default: Date.now },
  isGuest: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);