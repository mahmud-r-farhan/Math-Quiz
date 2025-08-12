import React from 'react';
import Link from 'next/link';

export default function QuizControls({ handleSkip, answered }) {
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={handleSkip}
        className="flex-1 p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 rounded-lg font-semibold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 disabled:bg-slate-600/50 disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={answered}
      >
        Skip
      </button>
      <Link
        href="/profile"
        className="flex-1 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 text-center"
      >
        End Quiz
      </Link>
    </div>
  );
}