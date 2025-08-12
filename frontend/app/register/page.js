'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, user?.isGuest);
      // No need for manual redirect here since register handles it
    } catch (err) {
      setError(err.message || 'Registration failed');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 2, text: 'Medium', color: 'bg-yellow-500' };
    return { strength: 3, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen top-20 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
      {/* Floating mathematical symbols background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 text-3xl sm:text-6xl text-amber-400 font-bold">π</div>
        <div className="absolute top-20 sm:top-40 right-8 sm:right-20 text-2xl sm:text-5xl text-blue-400 font-bold">∑</div>
        <div className="absolute bottom-20 sm:bottom-40 left-8 sm:left-20 text-2xl sm:text-4xl text-green-400 font-bold">∞</div>
        <div className="absolute bottom-10 sm:bottom-20 right-12 sm:right-32 text-3xl sm:text-5xl text-red-400 font-bold">∆</div>
        <div className="absolute top-1/2 left-1/4 text-xl sm:text-3xl text-cyan-400 font-bold opacity-50">∫</div>
        <div className="absolute top-1/3 right-1/3 text-xl sm:text-3xl text-yellow-400 font-bold opacity-50">α</div>
        <div className="absolute top-3/4 left-1/3 text-lg sm:text-2xl text-pink-400 font-bold opacity-50">θ</div>
      </div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full blur-3xl"></div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-sm sm:max-w-md p-4 sm:p-6 lg:p-8 relative z-10 mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Join Math Mastery
        </h1>
        
        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 sm:mb-6 text-center text-sm font-medium animate-pulse">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-3 sm:p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              placeholder="Choose a username (min. 5 characters)"
              disabled={loading}
              minLength={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 sm:p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              placeholder="Enter your email address"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 sm:p-4 pr-12 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                placeholder="Create a strong password"
                disabled={loading}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200 p-1"
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="w-5 h-5" />
                ) : (
                  <AiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-1 flex-1">
                    <div className={`h-1 rounded-full flex-1 ${passwordStrength.strength >= 1 ? passwordStrength.color : 'bg-slate-600'}`}></div>
                    <div className={`h-1 rounded-full flex-1 ${passwordStrength.strength >= 2 ? passwordStrength.color : 'bg-slate-600'}`}></div>
                    <div className={`h-1 rounded-full flex-1 ${passwordStrength.strength >= 3 ? passwordStrength.color : 'bg-slate-600'}`}></div>
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength === 1 ? 'text-red-400' : 
                    passwordStrength.strength === 2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Use 8+ characters with uppercase, lowercase, and numbers
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-3 sm:p-4 pr-12 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200 p-1"
                disabled={loading}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible className="w-5 h-5" />
                ) : (
                  <AiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
              <p className="mt-1 text-xs text-green-400">Passwords match ✓</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || formData.password !== formData.confirmPassword}
            className="w-full p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-semibold text-sm sm:text-lg hover:from-blue-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-blue-500/25 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <p className="mt-4 sm:mt-6 text-center text-slate-400 text-xs sm:text-sm">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-300 underline-offset-2 hover:underline"
          >
            Login here
          </Link>
        </p>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}