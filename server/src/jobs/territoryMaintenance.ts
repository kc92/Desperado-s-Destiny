/**
 * Territory Maintenance Job
 *
 * Daily job for territory control system:
 * - Apply influence decay
 * - Collect daily income for gangs
 * - Update contested zones
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic functions
 */

import { TerritoryControlService } from '../services/territoryControl.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Run territory maintenance tasks
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runTerritoryMaintenance(): Promise<void> {
  const lockKey = 'job:territory-maintenance';

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Territory Maintenance Job Started ===');

      // Apply influence decay
      logger.info('Applying influence decay...');
      await TerritoryControlService.applyInfluenceDecay();

      // Collect daily income
      logger.info('Collecting daily territory income...');
      await TerritoryControlService.collectDailyIncome();

      logger.info('=== Territory Maintenance Job Completed ===');
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('Territory maintenance job already running on another instance, skipping');
      return;
    }
    logger.error('Error in territory maintenance job:', error);
    throw error;
  }
}

/**
 * Run maintenance immediately (for testing)
 */
export async function runTerritoryMaintenanceNow(): Promise<void> {
  await runTerritoryMaintenance();
}

// NOTE: Scheduling is now handled by Bull queues in queues.ts
