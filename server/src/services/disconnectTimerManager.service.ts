/**
 * DisconnectTimerManager Service
 *
 * Redis-based distributed timer management for duel player disconnections.
 * Uses Redis sorted sets for efficient timeout tracking across instances.
 *
 * Features:
 * - Distributed timers work across multiple server instances
 * - Crash recovery - timers persist in Redis
 * - Efficient polling using sorted sets
 * - Automatic cleanup of stale timers
 *
 * SESSION FIX: Replaces in-memory Map<string, NodeJS.Timeout> for disconnect timers
 * to enable horizontal scaling and crash recovery.
 */

import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from '../utils/logger';

/**
 * Redis key for the disconnect timer sorted set
 * Score = timestamp when timer should fire
 * Member = "duelId:characterId"
 */
const DISCONNECT_TIMER_KEY = 'duel:disconnect:timers';

/**
 * Redis key prefix for character metadata (name, etc.)
 */
const DISCONNECT_META_KEY_PREFIX = 'duel:disconnect:meta:';

/**
 * Polling interval in milliseconds
 */
const POLL_INTERVAL_MS = 5000; // Check every 5 seconds for disconnect timeouts

/**
 * Timer callback type
 * Called when a disconnect timeout fires
 */
type DisconnectTimeoutCallback = (
  duelId: string,
  characterId: string,
  characterName: string
) => Promise<void>;

/**
 * Active polling state
 */
let pollingInterval: NodeJS.Timeout | null = null;
let onTimeoutCallback: DisconnectTimeoutCallback | null = null;

/**
 * DisconnectTimerManager - Distributed disconnect timer management
 *
 * Usage:
 * 1. Call startPolling() with callback on server startup
 * 2. Call setDisconnectTimer() when a player disconnects
 * 3. Call clearDisconnectTimer() when a player reconnects
 * 4. Call stopPolling() on server shutdown
 */
