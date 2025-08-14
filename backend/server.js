const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./socket');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cron = require('node-cron');
const { cleanupGuests } = require('./utils/cleanup');

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'https://math-quiz-next.vercel.app',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS error:', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

cron.schedule('0 0 * * *', async () => {
  console.log('Running guest account cleanup');
  try {
    await cleanupGuests();
  } catch (error) {
    console.error('Scheduled cleanup failed:', error.message);
  }
});

cron.schedule('0 * * * *', async () => {
  console.log('Running expired OTP cleanup');
  try {
    await User.deleteMany({
      resetPasswordExpires: { $lt: new Date() },
      resetPasswordOTP: { $exists: true },
    });
  } catch (error) {
    console.error('Scheduled OTP cleanup failed:', error.message);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});