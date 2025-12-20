/**
 * DistributedLock - Distributed locking service using Redis
 *
 * Prevents concurrent execution of critical operations across multiple server instances.
 * Uses the standard Redis SET NX PX pattern for lock acquisition.
 *
 * USE FOR:
 * - Marketplace bid processing
 * - Auction endings
 * - Background job deduplication
 * - Gang war resolution
 * - Any operation that must not run concurrently
 */

import { randomBytes } from 'crypto';
import { getRedisClient, isRedisConnected } from '../../config/redis';
import logger from '../../utils/logger';

/**
 * Options for lock acquisition
 */
export interface LockOptions {
  /** Lock TTL in milliseconds (default: 10000ms) */
  ttl?: number;
  /** Maximum time to wait for lock in milliseconds (default: 5000ms) */
  waitTimeout?: number;
  /** Retry interval in milliseconds (default: 100ms) */
  retryInterval?: number;
  /** Number of retry attempts (default: calculated from waitTimeout/retryInterval) */
  maxRetries?: number;
}

/**
 * Result of a lock operation
 */
export interface LockResult {
  acquired: boolean;
  lockId?: string;
  resource: string;
  waitedMs?: number;
}

/**
 * Lock release result
 */
export interface ReleaseResult {
  released: boolean;
  resource: string;
  reason?: string;
}

/**
 * Execute an operation with a distributed lock
 *
 * @param resource - Unique identifier for the resource to lock
 * @param operation - Async function to execute while holding the lock
 * @param options - Lock configuration options
 * @returns Result of the operation
 *
 * @example
 * ```typescript
 * // Process auction ending with lock
 * const winner = await withLock(
 *   `auction:${auctionId}`,
 *   async () => {
 *     const auction = await Auction.findById(auctionId);
 *     if (auction.status !== 'active') return null; // Already processed
 *
 *     auction.status = 'completed';
 *     await auction.save();
 *     return auction.highestBidder;
 *   },
 *   { ttl: 30000 }
 * );
 * ```
 */
export async function withLock<T>(
  resource: string,
  operation: () => Promise<T>,
  options?: LockOptions
): Promise<T> {
  const lockId = generateLockId();
  const lock = await acquireLock(resource, lockId, options);

  if (!lock.acquired) {
    throw new Error(`Failed to acquire lock for resource: ${resource}`);
  }

  try {
    logger.debug(`[Lock] Acquired: ${resource}`, { lockId, waitedMs: lock.waitedMs });
    return await operation();
  } finally {
    const released = await releaseLock(resource, lockId);
    if (!released.released) {
      logger.warn(`[Lock] Failed to release: ${resource}`, { lockId, reason: released.reason });
    } else {
      logger.debug(`[Lock] Released: ${resource}`, { lockId });
    }
  }
}

/**
 * Try to execute an operation with a lock, returning undefined if lock unavailable
 * Does not throw if lock cannot be acquired
 *
 * @param resource - Unique identifier for the resource to lock
 * @param operation - Async function to execute while holding the lock
 * @param options - Lock configuration options
 * @returns Result of the operation or undefined if lock not acquired
 *
 * @example
 * ```typescript
 * // Try to process, skip if another instance is already doing it
 * const result = await tryWithLock('daily-cleanup', async () => {
 *   await cleanupExpiredSessions();
 *   return { cleaned: true };
 * });
 *
 * if (!result) {
 *   logger.info('Cleanup already running on another instance');
 * }
 * ```
 */
export async function tryWithLock<T>(
  resource: string,
  operation: () => Promise<T>,
  options?: LockOptions
): Promise<T | undefined> {
  const lockId = generateLockId();

  // For tryWithLock, we don't wait - just try once
  const lock = await acquireLock(resource, lockId, {
    ...options,
    maxRetries: 1,
    waitTimeout: 0
  });

  if (!lock.acquired) {
    logger.debug(`[Lock] Not acquired (resource busy): ${resource}`);
    return undefined;
  }

  try {
    logger.debug(`[Lock] Acquired: ${resource}`, { lockId });
    return await operation();
  } finally {
    const released = await releaseLock(resource, lockId);
    if (released.released) {
      logger.debug(`[Lock] Released: ${resource}`, { lockId });
    }
  }
}

/**
 * Acquire a distributed lock
 *
 * @param resource - Resource to lock
 * @param lockId - Unique lock identifier (used for safe release)
 * @param options - Lock options
 * @returns Lock acquisition result
 */
