'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://math-quiz-6p3i.onrender.com/api';

let socket = null;

export const connectSocket = (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      console.log('No token provided for socket connection');
      return reject(new Error('No token provided'));
    }

    if (socket && socket.connected) {
      console.log('Socket already connected:', { socketId: socket.id, time: new Date().toISOString() });
      return resolve(socket);
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', { socketId: socket.id, namespace: socket.nsp, time: new Date().toISOString() });
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', {
        message: error.message,
        socketId: socket.id,
        namespace: socket.nsp,
        url: SOCKET_URL,
        time: new Date().toISOString(),
      });
      reject(error);
    });

    socket.on('error', (error) => {
      console.log('Socket error:', {
        message: error.message,
        socketId: socket.id,
        namespace: socket.nsp,
        time: new Date().toISOString(),
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        socketId: socket.id,
        namespace: socket.nsp,
        time: new Date().toISOString(),
      });
    });
  });
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.off('connect');
    socket.off('connect_error');
    socket.off('error');
    socket.off('disconnect');
    socket.disconnect();
    socket = null;
    console.log('Socket fully disconnected');
  }
};
