'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import FeedbackSection from '../components/FeedbackSection';
import { LuBrainCircuit } from 'react-icons/lu';
import { FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Loading from '../components/Loading';
import useGuestPlay from '../utility/useGuestPlay';

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const playAsGuest = useGuestPlay(setLoading);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen top-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating mathematical symbols background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl text-amber-400 font-bold">π</div>
        <div className="absolute top-40 right-20 text-5xl text-blue-400 font-bold">∑</div>
        <div className="absolute bottom-40 left-20 text-4xl text-green-400 font-bold">∞</div>
        <div className="absolute bottom-20 right-32 text-5xl text-red-400 font-bold">∆</div>
        <div className="absolute top-60 left-1/2 text-4xl text-yellow-400 font-bold">√</div>
        <div className="absolute top-32 left-1/3 text-3xl text-purple-400 font-bold">∫</div>
      </div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-slate-900 font-semibold text-sm mb-8 shadow-lg">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
            </svg>
            #1 Brain Training Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-6 leading-tight tracking-tight">
            MATH
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              MASTERY
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed">
            Unlock your mathematical potential with our scientifically-designed quiz system.
            <span className="text-amber-400 font-semibold"> Train your brain</span>,
            <span className="text-blue-400 font-semibold"> boost cognitive power</span>, and
            <span className="text-green-400 font-semibold"> dominate the leaderboard</span>.
          </p>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
            Join thousands of students who&apos;ve improved their math scores by an average of 40% in just 30 days.
          </p>

          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              <Link
                href="/quiz"
                className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center gap-3"
              >
                <FaUser />
                Start Training
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-10 py-5 bg-slate-800/50 backdrop-blur text-slate-200 border-2 border-slate-600 rounded-2xl font-semibold text-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
                >
                  <svg className="w-6 h-6 group-hover:bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Begin Journey
                </Link>
                <button
                  onClick={playAsGuest}
                  className="group px-10 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-gray-500/25 flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Play as Guest
                </button>
              </>
            )}
            <Link
              href="/leaderboard"
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-amber-500/25 flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Rest of the Home component remains unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-8 bg-slate-800/40 backdrop-blur rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-800/60">
            <div className="text-4xl font-black text-blue-400 mb-2">50K+</div>
            <div className="text-slate-300 font-semibold">Active Learners</div>
          </div>
          <div className="text-center p-8 bg-slate-800/40 backdrop-blur rounded-3xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:bg-slate-800/60">
            <div className="text-4xl font-black text-emerald-400 mb-2">1M+</div>
            <div className="text-slate-300 font-semibold">Questions Solved</div>
          </div>
          <div className="text-center p-8 bg-slate-800/40 backdrop-blur rounded-3xl border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:bg-slate-800/60">
            <div className="text-4xl font-black text-amber-400 mb-2">95%</div>
            <div className="text-slate-300 font-semibold">Success Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur rounded-3xl border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-300 mb-4">Adaptive Learning</h3>
            <p className="text-slate-300 leading-relaxed">AI-powered system adjusts difficulty based on your performance, ensuring optimal challenge level.</p>
          </div>

          <div className="p-8 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur rounded-3xl border border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-emerald-300 mb-4">Progress Tracking</h3>
            <p className="text-slate-300 leading-relaxed">Monitor your improvement with detailed analytics and performance insights.</p>
          </div>

          <div className="p-8 bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur rounded-3xl border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-amber-300 mb-4">Achievements</h3>
            <p className="text-slate-300 leading-relaxed">Unlock badges and rewards as you master different mathematical concepts.</p>
          </div>
        </div>

        <div className="relative w-full max-w-5xl mx-auto mb-20">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-gradient-to-r from-blue-500 to-purple-600 p-1 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <Image
                src="/home-banner.png"
                alt="Math Quiz Dashboard - Interactive Learning Interface"
                width={1200}
                height={600}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end">
                <div className="p-8 text-center w-full">
                  <p className="text-2xl font-bold text-white mb-4">
                    Ready to Challenge Your Mind?
                  </p>
                  <div className="flex gap-4 justify-center">
                    <div className="px-4 py-2 bg-emerald-500/20 backdrop-blur rounded-full text-emerald-400 font-semibold">
                      ✓ Instant Feedback
                    </div>
                    <div className="px-4 py-2 bg-blue-500/20 backdrop-blur rounded-full text-blue-400 font-semibold">
                      ✓ Multiple Difficulty Levels
                    </div>
                    <div className="px-4 py-2 bg-amber-500/20 backdrop-blur rounded-full text-amber-400 font-semibold">
                      ✓ Competitive Rankings
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-20 p-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur rounded-3xl border border-purple-500/20">
          <div className="text-6xl mb-6"><LuBrainCircuit className='text-white'/></div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
            ENHANCE YOUR COGNITIVE POWER
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Our scientifically-backed methodology improves working memory, processing speed, and logical reasoning.
            <span className="text-purple-400 font-semibold"> Transform your brain</span> into a mathematical powerhouse.
          </p>
        </div>

        <FeedbackSection />
      </div>
    </div>
  );
}