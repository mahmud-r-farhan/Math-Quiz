'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { connectSocket } from '../utility/socket';
const AuthContext = createContext();

async function safeFetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { message: 'Invalid JSON response from server' } };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const { ok, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (ok) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            connectSocket(data.token); // Connect socket for Firebase user
          } else {
            console.log('Google login failed:', data.message);
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            const { ok, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (ok) {
              setUser(data.user);
              connectSocket(token); // Connect socket for token-based user
            } else {
              console.log('Profile fetch failed:', data.message);
              localStorage.removeItem('token');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.log('Auth state check error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (username, email, password, isGuest = false) => {
    try {
      const { ok, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, isGuest }),
      });

      if (ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        connectSocket(data.token); // Connect socket after registration
        router.push('/profile');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    const { ok, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (ok) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      connectSocket(data.token); // Connect socket after login
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const googleLogin = async (retryCount = 0) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { ok, data } = await safeFetchJSON(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        connectSocket(data.token); // Connect socket after Google login
        router.push('/profile');
      } else {
        if (retryCount < 2) {
          console.log('Retrying Google login...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return googleLogin(retryCount + 1);
        }
        throw new Error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.log('Google login error:', error.message, error.stack);
      throw new Error('Google authentication failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      setUser(null);
      disconnectSocket(); // Disconnect socket on logout
      router.push('/login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}