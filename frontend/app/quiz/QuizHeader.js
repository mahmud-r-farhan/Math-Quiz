import React from 'react';

const QuizHeader = ({ streak, timeLeft }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="text-white text-lg font-semibold">Streak: {streak}</div>
    <div className="text-white text-lg font-semibold">Time: {timeLeft}s</div>
  </div>
);

export default QuizHeader;