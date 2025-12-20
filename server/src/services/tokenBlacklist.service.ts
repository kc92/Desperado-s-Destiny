/**
 * Token Blacklist Service
 *
 * Redis-backed service to manage blacklisted JWT tokens for secure logout
 * Tokens are stored with TTL matching their expiration time
 */

import { isRedisConnected, getRedisClient } from '../config/redis';
import { decodeToken } from '../utils/jwt';
import logger from '../utils/logger';

const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';

/**
 * Add a token to the blacklist
 * Token will be automatically removed when it expires
 *
 * @param token - JWT token to blacklist
 * @returns true if added successfully, false otherwise
 */
export async function addToBlacklist(token: string): Promise<boolean> {
  try {
    // Decode token to get expiration time
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      logger.warn('Cannot blacklist token: unable to decode or no expiration');
      return false;
    }

    // Calculate TTL (time until token expires)
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;

    // If token is already expired, no need to blacklist
    if (ttl <= 0) {
      logger.debug('Token already expired, no need to blacklist');
      return true;
    }

    // Check if Redis is connected
    if (!isRedisConnected()) {
      logger.warn('Redis not connected - using fallback in-memory blacklist');
      return addToInMemoryBlacklist(token, ttl);
    }

    // Add to Redis with TTL
    const client = getRedisClient();
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;

    await client.set(key, '1', { EX: ttl });

    logger.info(`Token blacklisted successfully (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error('Error adding token to blacklist:', error);
    // Fallback to in-memory blacklist
    return addToInMemoryBlacklist(token, 3600); // Default 1 hour TTL
  }
}

/**
 * Check if a token is blacklisted
 *
 * @param token - JWT token to check
 * @returns true if blacklisted, false otherwise
 */
export async function isBlacklisted(token: string): Promise<boolean> {
  try {
    // Check if Redis is connected
    if (!isRedisConnected()) {
      return isInMemoryBlacklisted(token);
    }

    const client = getRedisClient();
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;

    const result = await client.get(key);
    return result !== null;
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    // Fallback to in-memory check
    return isInMemoryBlacklisted(token);
  }
}

/**
 * Remove a token from the blacklist (rarely needed, mainly for testing)
 *
 * @param token - JWT token to remove
 * @returns true if removed, false otherwise
 */
export async function removeFromBlacklist(token: string): Promise<boolean> {
  try {
    if (!isRedisConnected()) {
      return removeFromInMemoryBlacklist(token);
    }

    const client = getRedisClient();
    const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;

    const result = await client.del(key);
    return result > 0;
  } catch (error) {
    logger.error('Error removing token from blacklist:', error);
    return removeFromInMemoryBlacklist(token);
  }
}

// In-memory fallback for when Redis is not available
// This is less secure but ensures logout still works in development
const inMemoryBlacklist = new Map<string, NodeJS.Timeout>();

function addToInMemoryBlacklist(token: string, ttlSeconds: number): boolean {
  // Clear existing timeout if any
  const existingTimeout = inMemoryBlacklist.get(token);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set timeout to auto-remove from blacklist
  const timeout = setTimeout(() => {
    inMemoryBlacklist.delete(token);
  }, ttlSeconds * 1000);

  inMemoryBlacklist.set(token, timeout);
  logger.debug(`Token added to in-memory blacklist (TTL: ${ttlSeconds}s)`);
  return true;
}

function isInMemoryBlacklisted(token: string): boolean {
  return inMemoryBlacklist.has(token);
}

function removeFromInMemoryBlacklist(token: string): boolean {
  const timeout = inMemoryBlacklist.get(token);
  if (timeout) {
    clearTimeout(timeout);
    inMemoryBlacklist.delete(token);
    return true;
  }
  return false;
}

/**
 * Get count of blacklisted tokens (for monitoring)
 */
export async function getBlacklistCount(): Promise<number> {
  try {
    if (!isRedisConnected()) {
      return inMemoryBlacklist.size;
    }

    const client = getRedisClient();
    const keys = await client.keys(`${TOKEN_BLACKLIST_PREFIX}*`);
    return keys.length;
  } catch (error) {
    logger.error('Error getting blacklist count:', error);
    return inMemoryBlacklist.size;
  }
}

export default {
  addToBlacklist,
  isBlacklisted,
  removeFromBlacklist,
  getBlacklistCount
};