export const DisconnectTimerManager = {
  /**
   * Set a disconnect timer for a player
   *
   * @param duelId - Duel identifier
   * @param characterId - Character identifier
   * @param characterName - Character name (for logging)
   * @param timeoutMs - Milliseconds until timeout
   */
  async setDisconnectTimer(
    duelId: string,
    characterId: string,
    characterName: string,
    timeoutMs: number
  ): Promise<void> {
    try {
      if (!isRedisConnected()) {
        logger.warn(
          `Redis not connected, disconnect timer for ${characterName} in duel ${duelId} not set`
        );
        return;
      }

      const client = getRedisClient();
      const fireAt = Date.now() + timeoutMs;
      const timerKey = `${duelId}:${characterId}`;

      // Remove any existing timer for this player first
      await client.zRem(DISCONNECT_TIMER_KEY, timerKey);

      // Add to sorted set with score = fire time
      await client.zAdd(DISCONNECT_TIMER_KEY, {
        score: fireAt,
        value: timerKey,
      });

      // Store metadata (character name) for the callback
      const metaKey = `${DISCONNECT_META_KEY_PREFIX}${timerKey}`;
      await client.setEx(metaKey, Math.ceil(timeoutMs / 1000) + 60, characterName);

      logger.info(
        `Set disconnect timer for ${characterName} (${characterId}) in duel ${duelId}. ` +
        `Fires at ${new Date(fireAt).toISOString()} (${timeoutMs / 1000}s)`
      );
    } catch (error) {
      logger.error(
        `Failed to set disconnect timer for ${characterName} in duel ${duelId}:`,
        error
      );
    }
  },

  /**
   * Clear a disconnect timer for a player (player reconnected)
   *
   * @param duelId - Duel identifier
   * @param characterId - Character identifier
   */
  async clearDisconnectTimer(duelId: string, characterId: string): Promise<void> {
    try {
      if (!isRedisConnected()) {
        return;
      }

      const client = getRedisClient();
      const timerKey = `${duelId}:${characterId}`;

      // Remove from sorted set
      const removed = await client.zRem(DISCONNECT_TIMER_KEY, timerKey);

      // Clean up metadata
      const metaKey = `${DISCONNECT_META_KEY_PREFIX}${timerKey}`;
      await client.del(metaKey);

      if (removed > 0) {
        logger.info(
          `Cleared disconnect timer for character ${characterId} in duel ${duelId}`
        );
      }
    } catch (error) {
      logger.error(
        `Failed to clear disconnect timer for ${characterId} in duel ${duelId}:`,
        error
      );
    }
  },

  /**
   * Check if a disconnect timer exists for a player
   *
   * @param duelId - Duel identifier
   * @param characterId - Character identifier
   * @returns true if timer exists
   */
  async hasDisconnectTimer(duelId: string, characterId: string): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        return false;
      }

      const client = getRedisClient();
      const timerKey = `${duelId}:${characterId}`;
      const score = await client.zScore(DISCONNECT_TIMER_KEY, timerKey);

      return score !== null;
    } catch (error) {
      logger.error(
        `Failed to check disconnect timer for ${characterId} in duel ${duelId}:`,
        error
      );
      return false;
    }
  },

  /**
   * Clear all disconnect timers for a duel (duel ended)
   *
   * @param duelId - Duel identifier
   */
  async clearAllTimersForDuel(duelId: string): Promise<void> {
    try {
      if (!isRedisConnected()) {
        return;
      }

      const client = getRedisClient();

      // Get all timers for this duel (prefix match)
      const allTimers = await client.zRange(DISCONNECT_TIMER_KEY, 0, -1);
      const duelTimers = allTimers.filter(key => key.startsWith(`${duelId}:`));

      if (duelTimers.length > 0) {
        // Remove all timers for this duel
        await client.zRem(DISCONNECT_TIMER_KEY, duelTimers);

        // Clean up metadata
        const metaKeys = duelTimers.map(key => `${DISCONNECT_META_KEY_PREFIX}${key}`);
        if (metaKeys.length > 0) {
          await client.del(metaKeys);
        }

        logger.debug(`Cleared ${duelTimers.length} disconnect timer(s) for duel ${duelId}`);
      }
    } catch (error) {
      logger.error(`Failed to clear all timers for duel ${duelId}:`, error);
    }
  },

  /**
   * Start polling for expired disconnect timers
   *
   * @param callback - Function to call when a timer fires
   */
  startPolling(callback: DisconnectTimeoutCallback): void {
    if (pollingInterval) {
      logger.warn('Disconnect timer polling already started');
      return;
    }

    onTimeoutCallback = callback;

    pollingInterval = setInterval(async () => {
      await this.processExpiredTimers();
    }, POLL_INTERVAL_MS);

    logger.info(
      `Disconnect timer polling started (interval: ${POLL_INTERVAL_MS}ms)`
    );
  },

  /**
   * Stop polling for expired timers
   */
  stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      onTimeoutCallback = null;
      logger.info('Disconnect timer polling stopped');
    }
  },

  /**
   * Process all expired disconnect timers
   * Called internally by the polling loop
   */
  async processExpiredTimers(): Promise<void> {
    try {
      if (!isRedisConnected() || !onTimeoutCallback) {
        return;
      }

      const client = getRedisClient();
      const now = Date.now();

      // Get all expired timers (score <= now)
      const expiredTimers = await client.zRangeByScore(
        DISCONNECT_TIMER_KEY,
        '-inf',
        now.toString()
      );

      for (const timerKey of expiredTimers) {
        // Parse duelId:characterId
        const [duelId, characterId] = timerKey.split(':');
        if (!duelId || !characterId) {
          // Invalid key format, remove it
          await client.zRem(DISCONNECT_TIMER_KEY, timerKey);
          continue;
        }

        // Remove from sorted set FIRST (prevents duplicate processing)
        const removed = await client.zRem(DISCONNECT_TIMER_KEY, timerKey);
        if (removed === 0) {
          // Another instance already processed this timer
          continue;
        }

        // Get character name from metadata
        const metaKey = `${DISCONNECT_META_KEY_PREFIX}${timerKey}`;
        const characterName = await client.get(metaKey) || 'Unknown';
        await client.del(metaKey);

        // Call the callback
        try {
          await onTimeoutCallback(duelId, characterId, characterName);
        } catch (error) {
          logger.error(
            `Error in disconnect timeout callback for ${characterName} in duel ${duelId}:`,
            error
          );
        }
      }
    } catch (error) {
      logger.error('Error processing expired disconnect timers:', error);
    }
  },

  /**
   * Get count of active disconnect timers (for monitoring)
   */
  async getActiveTimerCount(): Promise<number> {
    try {
      if (!isRedisConnected()) {
        return 0;
      }

      const client = getRedisClient();
      return await client.zCard(DISCONNECT_TIMER_KEY);
    } catch (error) {
      logger.error('Failed to get active disconnect timer count:', error);
      return 0;
    }
  },
};
