'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FeedbackSection from '@/components/FeedbackSection';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-indigo-900 mb-6 leading-tight">
            Master Mathematics Through
            <span className="text-indigo-600 block">Interactive Quizzes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Challenge yourself with our adaptive math quizzes. Learn, compete, and climb the leaderboard while improving your mathematical skills.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {user ? (
              <Link 
                href="/quiz" 
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Quiz
              </Link>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-gray-50 transition-all border-2 border-indigo-600"
                >
                  Login
                </Link>
              </>
            )}
            <Link 
              href="/leaderboard" 
              className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-gray-50 transition-all border-2 border-indigo-600"
            >
              View Leaderboard
            </Link>
          </div>

          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/home-banner.png"
              alt="Math Quiz"
              width={1200}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
        <FeedbackSection />
      </div>
    </div>
  );
}