'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import LoadingScreen from '../../components/Loading';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    profession: '',
    socialLinks: { twitter: '', linkedin: '', github: '' },
    profilePicture: 'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg',
  });
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setError('No user logged in.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await res.json();
      if (!data.user) {
        throw new Error('User data not found in response');
      }
      setProfile(data);
      setFormData({
        username: data.user.username || '',
        profession: data.user.profession || '',
        socialLinks: data.user.socialLinks || { twitter: '', linkedin: '', github: '' },
        profilePicture:
          data.user.profilePicture ||
          'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg',
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile. Please try again.');
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.isGuest) {
      setError('Guest users cannot update profile. Please register.');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(url);
    alert('Profile link copied to clipboard!');
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      Beginner: '🏆',
      Intermediate: '⭐',
      Expert: '🚀',
      Master: '👑',
    };
    return icons[badge] || '';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !profile || !profile.user || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <p className="text-red-400 bg-red-900/20 backdrop-blur rounded-full px-6 py-3 text-center font-semibold">
            {error || 'Profile not found or user not logged in.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen top-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden py-6 px-4 sm:px-6 lg:px-8">
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

      <div className="container mx-auto relative z-10">
        {error && (
          <p className="text-red-400 bg-red-900/20 backdrop-blur rounded-full px-6 py-3 mb-6 text-center font-semibold">{error}</p>
        )}
        <div className="bg-slate-800/40 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative">
              <Image
                src={formData.profilePicture}
                alt={profile.user.username}
                width={120}
                height={120}
                className="rounded-full object-cover border-4 border-gradient-to-r from-blue-500 to-purple-600 p-1 bg-gradient-to-r from-blue-500 to-purple-600"
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg';
                }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20"></div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                {profile.user.username}{' '}
                {profile.user.badges?.length > 0 && (
                  <span className="text-lg text-slate-300" title={profile.user.badges.join(', ')}>
                    {profile.user.badges.map((badge) => getBadgeIcon(badge)).join(' ')}
                  </span>
                )}
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl font-semibold mb-2">
                {profile.user.profession || 'No profession set'}
              </p>
              <p className="text-blue-400 font-bold text-lg sm:text-xl mb-4">
                Points: {profile.user.points}
              </p>
              <div className="flex gap-4 justify-center sm:justify-start">
                {profile.user.socialLinks?.twitter && (
                  <a
                    href={profile.user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaTwitter className="w-6 h-6" />
                  </a>
                )}
                {profile.user.socialLinks?.linkedin && (
                  <a
                    href={profile.user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                )}
                {profile.user.socialLinks?.github && (
                  <a
                    href={profile.user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaGithub className="w-6 h-6" />
                  </a>
                )}
              </div>
              <button
                onClick={handleShare}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-amber-500/25"
              >
                Share Profile
              </button>
            </div>
          </div>

          {!user.isGuest && editing ? (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur rounded-2xl p-6 border border-blue-500/20">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-3 bg-slate-800/50 text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Profession</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full p-3 bg-slate-800/50 text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Twitter</label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-800/50 text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">LinkedIn</label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-800/50 text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">GitHub</label>
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-800/50 text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Profile Picture URL</label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                  className="w-full p-3 bg-slate-800/50 text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-slate-800/50 text-slate-200 rounded-2xl font-semibold text-lg hover:bg-slate-700/50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            !user.isGuest && (
              <div className="text-center">
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
                >
                  Edit Profile
                </button>
              </div>
            )
          )}
        </div>

        <div className="bg-slate-800/40 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300">
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-6">
            Recent Games
          </h2>
          {profile.history.length === 0 ? (
            <p className="text-slate-300 text-lg sm:text-xl text-center">
              No games played yet.{' '}
              <Link href="/quiz" className="text-blue-400 hover:text-blue-300 font-semibold">
                Start a quiz now!
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {profile.history.map((game) => (
                <div
                  key={game._id}
                  className="border-b border-slate-700/50 pb-4 flex flex-col sm:flex-row justify-between items-center hover:bg-slate-800/60 rounded-lg p-4 transition-all duration-300"
                >
                  <div>
                    <p className="font-semibold text-lg sm:text-xl text-blue-300 capitalize">{game.difficulty}</p>
                    <p className="text-sm text-slate-400">
                      Score: {game.score.correct}/{game.score.total}
                    </p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="text-emerald-400 font-bold text-lg sm:text-xl">+{game.pointsEarned} points</p>
                    <p className="text-sm text-slate-400">
                      {new Date(game.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}