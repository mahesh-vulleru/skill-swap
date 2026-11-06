import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (userId?: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server:', socket?.id);
      if (userId) {
        socket?.emit('user_connected', userId);
      }
    });
  }

  if (userId && socket.connected) {
    socket.emit('user_connected', userId);
  }

  return socket;
};

