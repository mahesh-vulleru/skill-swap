import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (userId?: string): Socket => {
  const token = localStorage.getItem('skillswap_token');

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || '',
      },
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server with authenticated ID:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection auth error:', err.message);
    });
  } else if (token) {
    socket.auth = { token };
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
