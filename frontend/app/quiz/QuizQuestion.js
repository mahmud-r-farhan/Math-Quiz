import React from 'react';
import { MathJax } from 'better-react-mathjax';

export default function QuizQuestion({ questions, currentQuestion, timeLeft, streak, answered, handleAnswer }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <p className="text-slate-200 text-base sm:text-lg font-semibold">
          Question {currentQuestion + 1}/{questions.length}
        </p>
        <div className="flex items-center gap-4">
          <p className="text-slate-200 text-base sm:text-lg font-semibold">
            Time Left: <span className={timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}>{timeLeft}s</span>
          </p>
          <p className="text-amber-400 text-base sm:text-lg font-semibold">Streak: {streak}</p>
        </div>
      </div>
      <div className="w-full bg-slate-900/50 rounded-full h-3 mb-6">
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
      <div className="mb-8 bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
        <MathJax className="text-xl sm:text-2xl font-semibold text-slate-200 leading-relaxed">
          {`\\[${questions[currentQuestion].questionText}\\]`}
        </MathJax>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="option-btn p-4 sm:p-6 bg-slate-900/50 border border-slate-600/50 hover:bg-slate-800/50 text-slate-200 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed leading-relaxed"
            disabled={answered}
          >
            <MathJax>{`\\[${option}\\]`}</MathJax>
          </button>
        ))}
      </div>
    </>
  );
}