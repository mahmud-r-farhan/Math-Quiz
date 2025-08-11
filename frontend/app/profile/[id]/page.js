'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import LoadingScreen from '@/components/Loading';
import { useRouter } from 'next/navigation';

export default function Profile({ params }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    profession: '',
    socialLinks: { twitter: '', linkedin: '', github: '' },
    profilePicture: '',
  });
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      setProfile(data);
      setFormData({
        username: data.user.username || '',
        profession: data.user.profession || '',
        socialLinks: data.user.socialLinks || { twitter: '', linkedin: '', github: '' },
        profilePicture: data.user.profilePicture,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.isGuest) {
      alert('Guest users cannot update profile. Please register.');
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
      if (res.ok) {
        setEditing(false);
        fetchProfile();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${params.id}`;
    navigator.clipboard.writeText(url);
    alert('Profile link copied to clipboard!');
  };

  if (loading || !profile) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Image
              src={formData.profilePicture}
              alt={profile.user.username}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-indigo-900">{profile.user.username}</h1>
              <p className="text-gray-600 text-lg">{profile.user.profession || 'No profession set'}</p>
              <p className="text-indigo-600 font-semibold text-lg">Points: {profile.user.points}</p>
              {user?.id === params.id && (
                <button onClick={handleShare} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Share Profile
                </button>
              )}
            </div>
          </div>

          {user?.id === params.id && !user.isGuest && editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Profession</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Twitter</label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">LinkedIn</label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">GitHub</label>
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value },
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Profile Picture URL</label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            user?.id === params.id && !user.isGuest && (
              <button onClick={() => setEditing(true)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Edit Profile
              </button>
            )
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-indigo-900">Recent Games</h2>
          {profile.history.length === 0 ? (
            <p className="text-gray-600 text-lg">No games played yet.</p>
          ) : (
            <div className="space-y-4">
              {profile.history.map((game) => (
                <div key={game._id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg capitalize">{game.difficulty}</p>
                      <p className="text-sm text-gray-600">
                        Score: {game.score.correct}/{game.score.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600 font-semibold">+{game.pointsEarned} points</p>
                      <p className="text-sm text-gray-600">
                        {new Date(game.completedAt).toLocaleDateString()}
                      </p>
                    </div>
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