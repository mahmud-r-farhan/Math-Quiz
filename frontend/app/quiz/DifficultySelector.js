import React from 'react';

export default function DifficultySelector({ setDifficulty, error, user, register, setError }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 max-w-md w-full p-6 sm:p-8 relative z-10">
      <h1 className="text-3xl sm:text-4xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
        Choose Your Challenge
      </h1>
      {error && (
        <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-center text-sm font-medium">
          {error}
        </p>
      )}
      <div className="grid gap-4">
        {['easy', 'normal', 'hard', 'genius'].map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 ${
              level === 'easy'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                : level === 'normal'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : level === 'hard'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}