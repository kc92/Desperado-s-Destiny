/**
 * Decay Processor Job
 *
 * Phase 14: Risk Simulation - Decay System
 *
 * Daily job for processing asset decay:
 * - Property condition decay
 * - Mining claim condition decay
 *
 * Scheduled to run daily at 4 AM UTC via Bull queues in queues.ts
 */

import { DecayService, DecayProcessingResult } from '../services/decay.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Combined result for all decay processing
 */
export interface DecayJobResult {
  properties: DecayProcessingResult;
  miningClaims: DecayProcessingResult;
  totalProcessed: number;
  totalDecayed: number;
  totalStatusChanges: number;
  totalErrors: number;
  durationMs: number;
}

/**
 * Run decay processing tasks
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runDecayProcessor(): Promise<DecayJobResult> {
  const lockKey = 'job:decay-processor';
  const startTime = Date.now();

  const result: DecayJobResult = {
    properties: { processed: 0, decayed: 0, statusChanges: 0, errors: 0 },
    miningClaims: { processed: 0, decayed: 0, statusChanges: 0, errors: 0 },
    totalProcessed: 0,
    totalDecayed: 0,
    totalStatusChanges: 0,
    totalErrors: 0,
    durationMs: 0,
  };

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Decay Processor Job Started ===');

      // Process property decay
      logger.info('[DecayProcessor] Processing property condition decay...');
      try {
        result.properties = await DecayService.processAllPropertyDecay();
        logger.info(`[DecayProcessor] Properties: ${result.properties.processed} processed, ` +
          `${result.properties.decayed} decayed, ${result.properties.statusChanges} status changes`);
      } catch (error) {
        logger.error('[DecayProcessor] Error processing property decay:', error);
        result.properties.errors = 1;
      }

      // Process mining claim decay
      logger.info('[DecayProcessor] Processing mining claim condition decay...');
      try {
        result.miningClaims = await DecayService.processAllMiningClaimDecay();
        logger.info(`[DecayProcessor] Mining claims: ${result.miningClaims.processed} processed, ` +
          `${result.miningClaims.decayed} decayed, ${result.miningClaims.statusChanges} status changes`);
      } catch (error) {
        logger.error('[DecayProcessor] Error processing mining claim decay:', error);
        result.miningClaims.errors = 1;
      }

      // Calculate totals
      result.totalProcessed = result.properties.processed + result.miningClaims.processed;
      result.totalDecayed = result.properties.decayed + result.miningClaims.decayed;
      result.totalStatusChanges = result.properties.statusChanges + result.miningClaims.statusChanges;
      result.totalErrors = result.properties.errors + result.miningClaims.errors;
      result.durationMs = Date.now() - startTime;

      logger.info('=== Decay Processor Job Completed ===', {
        totalProcessed: result.totalProcessed,
        totalDecayed: result.totalDecayed,
        totalStatusChanges: result.totalStatusChanges,
        totalErrors: result.totalErrors,
        durationMs: result.durationMs,
      });
    }, {
      ttl: 600, // 10 minute lock TTL (decay processing can take time)
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[DecayProcessor] Job already running on another instance, skipping');
      return result;
    }
    logger.error('[DecayProcessor] Error in decay processor job:', error);
    throw error;
  }

  return result;
}

/**
 * Run decay processing immediately (for testing)
 */
export async function runDecayProcessorNow(): Promise<DecayJobResult> {
  return runDecayProcessor();
}

/**
 * Process decay for a specific character's assets only
 * Useful for individual processing or testing
 */
export async function runDecayForCharacter(characterId: string): Promise<{
  propertiesProcessed: number;
  claimsProcessed: number;
}> {
  logger.info(`[DecayProcessor] Processing decay for character ${characterId}`);

  const propertiesNeedingAttention = await DecayService.findPropertiesNeedingMaintenance(characterId, 100);
  const claimsNeedingRehab = await DecayService.findClaimsNeedingRehabilitation(characterId, 100);

  let propertiesProcessed = 0;
  let claimsProcessed = 0;

  for (const property of propertiesNeedingAttention) {
    try {
      await DecayService.processPropertyDecay(property._id.toString());
      propertiesProcessed++;
    } catch (error) {
      logger.error(`[DecayProcessor] Error processing property ${property._id}:`, error);
    }
  }

  for (const claim of claimsNeedingRehab) {
    try {
      await DecayService.processMiningClaimDecay(claim._id.toString());
      claimsProcessed++;
    } catch (error) {
      logger.error(`[DecayProcessor] Error processing claim ${claim._id}:`, error);
    }
  }

  return { propertiesProcessed, claimsProcessed };
}
