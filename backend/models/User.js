const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { 
    type: String, 
    default: 'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg' 
  },
  profession: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
  },
  points: { type: Number, default: 0 },
  badges: [{ type: String, enum: ['Beginner', 'Intermediate', 'Expert', 'Master'] }],
  gameHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GameResult' }],
  createdAt: { type: Date, default: Date.now },
  isGuest: { type: Boolean, default: false },
  guestId: { type: String, unique: true, sparse: true },
  resetPasswordOTP: { type: String }, // Added for password reset
  resetPasswordExpires: { type: Date }, // Added for password reset
});

// Index for efficient cleanup of guest accounts
userSchema.index({ isGuest: 1, createdAt: 1 });

// Index for password reset cleanup
userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });

// Update badges based on points before saving
userSchema.pre('save', function (next) {
  const points = this.points || 0;
  const badges = [];
  if (points >= 1000) badges.push('Master');
  else if (points >= 500) badges.push('Expert');
  else if (points >= 100) badges.push('Intermediate');
  else badges.push('Beginner');
  this.badges = badges;
  next();
});

module.exports = mongoose.model('User', userSchema);