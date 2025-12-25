/**
 * Mining Inspection Job
 *
 * Phase 13: Deep Mining System
 *
 * Periodic job for:
 * - Inspector patrols across illegal claims
 * - Suspicion decay over time
 * - Gang protection fee processing
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic functions
 */

import { MiningInspectorService } from '../services/miningInspector.service';
import { IllegalMiningService } from '../services/illegalMining.service';
import { IllegalClaim } from '../models/IllegalClaim.model';
import { ClaimLegalStatus } from '@desperados/shared';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Run inspector patrol across all illegal claims
 * Called by Bull queue every 2 hours
 */
export async function runInspectorPatrol(): Promise<void> {
  const lockKey = 'job:mining-inspector-patrol';

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Mining Inspector Patrol Started ===');

      const result = await MiningInspectorService.runPatrol();

      logger.info(`Inspector patrol complete: ${result.claimsChecked} claims checked, ` +
        `${result.claimsDiscovered} discovered, ${result.arrestsMade} arrests, ` +
        `${result.claimsCondemned} condemned`);

      logger.info('=== Mining Inspector Patrol Completed ===');
    }, {
      ttl: 600, // 10 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Mining inspector patrol already running on another instance, skipping');
      return;
    }
    logger.error('Error in mining inspector patrol job:', error);
    throw error;
  }
}

/**
 * Run daily suspicion decay for all claims
 * Called by Bull queue once per day
 */
export async function runSuspicionDecay(): Promise<void> {
  const lockKey = 'job:suspicion-decay';

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Suspicion Decay Job Started ===');

      const decayedCount = await IllegalMiningService.processDailySuspicionDecay();

      logger.info(`Suspicion decay applied to ${decayedCount} claims`);

      logger.info('=== Suspicion Decay Job Completed ===');
    }, {
      ttl: 300, // 5 minute lock TTL
      retries: 0
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Suspicion decay job already running on another instance, skipping');
      return;
    }
    logger.error('Error in suspicion decay job:', error);
    throw error;
  }
}

/**
 * Process daily gang protection for all gang-protected claims
 * Called by Bull queue once per day
 */
export async function runGangProtectionProcessing(): Promise<void> {
  const lockKey = 'job:gang-protection-processing';

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Gang Protection Processing Started ===');

      // Get all gang-protected claims
      const gangProtectedClaims = await IllegalClaim.find({
        isActive: true,
        legalStatus: ClaimLegalStatus.GANG_PROTECTED,
        gangId: { $ne: null },
      });

      let processedCount = 0;
      for (const claim of gangProtectedClaims) {
        await IllegalMiningService.processDailyGangProtection(claim._id.toString());
        processedCount++;
      }

      logger.info(`Gang protection processed for ${processedCount} claims`);

      logger.info('=== Gang Protection Processing Completed ===');
    }, {
      ttl: 300, // 5 minute lock TTL
      retries: 0
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Gang protection processing already running on another instance, skipping');
      return;
    }
    logger.error('Error in gang protection processing job:', error);
    throw error;
  }
}

/**
 * Run patrol immediately (for testing)
 */
export async function runInspectorPatrolNow(): Promise<void> {
  await runInspectorPatrol();
}

/**
 * Run suspicion decay immediately (for testing)
 */
export async function runSuspicionDecayNow(): Promise<void> {
  await runSuspicionDecay();
}

/**
 * Run gang protection processing immediately (for testing)
 */
export async function runGangProtectionProcessingNow(): Promise<void> {
  await runGangProtectionProcessing();
}

// NOTE: Scheduling is handled by Bull queues in queues.ts
