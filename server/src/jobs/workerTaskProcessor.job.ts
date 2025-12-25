/**
 * Worker Task Processor Job
 *
 * Phase 11 - Full Worker Tasks
 *
 * This job runs every 5 minutes and:
 * 1. Processes all tasks that have reached completion time
 * 2. Starts next queued tasks for workers
 * 3. Regenerates stamina for idle workers
 * 4. Logs statistics for monitoring
 */

import { WorkerTaskService, TaskProcessingResult } from '../services/workerTask.service';
import logger from '../utils/logger';

/**
 * Process completed worker tasks
 * Runs every 5 minutes to check for completed tasks
 */
export async function processWorkerTasks(): Promise<TaskProcessingResult> {
  logger.info('[WorkerTaskProcessor] ========== Starting Worker Task Processing ==========');

  const result = await WorkerTaskService.processCompletedTasks();

  logger.info('[WorkerTaskProcessor] ========== Worker Task Processing Complete ==========');
  logger.info(
    `[WorkerTaskProcessor] Summary: ` +
    `${result.tasksCompleted} completed, ` +
    `${result.tasksFailed} failed, ` +
    `${result.tasksStarted} started, ` +
    `${result.totalGoldEarned}g earned, ` +
    `${result.totalResourcesGathered} resources gathered`
  );

  return result;
}

/**
 * Regenerate stamina for idle workers
 * Runs every hour to restore stamina to workers not actively working
 */
export async function regenerateWorkerStamina(): Promise<{ workersRegerated: number }> {
  logger.info('[WorkerTaskProcessor] Starting idle worker stamina regeneration...');

  const regeneratedCount = await WorkerTaskService.regenerateAllIdleWorkerStamina();

  logger.info(`[WorkerTaskProcessor] Regenerated stamina for ${regeneratedCount} idle workers`);

  return { workersRegerated: regeneratedCount };
}

/**
 * Full worker task cycle (called by scheduler)
 * Combines task processing and stamina regeneration
 */
export async function runWorkerTaskCycle(): Promise<{
  taskResult: TaskProcessingResult;
  staminaResult: { workersRegerated: number };
}> {
  const taskResult = await processWorkerTasks();
  const staminaResult = await regenerateWorkerStamina();

  return { taskResult, staminaResult };
}

export default {
  processWorkerTasks,
  regenerateWorkerStamina,
  runWorkerTaskCycle,
};
