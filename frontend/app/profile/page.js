'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import LoadingScreen from '@/components/Loading';

export default function Profile() {
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

  const fetchProfile = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${user.id}`, {
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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  if (loading || !profile) {
    return <LoadingScreen />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Image
              src={formData.profilePicture}
              alt={profile.user.username}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{profile.user.username}</h1>
              <p className="text-gray-600">{profile.user.profession || 'No profession set'}</p>
              <p className="text-primary font-semibold">Points: {profile.user.points}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Profession</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary"
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
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary"
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
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary"
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
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Profile Picture URL</label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              Edit Profile
            </button>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Games</h2>
          {profile.history.length === 0 ? (
            <p className="text-gray-600">No games played yet.</p>
          ) : (
            <div className="space-y-4">
              {profile.history.map((game) => (
                <div key={game._id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold capitalize">{game.difficulty}</p>
                      <p className="text-sm text-gray-600">
                        Score: {game.score.correct}/{game.score.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary">+{game.pointsEarned} points</p>
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