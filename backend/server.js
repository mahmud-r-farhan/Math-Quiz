const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cron = require('node-cron');
const { cleanupGuests } = require('./utils/cleanup');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.join('all');
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schedule guest account cleanup (runs daily at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running guest account cleanup');
  try {
    await cleanupGuests();
  } catch (error) {
    console.error('Scheduled cleanup failed:', error.message);
  }
});

// Schedule expired OTP cleanup (runs every hour)
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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});