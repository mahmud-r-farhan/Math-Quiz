'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingScreen from '../../components/Loading';
import io from 'socket.io-client';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [badgeFilter, setBadgeFilter] = useState('');
  const [pointsFilter, setPointsFilter] = useState({ min: '', max: '' });
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('Connecting to Socket.IO server:', socketUrl, 'with token:', token);
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message, err.stack);
    });

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/leaderboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch leaderboard');
        }
        const data = await res.json();
        setLeaderboard(data.users);
        setFilteredLeaderboard(data.users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();

    socket.on('leaderboardUpdate', ({ users }) => {
      console.log('Received leaderboard update:', users);
      setLeaderboard(users);
      applyFilters(users, badgeFilter, pointsFilter);
    });

    return () => {
      console.log('Disconnecting socket:', socket.id);
      socket.disconnect();
    };
  }, [badgeFilter, pointsFilter]);

  const applyFilters = (users, badge, points) => {
    let filtered = [...users];

    if (badge) {
      filtered = filtered.filter((user) => user.badges?.includes(badge));
    }

    if (points.min !== '' || points.max !== '') {
      filtered = filtered.filter((user) => {
        const min = points.min !== '' ? Number(points.min) : -Infinity;
        const max = points.max !== '' ? Number(points.max) : Infinity;
        return user.points >= min && user.points <= max;
      });
    }

    setFilteredLeaderboard(filtered);
    setCurrentPage(1);
  };

  const handleBadgeFilter = (e) => {
    const badge = e.target.value;
    setBadgeFilter(badge);
    applyFilters(leaderboard, badge, pointsFilter);
  };

  const handlePointsFilter = (e) => {
    const { name, value } = e.target;
    const newPointsFilter = { ...pointsFilter, [name]: value };
    setPointsFilter(newPointsFilter);
    applyFilters(leaderboard, badgeFilter, newPointsFilter);
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      Beginner: '🏆',
      Intermediate: '⭐',
      Expert: '🚀',
      Master: '👑',
    };
    return icons[badge] || '🎖️';
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);
  const paginatedLeaderboard = filteredLeaderboard.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <LoadingScreen />;
  }

   return (
    <div className="min-h-screen top-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating mathematical symbols background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 text-4xl sm:text-6xl text-amber-400 font-bold">π</div>
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 text-3xl sm:text-5xl text-blue-400 font-bold">∑</div>
        <div className="absolute bottom-20 sm:bottom-40 left-10 sm:left-20 text-2xl sm:text-4xl text-green-400 font-bold">∞</div>
        <div className="absolute bottom-10 sm:bottom-20 right-16 sm:right-32 text-3xl sm:text-5xl text-red-400 font-bold">∆</div>
      </div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

      <div className="container mx-auto relative z-10 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Top Math Masters
        </h1>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">Filter by Badge</label>
              <select
                value={badgeFilter}
                onChange={handleBadgeFilter}
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm sm:text-base focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                <option value="">All Badges</option>
                <option value="Beginner">Beginner {getBadgeIcon('Beginner')}</option>
                <option value="Intermediate">Intermediate {getBadgeIcon('Intermediate')}</option>
                <option value="Expert">Expert {getBadgeIcon('Expert')}</option>
                <option value="Master">Master {getBadgeIcon('Master')}</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">Points Range</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  name="min"
                  value={pointsFilter.min}
                  onChange={handlePointsFilter}
                  placeholder="Min points"
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm sm:text-base focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <input
                  type="number"
                  name="max"
                  value={pointsFilter.max}
                  onChange={handlePointsFilter}
                  placeholder="Max points"
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm sm:text-base focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-4 sm:p-6">
          {paginatedLeaderboard.length === 0 ? (
            <p className="text-center text-slate-300 text-sm sm:text-lg font-semibold">
              No players found. Start solving to climb the ranks! 🚀
            </p>
          ) : (
            <div className="space-y-4">
              {paginatedLeaderboard.map((user, index) => (
                <Link
                  key={user._id}
                  href={`/profile/${user._id}`}
                  className={`flex flex-col sm:flex-row items-center p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-slate-700/30 hover:shadow-amber-500/25 border border-transparent hover:border-amber-400/50 ${
                    index + (currentPage - 1) * itemsPerPage < 3
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
                      : ''
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold mr-0 sm:mr-4 shrink-0 text-sm sm:text-base ${
                      index + (currentPage - 1) * itemsPerPage === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900'
                        : index + (currentPage - 1) * itemsPerPage === 1
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                        : index + (currentPage - 1) * itemsPerPage === 2
                        ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white'
                        : 'bg-slate-700/50 text-amber-400'
                    }`}
                  >
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </div>
                  <Image
                    src={user.profilePicture || '/default-profile.png'}
                    alt={user.username}
                    width={48}
                    height={48}
                    className="rounded-full my-2 sm:my-0 sm:mr-4 object-cover shrink-0"
                  />
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-200">
                      {user.username}{' '}
                      {user.badges?.length > 0 ? (
                        <span className="text-sm sm:text-base text-slate-400" title={user.badges.join(', ')}>
                          {user.badges.map((badge, idx) => (
                            <span key={idx} className="inline-block mr-1">
                              {getBadgeIcon(badge)}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-sm sm:text-base text-slate-400">No badges</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-amber-400 font-bold text-base sm:text-lg shrink-0">
                    {user.points} points
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-slate-900/50 text-slate-200 rounded-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400/20"
            >
              Previous
            </button>
            <span className="text-slate-200 text-sm sm:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-slate-900/50 text-slate-200 rounded-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400/20"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}