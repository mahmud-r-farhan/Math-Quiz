const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://math-quiz-next.vercel.app',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10, // Increased attempts
    reconnectionDelay: 2000, // Slightly longer delay
    reconnectionDelayMax: 5000,
    pingTimeout: 30000, // Increased timeout
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('Socket auth error: No token provided', { socketId: socket.id });
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.join('all');
      console.log('Socket authenticated:', { socketId: socket.id, userId: socket.userId });
      next();
    } catch (error) {
      console.log('Socket auth error:', { message: error.message, socketId: socket.id });
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', { socketId: socket.id, userId: socket.userId });

    socket.on('startQuiz', ({ difficulty, optionCount, userId }) => {
      console.log('startQuiz received:', { difficulty, optionCount, userId, socketId: socket.id });
      if (socket.userId !== userId) {
        console.log('Unauthorized user:', { socketUserId: socket.userId, userId });
        socket.emit('error', { message: 'Unauthorized user' });
        return;
      }
      if (!['easy', 'normal', 'hard', 'genius'].includes(difficulty)) {
        console.log('Invalid difficulty:', { difficulty, socketId: socket.id });
        socket.emit('error', { message: 'Invalid difficulty' });
        return;
      }
      if (![4, 6].includes(optionCount)) {
        console.log('Invalid option count:', { optionCount, socketId: socket.id });
        socket.emit('error', { message: 'Invalid option count' });
        return;
      }

      try {
        const { generateMathQuestion } = require('./utils/questionGenerator');
        const questions = Array.from({ length: 10 }, () => generateMathQuestion(difficulty, optionCount));
        console.log('Emitting quizQuestions:', { questionCount: questions.length, userId: socket.userId });
        socket.emit('quizQuestions', { questions, userId });
      } catch (error) {
        console.log('Quiz generation error:', { message: error.message, socketId: socket.id });
        socket.emit('error', { message: 'Failed to generate quiz questions' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', { socketId: socket.id, userId: socket.userId, reason });
    });

    socket.on('error', (error) => {
      console.log('Socket error:', { message: error.message, socketId: socket.id });
    });
  });

  return io;
};

module.exports = { initializeSocket };