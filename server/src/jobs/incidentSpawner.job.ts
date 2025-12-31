/**
 * Incident Spawner Job
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Periodic job that checks all active targets for potential incidents.
 * Runs every 30 minutes via Bull queue in queues.ts.
 */

import { IncidentService } from '../services/incident.service';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';
import { IBatchIncidentSpawnResult } from '@desperados/shared';

/**
 * Job result for incident spawning
 */
export interface IncidentSpawnerJobResult {
  processedCount: number;
  incidentsCreated: number;
  incidentsPrevented: number;
  onCooldown: number;
  expiredProcessed: number;
  remindersSet: number;
  errors: number;
  durationMs: number;
}

/**
 * Run the incident spawner job
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function runIncidentSpawner(): Promise<IncidentSpawnerJobResult> {
  const lockKey = 'job:incident-spawner';
  const startTime = Date.now();

  const result: IncidentSpawnerJobResult = {
    processedCount: 0,
    incidentsCreated: 0,
    incidentsPrevented: 0,
    onCooldown: 0,
    expiredProcessed: 0,
    remindersSet: 0,
    errors: 0,
    durationMs: 0,
  };

  try {
    await withLock(lockKey, async () => {
      logger.info('=== Incident Spawner Job Started ===');

      // 1. Process expired incidents first
      logger.info('[IncidentSpawner] Processing expired incidents...');
      try {
        result.expiredProcessed = await IncidentService.processExpiredIncidents();
        logger.info(`[IncidentSpawner] Processed ${result.expiredProcessed} expired incidents`);
      } catch (error) {
        logger.error('[IncidentSpawner] Error processing expired incidents:', error);
        result.errors++;
      }

      // 2. Send reminders for incidents about to expire
      logger.info('[IncidentSpawner] Sending incident reminders...');
      try {
        result.remindersSet = await IncidentService.sendIncidentReminders();
        logger.info(`[IncidentSpawner] Sent ${result.remindersSet} reminders`);
      } catch (error) {
        logger.error('[IncidentSpawner] Error sending reminders:', error);
        result.errors++;
      }

      // 3. Check for new incident spawns
      logger.info('[IncidentSpawner] Checking for new incidents...');
      try {
        const batchResult: IBatchIncidentSpawnResult =
          await IncidentService.processBatchIncidentChecks();

        result.processedCount = batchResult.processedCount;
        result.incidentsCreated = batchResult.incidentsCreated;
        result.incidentsPrevented = batchResult.incidentsPrevented;
        result.onCooldown = batchResult.onCooldown;
        result.errors += batchResult.errors;

        logger.info(
          `[IncidentSpawner] Checked ${result.processedCount} targets, ` +
          `created ${result.incidentsCreated} incidents, ` +
          `prevented ${result.incidentsPrevented}, ` +
          `${result.onCooldown} on cooldown`
        );
      } catch (error) {
        logger.error('[IncidentSpawner] Error in batch incident check:', error);
        result.errors++;
      }

      result.durationMs = Date.now() - startTime;

      logger.info('=== Incident Spawner Job Completed ===', {
        processedCount: result.processedCount,
        incidentsCreated: result.incidentsCreated,
        expiredProcessed: result.expiredProcessed,
        remindersSet: result.remindersSet,
        errors: result.errors,
        durationMs: result.durationMs,
      });
    }, {
      ttl: 300, // 5 minute lock TTL
      retries: 0, // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[IncidentSpawner] Job already running on another instance, skipping');
      return result;
    }
    logger.error('[IncidentSpawner] Error in incident spawner job:', error);
    throw error;
  }

  return result;
}

/**
 * Run incident spawner immediately (for testing)
 */
export async function runIncidentSpawnerNow(): Promise<IncidentSpawnerJobResult> {
  return runIncidentSpawner();
}

/**
 * Force spawn an incident on a specific target (for testing/admin)
 */
export async function forceSpawnIncident(
  targetId: string,
  targetType: 'property' | 'business' | 'mining_claim'
): Promise<{ success: boolean; incidentId?: string; error?: string }> {
  try {
    const result = await IncidentService.checkIncidentSpawn(targetId, targetType as any);

    if (result.incidentOccurred) {
      return { success: true, incidentId: result.incidentId };
    }

    // Force spawn by bypassing prevention
    const targetInfo = await (IncidentService as any).getTargetInfo(targetId, targetType);
    if (!targetInfo) {
      return { success: false, error: 'Target not found' };
    }

    const incidentTypes = await import('@desperados/shared').then(m =>
      m.getIncidentTypesForTarget(targetType as any)
    );

    if (incidentTypes.length === 0) {
      return { success: false, error: 'No incident types available for this target' };
    }

    const incidentType = SecureRNG.select(incidentTypes);
    const incident = await (IncidentService as any).createIncident(targetInfo, incidentType);

    return { success: true, incidentId: incident._id.toString() };
  } catch (error) {
    logger.error(`[IncidentSpawner] Error force spawning incident:`, error);
    return { success: false, error: (error as Error).message };
  }
}
