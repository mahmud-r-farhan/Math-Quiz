import { useEffect } from 'react';
import { connectSocket, getSocket, disconnectSocket } from '../utility/socket';

export const useSocket = (user, setSocketError, router) => {
  useEffect(() => {
    if (!user) {
      setSocketError('You must be logged in to play the quiz.');
      router.push('/login');
      return;
    }

    let socket;
    const initializeSocket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          socket = await connectSocket(token);
          socket.on('scoreUpdate', (data) => {
            console.log('Score update received:', data);
          });
          socket.on('leaderboardUpdate', (data) => {
            console.log('Leaderboard update received:', data);
          });
          socket.on('error', (data) => {
            setSocketError(`Socket error: ${data.message}`);
          });
        }
      } catch (err) {
        setSocketError(`Socket initialization failed: ${err.message}`);
      }
    };
    initializeSocket();

    return () => {
      if (socket) {
        socket.off('scoreUpdate');
        socket.off('leaderboardUpdate');
        socket.off('error');
        disconnectSocket();
      }
    };
  }, [user, setSocketError, router]);
};