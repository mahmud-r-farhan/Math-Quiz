const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.CLIENT_URL,
          'http://localhost:3000',
          'https://math-quiz-next.vercel.app',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('CORS error:', { origin, allowedOrigins });
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 2000,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('Socket auth error: No token provided', {
        socketId: socket.id,
        headers: socket.handshake.headers,
        time: new Date().toISOString(),
      });
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.join('all');
      console.log('Socket authenticated:', {
        socketId: socket.id,
        userId: socket.userId,
        namespace: socket.nsp.name,
        time: new Date().toISOString(),
      });
      next();
    } catch (error) {
      console.log('Socket auth error:', {
        message: error.message,
        socketId: socket.id,
        token: token.substring(0, 10) + '...',
        namespace: socket.nsp.name,
        time: new Date().toISOString(),
      });
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', {
      socketId: socket.id,
      userId: socket.userId,
      namespace: socket.nsp.name,
      time: new Date().toISOString(),
    });

    socket.on('startQuiz', ({ difficulty, optionCount, quizLength, userId }) => {
      console.log('startQuiz received:', { difficulty, optionCount, quizLength, userId, socketId: socket.id });
      if (socket.userId !== userId) {
        console.log('Unauthorized user:', { socketUserId: socket.userId, userId, socketId: socket.id });
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
      if (![5, 10, 15].includes(quizLength)) {
        console.log('Invalid quiz length:', { quizLength, socketId: socket.id });
        socket.emit('error', { message: 'Invalid quiz length' });
        return;
      }

      try {
        const { generateMathQuestion } = require('./utils/questionGenerator');
        const questions = Array.from({ length: quizLength }, () => generateMathQuestion(difficulty, optionCount));
        if (questions.some((q) => !q._id || !q.questionText || !q.correctAnswer || !q.options || q.options.length !== optionCount)) {
          console.log('Invalid questions generated:', { questions, socketId: socket.id });
          socket.emit('error', { message: 'Failed to generate valid quiz questions' });
          return;
        }
        console.log('Emitting quizQuestions:', { questionCount: questions.length, userId: socket.userId });
        socket.emit('quizQuestions', { questions, userId });
      } catch (error) {
        console.log('Quiz generation error:', { message: error.message, socketId: socket.id });
        socket.emit('error', { message: 'Failed to generate quiz questions' });
      }
    });

    socket.on('scoreUpdate', async ({ userId, points }) => {
      try {
        const user = await require('../models/User').findById(userId);
        if (!user) {
          console.log('User not found for score update:', { userId, socketId: socket.id });
          socket.emit('error', { message: 'User not found' });
          return;
        }
        user.points = (user.points || 0) + points;
        await user.save();
        io.to('all').emit('scoreUpdate', { userId: user._id, points: user.points, badges: user.badges });
        const leaderboard = await require('../models/User').find().sort({ points: -1 }).limit(10).select('username points profilePicture badges');
        io.to('all').emit('leaderboardUpdate', { users: leaderboard });
      } catch (error) {
        console.log('Score update error:', { message: error.message, socketId: socket.id });
        socket.emit('error', { message: 'Failed to update score' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', {
        socketId: socket.id,
        userId: socket.userId,
        reason,
        namespace: socket.nsp.name,
        time: new Date().toISOString(),
      });
    });

    socket.on('error', (error) => {
      console.log('Socket error:', { message: error.message, socketId: socket.id, namespace: socket.nsp.name });
    });
  });

  return io;
};

module.exports = { initializeSocket };