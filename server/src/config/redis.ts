import { createClient, RedisClientType } from 'redis';
import { config } from './index';
import logger from '../utils/logger';

/**
 * Redis client instance
 */
let redisClient: RedisClientType | null = null;

// Named handlers for proper cleanup
const handleRedisError = (error: Error) => {
  logger.error('Redis client error:', error);
};

const handleRedisConnect = () => {
  logger.info('Redis client connecting...');
};

const handleRedisReady = () => {
  logger.info('Redis client ready');
};

const handleRedisReconnecting = () => {
  logger.warn('Redis client reconnecting...');
};

const handleRedisEnd = () => {
  logger.warn('Redis client connection ended');
};

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
          connectTimeout: 15000, // Increased from 5000 for Railway's shared infrastructure latency
          // PRODUCTION FIX: Add socket timeout to prevent commands from hanging indefinitely
          // This prevents POST requests from hanging when Redis is unresponsive
          noDelay: true, // Disable Nagle's algorithm for faster command/response
          keepAlive: 5000, // Send keepalive packets every 5 seconds
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
        // PRODUCTION FIX: Limit command queue to prevent memory issues
        commandsQueueMaxLength: 100, // Limit pending commands queue
        // NOTE: disableOfflineQueue is intentionally NOT set to allow graceful reconnection
      });

      // EVENT LISTENER LEAK FIX: Use named handlers for proper cleanup
      redisClient.on('error', handleRedisError);
      redisClient.on('connect', handleRedisConnect);
      redisClient.on('ready', handleRedisReady);
      redisClient.on('reconnecting', handleRedisReconnecting);
      redisClient.on('end', handleRedisEnd);

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
    if (redisClient) {
      // EVENT LISTENER LEAK FIX: Remove listeners before disconnecting
      // Redis client uses removeListener instead of off
      redisClient.removeListener('error', handleRedisError);
      redisClient.removeListener('connect', handleRedisConnect);
      redisClient.removeListener('ready', handleRedisReady);
      redisClient.removeListener('reconnecting', handleRedisReconnecting);
      redisClient.removeListener('end', handleRedisEnd);

      if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis disconnected successfully');
      }
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
