/**
 * Influence Decay Job
 *
 * Daily cron job for territory influence decay
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import cron from 'node-cron';
import { TerritoryInfluenceService } from '../services/territoryInfluence.service';
import logger from '../utils/logger';

/**
 * Run influence decay tasks
 */
async function runInfluenceDecay(): Promise<void> {
  try {
    logger.info('=== Influence Decay Job Started ===');

    // Apply daily influence decay
    logger.info('Applying daily influence decay...');
    await TerritoryInfluenceService.applyDailyDecay();

    logger.info('=== Influence Decay Job Completed ===');
  } catch (error) {
    logger.error('Error in influence decay job:', error);
  }
}

/**
 * Schedule influence decay job
 * Runs daily at 03:00 (3 AM server time)
 */
export function scheduleInfluenceDecay(): void {
  // Run daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    await runInfluenceDecay();
  });

  logger.info('Influence decay job scheduled (daily at 03:00)');
}

/**
 * Run decay immediately (for testing)
 */
export async function runInfluenceDecayNow(): Promise<void> {
  await runInfluenceDecay();
}
