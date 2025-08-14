'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { connectSocket, disconnectSocket } from '../utility/socket';

const AuthContext = createContext();

async function safeFetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { ok: res.ok, status: res.status, data };
    } catch {
      return { ok: false, status: res.status, data: { message: 'Invalid JSON response from server' } };
    }
  } catch (error) {
    return { ok: false, status: 0, data: { message: 'Network error' } };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const validateToken = async (token) => {
    const { ok, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return ok ? data : null;
  };

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const { ok, status, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (ok && mounted) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            try {
              await connectSocket(data.token);
            } catch (socketError) {
              console.log('Socket connection failed:', socketError.message);
            }
          } else {
            console.log('Google login failed:', data.message, { status });
            localStorage.removeItem('token');
            if (mounted) setUser(null);
          }
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            const validationResult = await validateToken(token);
            if (validationResult && mounted) {
              setUser(validationResult.user);
              try {
                await connectSocket(token);
              } catch (socketError) {
                console.log('Socket connection failed:', socketError.message);
              }
            } else {
              console.log('Token validation failed:', validationResult?.message || 'Invalid token');
              localStorage.removeItem('token');
              if (mounted) setUser(null);
            }
          } else if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.log('Auth state check error:', error.message, error.stack);
        localStorage.removeItem('token');
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const register = async (username, email, password, isGuest = false) => {
    try {
      const { ok, status, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: isGuest ? 'guest' : password, isGuest }),
      });

      if (ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        try {
          await connectSocket(data.token);
        } catch (socketError) {
          console.log('Socket connection failed:', socketError.message);
        }
        router.push('/profile');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error.message, error.stack);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { ok, status, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        try {
          await connectSocket(data.token);
        } catch (socketError) {
          console.log('Socket connection failed:', socketError.message);
        }
        router.push('/profile');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.log('Login error:', error.message, error.stack);
      throw error;
    }
  };

  const googleLogin = async (retryCount = 0) => {
    const maxRetries = 2;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { ok, status, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        try {
          await connectSocket(data.token);
        } catch (socketError) {
          console.log('Socket connection failed:', socketError.message);
        }
        router.push('/profile');
      } else {
        if (retryCount < maxRetries && status >= 500) {
          console.log(`Google login retry ${retryCount + 1}/${maxRetries}: Server error`, { status, message: data.message });
          await new Promise((resolve) => setTimeout(resolve, 2000 * (retryCount + 1)));
          return googleLogin(retryCount + 1);
        }
        throw new Error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.log('Google login error:', error.message, error.stack);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('Google login cancelled');
      }
      if (retryCount < maxRetries && error.message.includes('network')) {
        console.log(`Google login retry ${retryCount + 1}/${maxRetries}: Network error`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * (retryCount + 1)));
        return googleLogin(retryCount + 1);
      }
      throw new Error('Google authentication failed. Please try again.');
    }
  };

  const resetPasswordRequest = async (email) => {
    try {
      const { ok, status, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log('Reset password request error:', error.message, error.stack);
      throw error;
    }
  };

  const resetPasswordVerify = async (email, otp, newPassword) => {
    try {
      const { ok, status, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        try {
          await connectSocket(data.token);
        } catch (socketError) {
          console.log('Socket connection failed:', socketError.message);
        }
        router.push('/profile');
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.log('Reset password verify error:', error.message, error.stack);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      setUser(null);
      disconnectSocket();
      router.push('/login');
    } catch (error) {
      console.log('Logout error:', error.message, error.stack);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        resetPasswordRequest,
        resetPasswordVerify,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}