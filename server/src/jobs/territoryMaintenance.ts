/**
 * Territory Maintenance Job
 *
 * Daily cron job for territory control system:
 * - Apply influence decay
 * - Collect daily income for gangs
 * - Update contested zones
 */

import cron from 'node-cron';
import { TerritoryControlService } from '../services/territoryControl.service';
import logger from '../utils/logger';

/**
 * Run territory maintenance tasks
 */
async function runTerritoryMaintenance(): Promise<void> {
  try {
    logger.info('=== Territory Maintenance Job Started ===');

    // Apply influence decay
    logger.info('Applying influence decay...');
    await TerritoryControlService.applyInfluenceDecay();

    // Collect daily income
    logger.info('Collecting daily territory income...');
    await TerritoryControlService.collectDailyIncome();

    logger.info('=== Territory Maintenance Job Completed ===');
  } catch (error) {
    logger.error('Error in territory maintenance job:', error);
  }
}

/**
 * Schedule territory maintenance job
 * Runs daily at 00:00 (midnight server time)
 */
export function scheduleTerritoryMaintenance(): void {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    await runTerritoryMaintenance();
  });

  logger.info('Territory maintenance job scheduled (daily at 00:00)');
}

/**
 * Run maintenance immediately (for testing)
 */
export async function runTerritoryMaintenanceNow(): Promise<void> {
  await runTerritoryMaintenance();
}