export async function acquireLock(
  resource: string,
  lockId: string,
  options?: LockOptions
): Promise<LockResult> {
  if (!isRedisConnected()) {
    logger.error('[Lock] Redis not connected - cannot acquire lock');
    return { acquired: false, resource };
  }

  const ttl = options?.ttl ?? 10000;
  const waitTimeout = options?.waitTimeout ?? 5000;
  const retryInterval = options?.retryInterval ?? 100;
  const maxRetries = options?.maxRetries ?? Math.floor(waitTimeout / retryInterval);

  const key = `lock:${resource}`;
  const startTime = Date.now();

  const client = getRedisClient();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // SET key value NX PX milliseconds
    // NX = only set if not exists
    // PX = set expiration in milliseconds
    const result = await client.set(key, lockId, {
      NX: true,
      PX: ttl
    });

    if (result === 'OK') {
      return {
        acquired: true,
        lockId,
        resource,
        waitedMs: Date.now() - startTime
      };
    }

    // Lock not acquired, wait before retry
    if (attempt < maxRetries - 1) {
      await delay(retryInterval);
    }
  }

  return {
    acquired: false,
    resource,
    waitedMs: Date.now() - startTime
  };
}

/**
 * Release a distributed lock
 * Only releases if we still hold the lock (verified by lockId)
 *
 * @param resource - Resource to unlock
 * @param lockId - Lock identifier from acquisition
 * @returns Release result
 */
export async function releaseLock(
  resource: string,
  lockId: string
): Promise<ReleaseResult> {
  if (!isRedisConnected()) {
    return { released: false, resource, reason: 'Redis not connected' };
  }

  const key = `lock:${resource}`;
  const client = getRedisClient();

  // Lua script to atomically check and delete
  // This ensures we only delete our own lock
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  try {
    const result = await client.eval(script, {
      keys: [key],
      arguments: [lockId]
    });

    if (result === 1) {
      return { released: true, resource };
    } else {
      return { released: false, resource, reason: 'Lock owned by another holder or expired' };
    }
  } catch (error) {
    logger.error('[Lock] Error releasing lock', { resource, error });
    return { released: false, resource, reason: 'Release error' };
  }
}

/**
 * Check if a resource is currently locked
 *
 * @param resource - Resource to check
 * @returns True if locked, false otherwise
 */
export async function isLocked(resource: string): Promise<boolean> {
  if (!isRedisConnected()) {
    return false;
  }

  const key = `lock:${resource}`;
  const client = getRedisClient();
  const result = await client.exists(key);
  return result > 0;
}

/**
 * Extend a lock's TTL (for long-running operations)
 *
 * @param resource - Resource locked
 * @param lockId - Lock identifier
 * @param additionalMs - Additional milliseconds to add to TTL
 * @returns True if extended, false if lock not held or expired
 */
export async function extendLock(
  resource: string,
  lockId: string,
  additionalMs: number
): Promise<boolean> {
  if (!isRedisConnected()) {
    return false;
  }

  const key = `lock:${resource}`;
  const client = getRedisClient();

  // Lua script to atomically verify ownership and extend
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("PEXPIRE", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;

  try {
    const result = await client.eval(script, {
      keys: [key],
      arguments: [lockId, additionalMs.toString()]
    });

    return result === 1;
  } catch (error) {
    logger.error('[Lock] Error extending lock', { resource, error });
    return false;
  }
}

/**
 * Generate a unique lock identifier
 */
function generateLockId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Promise-based delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Pre-defined lock key generators for common resources
 * Ensures consistent naming across the codebase
 */
export const LockKeys = {
  /** Lock for character-specific operations */
  character: (characterId: string) => `character:${characterId}`,

  /** Lock for gang operations */
  gang: (gangId: string) => `gang:${gangId}`,

  /** Lock for specific marketplace listing */
  listing: (listingId: string) => `marketplace:listing:${listingId}`,

  /** Lock for auction processing */
  auction: (auctionId: string) => `marketplace:auction:${auctionId}`,

  /** Lock for duel session */
  duel: (duelId: string) => `duel:${duelId}`,

  /** Lock for combat encounter */
  combat: (encounterId: string) => `combat:${encounterId}`,

  /** Lock for background job execution */
  job: (jobType: string) => `job:${jobType}`,

  /** Lock for gang war operations */
  war: (warId: string) => `gangwar:${warId}`,

  /** Lock for quest completion */
  quest: (characterId: string, questId: string) => `quest:${characterId}:${questId}`,

  /** Lock for hunting trip */
  hunt: (tripId: string) => `hunt:${tripId}`,

  /** Lock for gambling session */
  gambling: (sessionId: string) => `gambling:${sessionId}`,

  /** Lock for property purchase */
  property: (propertyId: string) => `property:${propertyId}`,

  /** Lock for gold transfer */
  goldTransfer: (sourceId: string, targetId: string) =>
    `gold:${[sourceId, targetId].sort().join(':')}`, // Sorted to prevent deadlocks
};

export default {
  withLock,
  tryWithLock,
  acquireLock,
  releaseLock,
  isLocked,
  extendLock,
  LockKeys
};
