/**
 * War Resolution Job Logic
 *
 * Auto-resolves expired gang wars.
 * Ensures wars are resolved exactly 24 hours after declaration.
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains the job execution logic.
 */

import { GangWarService } from '../services/gangWar.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Execute war resolution job
 * Called by Bull queue processor in queues.ts
 */
export async function executeWarResolution(): Promise<number> {
  const lockKey = 'job:war-resolution';

  try {
    return await withLock(lockKey, async () => {
      logger.info('Running war auto-resolution job...');
      const startTime = Date.now();

      const resolved = await GangWarService.autoResolveWars();

      const duration = Date.now() - startTime;
      logger.info(
        `War auto-resolution complete. Resolved ${resolved} wars in ${duration}ms`
      );

      return resolved;
    }, {
      ttl: 360, // 6 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('War resolution job already running on another instance, skipping');
      return 0;
    }
    logger.error('War resolution job failed:', error);
    throw error;
  }
}

// Legacy exports for backwards compatibility (deprecated)
// These functions are no longer used - Bull handles scheduling
/** @deprecated Use Bull queue scheduling instead */
export function initializeWarResolutionJob(): void {
  logger.warn('initializeWarResolutionJob is deprecated - Bull queue handles scheduling');
}

/** @deprecated Use Bull queue scheduling instead */
export function stopWarResolutionJob(): void {
  logger.warn('stopWarResolutionJob is deprecated - Bull queue handles scheduling');
}

/** @deprecated Use Bull queue scheduling instead */
export function isWarResolutionJobRunning(): boolean {
  logger.warn('isWarResolutionJobRunning is deprecated - check Bull queue instead');
  return false;
}
