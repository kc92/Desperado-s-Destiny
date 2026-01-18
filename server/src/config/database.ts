import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

/**
 * MongoDB connection options
 * Pool sizes scaled for production to handle thousands of concurrent users
 */
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: config.isProduction ? 50 : 10,
  minPoolSize: config.isProduction ? 10 : 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 15000, // Increased from 5000 for Railway's shared infrastructure latency
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: false, // Disable retryable writes for standalone MongoDB (no replica set)
};

// Track if listeners have been registered to prevent duplicates
let listenersRegistered = false;

// Named handlers for proper cleanup
const handleError = (error: Error) => {
  logger.error('MongoDB connection error:', error);
};

const handleDisconnected = () => {
  logger.warn('MongoDB disconnected');
};

const handleReconnected = () => {
  logger.info('MongoDB reconnected');
};

/**
 * Ensures the MongoDB URI has retryWrites=false for standalone MongoDB compatibility.
 * Railway's MongoDB is standalone (no replica set), which doesn't support retryable writes.
 */
function ensureNoRetryWrites(uri: string): string {
  // Remove any existing retryWrites parameter
  let modifiedUri = uri.replace(/[?&]retryWrites=[^&]*/gi, '');

  // Clean up any double ampersands or trailing question marks
  modifiedUri = modifiedUri.replace(/&&/g, '&').replace(/\?&/g, '?').replace(/[?&]$/, '');

  // Add retryWrites=false
  const separator = modifiedUri.includes('?') ? '&' : '?';
  modifiedUri = `${modifiedUri}${separator}retryWrites=false`;

  return modifiedUri;
}

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

  const rawUri = config.isTest ? config.database.mongoTestUri : config.database.mongoUri;
  // Ensure retryWrites=false for standalone MongoDB (Railway doesn't use replica set)
  const uri = ensureNoRetryWrites(rawUri);

  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})...`);

      await mongoose.connect(uri, mongooseOptions);

      logger.info('MongoDB connected successfully');

      // EVENT LISTENER LEAK FIX: Register listeners only once using named handlers
      if (!listenersRegistered) {
        mongoose.connection.on('error', handleError);
        mongoose.connection.on('disconnected', handleDisconnected);
        mongoose.connection.on('reconnected', handleReconnected);
        listenersRegistered = true;
      }

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
    // EVENT LISTENER LEAK FIX: Remove listeners before disconnecting
    if (listenersRegistered) {
      mongoose.connection.off('error', handleError);
      mongoose.connection.off('disconnected', handleDisconnected);
      mongoose.connection.off('reconnected', handleReconnected);
      listenersRegistered = false;
    }

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
