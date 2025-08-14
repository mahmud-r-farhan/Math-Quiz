'use client';

import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../utility/socket';

const useGuestPlay = (setLoading) => {
  const { register } = useAuth();
  const router = useRouter();

  const playAsGuest = async (retries = 2) => {
    setLoading?.(true);
    try {
      const guestId = `guest_${uuidv4()}`; // Use full UUID
      const guestEmail = `${guestId}@guest.com`;
      await register(guestId, guestEmail, 'guest', true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Failed to retrieve authentication token');
      }
      const socket = connectSocket(token);
      socket.on('connect', () => {
        router.push('/quiz');
      });
      socket.on('connect_error', (error) => {
        console.log('Socket connection failed!');
        setLoading?.(false);
        alert('Failed to connect to the server. Please try again.');
      });
    } catch (error) {
      console.log('Guest registration error!');
      if (retries > 0 && error.message.includes('Guest email already exists')) {
        console.log(`Retrying guest registration (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return playAsGuest(retries - 1);
      }
    } finally {
      setLoading?.(false);
    }
  };

  return playAsGuest;
};

export default useGuestPlay;