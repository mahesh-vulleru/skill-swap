import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const validateEnv = () => {
  const errors: string[] = [];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.trim() === '' || jwtSecret === 'replace_with_secure_secret') {
    errors.push('JWT_SECRET must be set in .env with a secure, non-default secret key (minimum 16 characters).');
  } else if (jwtSecret.length < 16) {
    errors.push('JWT_SECRET is too short. Minimum 16 characters required for production security.');
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.trim() === '') {
    errors.push('MONGODB_URI must be set in .env.');
  }

  const port = process.env.PORT;
  if (port && (isNaN(Number(port)) || Number(port) <= 0 || Number(port) > 65535)) {
    errors.push('PORT must be a valid port number between 1 and 65535.');
  }

  if (errors.length > 0) {
    console.error('\n❌ [ENVIRONMENT CONFIGURATION ERROR]');
    errors.forEach((err) => console.error(`  - ${err}`));
    console.error('Please configure your .env file according to .env.example\n');
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: mongoUri!.trim(),
    jwtSecret: jwtSecret!.trim(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development',
  };
};

export const config = validateEnv();
