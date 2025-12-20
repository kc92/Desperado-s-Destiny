/**
 * Production Tick Job
 *
 * Periodically checks and updates production statuses
 * Handles worker wage payments and maintenance
 *
 * SECURITY: Uses MongoDB transactions to prevent data corruption
 */

import mongoose from 'mongoose';
import { ProductionService } from '../services/production.service';
import { WorkerManagementService } from '../services/workerManagement.service';
import { PropertyWorker } from '../models/PropertyWorker.model';
import { Character } from '../models/Character.model';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';
import { areTransactionsDisabled } from '../utils/transaction.helper';

/**
 * Main production tick function
 * Should run every 5 minutes
 *
 * SECURITY: Uses MongoDB transaction to ensure all operations succeed or fail together
 */
export async function productionTick(): Promise<void> {
  const lockKey = 'job:production-tick';

  try {
    await withLock(lockKey, async () => {
      logger.info('[ProductionTick] Starting production tick...');

      // Check if transactions are disabled (standalone MongoDB)
      if (areTransactionsDisabled()) {
        // Run without transactions
        const completedCount = await ProductionService.updateProductionStatuses();
        logger.info(`[ProductionTick] ${completedCount} productions completed`);
        await checkWorkerHealth();
        await updateWorkerMorale();
        logger.info('[ProductionTick] Production tick completed successfully');
        return;
      }

      const session = await mongoose.startSession();

      try {
        await session.startTransaction();

        // Update production statuses
        const completedCount = await ProductionService.updateProductionStatuses();
        logger.info(`[ProductionTick] ${completedCount} productions completed`);

        // Check for worker sickness recovery (within transaction)
        await checkWorkerHealth(session);

        // Natural morale decay for workers (within transaction)
        await updateWorkerMorale(session);

        await session.commitTransaction();
        logger.info('[ProductionTick] Production tick completed successfully');
      } catch (error) {
        await session.abortTransaction();
        logger.error('[ProductionTick] Transaction aborted due to error', {
          error: error instanceof Error ? error.message : error,
        });
        throw error;
      } finally {
        session.endSession();
      }
    }, {
      ttl: 360, // 6 minute lock TTL (longer than 5 min interval)
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[ProductionTick] Production tick already running on another instance, skipping');
      return;
    }
    logger.error('[ProductionTick] Error during production tick', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Check and recover worker health
 *
 * @param session - MongoDB session for transaction support
 */
async function checkWorkerHealth(session?: mongoose.ClientSession): Promise<void> {
  try {
    const now = new Date();

    // Find sick workers whose recovery time has passed
    const sickWorkers = await PropertyWorker.find({
      isSick: true,
      sickUntil: { $lte: now },
    }).session(session || null);

    if (sickWorkers.length === 0) {
      return;
    }

    // Batch update all recovered workers
    const bulkOps = sickWorkers.map((worker) => {
      // Apply morale update
      worker.updateMorale(10); // Feeling better boosts morale

      return {
        updateOne: {
          filter: { _id: worker._id },
          update: {
            $set: {
              isSick: false,
              morale: worker.morale,
            },
            $unset: {
              sickUntil: '',
            },
          },
        },
      };
    });

    const result = await PropertyWorker.bulkWrite(bulkOps, { session });
    logger.info(`[ProductionTick] ${result.modifiedCount} workers recovered from sickness`);
  } catch (error) {
    logger.error('[ProductionTick] Error checking worker health', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Re-throw to trigger transaction rollback
  }
}

/**
 * Update worker morale naturally over time
 *
 * @param session - MongoDB session for transaction support
 */
async function updateWorkerMorale(session?: mongoose.ClientSession): Promise<void> {
  try {
    // Get all workers
    const workers = await PropertyWorker.find({}).session(session || null);

    if (workers.length === 0) {
      return;
    }

    // Batch update all workers
    const bulkOps = workers.map((worker) => {
      let moraleChanged = false;
      const updateFields: any = {};
      const sickWorkers: string[] = [];

      // Morale naturally trends toward 50
      if (worker.morale > 50) {
        worker.updateMorale(-1); // Slowly decrease if above average
        moraleChanged = true;
      } else if (worker.morale < 50) {
        worker.updateMorale(1); // Slowly increase if below average
        moraleChanged = true;
      }

      // Very high loyalty prevents morale from dropping too low
      if (worker.loyalty > 80 && worker.morale < 30) {
        worker.updateMorale(2);
        moraleChanged = true;
      }

      // Random sickness chance (very low)
      if (!worker.isSick && SecureRNG.chance(0.001)) {
        // 0.1% chance
        updateFields.isSick = true;
        updateFields.sickUntil = new Date(Date.now() + 4 * 60 * 60 * 1000); // Sick for 4 hours
        worker.updateMorale(-10);
        moraleChanged = true;
        sickWorkers.push(worker.name);
      }

      if (moraleChanged) {
        updateFields.morale = worker.morale;
      }

      return {
        updateOne: {
          filter: { _id: worker._id },
          update: {
            $set: updateFields,
          },
        },
        sickWorkers,
      };
    });

    // Extract sick worker names for logging
    const newlySickWorkers = bulkOps.flatMap((op) => op.sickWorkers);

    // Perform bulk write with only the update operations
    const bulkWriteOps = bulkOps.map(({ updateOne }) => ({ updateOne }));
    const result = await PropertyWorker.bulkWrite(bulkWriteOps, { session });

    if (result.modifiedCount > 0) {
      logger.debug(`[ProductionTick] Updated morale for ${result.modifiedCount} workers`);
    }

    if (newlySickWorkers.length > 0) {
      logger.info(`[ProductionTick] Workers became sick: ${newlySickWorkers.join(', ')}`);
    }
  } catch (error) {
    logger.error('[ProductionTick] Error updating worker morale', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Re-throw to trigger transaction rollback
  }
}

/**
 * Weekly wage payment job
 * Should run once per week
 *
 * SECURITY: Uses MongoDB transaction to ensure all wage payments succeed or fail together
 */
export async function weeklyWagePayment(): Promise<void> {
  const lockKey = 'job:weekly-wage-payment';

  try {
    await withLock(lockKey, async () => {
      logger.info('[ProductionTick] Starting weekly wage payments...');

      // Get all unique character IDs with workers
      const workers = await PropertyWorker.find({});
      const characterIds = new Set(workers.map((w) => w.characterId.toString()));

      let totalCharacters = 0;
      let totalWorkersPaid = 0;
      let totalGoldPaid = 0;

      for (const characterId of characterIds) {
        try {
          const result = await WorkerManagementService.payWorkerWages(characterId);

          totalCharacters++;
          totalWorkersPaid += result.workersPaid;
          totalGoldPaid += result.totalCost;

          if (result.unpaidWorkers.length > 0) {
            logger.warn(
              `[ProductionTick] Character ${characterId} couldn't pay ${result.unpaidWorkers.length} workers`
            );
          }
        } catch (error) {
          // Log but continue - individual character failures shouldn't abort entire transaction
          logger.error('[ProductionTick] Error paying wages for character', {
            characterId,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      }

      logger.info(
        `[ProductionTick] Weekly wages paid: ${totalWorkersPaid} workers, ${totalGoldPaid} gold across ${totalCharacters} characters`
      );
    }, {
      ttl: 600, // 10 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[ProductionTick] Weekly wage payment already running on another instance, skipping');
      return;
    }
    logger.error('[ProductionTick] Error during weekly wage payment', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Daily maintenance job
 * Should run once per day
 *
 * SECURITY: Uses MongoDB transaction to ensure all maintenance operations succeed or fail together
 */
export async function dailyMaintenance(): Promise<void> {
  const lockKey = 'job:daily-maintenance';

  try {
    await withLock(lockKey, async () => {
      logger.info('[ProductionTick] Starting daily maintenance...');

      // Check for workers who haven't been paid in a long time
      const workers = await PropertyWorker.find({});
      const now = new Date();

      const deleteOps: any[] = [];
      const updateOps: any[] = [];
      const quitWorkers: string[] = [];

      for (const worker of workers) {
        const daysSincePayment =
          (now.getTime() - worker.lastPaidDate.getTime()) / (1000 * 60 * 60 * 24);

        // If not paid for 14+ days, worker quits
        if (daysSincePayment >= 14) {
          quitWorkers.push(`${worker.name} (${daysSincePayment.toFixed(1)} days)`);
          deleteOps.push({
            deleteOne: {
              filter: { _id: worker._id },
            },
          });
        }
        // If not paid for 10+ days, morale and loyalty tank
        else if (daysSincePayment >= 10) {
          worker.updateMorale(-5);
          const newLoyalty = Math.max(0, worker.loyalty - 5);
          updateOps.push({
            updateOne: {
              filter: { _id: worker._id },
              update: {
                $set: {
                  morale: worker.morale,
                  loyalty: newLoyalty,
                },
              },
            },
          });
        }
      }

      // Perform bulk operations
      const allOps = [...deleteOps, ...updateOps];
      if (allOps.length > 0) {
        const result = await PropertyWorker.bulkWrite(allOps);

        if (result.deletedCount > 0) {
          logger.warn(`[ProductionTick] ${result.deletedCount} workers quit due to non-payment:`);
          quitWorkers.forEach((worker) => logger.warn(`  - ${worker}`));
        }

        if (result.modifiedCount > 0) {
          logger.warn(`[ProductionTick] ${result.modifiedCount} unpaid workers had morale/loyalty reduced`);
        }
      }

      logger.info('[ProductionTick] Daily maintenance completed');
    }, {
      ttl: 600, // 10 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[ProductionTick] Daily maintenance already running on another instance, skipping');
      return;
    }
    logger.error('[ProductionTick] Error during daily maintenance', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Get production system status
 */
export async function getProductionStatus(): Promise<{
  activeProductions: number;
  completedProductions: number;
  totalWorkers: number;
  sickWorkers: number;
  workersOnStrike: number;
}> {
  try {
    const { ProductionSlot } = await import('../models/ProductionSlot.model');

    const activeProductions = await ProductionSlot.countDocuments({
      status: 'producing',
    });
    const completedProductions = await ProductionSlot.countDocuments({
      status: 'ready',
    });

    const totalWorkers = await PropertyWorker.countDocuments({});
    const sickWorkers = await PropertyWorker.countDocuments({ isSick: true });
    const workersOnStrike = await PropertyWorker.countDocuments({ isOnStrike: true });

    return {
      activeProductions,
      completedProductions,
      totalWorkers,
      sickWorkers,
      workersOnStrike,
    };
  } catch (error) {
    logger.error('[ProductionTick] Error getting production status', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export default {
  productionTick,
  weeklyWagePayment,
  dailyMaintenance,
  getProductionStatus,
};
