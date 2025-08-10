'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function FeedbackSection() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ content: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`);
      const data = await res.json();
      setFeedback(data.feedback);

      // Check if current user has already submitted feedback
      if (user && data.feedback.some((f) => f.user._id === user._id)) {
        setHasSubmitted(true);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!user || hasSubmitted) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(feedbackForm),
      });

      if (res.ok) {
        setFeedbackForm({ content: '', rating: 5 });
        setHasSubmitted(true);
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <h2 className="text-3xl font-bold text-center text-indigo-900 mb-8">User Feedback</h2>

      {user && !hasSubmitted && (
        <form onSubmit={submitFeedback} className="mb-12 bg-white p-6 rounded-xl shadow-lg">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Feedback</label>
            <textarea
              value={feedbackForm.content}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Rating</label>
            <select
              value={feedbackForm.rating}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>{num} Stars</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}

      {user && hasSubmitted && (
        <div className="text-center text-green-600 mb-6 font-semibold">
          You have already submitted feedback. Thank you!
        </div>
      )}

      <div className="grid gap-6">
        {feedback.map((item) => (
          <div key={item._id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Image
                src={item.user.profilePicture || '/default-profile.png'}
                alt={item.user.username}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{item.user.username}</h3>
                <div className="flex items-center">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}