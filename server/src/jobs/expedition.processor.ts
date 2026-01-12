/**
 * Expedition Processor Job
 *
 * Handles expedition completion processing for offline progression
 *
 * This job:
 * 1. Processes individual expedition completions (scheduled per expedition)
 * 2. Catches up on any missed expeditions (backup sweep)
 * 3. Awards rewards and updates character state
 */

import { Job } from 'bull';
import { ExpeditionService, ExpeditionProcessingResult } from '../services/expedition.service';
import { withLock } from '../utils/distributedLock';
import { getRedisClient } from '../config/redis';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger';

/**
 * Job data for individual expedition completion
 */
interface ExpeditionCompleteJobData {
  expeditionId: string;
  characterId: string;
}

/**
 * Process a single expedition completion
 * Called when a scheduled expedition reaches its completion time
 */
export async function processExpeditionComplete(job: Job<ExpeditionCompleteJobData>): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  const { expeditionId, characterId } = job.data;

  logger.info(`[ExpeditionProcessor] Processing expedition ${expeditionId} for character ${characterId}`);

  try {
    const result = await ExpeditionService.completeExpedition(expeditionId);

    logger.info(
      `[ExpeditionProcessor] Expedition ${expeditionId} completed: ` +
      `${result.outcome}, $${result.totalGold} gold, ${result.totalXp} XP`
    );

    // TODO: Emit socket event to notify player if online
    // socketService.emitToCharacter(characterId, 'expedition:completed', result);

    return { success: true, result };
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Don't report "not in progress" as error - expedition may have been cancelled
    if (errorMessage.includes('not in progress')) {
      logger.info(`[ExpeditionProcessor] Expedition ${expeditionId} already processed or cancelled`);
      return { success: true, result: { skipped: true } };
    }

    logger.error(`[ExpeditionProcessor] Error processing expedition ${expeditionId}:`, error);
    Sentry.captureException(error, {
      tags: { job: 'expedition-complete' },
      extra: { expeditionId, characterId }
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Sweep for any missed expedition completions
 * This is a backup in case individual jobs fail
 * Runs every 15 minutes
 */
export async function sweepDueExpeditions(): Promise<ExpeditionProcessingResult> {
  const lockKey = 'job:expedition-sweep';

  try {
    return await withLock(lockKey, async () => {
      logger.info('[ExpeditionProcessor] ========== Starting Expedition Sweep ==========');

      const result = await ExpeditionService.processDueExpeditions();

      logger.info('[ExpeditionProcessor] ========== Expedition Sweep Complete ==========');
      logger.info(
        `[ExpeditionProcessor] Summary: ` +
        `${result.processed} completed, ` +
        `${result.failed} failed, ` +
        `$${result.totalGoldAwarded} gold awarded, ` +
        `${result.totalXpAwarded} XP awarded`
      );

      return result;
    }, {
      ttl: 300, // 5 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    // Handle lock contention gracefully
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[ExpeditionProcessor] Sweep already running on another instance, skipping');
      return { processed: 0, failed: 0, totalGoldAwarded: 0, totalXpAwarded: 0 };
    }

    logger.error('[ExpeditionProcessor] Error during expedition sweep:', error);
    Sentry.captureException(error, {
      tags: { job: 'expedition-sweep' }
    });
    throw error;
  }
}

/**
 * Check expedition progress (for real-time updates)
 * Called periodically to emit progress updates to connected players
 */
export async function checkExpeditionProgress(): Promise<{
  checked: number;
  updates: number;
}> {
  // TODO: Implement progress checking and socket updates
  // This would find in-progress expeditions and emit progress updates
  // to connected players via WebSocket

  return { checked: 0, updates: 0 };
}

export default {
  processExpeditionComplete,
  sweepDueExpeditions,
  checkExpeditionProgress
};
