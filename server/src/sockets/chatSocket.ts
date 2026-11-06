import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { config } from '../config/env';
import { isValidObjectId } from '../utils/security';

export const setupSocket = (io: Server): void => {
  // Authentication Middleware for Socket.IO
  io.use(async (socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token || typeof token !== 'string' || token.trim() === '') {
        return next(new Error('Authentication error: Missing token'));
      }

      const decoded = jwt.verify(token.trim(), config.jwtSecret) as { id: string; role: string };
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (user.status === 'inactive') {
        return next(new Error('Authentication error: Account deactivated'));
      }

      socket.data.user = user;
      next();
    } catch (err: any) {
      console.warn(`[Socket.IO] Auth rejected for socket ${socket.id}: ${err.message}`);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // Track online users: userId -> Set of socket IDs (handles multiple browser tabs cleanly)
  const onlineUsers = new Map<string, Set<string>>();

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const userId = user._id.toString();
    console.log(`[Socket.IO] Authenticated client connected: ${socket.id} (User: ${user.name} - ${userId})`);

    // Add socket to user's set of active sockets
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Join strictly authorized private personal room
    socket.join(`user:${userId}`);

    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // Send Message Event
    socket.on('send_message', async (data: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = data;

        // Security Hardening: Sender identity is strictly derived from authenticated socket session!
        const senderId = user._id;

        if (!receiverId || !content) {
          socket.emit('message_error', { message: 'Receiver and content are required.' });
          return;
        }

        if (!isValidObjectId(receiverId)) {
          socket.emit('message_error', { message: 'Invalid receiver ID format.' });
          return;
        }

        if (senderId.toString() === receiverId.toString()) {
          socket.emit('message_error', { message: 'Cannot send message to yourself.' });
          return;
        }

        const cleanContent = String(content).trim();
        if (!cleanContent) {
          socket.emit('message_error', { message: 'Message content cannot be empty.' });
          return;
        }

        if (cleanContent.length > 5000) {
          socket.emit('message_error', { message: 'Message exceeds maximum length of 5000 characters.' });
          return;
        }

        const receiverExists = await User.findById(receiverId);
        if (!receiverExists || receiverExists.status === 'inactive') {
          socket.emit('message_error', { message: 'Receiver not found or inactive.' });
          return;
        }

        const msg = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: cleanContent,
          read: false,
        });

        const populated = await Message.findById(msg._id)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar');

        // Emit to sender socket
        socket.emit('message_sent', populated);

        // Emit to receiver's private room
        io.to(`user:${receiverId}`).emit('receive_message', populated);
      } catch (err: any) {
        console.error('[Socket.IO] send_message error:', err);
        socket.emit('message_error', { message: 'Server error processing message.' });
      }
    });

    // Typing Indicators: derive sender identity from authenticated socket
    socket.on('typing', ({ receiverId }: { receiverId: string }) => {
      if (receiverId && isValidObjectId(receiverId)) {
        io.to(`user:${receiverId}`).emit('user_typing', { senderId: userId });
      }
    });

    socket.on('stop_typing', ({ receiverId }: { receiverId: string }) => {
      if (receiverId && isValidObjectId(receiverId)) {
        io.to(`user:${receiverId}`).emit('user_stopped_typing', { senderId: userId });
      }
    });

    // Disconnect Event
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (User: ${userId})`);
    });
  });
};
