import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { setupSocket } from './sockets/chatSocket';
import { seedDatabase } from './utils/seedData';

const startServer = async () => {
  const app = createApp();
  const server = http.createServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        config.clientUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setupSocket(io);

  // Connect to MongoDB
  await connectDB();

  // Auto-seed if database is fresh
  try {
    await seedDatabase();
  } catch (err) {
    console.warn('[Server] Seed check finished:', err);
  }

  // Start listening
  server.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`🚀 SkillSwap Backend API running on port ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log(`=================================================`);
  });
};

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
