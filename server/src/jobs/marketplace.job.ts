/**
 * Marketplace Jobs
 *
 * Job functions for processing marketplace operations:
 * - Processing ended auctions
 * - Updating price history statistics
 * - Cleaning up old expired listings
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic functions
 */

import { MarketplaceService } from '../services/marketplace.service';
import { PriceHistory } from '../models/PriceHistory.model';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Process ended auctions and expired listings
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function processAuctions(): Promise<{
  auctionsProcessed: number;
  expiredProcessed: number;
}> {
  const lockKey = 'job:marketplace-auctions';

  try {
    return await withLock(lockKey, async () => {
      logger.debug('[Marketplace Jobs] Starting auction processing...');

      // Process ended auctions (award to highest bidder)
      const auctionsProcessed = await MarketplaceService.processEndedAuctions();
      if (auctionsProcessed > 0) {
        logger.info(`[Marketplace Jobs] Processed ${auctionsProcessed} ended auctions`);
      }

      // Process expired buyout listings (return items to sellers)
      const expiredProcessed = await MarketplaceService.processExpiredListings();
      if (expiredProcessed > 0) {
        logger.info(`[Marketplace Jobs] Processed ${expiredProcessed} expired listings`);
      }

      logger.debug('[Marketplace Jobs] Auction processing completed');

      return { auctionsProcessed, expiredProcessed };
    }, {
      ttl: 120, // 2 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[Marketplace Jobs] Auction processing already running on another instance, skipping');
      return { auctionsProcessed: 0, expiredProcessed: 0 };
    }
    logger.error('[Marketplace Jobs] Error processing auctions:', error);
    throw error;
  }
}

/**
 * Update price history statistics for all items with recent sales
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function updatePriceHistory(): Promise<number> {
  const lockKey = 'job:marketplace-price-history';

  try {
    return await withLock(lockKey, async () => {
      logger.debug('[Marketplace Jobs] Starting price history update...');

      // Get all price histories that need updating (have sales in last 24h)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentHistories = await PriceHistory.find({
        lastSaleAt: { $gte: cutoff }
      }).select('itemId');

      let updated = 0;
      for (const history of recentHistories) {
        try {
          // Use the static method through the model
          await (PriceHistory as any).updateStats(history.itemId);
          updated++;
        } catch (error) {
          logger.error(`[Marketplace Jobs] Error updating price history for ${history.itemId}:`, error);
        }
      }

      if (updated > 0) {
        logger.info(`[Marketplace Jobs] Updated price history for ${updated} items`);
      }

      logger.debug('[Marketplace Jobs] Price history update completed');

      return updated;
    }, {
      ttl: 360, // 6 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[Marketplace Jobs] Price history update already running on another instance, skipping');
      return 0;
    }
    logger.error('[Marketplace Jobs] Error updating price history:', error);
    throw error;
  }
}

/**
 * Clean up old expired/sold listings
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function cleanupListings(daysOld: number = 30): Promise<number> {
  const lockKey = 'job:marketplace-cleanup';

  try {
    return await withLock(lockKey, async () => {
      logger.debug('[Marketplace Jobs] Starting listing cleanup...');

      // Clean up listings older than specified days
      const deleted = await MarketplaceService.cleanupOldListings(daysOld);

      if (deleted > 0) {
        logger.info(`[Marketplace Jobs] Cleaned up ${deleted} old listings`);
      }

      logger.debug('[Marketplace Jobs] Listing cleanup completed');

      return deleted;
    }, {
      ttl: 600, // 10 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[Marketplace Jobs] Cleanup already running on another instance, skipping');
      return 0;
    }
    logger.error('[Marketplace Jobs] Error during cleanup:', error);
    throw error;
  }
}

/**
 * Manually trigger auction processing (for testing/admin)
 */
export async function manualProcessAuctions(): Promise<{
  auctionsProcessed: number;
  expiredProcessed: number;
}> {
  return processAuctions();
}

/**
 * Manually trigger price history update (for testing/admin)
 */
export async function manualUpdatePriceHistory(): Promise<number> {
  return updatePriceHistory();
}

/**
 * Manually trigger cleanup (for testing/admin)
 */
export async function manualCleanup(daysOld: number = 30): Promise<number> {
  return cleanupListings(daysOld);
}

export default {
  processAuctions,
  updatePriceHistory,
  cleanupListings,
  manualProcessAuctions,
  manualUpdatePriceHistory,
  manualCleanup
};

// NOTE: Scheduling is now handled by Bull queues in queues.ts
// Bull calls MarketplaceService methods directly
