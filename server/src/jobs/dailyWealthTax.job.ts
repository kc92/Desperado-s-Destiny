/**
 * Daily Wealth Tax Collection Job
 *
 * BALANCE FIX (Phase 3.3): Implements progressive wealth tax to prevent
 * extreme gold hoarding and maintain healthy economy.
 *
 * Tax rates (daily):
 * - 0-100K gold: 0% (exempt)
 * - 100K-1M gold: 0.1%
 * - 1M-10M gold: 0.25%
 * - 10M+ gold: 0.5%
 *
 * This job runs daily and:
 * 1. Finds all characters above the wealth threshold
 * 2. Calculates progressive tax for each
 * 3. Collects tax atomically with audit trail
 * 4. Sends notifications to taxed players
 * 5. Logs statistics for economy monitoring
 */

import { GoldService } from '../services/gold.service';
import { NotificationService } from '../services/notification.service';
import { withLock } from '../utils/distributedLock';
import { getRedisClient } from '../config/redis';
import { WEALTH_TAX } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Generate a unique key for today's date (YYYY-MM-DD)
 * Used for idempotency to prevent duplicate tax collection
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Send wealth tax notification to a character
 * Informs them of the tax collected and their new balance
 *
 * Note: This is optional - notifications can be disabled for tax collection
 * to reduce notification spam for wealthy players
 */
async function sendWealthTaxNotification(
  characterId: string,
  taxAmount: number,
  newBalance: number
): Promise<void> {
  try {
    await NotificationService.sendNotification(
      characterId,
      'WEALTH_TAX',
      `The Territory Tax Office has collected ${taxAmount.toLocaleString()} gold in wealth tax. ` +
      `Your remaining balance is ${newBalance.toLocaleString()} gold. ` +
      `Consider investing in properties or gang operations to reduce future tax burden.`,
      { taxAmount, newBalance, taxType: 'wealth_tax', link: '/bank' }
    );
  } catch (error) {
    // Don't fail tax collection if notification fails
    logger.warn(`Failed to send wealth tax notification to ${characterId}:`, error);
  }
}

/**
 * Run daily wealth tax collection
 *
 * SECURITY: Uses Redis-based idempotency to prevent duplicate collection
 * if the job runs multiple times in the same day (e.g., server restart, cron overlap)
 */
export async function runDailyWealthTax(): Promise<{
  processed: number;
  collected: number;
  totalTax: number;
  skipped: number;
  errors: number;
}> {
  const lockKey = 'job:daily-wealth-tax';
  const todayKey = getTodayKey();
  const idempotencyKey = `executed:wealth-tax:${todayKey}`;

  const emptyResult = {
    processed: 0,
    collected: 0,
    totalTax: 0,
    skipped: 0,
    errors: 0
  };

  try {
    return await withLock(lockKey, async () => {
      // Check if already executed today (idempotency)
      const redis = getRedisClient();
      const alreadyExecuted = await redis.exists(idempotencyKey);

      if (alreadyExecuted) {
        logger.info(`[WealthTax] Daily collection already executed for ${todayKey}, skipping`);
        return emptyResult;
      }

      logger.info('[WealthTax] ========== Starting Daily Wealth Tax Collection ==========');
      logger.info(`[WealthTax] Date: ${todayKey}`);
      logger.info(`[WealthTax] Exempt threshold: ${WEALTH_TAX.EXEMPT_THRESHOLD.toLocaleString()} gold`);

      // Run batch collection
      const stats = await GoldService.batchCollectWealthTax();

      // Mark as executed for today (expires in 25 hours to ensure coverage)
      await redis.setEx(idempotencyKey, 25 * 60 * 60, 'completed');

      logger.info('[WealthTax] ========== Daily Wealth Tax Collection Complete ==========');
      logger.info(`[WealthTax] Summary: ${stats.totalTax.toLocaleString()} gold collected from ${stats.collected} characters`);

      return stats;
    }, {
      ttl: 3600, // 60 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[WealthTax] Daily wealth tax already running on another instance, skipping');
      return emptyResult;
    }
    logger.error('[WealthTax] Error in daily wealth tax collection:', error);
    throw error;
  }
}

/**
 * Get wealth tax statistics for economy monitoring
 * Returns breakdown of wealth distribution and projected tax revenue
 */
export async function getWealthTaxStatistics(): Promise<{
  totalWealthyCharacters: number;
  totalTaxableGold: number;
  projectedDailyTax: number;
  wealthDistribution: {
    tier: string;
    count: number;
    totalGold: number;
    projectedTax: number;
  }[];
}> {
  try {
    const { Character } = await import('../models/Character.model');

    // Aggregate wealth distribution
    const distribution = await Character.aggregate([
      {
        $match: {
          gold: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$gold', 100000] }, then: '0-100K (exempt)' },
                { case: { $lte: ['$gold', 1000000] }, then: '100K-1M (0.1%)' },
                { case: { $lte: ['$gold', 10000000] }, then: '1M-10M (0.25%)' }
              ],
              default: '10M+ (0.5%)'
            }
          },
          count: { $sum: 1 },
          totalGold: { $sum: '$gold' }
        }
      },
      {
        $sort: { totalGold: -1 as const }
      }
    ]);

    // Calculate projected tax for each tier
    const wealthDistribution = distribution.map(tier => {
      let projectedTax = 0;

      // Calculate approximate tax based on tier
      if (tier._id === '100K-1M (0.1%)') {
        projectedTax = Math.floor((tier.totalGold - 100000 * tier.count) * 0.001);
      } else if (tier._id === '1M-10M (0.25%)') {
        const tier1Tax = 900000 * tier.count * 0.001; // 100K-1M portion
        const tier2Tax = (tier.totalGold - 1000000 * tier.count) * 0.0025;
        projectedTax = Math.floor(tier1Tax + tier2Tax);
      } else if (tier._id === '10M+ (0.5%)') {
        const tier1Tax = 900000 * tier.count * 0.001;
        const tier2Tax = 9000000 * tier.count * 0.0025;
        const tier3Tax = (tier.totalGold - 10000000 * tier.count) * 0.005;
        projectedTax = Math.floor(tier1Tax + tier2Tax + tier3Tax);
      }

      return {
        tier: tier._id,
        count: tier.count,
        totalGold: tier.totalGold,
        projectedTax
      };
    });

    const totalWealthyCharacters = wealthDistribution
      .filter(t => !t.tier.includes('exempt'))
      .reduce((sum, t) => sum + t.count, 0);

    const totalTaxableGold = wealthDistribution
      .filter(t => !t.tier.includes('exempt'))
      .reduce((sum, t) => sum + t.totalGold, 0);

    const projectedDailyTax = wealthDistribution.reduce((sum, t) => sum + t.projectedTax, 0);

    logger.info(`[WealthTax] Statistics: ${totalWealthyCharacters} taxable characters, ` +
      `${totalTaxableGold.toLocaleString()} gold taxable, ` +
      `${projectedDailyTax.toLocaleString()} projected daily tax`);

    return {
      totalWealthyCharacters,
      totalTaxableGold,
      projectedDailyTax,
      wealthDistribution
    };
  } catch (error) {
    logger.error('[WealthTax] Error getting statistics:', error);
    throw error;
  }
}

export default {
  runDailyWealthTax,
  getWealthTaxStatistics
};
