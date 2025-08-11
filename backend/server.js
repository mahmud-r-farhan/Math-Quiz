const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const feedbackRoutes = require('./routes/feedback');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Security Middleware
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

connectDB();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feedback', feedbackRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.join('all');
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);

  socket.on('startQuiz', ({ difficulty, optionCount, userId }) => {
    if (socket.userId !== userId) {
      socket.emit('error', { message: 'Unauthorized user' });
      return;
    }
    if (!['easy', 'normal', 'hard', 'genius'].includes(difficulty)) {
      socket.emit('error', { message: 'Invalid difficulty' });
      return;
    }
    if (![4, 6].includes(optionCount)) {
      socket.emit('error', { message: 'Invalid option count' });
      return;
    }

    try {
      const questions = Array.from({ length: 10 }, () => generateMathQuestion(difficulty, optionCount));
      socket.emit('quizQuestions', { questions, userId });
    } catch (error) {
      console.error('Quiz generation error:', error);
      socket.emit('error', { message: 'Failed to generate quiz questions' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));