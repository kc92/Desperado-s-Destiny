/**
 * Customer Traffic Job
 *
 * Phase 12: Business Ownership System
 *
 * Scheduled job that runs every 5 minutes to:
 * 1. Simulate NPC customer traffic to all active businesses
 * 2. Generate revenue from NPC transactions
 * 3. Update business statistics
 */

import { CustomerTrafficService, TrafficCycleResult } from '../services/customerTraffic.service';
import { BusinessRevenueService } from '../services/businessRevenue.service';
import logger from '../utils/logger';

/**
 * Process customer traffic for all businesses
 * Runs every 5 minutes
 */
export async function processCustomerTraffic(): Promise<TrafficCycleResult> {
  logger.info('[CustomerTrafficJob] ========== Starting Customer Traffic Processing ==========');

  const result = await CustomerTrafficService.processAllBusinessTraffic();

  logger.info('[CustomerTrafficJob] ========== Customer Traffic Processing Complete ==========');
  logger.info(
    `[CustomerTrafficJob] Summary: ` +
    `${result.processedBusinesses} businesses processed, ` +
    `${result.totalVisitors} visitors, ` +
    `$${result.totalRevenue} revenue generated`
  );

  return result;
}

/**
 * Apply reputation decay to inactive businesses
 * Runs once per day at midnight
 */
export async function processReputationDecay(): Promise<{ decayedCount: number }> {
  logger.info('[CustomerTrafficJob] Starting reputation decay processing...');

  const decayedCount = await BusinessRevenueService.applyReputationDecay();

  logger.info(`[CustomerTrafficJob] Applied reputation decay to ${decayedCount} businesses`);

  return { decayedCount };
}

/**
 * Reset daily traffic stats
 * Runs at midnight
 */
export async function resetDailyTrafficStats(): Promise<{ resetCount: number }> {
  logger.info('[CustomerTrafficJob] Resetting daily traffic stats...');

  const resetCount = await BusinessRevenueService.resetDailyStats();

  logger.info(`[CustomerTrafficJob] Reset daily stats for ${resetCount} businesses`);

  return { resetCount };
}

/**
 * Reset weekly traffic stats
 * Runs at midnight on Monday
 */
export async function resetWeeklyTrafficStats(): Promise<{ resetCount: number }> {
  logger.info('[CustomerTrafficJob] Resetting weekly traffic stats...');

  const resetCount = await BusinessRevenueService.resetWeeklyStats();

  logger.info(`[CustomerTrafficJob] Reset weekly stats for ${resetCount} businesses`);

  return { resetCount };
}

/**
 * Reset monthly traffic stats
 * Runs at midnight on the 1st of each month
 */
export async function resetMonthlyTrafficStats(): Promise<{ resetCount: number }> {
  logger.info('[CustomerTrafficJob] Resetting monthly traffic stats...');

  const resetCount = await BusinessRevenueService.resetMonthlyStats();

  logger.info(`[CustomerTrafficJob] Reset monthly stats for ${resetCount} businesses`);

  return { resetCount };
}

/**
 * Full daily maintenance cycle
 * Combines all daily tasks
 */
export async function runDailyMaintenance(): Promise<{
  reputationDecay: { decayedCount: number };
  dailyReset: { resetCount: number };
}> {
  const reputationDecay = await processReputationDecay();
  const dailyReset = await resetDailyTrafficStats();

  return { reputationDecay, dailyReset };
}

export default {
  processCustomerTraffic,
  processReputationDecay,
  resetDailyTrafficStats,
  resetWeeklyTrafficStats,
  resetMonthlyTrafficStats,
  runDailyMaintenance,
};
