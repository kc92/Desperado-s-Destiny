/**
 * Bounty Cleanup CRON Job
 *
 * Handles periodic bounty maintenance:
 * - Expires old bounties
 * - Decays faction bounties over time
 * - Updates wanted levels
 */

import cron, { ScheduledTask } from 'node-cron';
import { BountyService } from '../services/bounty.service';
import logger from '../utils/logger';

let cleanupJob: ScheduledTask | null = null;
let decayJob: ScheduledTask | null = null;

/**
 * Initialize bounty expiration job
 * Runs every 15 minutes to expire old bounties
 */
export function initializeBountyExpirationJob(): void {
  if (cleanupJob) {
    logger.warn('Bounty expiration job already initialized');
    return;
  }

  cleanupJob = cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Running bounty expiration job...');
      const startTime = Date.now();

      const expired = await BountyService.expireOldBounties();

      const duration = Date.now() - startTime;
      logger.info(
        `Bounty expiration complete. Expired ${expired} bounties in ${duration}ms`
      );
    } catch (error) {
      logger.error('Bounty expiration job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  logger.info('Bounty expiration CRON job initialized (runs every 15 minutes)');
}

/**
 * Initialize bounty decay job
 * Runs once per day at midnight to decay faction bounties
 */
export function initializeBountyDecayJob(): void {
  if (decayJob) {
    logger.warn('Bounty decay job already initialized');
    return;
  }

  // Run at midnight UTC every day
  decayJob = cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running bounty decay job...');
      const startTime = Date.now();

      const result = await BountyService.decayBounties();

      const duration = Date.now() - startTime;
      logger.info(
        `Bounty decay complete. Decayed ${result.bountiesDecayed} bounties, ` +
        `reduced ${result.totalReduced} gold in ${duration}ms`
      );
    } catch (error) {
      logger.error('Bounty decay job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  logger.info('Bounty decay CRON job initialized (runs daily at midnight UTC)');
}

/**
 * Initialize all bounty CRON jobs
 */
export function initializeBountyJobs(): void {
  initializeBountyExpirationJob();
  initializeBountyDecayJob();
  logger.info('All bounty CRON jobs initialized');
}

/**
 * Stop all bounty CRON jobs
 * Called during graceful shutdown
 */
export function stopBountyJobs(): void {
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    logger.info('Bounty expiration CRON job stopped');
  }

  if (decayJob) {
    decayJob.stop();
    decayJob = null;
    logger.info('Bounty decay CRON job stopped');
  }
}

/**
 * Check if CRON jobs are running
 */
export function areBountyJobsRunning(): boolean {
  return cleanupJob !== null && decayJob !== null;
}
