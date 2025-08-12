const User = require('../models/User');

const cleanupGuests = async () => {
  try {
    const result = await User.deleteMany({
      isGuest: true,
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    console.log(`Cleaned up ${result.deletedCount} expired guest accounts`);
    return result;
  } catch (error) {
    console.error('Error cleaning up guest accounts:', error.message, error.stack);
    throw error;
  }
};

module.exports = { cleanupGuests };