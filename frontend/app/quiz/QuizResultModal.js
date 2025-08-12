import React from 'react';
import Link from 'next/link';

export default function QuizResultModal({ isOpen, onClose, results, difficulty, timeTaken, maxStreak }) {
  if (!isOpen) return null;

  const { correct, wrong, skipped, total } = results;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50 max-w-md w-full m-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-amber-400">
          Quiz Completed!
        </h2>
        <div className="text-slate-200 space-y-4">
          <p className="text-lg">
            <span className="font-semibold">Difficulty:</span> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Score:</span> {correct} Correct, {wrong} Wrong, {skipped} Skipped
          </p>
          <p className="text-lg">
            <span className="font-semibold">Total Questions:</span> {total}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Accuracy:</span> {total > 0 ? Math.round((correct / total) * 100) : 0}%
          </p>
          <p className="text-lg">
            <span className="font-semibold">Time Taken:</span> {Math.round(timeTaken)} seconds
          </p>
          <p className="text-lg">
            <span className="font-semibold">Max Streak:</span> {maxStreak}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Points Earned:</span> {results.pointsEarned || 0}
          </p>
        </div>
        <div className="flex gap-4 mt-6">
          <Link
            href="/profile"
            className="flex-1 p-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-800 transition-all duration-300"
          >
            View Profile
          </Link>
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}