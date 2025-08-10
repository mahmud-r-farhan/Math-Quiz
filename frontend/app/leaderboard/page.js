'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
    return (
      < LoadingScreen/>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Top Players</h1>
        <div className="card">
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-600">No players found.</p>
          ) : (
            leaderboard.map((user, index) => (
              <div
                key={user._id}
                className={`flex items-center p-4 ${
                  index !== leaderboard.length - 1 ? 'border-b' : ''
                } ${index < 3 ? 'bg-blue-50' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 ${
                    index === 0
                      ? 'bg-yellow-400 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-100 text-primary'
                  }`}
                >
                  {index + 1}
                </div>
                <Image
                  src={user.profilePicture || '/default-profile.png'}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full mr-4 object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{user.username}</h3>
                </div>
                <div className="text-primary font-bold">{user.points} points</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}