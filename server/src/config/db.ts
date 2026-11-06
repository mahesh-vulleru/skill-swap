import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Connection error with primary URI:', error);

    // If primary URI fails in development, attempt local instance fallback
    if (config.nodeEnv !== 'production') {
      const localUri = 'mongodb://127.0.0.1:27017/skillswap';
      if (config.mongoUri !== localUri) {
        try {
          console.log('[MongoDB] Attempting fallback to local instance (127.0.0.1:27017)...');
          const localConn = await mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 3000,
          });
          console.log(`[MongoDB] Connected successfully to local fallback: ${localConn.connection.host}, database: ${localConn.connection.name}`);
          return;
        } catch (fallbackError) {
          console.error('[MongoDB] Local fallback also failed:', fallbackError);
        }
      }
    }

    // Fail safely and prevent application from silently running in disconnected state
    throw new Error(`[MongoDB] Critical: Unable to establish database connection. ${(error as any)?.message || error}`);
  }
};

export const getDatabaseStatus = (): 'connected' | 'connecting' | 'disconnecting' | 'disconnected' => {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};
