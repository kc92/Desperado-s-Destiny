/**
 * StateManager - Redis-backed state management for real-time game state
 *
 * This service replaces in-memory Maps for session/game state storage,
 * ensuring state persists across server restarts and works in multi-instance deployments.
 *
 * IMPORTANT: Migrate ALL `new Map<>()` patterns for game state to StateManager
 */

import { RedisClientType } from 'redis';
import { getRedisClient, isRedisConnected } from '../../config/redis';
import logger from '../../utils/logger';

/**
 * Options for state operations
 */
export interface StateOptions {
  /** Time-to-live in seconds (auto-expires state) */
  ttl?: number;
}

/**
 * Options for batch operations
 */
export interface BatchStateOptions extends StateOptions {
  /** Continue on individual item errors */
  continueOnError?: boolean;
}

/**
 * Result of a batch operation
 */
export interface BatchResult<T> {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}

/**
 * Redis-backed state manager for game state
 *
 * @example
 * ```typescript
 * // Create a state manager for duels
 * const duelState = new StateManager('duel');
 *
 * // Store a duel session
 * await duelState.set('duel-123', { players: [...], round: 1 }, { ttl: 3600 });
 *
 * // Get duel state
 * const duel = await duelState.get<DuelSession>('duel-123');
 *
 * // Update atomically
 * await duelState.update<DuelSession>('duel-123', (current) => ({
 *   ...current,
 *   round: current.round + 1
 * }));
 * ```
 */
export class StateManager {
  private readonly namespace: string;

  constructor(namespace: string = 'game') {
    this.namespace = namespace;
  }

  /**
   * Get the Redis client, throwing if not connected
   */
  private getClient(): RedisClientType {
    if (!isRedisConnected()) {
      throw new Error('Redis client is not connected - StateManager unavailable');
    }
    return getRedisClient();
  }

  /**
   * Generate namespaced key
   */
  private key(id: string): string {
    return `${this.namespace}:${id}`;
  }

