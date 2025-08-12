import React from 'react';
import Image from 'next/image';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background mathematical symbols */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold animate-pulse">π</div>
        <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold animate-pulse delay-300">∑</div>
        <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold animate-pulse delay-500">∞</div>
        <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold animate-pulse delay-700">∆</div>
        <div className="absolute top-60 left-1/2 text-4xl text-yellow-400 font-bold animate-pulse delay-200">√</div>
        <div className="absolute top-32 left-1/3 text-3xl text-purple-400 font-bold animate-pulse delay-600">∫</div>
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="flex flex-col items-center relative z-10">
        {/* Main loading animation */}
        <div className="relative mb-8">
          {/* Outer rotating ring with math symbols */}
          <div className="w-32 h-32 relative">
            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-amber-400 via-blue-500 to-purple-600 animate-spin [animation-duration:3s]"
                 style={{
                   background: 'conic-gradient(from 0deg, #f59e0b, #3b82f6, #8b5cf6, #f59e0b)',
                   borderRadius: '50%',
                   mask: 'radial-gradient(circle at center, transparent 60%, black 65%)',
                   WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 65%)'
                 }}>
            </div>
            
            {/* Mathematical symbols rotating around */}
            <div className="absolute inset-0 animate-spin [animation-duration:4s] [animation-direction:reverse]">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-amber-400 font-bold text-xl">π</div>
              <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 text-blue-400 font-bold text-xl">∑</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 text-purple-400 font-bold text-xl">∆</div>
              <div className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2 text-green-400 font-bold text-xl">√</div>
            </div>
            
            {/* Inner pulsing core */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-center animate-pulse">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
               <Image 
               src="/logo.png" 
               width={500}
               height={500}
               alt="MATH QUIZ LOGO"
               className="rounded-full"
               />
              </div>
            </div>
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin [animation-duration:2s]">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 shadow-lg shadow-amber-400/50"></div>
          </div>
          <div className="absolute inset-0 animate-spin [animation-duration:2s] [animation-delay:0.5s]">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 shadow-lg shadow-blue-400/50"></div>
          </div>
        </div>

        {/* Brand text with typing animation */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
            MATH QUIZ
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-300 font-medium">Preparing your brain training</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
          <div className="h-full bg-gradient-to-r from-amber-400 via-blue-500 to-purple-600 rounded-full animate-pulse"
               style={{
                 background: 'linear-gradient(90deg, #f59e0b 0%, #3b82f6 50%, #8b5cf6 100%)',
                 animation: 'loading-progress 2s ease-in-out infinite'
               }}>
          </div>
        </div>

        {/* Status text */}
        <div className="text-sm text-slate-400 font-medium">
          Loading mathematical challenges...
        </div>

        {/* Floating equation animation */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-30">
          <div className="text-slate-400 font-mono text-lg animate-bounce">
            <span className="inline-block animate-pulse">2</span>
            <span className="inline-block text-amber-400">+</span>
            <span className="inline-block animate-pulse delay-200">2</span>
            <span className="inline-block text-blue-400">=</span>
            <span className="inline-block animate-pulse delay-400 text-green-400">4</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Loading;