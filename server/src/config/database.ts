import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

/**
 * MongoDB connection options
 */
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connects to MongoDB with retry logic
 * @param maxRetries Maximum number of connection attempts
 * @param retryDelay Delay between retries in milliseconds
 */
export async function connectMongoDB(
  maxRetries: number = 5,
  retryDelay: number = 5000
): Promise<void> {
  let retries = 0;

  const uri = config.isTest ? config.database.mongoTestUri : config.database.mongoUri;

  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})...`);

      await mongoose.connect(uri, mongooseOptions);

      logger.info('MongoDB connected successfully');

      // Set up event listeners
      mongoose.connection.on('error', (error: Error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return;
    } catch (error) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries} failed:`, error);

      if (retries >= maxRetries) {
        logger.error('Max retries reached. Could not connect to MongoDB');
        throw new Error('Failed to connect to MongoDB after maximum retries');
      }

      logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Disconnects from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

/**
 * Checks MongoDB connection health
 * @returns True if connected, false otherwise
 */
export function isMongoDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Gets MongoDB connection state as a string
 * @returns Connection state string
 */
export function getMongoDBConnectionState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] || 'unknown';
}

export default {
  connect: connectMongoDB,
  disconnect: disconnectMongoDB,
  isConnected: isMongoDBConnected,
  getConnectionState: getMongoDBConnectionState,
};
