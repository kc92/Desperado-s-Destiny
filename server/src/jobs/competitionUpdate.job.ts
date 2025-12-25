/**
 * Competition Update Job
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Periodic job that updates NPC business behavior, resource regeneration,
 * and market competition metrics.
 *
 * Runs hourly via Bull queue in queues.ts.
 */

import { NPCBusinessBehaviorService } from '../services/npcBusinessBehavior.service';
import { ResourceScarcityService } from '../services/resourceScarcity.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Job result for competition update
 */
export interface CompetitionUpdateJobResult {
  npcBusinesses: {
    processed: number;
    priceChanges: number;
    qualityChanges: number;
    closures: number;
    errors: number;
  };
  resources: {
    veinsProcessed: number;
    totalRegenerated: number;
  };
  revenueSimulation: {
    processed: number;
    totalRevenue: number;
  };
  durationMs: number;
}

/**
 * Run the competition update cycle
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runCompetitionUpdate(): Promise<CompetitionUpdateJobResult> {
  const lockKey = 'job:competition-update';
  const startTime = Date.now();

  const result: CompetitionUpdateJobResult = {
    npcBusinesses: {
      processed: 0,
      priceChanges: 0,
      qualityChanges: 0,
      closures: 0,
      errors: 0,
    },
    resources: {
      veinsProcessed: 0,
      totalRegenerated: 0,
    },
    revenueSimulation: {
      processed: 0,
      totalRevenue: 0,
    },
    durationMs: 0,
  };

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Competition Update Job Started ===');

      // 1. Process NPC business behavior (price/quality adjustments, closures)
      logger.info('[CompetitionUpdate] Processing NPC business behavior...');
      try {
        const behaviorResult = await NPCBusinessBehaviorService.processAllBusinesses();
        result.npcBusinesses = behaviorResult;
        logger.info(
          `[CompetitionUpdate] NPC behavior: ${behaviorResult.processed} processed, ` +
          `${behaviorResult.priceChanges} price changes, ` +
          `${behaviorResult.qualityChanges} quality changes, ` +
          `${behaviorResult.closures} closures`
        );
      } catch (error) {
        logger.error('[CompetitionUpdate] Error processing NPC behavior:', error);
        result.npcBusinesses.errors++;
      }

      // 2. Process resource regeneration for renewable veins
      logger.info('[CompetitionUpdate] Processing resource regeneration...');
      try {
        const regenResult = await ResourceScarcityService.processRegeneration();
        result.resources = regenResult;
        logger.info(
          `[CompetitionUpdate] Regeneration: ${regenResult.veinsProcessed} veins, ` +
          `${regenResult.totalRegenerated} total regenerated`
        );
      } catch (error) {
        logger.error('[CompetitionUpdate] Error processing regeneration:', error);
      }

      result.durationMs = Date.now() - startTime;

      logger.info('=== Competition Update Job Completed ===', {
        npcProcessed: result.npcBusinesses.processed,
        priceChanges: result.npcBusinesses.priceChanges,
        qualityChanges: result.npcBusinesses.qualityChanges,
        closures: result.npcBusinesses.closures,
        veinsRegenerated: result.resources.veinsProcessed,
        durationMs: result.durationMs,
      });
    });
  } catch (error) {
    logger.error('[CompetitionUpdate] Failed to acquire lock or run job:', error);
    result.durationMs = Date.now() - startTime;
  }

  return result;
}

/**
 * Run NPC revenue simulation (weekly)
 * Simulates revenue for all NPC businesses based on traffic shares
 */
export async function runNPCRevenueSimulation(): Promise<{
  processed: number;
  totalRevenue: number;
  durationMs: number;
}> {
  const lockKey = 'job:npc-revenue-simulation';
  const startTime = Date.now();

  const result = {
    processed: 0,
    totalRevenue: 0,
    durationMs: 0,
  };

  try {
    await withLock(lockKey, async () => {
      logger.info('=== NPC Revenue Simulation Started ===');

      const simResult = await NPCBusinessBehaviorService.simulateWeeklyRevenue();
      result.processed = simResult.processed;
      result.totalRevenue = simResult.totalRevenue;

      result.durationMs = Date.now() - startTime;

      logger.info('=== NPC Revenue Simulation Completed ===', {
        processed: result.processed,
        totalRevenue: result.totalRevenue,
        durationMs: result.durationMs,
      });
    });
  } catch (error) {
    logger.error('[NPCRevenueSimulation] Failed:', error);
    result.durationMs = Date.now() - startTime;
  }

  return result;
}
