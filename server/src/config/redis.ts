import { createClient, RedisClientType } from 'redis';
import { config } from './index';
import logger from '../utils/logger';

/**
 * Redis client instance
 */
let redisClient: RedisClientType | null = null;

/**
 * Connects to Redis with retry logic
 * @param maxRetries Maximum number of connection attempts
 * @param retryDelay Delay between retries in milliseconds
 */
export async function connectRedis(
  maxRetries: number = 5,
  retryDelay: number = 5000
): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    logger.info('Redis client already connected');
    return redisClient;
  }

  let retries = 0;

  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to connect to Redis (attempt ${retries + 1}/${maxRetries})...`);

      // Create Redis client
      redisClient = createClient({
        url: config.database.redisUrl,
        password: config.database.redisPassword,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error('Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            const delay = Math.min(retries * 100, 3000);
            logger.info(`Redis reconnecting in ${delay}ms...`);
            return delay;
          },
        },
      });

      // Set up event listeners
      redisClient.on('error', (error: Error) => {
        logger.error('Redis client error:', error);
      });

      redisClient.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      redisClient.on('ready', () => {
        logger.info('Redis client ready');
      });

      redisClient.on('reconnecting', () => {
        logger.warn('Redis client reconnecting...');
      });

      redisClient.on('end', () => {
        logger.warn('Redis client connection ended');
      });

      // Connect to Redis
      await redisClient.connect();

      logger.info('Redis connected successfully');

      return redisClient;
    } catch (error) {
      retries++;
      logger.error(`Redis connection attempt ${retries} failed:`, error);

      if (retries >= maxRetries) {
        logger.error('Max retries reached. Could not connect to Redis');
        throw new Error('Failed to connect to Redis after maximum retries');
      }

      logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Failed to connect to Redis');
}

/**
 * Disconnects from Redis
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis disconnected successfully');
      redisClient = null;
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
    throw error;
  }
}

/**
 * Gets the Redis client instance
 * @throws Error if Redis is not connected
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client is not connected');
  }
  return redisClient;
}

/**
 * Checks Redis connection health
 * @returns True if connected, false otherwise
 */
export function isRedisConnected(): boolean {
  return redisClient !== null && redisClient.isOpen;
}

/**
 * Performs a health check by pinging Redis
 * @returns True if ping successful, false otherwise
 */
export async function redisHealthCheck(): Promise<boolean> {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    const response = await redisClient.ping();
    return response === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}

export default {
  connect: connectRedis,
  disconnect: disconnectRedis,
  getClient: getRedisClient,
  isConnected: isRedisConnected,
  healthCheck: redisHealthCheck,
};
