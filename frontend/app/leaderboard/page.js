'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingScreen from '@/components/Loading';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      setLeaderboard(data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-indigo-900">Top Players</h1>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No players found.</p>
          ) : (
            leaderboard.map((user, index) => (
              <Link
                key={user._id}
                href={`/profile/${user._id}`}
                className={`flex items-center p-4 rounded-lg transition-all hover:bg-indigo-50 ${
                  index !== leaderboard.length - 1 ? 'border-b border-gray-200' : ''
                } ${index < 3 ? 'bg-indigo-50' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-4 ${
                    index === 0
                      ? 'bg-yellow-400 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {index + 1}
                </div>
                <Image
                  src={user.profilePicture || '/default-profile.png'}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full mr-4 object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900">{user.username}</h3>
                </div>
                <div className="text-indigo-600 font-bold text-lg">{user.points} points</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}