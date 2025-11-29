/**
 * Hunter Tracking Job
 *
 * Cron job to update bounty hunter positions and trigger encounters
 * Runs every hour
 */

import cron from 'node-cron';
import { BountyHunterService } from '../services/bountyHunter.service';
import logger from '../utils/logger';

/**
 * Update hunter positions every hour
 * Cron schedule: '0 * * * *' = At minute 0 of every hour
 */
export const startHunterTrackingJob = (): void => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running hunter tracking job...');
      await BountyHunterService.updateHunterPositions();
      logger.info('Hunter tracking job completed');
    } catch (error) {
      logger.error('Error in hunter tracking job:', error);
    }
  });

  logger.info('Hunter tracking job scheduled (every hour)');
};

/**
 * Manual trigger for testing
 */
export const runHunterTrackingNow = async (): Promise<void> => {
  try {
    logger.info('Manually running hunter tracking job...');
    await BountyHunterService.updateHunterPositions();
    logger.info('Manual hunter tracking completed');
  } catch (error) {
    logger.error('Error in manual hunter tracking:', error);
    throw error;
  }
};
