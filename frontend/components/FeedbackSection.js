'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

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
      const cleanFeedback = data.feedback.filter((f) => f.user);
      setFeedback(cleanFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  }, []);

  const checkHasSubmitted = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/hasSubmitted`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setHasSubmitted(data.hasSubmitted);
    } catch (error) {
      console.error('Error checking feedback status:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
    checkHasSubmitted();
  }, [fetchFeedback, checkHasSubmitted]);

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
      } else {
        const data = await res.json();
        console.error('Feedback submission failed:', data.message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 relative">
      <h2 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
        What Our Users Say
      </h2>

      {user && !hasSubmitted && (
        <form
          onSubmit={submitFeedback}
          className="mb-12 bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">Your Feedback</label>
            <textarea
              value={feedbackForm.content}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
              className="w-full p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300"
              placeholder="Share your thoughts about Math Mastery..."
              rows="4"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: num })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    feedbackForm.rating >= num
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:bg-slate-600/50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      )}

      {user && hasSubmitted && (
        <div className="text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 font-semibold">
          Thank you for your feedback! 🎉
        </div>
      )}

      <div className="grid gap-6">
        {feedback.map((item) => (
          <div
            key={item._id}
            className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 hover:border-amber-400/50 transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
          >
            <div className="flex items-center mb-4">
              <Image
                src={
                  item?.user?.profilePicture ||
                  'https://res.cloudinary.com/dqovjmmlx/image/upload/v1754038761/defult-profile_whp2vd.jpg'
                }
                alt={item?.user?.username || 'Username loading...'}
                width={48}
                height={48}
                className="rounded-full mr-3 object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg text-slate-200">
                  {item?.user?.username || 'Username...'}
                </h3>
                <div className="flex items-center">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}