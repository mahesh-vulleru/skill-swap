import { Server, Socket } from 'socket.io';
import { Message } from '../models/Message';

export const setupSocket = (io: Server): void => {
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('user_connected', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`[Socket.IO] User registered online: ${userId}`);
    });

    socket.on('join_chat', (chatRoom: string) => {
      socket.join(chatRoom);
    });

    socket.on('send_message', async (data: { senderId: string; receiverId: string; content: string }) => {
      try {
        const { senderId, receiverId, content } = data;
        const msg = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
          read: false,
        });

        const populated = await Message.findById(msg._id)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar');

        // Emit to sender
        socket.emit('message_sent', populated);

        // Emit to receiver's private room
        io.to(`user:${receiverId}`).emit('receive_message', populated);
      } catch (err) {
        console.error('[Socket.IO] Message error:', err);
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(`user:${receiverId}`).emit('user_typing', { senderId });
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
      io.to(`user:${receiverId}`).emit('user_stopped_typing', { senderId });
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