  /**
   * Get state by ID
   *
   * @param id - Unique identifier for the state
   * @returns State object or null if not found
   */
  async get<T>(id: string): Promise<T | null> {
    try {
      const client = this.getClient();
      const data = await client.get(this.key(id));

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not connected')) {
        throw error;
      }
      logger.error(`[StateManager:${this.namespace}] Failed to get state for ${id}`, { error });
      return null;
    }
  }

  /**
   * Set state with optional TTL
   *
   * @param id - Unique identifier for the state
   * @param state - State object to store
   * @param options - Optional TTL configuration
   */
  async set<T>(id: string, state: T, options?: StateOptions): Promise<void> {
    const client = this.getClient();
    const key = this.key(id);
    const value = JSON.stringify(state);

    if (options?.ttl) {
      await client.setEx(key, options.ttl, value);
    } else {
      await client.set(key, value);
    }
  }

  /**
   * Update state atomically using optimistic locking
   * Uses Redis WATCH/MULTI/EXEC for atomic updates
   *
   * @param id - Unique identifier for the state
   * @param updater - Function that receives current state and returns new state
   * @param options - Optional TTL configuration
   * @returns Updated state
   *
   * @example
   * ```typescript
   * // Atomically increment a counter
   * await state.update('session-123', (current) => ({
   *   ...current,
   *   round: (current?.round || 0) + 1
   * }));
   * ```
   */
  async update<T>(
    id: string,
    updater: (current: T | null) => T,
    options?: StateOptions
  ): Promise<T> {
    const client = this.getClient();
    const key = this.key(id);

    // Maximum retry attempts for optimistic locking conflicts
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // Watch the key for changes
        await client.watch(key);

        // Get current value
        const currentData = await client.get(key);
        const current = currentData ? (JSON.parse(currentData) as T) : null;

        // Apply updater
        const updated = updater(current);
        const value = JSON.stringify(updated);

        // Execute transaction
        const multi = client.multi();

        if (options?.ttl) {
          multi.setEx(key, options.ttl, value);
        } else {
          multi.set(key, value);
        }

        const result = await multi.exec();

        if (result === null) {
          // WATCH detected concurrent modification, retry
          retries++;
          logger.debug(`[StateManager:${this.namespace}] Update conflict, retrying (${retries}/${maxRetries})`);
          continue;
        }

        return updated;
      } catch (error) {
        // Ensure we unwatch on error
        await client.unwatch().catch(() => {});
        throw error;
      }
    }

    throw new Error(`[StateManager:${this.namespace}] Max retries exceeded for atomic update of ${id}`);
  }

  /**
   * Delete state
   *
   * @param id - Unique identifier for the state
   * @returns True if state was deleted, false if it didn't exist
   */
  async delete(id: string): Promise<boolean> {
    const client = this.getClient();
    const deleted = await client.del(this.key(id));
    return deleted > 0;
  }

  /**
   * Check if state exists
   *
   * @param id - Unique identifier for the state
   */
  async exists(id: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.exists(this.key(id));
    return result > 0;
  }

  /**
   * Get all keys matching a pattern
   * Use sparingly - KEYS command can be slow on large datasets
   *
   * @param pattern - Glob pattern to match (default: '*')
   * @returns Array of matching keys (without namespace prefix)
   */
  async keys(pattern: string = '*'): Promise<string[]> {
    const client = this.getClient();
    const fullPattern = `${this.namespace}:${pattern}`;
    const keys = await client.keys(fullPattern);

    // Strip namespace prefix from results
    const prefix = `${this.namespace}:`;
    return keys.map(k => k.substring(prefix.length));
  }

  /**
   * Set expiration on existing key
   *
   * @param id - Unique identifier for the state
   * @param seconds - TTL in seconds
   * @returns True if expiration was set, false if key doesn't exist
   */
  async expire(id: string, seconds: number): Promise<boolean> {
    const client = this.getClient();
    const result = await client.expire(this.key(id), seconds);
    return result;
  }

  /**
   * Get remaining TTL for a key
   *
   * @param id - Unique identifier for the state
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(id: string): Promise<number> {
    const client = this.getClient();
    return client.ttl(this.key(id));
  }

  /**
   * Get multiple states at once (batch read)
   *
   * @param ids - Array of identifiers
   * @returns Map of id -> state (null for missing keys)
   */
  async getMany<T>(ids: string[]): Promise<Map<string, T | null>> {
    if (ids.length === 0) {
      return new Map();
    }

    const client = this.getClient();
    const keys = ids.map(id => this.key(id));
    const values = await client.mGet(keys);

    const result = new Map<string, T | null>();
    ids.forEach((id, index) => {
      const data = values[index];
      if (data) {
        try {
          result.set(id, JSON.parse(data) as T);
        } catch {
          result.set(id, null);
        }
      } else {
        result.set(id, null);
      }
    });

    return result;
  }

  /**
   * Set multiple states at once (batch write)
   *
   * @param states - Map of id -> state
   * @param options - Optional TTL configuration (applies to all)
   */
  async setMany<T>(states: Map<string, T>, options?: StateOptions): Promise<void> {
    if (states.size === 0) {
      return;
    }

    const client = this.getClient();
    const multi = client.multi();

    for (const [id, state] of states) {
      const key = this.key(id);
      const value = JSON.stringify(state);

      if (options?.ttl) {
        multi.setEx(key, options.ttl, value);
      } else {
        multi.set(key, value);
      }
    }

    await multi.exec();
  }

  /**
   * Delete multiple states at once
   *
   * @param ids - Array of identifiers to delete
   * @returns Number of keys deleted
   */
  async deleteMany(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    const client = this.getClient();
    const keys = ids.map(id => this.key(id));
    return client.del(keys);
  }

  /**
   * Count total keys in this namespace
   * Uses SCAN for efficiency on large datasets
   */
  async count(): Promise<number> {
    const client = this.getClient();
    let count = 0;
    let cursor = 0;
    const pattern = `${this.namespace}:*`;

    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      count += result.keys.length;
    } while (cursor !== 0);

    return count;
  }

  /**
   * Clear all keys in this namespace
   * USE WITH CAUTION - deletes all data in namespace
   */
  async clear(): Promise<number> {
    const allKeys = await this.keys('*');
    if (allKeys.length === 0) {
      return 0;
    }
    return this.deleteMany(allKeys);
  }
}

// Pre-configured state managers for different game domains
// These replace in-memory Maps across the codebase

/** State manager for active duel sessions */
export const duelStateManager = new StateManager('duel');

/** State manager for gang raid sessions */
export const raidStateManager = new StateManager('raid');

/** State manager for hunting trips */
export const huntingStateManager = new StateManager('hunt');

/** State manager for gambling sessions */
export const gamblingStateManager = new StateManager('gambling');

/** State manager for gang showdowns */
export const showdownStateManager = new StateManager('showdown');

/** State manager for cosmic horror quest progress */
export const cosmicStateManager = new StateManager('cosmic');

/** State manager for reality distortion effects */
export const distortionStateManager = new StateManager('distortion');

/** State manager for horse racing */
export const racingStateManager = new StateManager('racing');

/** State manager for world boss sessions */
export const worldBossStateManager = new StateManager('worldboss');

/** State manager for deck engine pending games */
export const deckStateManager = new StateManager('deck');

/** State manager for stagecoach journeys */
export const stagecoachStateManager = new StateManager('stagecoach');

/** State manager for train robbery plans */
export const robberyStateManager = new StateManager('robbery');

/** State manager for Pinkerton pursuits */
export const pursuitStateManager = new StateManager('pursuit');

/** State manager for tournament sessions */
export const tournamentStateManager = new StateManager('tournament');

/** State manager for heist sessions */
export const heistStateManager = new StateManager('heist');

export default StateManager;
