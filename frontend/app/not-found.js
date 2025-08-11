'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background mathematical symbols */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold animate-pulse">π</div>
        <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold animate-pulse delay-300">∑</div>
        <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold animate-pulse delay-500">∞</div>
        <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold animate-pulse delay-700">∆</div>
        <div className="absolute top-60 left-1/2 text-4xl text-yellow-400 font-bold animate-pulse delay-200">√</div>
        <div className="absolute top-32 left-1/3 text-3xl text-purple-400 font-bold animate-pulse delay-600">∫</div>
        <div className="absolute bottom-60 right-10 text-4xl text-teal-400 font-bold animate-pulse delay-400">≠</div>
        <div className="absolute top-80 left-1/4 text-3xl text-pink-400 font-bold animate-pulse delay-800">±</div>
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        {/* Mathematical 404 display */}
        <div className="mb-8 relative">
          {/* Large 404 with mathematical styling */}
          <div className="relative inline-block">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 leading-tight tracking-wider">
              4
              <span className="relative inline-block">
                0
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-blue-400 animate-spin [animation-duration:3s]">
                    <div className="absolute inset-2 rounded-full border-2 border-purple-400 animate-spin [animation-duration:2s] [animation-direction:reverse]"></div>
                  </div>
                </div>
              </span>
              4
            </h1>
            
            {/* Mathematical equation overlay */}
            <div className="absolute -top-6 -right-12 text-2xl text-slate-400 font-mono animate-bounce">
              <span className="text-red-400">≠</span>
              <span className="text-blue-400 ml-2">∞</span>
            </div>
          </div>

          {/* Floating mathematical error symbols */}
          <div className="absolute -top-8 left-0 animate-float">
            <div className="text-4xl text-red-400 opacity-60">⚠</div>
          </div>
          <div className="absolute -top-4 right-8 animate-float delay-500">
            <div className="text-3xl text-amber-400 opacity-60">⁇</div>
          </div>
        </div>

        {/* Error message with mathematical context */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            EQUATION NOT FOUND
          </h2>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50 mb-6">
            <div className="text-lg text-slate-300 font-mono mb-4">
              <span className="text-amber-400">Error:</span> <span className="text-red-400">PageNotFoundException</span>
            </div>
            <div className="text-slate-300 text-lg leading-relaxed">
              The mathematical path you&apos;re looking for seems to have been 
              <span className="text-blue-400 font-semibold"> divided by zero</span> or 
              <span className="text-purple-400 font-semibold"> lost in an infinite loop</span>.
            </div>
          </div>

          <p className="text-xl text-slate-400 mb-8">
            Don&apos;t worry, even the greatest mathematicians make calculation errors sometimes!
          </p>
        </div>

        {/* Mathematical solutions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 bg-slate-800/30 backdrop-blur rounded-xl border border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300">
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-emerald-400 font-semibold">Home = Safety</div>
            <div className="text-sm text-slate-400">Return to base equation</div>
          </div>
          <div className="p-4 bg-slate-800/30 backdrop-blur rounded-xl border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300">
            <div className="text-2xl mb-2">🧠</div>
            <div className="text-blue-400 font-semibold">Quiz = Learning</div>
            <div className="text-sm text-slate-400">Start brain training</div>
          </div>
          <div className="p-4 bg-slate-800/30 backdrop-blur rounded-xl border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-amber-400 font-semibold">Rank = Achievement</div>
            <div className="text-sm text-slate-400">Check leaderboard</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center gap-3"
          >
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return Home
          </Link>
          
          <Link
            href="/quiz"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
          >
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            Start Quiz
          </Link>

          <Link
            href="/leaderboard"
            className="px-8 py-4 bg-slate-800/50 backdrop-blur text-slate-200 border-2 border-slate-600 rounded-2xl font-semibold text-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Leaderboard
          </Link>
        </div>

        {/* Fun mathematical fact */}
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur rounded-2xl border border-purple-500/20">
          <div className="text-purple-400 text-sm font-semibold mb-2">💡 MATH FACT</div>
          <p className="text-slate-300 text-sm">
            Did you know? The probability of randomly finding this page is approximately 
            <span className="text-amber-400 font-mono"> 1/∞</span>, 
            which mathematically equals <span className="text-red-400 font-mono">0</span>. 
            Yet here you are! 🎉
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}