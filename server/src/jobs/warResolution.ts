/**
 * War Resolution CRON Job
 *
 * Auto-resolves expired gang wars every 5 minutes
 * Ensures wars are resolved exactly 24 hours after declaration
 */

import cron, { ScheduledTask } from 'node-cron';
import { GangWarService } from '../services/gangWar.service';
import logger from '../utils/logger';

let cronJob: ScheduledTask | null = null;

/**
 * Initialize war resolution CRON job
 * Runs every 5 minutes to check for expired wars
 */
export function initializeWarResolutionJob(): void {
  if (cronJob) {
    logger.warn('War resolution job already initialized');
    return;
  }

  cronJob = cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('Running war auto-resolution job...');
      const startTime = Date.now();

      const resolved = await GangWarService.autoResolveWars();

      const duration = Date.now() - startTime;
      logger.info(
        `War auto-resolution complete. Resolved ${resolved} wars in ${duration}ms`
      );
    } catch (error) {
      logger.error('War resolution job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  logger.info('War resolution CRON job initialized (runs every 5 minutes)');
}

/**
 * Stop war resolution CRON job
 * Called during graceful shutdown
 */
export function stopWarResolutionJob(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('War resolution CRON job stopped');
  }
}

/**
 * Check if CRON job is running
 */
export function isWarResolutionJobRunning(): boolean {
  return cronJob !== null;
}
