/**
 * Bounty Cleanup Job Functions
 *
 * Handles periodic bounty maintenance:
 * - Expires old bounties
 * - Decays faction bounties over time
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic functions
 */

import { BountyService } from '../services/bounty.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Run bounty expiration job
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runBountyExpiration(): Promise<number> {
  const lockKey = 'job:bounty-expiration';

  try {
    return await withLock(lockKey, async () => {
      logger.info('Running bounty expiration job...');
      const startTime = Date.now();

      const expired = await BountyService.expireOldBounties();

      const duration = Date.now() - startTime;
      logger.info(
        `Bounty expiration complete. Expired ${expired} bounties in ${duration}ms`
      );

      return expired;
    }, {
      ttl: 900, // 15 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Bounty expiration job already running on another instance, skipping');
      return 0;
    }
    logger.error('Bounty expiration job failed:', error);
    throw error;
  }
}

/**
 * Run bounty decay job
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runBountyDecay(): Promise<{ bountiesDecayed: number; totalReduced: number }> {
  const lockKey = 'job:bounty-decay';

  try {
    return await withLock(lockKey, async () => {
      logger.info('Running bounty decay job...');
      const startTime = Date.now();

      const result = await BountyService.decayBounties();

      const duration = Date.now() - startTime;
      logger.info(
        `Bounty decay complete. Decayed ${result.bountiesDecayed} bounties, ` +
        `reduced ${result.totalReduced} gold in ${duration}ms`
      );

      return result;
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Bounty decay job already running on another instance, skipping');
      return { bountiesDecayed: 0, totalReduced: 0 };
    }
    logger.error('Bounty decay job failed:', error);
    throw error;
  }
}

// NOTE: Scheduling is now handled by Bull queues in queues.ts
// Bull calls BountyService.expireOldBounties() and BountyService.decayBounties() directly
