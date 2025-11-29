/**
 * Production Tick Job
 *
 * Periodically checks and updates production statuses
 * Handles worker wage payments and maintenance
 */

import { ProductionService } from '../services/production.service';
import { WorkerManagementService } from '../services/workerManagement.service';
import { PropertyWorker } from '../models/PropertyWorker.model';
import { Character } from '../models/Character.model';

/**
 * Main production tick function
 * Should run every 5 minutes
 */
export async function productionTick(): Promise<void> {
  try {
    console.log('[ProductionTick] Starting production tick...');

    // Update production statuses
    const completedCount = await ProductionService.updateProductionStatuses();
    console.log(`[ProductionTick] ${completedCount} productions completed`);

    // Check for worker sickness recovery
    await checkWorkerHealth();

    // Natural morale decay for workers
    await updateWorkerMorale();

    console.log('[ProductionTick] Production tick completed successfully');
  } catch (error) {
    console.error('[ProductionTick] Error during production tick:', error);
    throw error;
  }
}

/**
 * Check and recover worker health
 */
async function checkWorkerHealth(): Promise<void> {
  try {
    const now = new Date();

    // Find sick workers whose recovery time has passed
    const sickWorkers = await PropertyWorker.find({
      isSick: true,
      sickUntil: { $lte: now },
    });

    for (const worker of sickWorkers) {
      worker.isSick = false;
      worker.sickUntil = undefined;
      worker.updateMorale(10); // Feeling better boosts morale
      await worker.save();
      console.log(`[ProductionTick] Worker ${worker.name} recovered from sickness`);
    }
  } catch (error) {
    console.error('[ProductionTick] Error checking worker health:', error);
  }
}

/**
 * Update worker morale naturally over time
 */
async function updateWorkerMorale(): Promise<void> {
  try {
    // Get all workers
    const workers = await PropertyWorker.find({});

    for (const worker of workers) {
      // Morale naturally trends toward 50
      if (worker.morale > 50) {
        worker.updateMorale(-1); // Slowly decrease if above average
      } else if (worker.morale < 50) {
        worker.updateMorale(1); // Slowly increase if below average
      }

      // Very high loyalty prevents morale from dropping too low
      if (worker.loyalty > 80 && worker.morale < 30) {
        worker.updateMorale(2);
      }

      // Random sickness chance (very low)
      if (!worker.isSick && Math.random() < 0.001) {
        // 0.1% chance
        worker.isSick = true;
        worker.sickUntil = new Date(Date.now() + 4 * 60 * 60 * 1000); // Sick for 4 hours
        worker.updateMorale(-10);
        console.log(`[ProductionTick] Worker ${worker.name} became sick`);
      }

      await worker.save();
    }
  } catch (error) {
    console.error('[ProductionTick] Error updating worker morale:', error);
  }
}

/**
 * Weekly wage payment job
 * Should run once per week
 */
export async function weeklyWagePayment(): Promise<void> {
  try {
    console.log('[ProductionTick] Starting weekly wage payments...');

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
          console.log(
            `[ProductionTick] Character ${characterId} couldn't pay ${result.unpaidWorkers.length} workers`
          );
        }
      } catch (error) {
        console.error(
          `[ProductionTick] Error paying wages for character ${characterId}:`,
          error
        );
      }
    }

    console.log(
      `[ProductionTick] Weekly wages paid: ${totalWorkersPaid} workers, ${totalGoldPaid} gold across ${totalCharacters} characters`
    );
  } catch (error) {
    console.error('[ProductionTick] Error during weekly wage payment:', error);
    throw error;
  }
}

/**
 * Daily maintenance job
 * Should run once per day
 */
export async function dailyMaintenance(): Promise<void> {
  try {
    console.log('[ProductionTick] Starting daily maintenance...');

    // Check for workers who haven't been paid in a long time
    const workers = await PropertyWorker.find({});
    const now = new Date();

    for (const worker of workers) {
      const daysSincePayment =
        (now.getTime() - worker.lastPaidDate.getTime()) / (1000 * 60 * 60 * 24);

      // If not paid for 14+ days, worker quits
      if (daysSincePayment >= 14) {
        console.log(
          `[ProductionTick] Worker ${worker.name} quit due to non-payment (${daysSincePayment.toFixed(1)} days)`
        );
        await PropertyWorker.deleteOne({ workerId: worker.workerId });
      }
      // If not paid for 10+ days, morale and loyalty tank
      else if (daysSincePayment >= 10) {
        worker.updateMorale(-5);
        worker.loyalty = Math.max(0, worker.loyalty - 5);
        await worker.save();
      }
    }

    console.log('[ProductionTick] Daily maintenance completed');
  } catch (error) {
    console.error('[ProductionTick] Error during daily maintenance:', error);
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
    console.error('[ProductionTick] Error getting production status:', error);
    throw error;
  }
}

export default {
  productionTick,
  weeklyWagePayment,
  dailyMaintenance,
  getProductionStatus,
};
