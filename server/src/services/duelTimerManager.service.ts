/**
 * DuelTimerManager Service
 *
 * Redis-based distributed timer management for duel turn timeouts.
 * Uses Redis sorted sets for efficient timeout tracking across instances.
 *
 * Features:
 * - Distributed timers work across multiple server instances
 * - Crash recovery - timers persist in Redis
 * - Efficient polling using sorted sets
 * - Automatic cleanup of stale timers
 */

import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from '../utils/logger';

/**
 * Redis key for the timer sorted set
 * Score = timestamp when timer should fire
 * Member = duelId
 */
const TIMER_KEY = 'duel:timers';

/**
 * Polling interval in milliseconds
 */
const POLL_INTERVAL_MS = 1000;

/**
 * Timer callback type
 */
type TimeoutCallback = (duelId: string) => Promise<void>;

/**
 * Active polling state
 */
let pollingInterval: NodeJS.Timeout | null = null;
let onTimeoutCallback: TimeoutCallback | null = null;

/**
 * DuelTimerManager - Distributed timer management
 */
export const DuelTimerManager = {
  /**
   * Schedule a timeout for a duel
   *
   * @param duelId - Duel identifier
   * @param timeoutMs - Milliseconds until timeout
   */
  async scheduleTimeout(duelId: string, timeoutMs: number): Promise<void> {
    try {
      if (!isRedisConnected()) {
        logger.warn(`Redis not connected, timer for ${duelId} not scheduled`);
        return;
      }

      const client = getRedisClient();
      const fireAt = Date.now() + timeoutMs;

      // Add to sorted set with score = fire time
      await client.zAdd(TIMER_KEY, {
        score: fireAt,
        value: duelId,
      });

      logger.debug(`Scheduled timeout for duel ${duelId} at ${new Date(fireAt).toISOString()}`);
    } catch (error) {
      logger.error(`Failed to schedule timeout for duel ${duelId}:`, error);
    }
  },

  /**
   * Cancel a scheduled timeout
   *
   * @param duelId - Duel identifier
   */
  async cancelTimeout(duelId: string): Promise<void> {
    try {
      if (!isRedisConnected()) {
        return;
      }

      const client = getRedisClient();
      await client.zRem(TIMER_KEY, duelId);

      logger.debug(`Cancelled timeout for duel ${duelId}`);
    } catch (error) {
      logger.error(`Failed to cancel timeout for duel ${duelId}:`, error);
    }
  },

  /**
   * Reschedule a timeout (cancel existing and schedule new)
   *
   * @param duelId - Duel identifier
   * @param timeoutMs - New timeout in milliseconds
   */
  async rescheduleTimeout(duelId: string, timeoutMs: number): Promise<void> {
    await this.cancelTimeout(duelId);
    await this.scheduleTimeout(duelId, timeoutMs);
  },

  /**
   * Get remaining time for a duel's timeout
   *
   * @param duelId - Duel identifier
   * @returns Milliseconds remaining, or null if no timer
   */
  async getRemainingTime(duelId: string): Promise<number | null> {
    try {
      if (!isRedisConnected()) {
        return null;
      }

      const client = getRedisClient();
      const score = await client.zScore(TIMER_KEY, duelId);

      if (score === null) {
        return null;
      }

      const remaining = score - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      logger.error(`Failed to get remaining time for duel ${duelId}:`, error);
      return null;
    }
  },

  /**
   * Check for and process expired timers
   * Called by the polling loop
   */
  async processExpiredTimers(): Promise<void> {
    try {
      if (!isRedisConnected() || !onTimeoutCallback) {
        return;
      }

      const client = getRedisClient();
      const now = Date.now();

      // Get all timers that have expired (score <= now)
      const expired = await client.zRangeByScore(TIMER_KEY, '-inf', now.toString());

      if (expired.length === 0) {
        return;
      }

      // Process each expired timer
      for (const duelId of expired) {
        // Remove from set first (atomic with processing)
        const removed = await client.zRem(TIMER_KEY, duelId);

        if (removed > 0) {
          logger.info(`Timer expired for duel ${duelId}`);

          // Call the timeout handler
          try {
            await onTimeoutCallback(duelId);
          } catch (error) {
            logger.error(`Error handling timeout for duel ${duelId}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing expired timers:', error);
    }
  },

  /**
   * Start the polling loop for expired timers
   *
   * @param onTimeout - Callback to handle timeouts
   */
  startPolling(onTimeout: TimeoutCallback): void {
    if (pollingInterval) {
      logger.warn('Timer polling already started');
      return;
    }

    onTimeoutCallback = onTimeout;

    pollingInterval = setInterval(() => {
      void this.processExpiredTimers();
    }, POLL_INTERVAL_MS);

    logger.info('DuelTimerManager polling started');
  },

  /**
   * Stop the polling loop
   */
  stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      onTimeoutCallback = null;
      logger.info('DuelTimerManager polling stopped');
    }
  },

  /**
   * Check if polling is active
   */
  isPolling(): boolean {
    return pollingInterval !== null;
  },

  /**
   * Get count of active timers
   */
  async getTimerCount(): Promise<number> {
    try {
      if (!isRedisConnected()) {
        return 0;
      }

      const client = getRedisClient();
      return await client.zCard(TIMER_KEY);
    } catch (error) {
      logger.error('Failed to get timer count:', error);
      return 0;
    }
  },

  /**
   * Clear all timers (use with caution)
   */
  async clearAllTimers(): Promise<number> {
    try {
      if (!isRedisConnected()) {
        return 0;
      }

      const client = getRedisClient();
      const count = await client.zCard(TIMER_KEY);
      await client.del(TIMER_KEY);

      logger.warn(`Cleared ${count} timers from Redis`);
      return count;
    } catch (error) {
      logger.error('Failed to clear timers:', error);
      return 0;
    }
  },

  /**
   * Schedule a time warning emission
   *
   * @param duelId - Duel identifier
   * @param warningMs - Milliseconds before timeout to warn
   * @param totalTimeoutMs - Total timeout duration
   */
  async scheduleTimeWarning(
    duelId: string,
    warningMs: number,
    totalTimeoutMs: number
  ): Promise<void> {
    // The warning is typically 10 seconds before timeout
    const warningDelay = totalTimeoutMs - warningMs;
    if (warningDelay > 0) {
      const warningKey = `${duelId}:warning`;
      await this.scheduleTimeout(warningKey, warningDelay);
    }
  },

  /**
   * Check if a timer ID is a warning timer
   */
  isWarningTimer(timerId: string): boolean {
    return timerId.endsWith(':warning');
  },

  /**
   * Get the duel ID from a warning timer ID
   */
  getDuelIdFromWarning(warningTimerId: string): string {
    return warningTimerId.replace(':warning', '');
  },
};

export default DuelTimerManager;
