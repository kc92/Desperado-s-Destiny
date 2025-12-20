/**
 * Hunter Tracking Job
 *
 * Job to update bounty hunter positions and trigger encounters
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic functions
 */

import { BountyHunterService } from '../services/bountyHunter.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Run hunter tracking job
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runHunterTracking(): Promise<void> {
  const lockKey = 'job:hunter-tracking';

  try {
    await withLock(lockKey, async () => {
      logger.info('Running hunter tracking job...');
      await BountyHunterService.updateHunterPositions();
      logger.info('Hunter tracking job completed');
    }, {
      ttl: 3600, // 60 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Hunter tracking job already running on another instance, skipping');
      return;
    }
    logger.error('Error in hunter tracking job:', error);
    throw error;
  }
}

/**
 * Manual trigger for testing
 */
export async function runHunterTrackingNow(): Promise<void> {
  try {
    logger.info('Manually running hunter tracking job...');
    await BountyHunterService.updateHunterPositions();
    logger.info('Manual hunter tracking completed');
  } catch (error) {
    logger.error('Error in manual hunter tracking:', error);
    throw error;
  }
}

// NOTE: Scheduling is now handled by Bull queues in queues.ts
// Bull calls BountyHunterService.updateHunterPositions() directly
