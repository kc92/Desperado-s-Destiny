/**
 * Protection Payment Job
 *
 * Phase 15: Gang Businesses
 *
 * Processes weekly protection payments for all active protection contracts:
 * - Collects payments from business owners
 * - Deposits funds to gang treasury
 * - Handles missed payments and suspensions
 * - Sends notifications for payment status
 */

import { ProtectionRacketService } from '../services/protectionRacket.service';
import { withLock } from '../utils/distributedLock';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * Generate a unique key for the current week (ISO week number)
 * Used for idempotency to prevent duplicate payment processing
 */
function getWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  // Calculate ISO week number
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Main weekly protection payment job
 * Run every Sunday at noon UTC
 *
 * SECURITY: Uses Redis-based idempotency to prevent duplicate payment processing
 * if the job runs multiple times in the same week (e.g., server restart, cron overlap)
 */
export async function runWeeklyProtectionPayments(): Promise<{
  processed: number;
  totalCollected: number;
  suspended: number;
  failed: number;
}> {
  const lockKey = 'job:weekly-protection-payment';
  const weekKey = getWeekKey();
  const idempotencyKey = `executed:weekly-protection-payment:${weekKey}`;

  try {
    return await withLock(
      lockKey,
      async () => {
        // Check if already executed this week (idempotency)
        const redis = getRedisClient();
        const alreadyExecuted = await redis.exists(idempotencyKey);

        if (alreadyExecuted) {
          logger.info(
            `[ProtectionPayment] Weekly protection payments already processed for ${weekKey}, skipping`
          );
          return { processed: 0, totalCollected: 0, suspended: 0, failed: 0 };
        }

        logger.info(
          '[ProtectionPayment] ========== Starting Weekly Protection Payments =========='
        );
        logger.info(`[ProtectionPayment] Week: ${weekKey}`);

        // Process all active protection contracts
        const result = await ProtectionRacketService.processWeeklyPayments();

        logger.info(
          `[ProtectionPayment] Processed ${result.processed} contracts: ` +
            `$${result.totalCollected} collected, ${result.suspended} suspended, ${result.failed} failed`
        );

        // Mark as executed for this week (expires in 8 days to ensure coverage)
        await redis.setEx(idempotencyKey, 8 * 24 * 60 * 60, 'completed');

        logger.info(
          '[ProtectionPayment] ========== Weekly Protection Payments Complete =========='
        );

        return result;
      },
      {
        ttl: 3600, // 60 minute lock TTL
        retries: 0, // Don't retry - skip if locked
      }
    );
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug(
        '[ProtectionPayment] Weekly protection payments already running on another instance, skipping'
      );
      return { processed: 0, totalCollected: 0, suspended: 0, failed: 0 };
    }
    logger.error('[ProtectionPayment] Error in weekly protection payments:', error);
    throw error;
  }
}

export default {
  runWeeklyProtectionPayments,
};
