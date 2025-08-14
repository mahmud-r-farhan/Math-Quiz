import React from 'react';

const QuizOptions = ({ optionCount, setOptionCount, quizLength, setQuizLength, startQuiz, isLoading }) => (
  <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-4 sm:p-6 lg:p-8 text-center relative z-10">
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">Number of Options</label>
      <select
        value={optionCount}
        onChange={(e) => setOptionCount(Number(e.target.value))}
        className="w-full max-w-xs p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={4}>4 Options</option>
        <option value={6}>6 Options</option>
      </select>
    </div>
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">Quiz Length</label>
      <select
        value={quizLength}
        onChange={(e) => setQuizLength(Number(e.target.value))}
        className="w-full max-w-xs p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={5}>5 Questions</option>
        <option value={10}>10 Questions</option>
        <option value={15}>15 Questions</option>
      </select>
    </div>
    {isLoading ? (
      <QuizLoading />
    ) : (
      <button
        onClick={startQuiz}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto"
      >
        Start Quiz
      </button>
    )}
  </div>
);

export default QuizOptions;