/**
 * RedisStateManager - Base class for Redis-backed state management
 *
 * Provides a consistent pattern for storing transient game state in Redis
 * instead of in-memory Maps. This enables horizontal scaling and crash recovery.
 *
 * Usage:
 *   class DuelStateManager extends RedisStateManager<ActiveDuelState> {
 *     protected keyPrefix = 'duel:state:';
 *     protected ttlSeconds = 3600;
 *   }
 */

import { getRedisClient, isRedisConnected } from '../../config/redis';
import logger from '../../utils/logger';

export abstract class RedisStateManager<T> {
  /**
   * Redis key prefix for this state type
   * Example: 'duel:state:', 'session:', 'presence:'
   */
  protected abstract keyPrefix: string;

  /**
   * TTL in seconds for state entries (auto-cleanup)
   * Should be set based on expected max duration of state
   */
  protected abstract ttlSeconds: number;

  /**
   * Build full Redis key from ID
   */
  protected buildKey(id: string): string {
    return `${this.keyPrefix}${id}`;
  }

  /**
   * Store state in Redis with TTL
   * @param id - Unique identifier for this state
   * @param state - State object to store
   */
  async setState(id: string, state: T): Promise<void> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const key = this.buildKey(id);
      const serialized = JSON.stringify(state);

      await client.setEx(key, this.ttlSeconds, serialized);
      logger.debug(`[RedisState] Set ${key} (TTL: ${this.ttlSeconds}s)`);
    } catch (error) {
      logger.error(`[RedisState] Failed to set state for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve state from Redis
   * @param id - Unique identifier
   * @returns State object or null if not found
   */
  async getState(id: string): Promise<T | null> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const key = this.buildKey(id);
      const data = await client.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`[RedisState] Failed to get state for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if state exists
   * @param id - Unique identifier
   * @returns True if state exists
   */
  async hasState(id: string): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const key = this.buildKey(id);
      const exists = await client.exists(key);

      return exists === 1;
    } catch (error) {
      logger.error(`[RedisState] Failed to check state for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete state from Redis
   * @param id - Unique identifier
   */
  async deleteState(id: string): Promise<void> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const key = this.buildKey(id);
      await client.del(key);

      logger.debug(`[RedisState] Deleted ${key}`);
    } catch (error) {
      logger.error(`[RedisState] Failed to delete state for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atomic update with read-modify-write using WATCH for optimistic locking
   * This prevents race conditions when multiple processes update the same state
   *
   * @param id - Unique identifier
   * @param updateFn - Function that receives current state and returns updated state
   * @returns Updated state or null if state didn't exist
   */
  async updateStateAtomic(
    id: string,
    updateFn: (state: T) => T
  ): Promise<T | null> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const key = this.buildKey(id);

      // Use WATCH/MULTI/EXEC for optimistic locking
      // If key changes between WATCH and EXEC, transaction fails and retries
      const maxRetries = 3;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          // Watch the key for changes
          await client.watch(key);

          // Get current state
          const currentData = await client.get(key);
          if (!currentData) {
            await client.unwatch();
            return null;
          }

          const currentState = JSON.parse(currentData) as T;
          const updatedState = updateFn(currentState);
          const serialized = JSON.stringify(updatedState);

          // Execute atomic transaction
          const multi = client.multi();
          multi.setEx(key, this.ttlSeconds, serialized);
          const result = await multi.exec();

          if (result === null) {
            // Transaction was aborted due to WATCH failure (concurrent modification)
            retries++;
            logger.warn(`[RedisState] Optimistic lock failed for ${key}, retry ${retries}/${maxRetries}`);
            continue;
          }

          logger.debug(`[RedisState] Atomic update ${key}`);
          return updatedState;
        } catch (error) {
          await client.unwatch();
          throw error;
        }
      }

      throw new Error(`Failed to update state after ${maxRetries} retries (concurrent modification)`);
    } catch (error) {
      logger.error(`[RedisState] Failed to atomically update state for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Refresh TTL without modifying state
   * Useful for extending session/activity timeouts
   *
   * @param id - Unique identifier
   * @returns True if TTL was refreshed, false if key doesn't exist
   */
  async refreshTTL(id: string): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const key = this.buildKey(id);
      const result = await client.expire(key, this.ttlSeconds);

      return result;
    } catch (error) {
      logger.error(`[RedisState] Failed to refresh TTL for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Scan keys matching pattern using non-blocking SCAN cursor
   * Safe for production - doesn't block Redis server
   *
   * @param pattern - Redis key pattern to match
   * @param batchSize - Number of keys per SCAN iteration (default: 100)
   * @yields Batches of matching keys
   */
  protected async *scanKeys(pattern: string, batchSize = 100): AsyncGenerator<string[]> {
    if (!isRedisConnected()) {
      throw new Error('Redis not connected');
    }

    const client = getRedisClient();
    let cursor = 0;

    do {
      const result = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: batchSize,
      });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        yield result.keys;
      }
    } while (cursor !== 0);
  }

  /**
   * Get all state IDs matching this manager's prefix
   * Uses SCAN for non-blocking iteration - safe for production
   *
   * @returns Array of IDs (without prefix)
   */
  async getAllIds(): Promise<string[]> {
    try {
      const pattern = `${this.keyPrefix}*`;
      const allIds: string[] = [];

      for await (const keyBatch of this.scanKeys(pattern)) {
        for (const key of keyBatch) {
          allIds.push(key.replace(this.keyPrefix, ''));
        }
      }

      return allIds;
    } catch (error) {
      logger.error(`[RedisState] Failed to get all IDs:`, error);
      throw error;
    }
  }

  /**
   * Delete all state entries for this manager
   * Uses SCAN for non-blocking key discovery, then batch deletes
   * WARNING: Use with caution - destructive operation
   */
  async deleteAll(): Promise<number> {
    try {
      if (!isRedisConnected()) {
        throw new Error('Redis not connected');
      }

      const client = getRedisClient();
      const pattern = `${this.keyPrefix}*`;
      let totalDeleted = 0;

      // Process in batches to avoid blocking and memory issues
      for await (const keyBatch of this.scanKeys(pattern)) {
        if (keyBatch.length > 0) {
          const deleted = await client.del(keyBatch);
          totalDeleted += deleted;
        }
      }

      if (totalDeleted > 0) {
        logger.warn(`[RedisState] Deleted ${totalDeleted} entries with prefix ${this.keyPrefix}`);
      }
      return totalDeleted;
    } catch (error) {
      logger.error(`[RedisState] Failed to delete all:`, error);
      throw error;
    }
  }

  /**
   * Get count of state entries
   */
  async getCount(): Promise<number> {
    try {
      const ids = await this.getAllIds();
      return ids.length;
    } catch (error) {
      logger.error(`[RedisState] Failed to get count:`, error);
      throw error;
    }
  }
}

/**
 * Simple key-value mapping manager for Redis
 * Useful for character-to-duel mappings, etc.
 */
export class RedisMapping {
  constructor(
    private keyPrefix: string,
    private ttlSeconds: number
  ) {}

  private buildKey(id: string): string {
    return `${this.keyPrefix}${id}`;
  }

  async set(id: string, value: string): Promise<void> {
    if (!isRedisConnected()) {
      throw new Error('Redis not connected');
    }

    const client = getRedisClient();
    await client.setEx(this.buildKey(id), this.ttlSeconds, value);
  }

  async get(id: string): Promise<string | null> {
    if (!isRedisConnected()) {
      throw new Error('Redis not connected');
    }

    const client = getRedisClient();
    return client.get(this.buildKey(id));
  }

  async delete(id: string): Promise<void> {
    if (!isRedisConnected()) {
      throw new Error('Redis not connected');
    }

    const client = getRedisClient();
    await client.del(this.buildKey(id));
  }

  async has(id: string): Promise<boolean> {
    if (!isRedisConnected()) {
      throw new Error('Redis not connected');
    }

    const client = getRedisClient();
    const exists = await client.exists(this.buildKey(id));
    return exists === 1;
  }
}

export default RedisStateManager;
