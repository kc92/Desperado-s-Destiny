/**
 * Marketplace Jobs
 *
 * Cron jobs for processing marketplace operations:
 * - Processing ended auctions (every 1 minute)
 * - Updating price history statistics (every 5 minutes)
 * - Cleaning up old expired listings (every hour)
 */

import * as cron from 'node-cron';
import { MarketplaceService } from '../services/marketplace.service';
import { PriceHistory } from '../models/PriceHistory.model';
import logger from '../utils/logger';

// Type for cron scheduled task
type ScheduledTask = ReturnType<typeof cron.schedule>;

/**
 * Cron job instances
 */
let auctionProcessingJob: ScheduledTask | null = null;
let priceHistoryJob: ScheduledTask | null = null;
let cleanupJob: ScheduledTask | null = null;

/**
 * Job status tracking
 */
let isAuctionProcessingRunning = false;
let isPriceHistoryRunning = false;
let isCleanupRunning = false;

/**
 * Process ended auctions and expired listings
 * Runs every 1 minute
 */
async function processAuctions(): Promise<void> {
  // Prevent concurrent runs
  if (isAuctionProcessingRunning) {
    logger.debug('[Marketplace Jobs] Auction processing already running, skipping...');
    return;
  }

  isAuctionProcessingRunning = true;

  try {
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
  } catch (error) {
    logger.error('[Marketplace Jobs] Error processing auctions:', error);
  } finally {
    isAuctionProcessingRunning = false;
  }
}

/**
 * Update price history statistics for all items with recent sales
 * Runs every 5 minutes
 */
async function updatePriceHistory(): Promise<void> {
  // Prevent concurrent runs
  if (isPriceHistoryRunning) {
    logger.debug('[Marketplace Jobs] Price history update already running, skipping...');
    return;
  }

  isPriceHistoryRunning = true;

  try {
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
  } catch (error) {
    logger.error('[Marketplace Jobs] Error updating price history:', error);
  } finally {
    isPriceHistoryRunning = false;
  }
}

/**
 * Clean up old expired/sold listings
 * Runs every hour
 */
async function cleanupListings(): Promise<void> {
  // Prevent concurrent runs
  if (isCleanupRunning) {
    logger.debug('[Marketplace Jobs] Cleanup already running, skipping...');
    return;
  }

  isCleanupRunning = true;

  try {
    logger.debug('[Marketplace Jobs] Starting listing cleanup...');

    // Clean up listings older than 30 days
    const deleted = await MarketplaceService.cleanupOldListings(30);

    if (deleted > 0) {
      logger.info(`[Marketplace Jobs] Cleaned up ${deleted} old listings`);
    }

    logger.debug('[Marketplace Jobs] Listing cleanup completed');
  } catch (error) {
    logger.error('[Marketplace Jobs] Error during cleanup:', error);
  } finally {
    isCleanupRunning = false;
  }
}

/**
 * Initialize all marketplace cron jobs
 */
export function initializeMarketplaceJobs(): void {
  logger.info('[Marketplace Jobs] Initializing marketplace cron jobs...');

  // Process ended auctions every minute
  // Cron: "* * * * *" = every minute
  auctionProcessingJob = cron.schedule('* * * * *', () => {
    void processAuctions();
  });

  // Update price history every 5 minutes
  // Cron: "*/5 * * * *" = every 5 minutes
  priceHistoryJob = cron.schedule('*/5 * * * *', () => {
    void updatePriceHistory();
  });

  // Clean up old listings every hour
  // Cron: "0 * * * *" = at minute 0 of every hour
  cleanupJob = cron.schedule('0 * * * *', () => {
    void cleanupListings();
  });

  logger.info('[Marketplace Jobs] All marketplace cron jobs started');
}

/**
 * Stop all marketplace cron jobs
 */
export function stopMarketplaceJobs(): void {
  logger.info('[Marketplace Jobs] Stopping marketplace cron jobs...');

  if (auctionProcessingJob) {
    auctionProcessingJob.stop();
    auctionProcessingJob = null;
  }

  if (priceHistoryJob) {
    priceHistoryJob.stop();
    priceHistoryJob = null;
  }

  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
  }

  logger.info('[Marketplace Jobs] All marketplace cron jobs stopped');
}

/**
 * Manually trigger auction processing (for testing/admin)
 */
export async function manualProcessAuctions(): Promise<{
  auctionsProcessed: number;
  expiredProcessed: number;
}> {
  const auctionsProcessed = await MarketplaceService.processEndedAuctions();
  const expiredProcessed = await MarketplaceService.processExpiredListings();

  return { auctionsProcessed, expiredProcessed };
}

/**
 * Manually trigger price history update (for testing/admin)
 */
export async function manualUpdatePriceHistory(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentHistories = await PriceHistory.find({
    lastSaleAt: { $gte: cutoff }
  }).select('itemId');

  let updated = 0;
  for (const history of recentHistories) {
    try {
      await (PriceHistory as any).updateStats(history.itemId);
      updated++;
    } catch (error) {
      logger.error(`Error updating price history for ${history.itemId}:`, error);
    }
  }

  return updated;
}

/**
 * Manually trigger cleanup (for testing/admin)
 */
export async function manualCleanup(daysOld: number = 30): Promise<number> {
  return MarketplaceService.cleanupOldListings(daysOld);
}

/**
 * Get job status
 */
export function getJobStatus(): {
  auctionProcessing: { running: boolean; scheduled: boolean };
  priceHistory: { running: boolean; scheduled: boolean };
  cleanup: { running: boolean; scheduled: boolean };
} {
  return {
    auctionProcessing: {
      running: isAuctionProcessingRunning,
      scheduled: auctionProcessingJob !== null
    },
    priceHistory: {
      running: isPriceHistoryRunning,
      scheduled: priceHistoryJob !== null
    },
    cleanup: {
      running: isCleanupRunning,
      scheduled: cleanupJob !== null
    }
  };
}

export default {
  initializeMarketplaceJobs,
  stopMarketplaceJobs,
  manualProcessAuctions,
  manualUpdatePriceHistory,
  manualCleanup,
  getJobStatus
};
