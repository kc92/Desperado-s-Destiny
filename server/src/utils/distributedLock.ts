/**
 * Distributed Lock Utility
 * C5 SECURITY FIX: Prevents race conditions in financial operations
 *
 * Uses Redis SET NX with expiry for atomic lock acquisition
 * Implements proper cleanup to prevent deadlocks
 */

import { getRedisClient } from '../config/redis';
import logger from './logger';
import { SecureRNG } from '../services/base/SecureRNG';

// Lock configuration
const DEFAULT_LOCK_TTL_MS = 10000; // 10 seconds default
const LOCK_RETRY_DELAY_MS = 50; // 50ms between retries
const MAX_LOCK_RETRIES = 20; // Max 1 second of retrying

/**
 * Acquire a distributed lock
 *
 * @param lockKey - Unique key for the lock (e.g., "gold-lock:characterId")
 * @param ttlMs - Lock time-to-live in milliseconds (auto-releases after this)
 * @returns Lock token if acquired, null if failed
 */
export async function acquireLock(
  lockKey: string,
  ttlMs: number = DEFAULT_LOCK_TTL_MS
): Promise<string | null> {
  try {
    const redis = getRedisClient();
    const lockToken = `${Date.now()}-${SecureRNG.hex(8)}`;

    // SET NX (only if not exists) with EX (expiry)
    // This is atomic - either we get the lock or we don't
    const result = await redis.set(lockKey, lockToken, {
      NX: true,
      PX: ttlMs
    });

    if (result === 'OK') {
      logger.debug(`[LOCK] Acquired lock: ${lockKey}`);
      return lockToken;
    }

    return null;
  } catch (error) {
    logger.error(`[LOCK] Error acquiring lock ${lockKey}:`, error);
    return null;
  }
}

/**
 * Acquire a lock with retry logic
 *
 * @param lockKey - Unique key for the lock
 * @param ttlMs - Lock time-to-live in milliseconds
 * @param maxRetries - Maximum retry attempts
 * @returns Lock token if acquired, null if failed after retries
 */
export async function acquireLockWithRetry(
  lockKey: string,
  ttlMs: number = DEFAULT_LOCK_TTL_MS,
  maxRetries: number = MAX_LOCK_RETRIES
): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    const token = await acquireLock(lockKey, ttlMs);
    if (token) {
      return token;
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_DELAY_MS));
  }

  logger.warn(`[LOCK] Failed to acquire lock after ${maxRetries} retries: ${lockKey}`);
  return null;
}

/**
 * Release a distributed lock
 * Only releases if the token matches (prevents releasing someone else's lock)
 *
 * @param lockKey - Unique key for the lock
 * @param lockToken - Token received when lock was acquired
 * @returns True if released, false otherwise
 */
export async function releaseLock(
  lockKey: string,
  lockToken: string
): Promise<boolean> {
  try {
    const redis = getRedisClient();

    // Lua script for atomic check-and-delete
    // Only delete if the token matches (prevents releasing others' locks)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await redis.eval(script, {
      keys: [lockKey],
      arguments: [lockToken]
    });

    if (result === 1) {
      logger.debug(`[LOCK] Released lock: ${lockKey}`);
      return true;
    }

    logger.warn(`[LOCK] Failed to release lock (token mismatch or expired): ${lockKey}`);
    return false;
  } catch (error) {
    logger.error(`[LOCK] Error releasing lock ${lockKey}:`, error);
    return false;
  }
}

/**
 * Options for withLock function
 */
export interface LockOptions {
  /** Lock time-to-live in seconds (not milliseconds) */
  ttl?: number;
  /** Maximum retry attempts (0 = no retries, fail fast) */
  retries?: number;
}

/**
 * Execute a function with a distributed lock
 * Automatically acquires and releases the lock
 *
 * @param lockKey - Unique key for the lock
 * @param fn - Function to execute while holding the lock
 * @param options - Lock options (ttl in seconds, retries count)
 * @returns Result of the function
 * @throws Error if lock cannot be acquired or function throws
 */
export async function withLock<T>(
  lockKey: string,
  fn: () => Promise<T>,
  options?: LockOptions
): Promise<T> {
  const ttlMs = (options?.ttl || 10) * 1000; // Convert seconds to milliseconds
  const maxRetries = options?.retries !== undefined ? options.retries : MAX_LOCK_RETRIES;

  let lockToken: string | null;

  if (maxRetries === 0) {
    // No retries - try once
    lockToken = await acquireLock(lockKey, ttlMs);
  } else {
    // Retry logic
    lockToken = await acquireLockWithRetry(lockKey, ttlMs, maxRetries);
  }

  if (!lockToken) {
    throw new Error(`Failed to acquire lock: ${lockKey}. Please try again.`);
  }

  try {
    return await fn();
  } finally {
    await releaseLock(lockKey, lockToken);
  }
}

/**
 * Create a character gold lock key
 * Used for financial operations on a character's gold
 */
export function goldLockKey(characterId: string): string {
  return `lock:gold:${characterId}`;
}

/**
 * Create a duel challenge lock key
 * Prevents creating multiple challenges simultaneously
 */
export function duelChallengeLockKey(characterId: string): string {
  return `lock:duel-challenge:${characterId}`;
}

export default {
  acquireLock,
  acquireLockWithRetry,
  releaseLock,
  withLock,
  goldLockKey,
  duelChallengeLockKey
};
