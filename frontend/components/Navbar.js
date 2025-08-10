'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation'; // Added to get the current path

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get the current path

  const linkClass = (path) =>
    `relative text-gray-600 hover:text-primary transition-colors duration-200 
    ${pathname === path ? 'text-primary font-semibold' : ''}`; // Highlight active link

  const mobileLinkClass = (path) =>
    `block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition
    ${pathname === path ? 'text-primary font-semibold' : ''}`; // Highlight active link

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            Math Quiz
          </Link>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/leaderboard" className={linkClass('/leaderboard')}>
              Leaderboard
            </Link>
            {user ? (
              <>
                <Link href="/quiz" className={linkClass('/quiz')}>
                  Play Quiz
                </Link>
                <Link href="/profile" className={linkClass('/profile')}>
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass('/login')}>
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, with improved transitions and styling */}
      <div
        className={`sm:hidden absolute top-16 left-0 right-0 bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex flex-col gap-2 p-4">
          <Link href="/leaderboard" className={mobileLinkClass('/leaderboard')}>
            Leaderboard
          </Link>
          {user ? (
            <>
              <Link href="/quiz" className={mobileLinkClass('/quiz')}>
                Play Quiz
              </Link>
              <Link href="/profile" className={mobileLinkClass('/profile')}>
                Profile
              </Link>
              <button
                onClick={logout}
                className="block px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={mobileLinkClass('/login')}>
                Login
              </Link>
              <Link href="/register" className="btn-primary w-full text-center mt-2">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}