/**
 * Influence Decay Job
 *
 * Daily job for territory influence decay
 * Phase 11, Wave 11.1 - Territory Influence System
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic functions
 */

import { TerritoryInfluenceService } from '../services/territoryInfluence.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Run influence decay tasks
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runInfluenceDecay(): Promise<void> {
  const lockKey = 'job:influence-decay';

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Influence Decay Job Started ===');

      // Apply daily influence decay
      logger.info('Applying daily influence decay...');
      await TerritoryInfluenceService.applyDailyDecay();

      logger.info('=== Influence Decay Job Completed ===');
    }, {
      ttl: 300, // 5 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Influence decay job already running on another instance, skipping');
      return;
    }
    logger.error('Error in influence decay job:', error);
    throw error;
  }
}

/**
 * Run decay immediately (for testing)
 */
export async function runInfluenceDecayNow(): Promise<void> {
  await runInfluenceDecay();
}

// NOTE: Scheduling is now handled by Bull queues in queues.ts
