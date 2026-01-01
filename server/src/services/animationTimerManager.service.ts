/**
 * AnimationTimerManager Service
 *
 * Redis-based distributed timer management for duel animation sequences.
 * Uses Redis sorted sets for efficient timeout tracking across instances.
 *
 * Features:
 * - Distributed timers work across multiple server instances
 * - Crash recovery - animation timers persist in Redis
 * - Supports multiple animation types with distinct callbacks
 * - Fast polling (500ms) for smooth animation transitions
 */

import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from '../utils/logger';

/**
 * Redis key for the animation timer sorted set
 * Score = timestamp when timer should fire
 * Member = duelId:animationType
 */
const ANIMATION_TIMER_KEY = 'duel:animation_timers';

/**
 * Polling interval in milliseconds (faster than turn timers for smooth animations)
 */
const POLL_INTERVAL_MS = 500;

/**
 * Animation types that can be scheduled
 */
export type AnimationType = 'dealing' | 'reveal' | 'round_transition';

/**
 * Timer callback type
 */
type AnimationCallback = (duelId: string, animationType: AnimationType) => Promise<void>;

/**
 * Active polling state
 */
let pollingInterval: NodeJS.Timeout | null = null;
let onAnimationCallback: AnimationCallback | null = null;

/**
 * Parse a timer member string into duelId and animation type
 */
function parseMember(member: string): { duelId: string; animationType: AnimationType } | null {
  const lastColonIndex = member.lastIndexOf(':');
  if (lastColonIndex === -1) return null;

  const duelId = member.substring(0, lastColonIndex);
  const animationType = member.substring(lastColonIndex + 1) as AnimationType;

  return { duelId, animationType };
}

/**
 * Build a timer member string from duelId and animation type
 */
function buildMember(duelId: string, animationType: AnimationType): string {
  return `${duelId}:${animationType}`;
}

/**
 * AnimationTimerManager - Distributed animation timer management
 */
export const AnimationTimerManager = {
  /**
   * Schedule an animation timer
   *
   * @param duelId - Duel identifier
   * @param animationType - Type of animation
   * @param delayMs - Milliseconds until animation completes
   */
  async scheduleAnimation(
    duelId: string,
    animationType: AnimationType,
    delayMs: number
  ): Promise<void> {
    try {
      if (!isRedisConnected()) {
        logger.warn(`Redis not connected, animation timer for ${duelId} not scheduled`);
        return;
      }

      const client = getRedisClient();
      const fireAt = Date.now() + delayMs;
      const member = buildMember(duelId, animationType);

      // Add to sorted set with score = fire time
      await client.zAdd(ANIMATION_TIMER_KEY, {
        score: fireAt,
        value: member,
      });

      logger.debug(`Scheduled ${animationType} animation for duel ${duelId} in ${delayMs}ms`);
    } catch (error) {
      logger.error(`Failed to schedule animation for duel ${duelId}:`, error);
    }
  },

  /**
   * Cancel a scheduled animation timer
   *
   * @param duelId - Duel identifier
   * @param animationType - Type of animation to cancel
   */
  async cancelAnimation(duelId: string, animationType: AnimationType): Promise<void> {
    try {
      if (!isRedisConnected()) {
        return;
      }

      const client = getRedisClient();
      const member = buildMember(duelId, animationType);
      await client.zRem(ANIMATION_TIMER_KEY, member);

      logger.debug(`Cancelled ${animationType} animation for duel ${duelId}`);
    } catch (error) {
      logger.error(`Failed to cancel animation for duel ${duelId}:`, error);
    }
  },

  /**
   * Cancel all animation timers for a duel
   *
   * @param duelId - Duel identifier
   */
  async cancelAllAnimations(duelId: string): Promise<void> {
    const animationTypes: AnimationType[] = ['dealing', 'reveal', 'round_transition'];

    await Promise.all(
      animationTypes.map(type => this.cancelAnimation(duelId, type))
    );

    logger.debug(`Cancelled all animation timers for duel ${duelId}`);
  },

  /**
   * Check and process expired animation timers
   * Called by the polling loop
   */
  async processExpiredTimers(): Promise<void> {
    try {
      if (!isRedisConnected() || !onAnimationCallback) {
        return;
      }

      const client = getRedisClient();
      const now = Date.now();

      // Get all timers that have expired (score <= now)
      const expiredMembers = await client.zRangeByScore(
        ANIMATION_TIMER_KEY,
        0,
        now
      );

      if (expiredMembers.length === 0) {
        return;
      }

      // Process each expired timer
      for (const member of expiredMembers) {
        const parsed = parseMember(member);
        if (!parsed) {
          logger.warn(`Invalid animation timer member: ${member}`);
          await client.zRem(ANIMATION_TIMER_KEY, member);
          continue;
        }

        const { duelId, animationType } = parsed;

        // Remove from sorted set first (prevents duplicate processing)
        await client.zRem(ANIMATION_TIMER_KEY, member);

        // Fire callback
        try {
          await onAnimationCallback(duelId, animationType);
        } catch (error) {
          logger.error(`Animation callback failed for ${duelId}:${animationType}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error processing expired animation timers:', error);
    }
  },

  /**
   * Start the polling loop for animation timers
   *
   * @param callback - Function to call when an animation timer expires
   */
  startPolling(callback: AnimationCallback): void {
    if (pollingInterval) {
      logger.warn('Animation timer polling already running');
      return;
    }

    onAnimationCallback = callback;

    pollingInterval = setInterval(() => {
      this.processExpiredTimers().catch(error => {
        logger.error('Animation timer polling error:', error);
      });
    }, POLL_INTERVAL_MS);

    logger.info('Animation timer polling started');
  },

  /**
   * Stop the polling loop
   */
  stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      onAnimationCallback = null;
      logger.info('Animation timer polling stopped');
    }
  },

  /**
   * Check if polling is active
   */
  isPolling(): boolean {
    return pollingInterval !== null;
  },

  /**
   * Get count of pending animation timers (for monitoring)
   */
  async getPendingCount(): Promise<number> {
    try {
      if (!isRedisConnected()) {
        return 0;
      }

      const client = getRedisClient();
      return await client.zCard(ANIMATION_TIMER_KEY);
    } catch (error) {
      logger.error('Failed to get pending animation count:', error);
      return 0;
    }
  },

  /**
   * Clear all animation timers (use with caution - for cleanup/testing)
   */
  async clearAll(): Promise<number> {
    try {
      if (!isRedisConnected()) {
        return 0;
      }

      const client = getRedisClient();
      const count = await client.zCard(ANIMATION_TIMER_KEY);
      if (count > 0) {
        await client.del(ANIMATION_TIMER_KEY);
        logger.warn(`Cleared ${count} animation timers`);
      }
      return count;
    } catch (error) {
      logger.error('Failed to clear animation timers:', error);
      return 0;
    }
  },
};

export default AnimationTimerManager;
