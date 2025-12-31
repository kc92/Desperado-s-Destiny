/**
 * Investment Maturity Job
 *
 * Phase 10 - Banking System Investment Products
 *
 * This job runs daily and:
 * 1. Finds all investments that have reached maturity
 * 2. Marks them as MATURED (players must manually cash out)
 * 3. Logs statistics for economy monitoring
 *
 * PRODUCTION FIX: Added idempotency check and error handling
 */

import { InvestmentService } from '../services/investment.service';
import { withLock } from '../utils/distributedLock';
import { getRedisClient } from '../config/redis';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger';

/**
 * Generate a unique key for today's date (YYYY-MM-DD)
 * Used for idempotency to prevent duplicate processing
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Process matured investments
 * Runs daily to mark investments that have reached maturity
 *
 * SECURITY: Uses Redis-based idempotency to prevent duplicate processing
 * if the job runs multiple times in the same day
 */
export async function processMaturedInvestments(): Promise<{
  processed: number;
  skipped?: boolean;
}> {
  const lockKey = 'job:investment-maturity';
  const todayKey = getTodayKey();
  const idempotencyKey = `executed:investment-maturity:${todayKey}`;

  try {
    return await withLock(lockKey, async () => {
      // Check if already executed today (idempotency)
      const redis = getRedisClient();
      const alreadyExecuted = await redis.exists(idempotencyKey);

      if (alreadyExecuted) {
        logger.info(`[InvestmentMaturity] Already executed for ${todayKey}, skipping`);
        return { processed: 0, skipped: true };
      }

      logger.info('[InvestmentMaturity] ========== Starting Investment Maturity Processing ==========');

      const processed = await InvestmentService.processMaturedInvestments();

      // Mark as executed for today (expires in 25 hours to ensure coverage)
      await redis.setEx(idempotencyKey, 25 * 60 * 60, 'completed');

      logger.info('[InvestmentMaturity] ========== Investment Maturity Processing Complete ==========');
      logger.info(`[InvestmentMaturity] Summary: ${processed} investments marked as matured`);

      return { processed };
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    // Handle lock contention gracefully
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[InvestmentMaturity] Job already running on another instance, skipping');
      return { processed: 0, skipped: true };
    }

    // Log and report other errors to Sentry
    logger.error('[InvestmentMaturity] Error processing matured investments:', error);
    Sentry.captureException(error, {
      tags: { job: 'investment-maturity' },
      extra: { todayKey }
    });
    throw error;
  }
}

export default {
  processMaturedInvestments
};
