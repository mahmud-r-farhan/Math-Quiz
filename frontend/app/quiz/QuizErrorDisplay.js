import React from 'react';

const QuizErrorDisplay = ({ error, socketError }) => (
  <>
    {error && (
      <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
        {error}
      </p>
    )}
    {socketError && (
      <p className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
        {socketError}
      </p>
    )}
  </>
);

export default QuizErrorDisplay;