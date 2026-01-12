/**
 * Training Complete Processor Job
 *
 * Handles auto-completion of skill training sessions
 *
 * This job:
 * 1. Processes individual training completions (scheduled per training session)
 * 2. Sweeps for any missed training completions (backup)
 * 3. Awards skill XP and clears training state
 */

import { Job } from 'bull';
import { Character } from '../models/Character.model';
import { SkillService } from '../services/skill.service';
import { withLock } from '../utils/distributedLock';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger';

/**
 * Job data for individual training completion
 */
interface TrainingCompleteJobData {
  characterId: string;
  skillId: string;
  xpAmount: number;
}

/**
 * Result of processing completed training sessions
 */
export interface TrainingProcessingResult {
  processed: number;
  failed: number;
  totalXpAwarded: number;
  levelUps: number;
}

/**
 * Process a single training completion
 * Called when a scheduled training session reaches its completion time
 */
export async function processTrainingComplete(job: Job<TrainingCompleteJobData>): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  const { characterId, skillId, xpAmount } = job.data;

  logger.info(`[TrainingProcessor] Processing training completion for character ${characterId}, skill ${skillId}`);

  try {
    const character = await Character.findById(characterId);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Find the skill that was training
    const skill = character.skills.find(s => s.skillId === skillId);
    if (!skill) {
      return { success: false, error: 'Skill not found on character' };
    }

    // Check if this skill was actually training
    if (!skill.trainingStarted || !skill.trainingCompletes) {
      logger.info(`[TrainingProcessor] Skill ${skillId} not in training state, skipping`);
      return { success: true, result: { skipped: true } };
    }

    // Check if training is actually complete
    if (new Date() < skill.trainingCompletes) {
      logger.info(`[TrainingProcessor] Training for ${skillId} not yet complete, skipping`);
      return { success: true, result: { skipped: true, reason: 'not_complete' } };
    }

    // Award skill XP
    const xpResult = await SkillService.awardSkillXP(characterId, skillId, xpAmount);

    // Clear training state
    skill.trainingStarted = undefined;
    skill.trainingCompletes = undefined;
    await character.save();

    logger.info(
      `[TrainingProcessor] Training completed for character ${character.name}: ` +
      `${skillId} +${xpAmount} XP` +
      (xpResult.result?.leveledUp ? ` (Level ${xpResult.result.oldLevel} -> ${xpResult.result.newLevel})` : '')
    );

    // TODO: Emit socket event to notify player if online
    // socketService.emitToCharacter(characterId, 'training:completed', { skillId, xpGained: xpAmount, leveledUp: xpResult.result?.leveledUp });

    return {
      success: true,
      result: {
        skillId,
        xpAwarded: xpAmount,
        leveledUp: xpResult.result?.leveledUp,
        newLevel: xpResult.result?.newLevel
      }
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`[TrainingProcessor] Error processing training for ${characterId}:`, error);
    Sentry.captureException(error, {
      tags: { job: 'training-complete' },
      extra: { characterId, skillId, xpAmount }
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Sweep for any missed training completions
 * This is a backup in case individual jobs fail
 * Runs every 5 minutes
 */
export async function sweepCompletedTraining(): Promise<TrainingProcessingResult> {
  const lockKey = 'job:training-sweep';

  try {
    return await withLock(lockKey, async () => {
      logger.info('[TrainingProcessor] ========== Starting Training Sweep ==========');

      const result: TrainingProcessingResult = {
        processed: 0,
        failed: 0,
        totalXpAwarded: 0,
        levelUps: 0
      };

      // Find all characters with completed training
      const now = new Date();
      const characters = await Character.find({
        'skills.trainingCompletes': { $lte: now }
      });

      logger.info(`[TrainingProcessor] Found ${characters.length} characters with completed training`);

      for (const character of characters) {
        // Find skills with completed training
        const completedSkills = character.skills.filter(
          skill => skill.trainingCompletes && new Date(skill.trainingCompletes) <= now
        );

        for (const skill of completedSkills) {
          try {
            // Calculate XP based on training duration
            // Default formula: 1 XP per minute of training
            const startTime = skill.trainingStarted?.getTime() || 0;
            const endTime = skill.trainingCompletes?.getTime() || 0;
            const durationMinutes = Math.floor((endTime - startTime) / (60 * 1000));
            const xpAmount = Math.max(1, durationMinutes);

            // Award skill XP
            const xpResult = await SkillService.awardSkillXP(
              character._id.toString(),
              skill.skillId,
              xpAmount
            );

            // Clear training state
            skill.trainingStarted = undefined;
            skill.trainingCompletes = undefined;

            result.processed++;
            result.totalXpAwarded += xpAmount;
            if (xpResult.result?.leveledUp) {
              result.levelUps++;
            }

            logger.info(
              `[TrainingProcessor] Auto-completed training for ${character.name}: ` +
              `${skill.skillId} +${xpAmount} XP`
            );
          } catch (error) {
            logger.error(`[TrainingProcessor] Error processing skill ${skill.skillId} for ${character._id}:`, error);
            result.failed++;
          }
        }

        // Save character with cleared training states
        if (completedSkills.length > 0) {
          await character.save();
        }
      }

      logger.info('[TrainingProcessor] ========== Training Sweep Complete ==========');
      logger.info(
        `[TrainingProcessor] Summary: ` +
        `${result.processed} completed, ` +
        `${result.failed} failed, ` +
        `${result.totalXpAwarded} XP awarded, ` +
        `${result.levelUps} level ups`
      );

      return result;
    }, {
      ttl: 300, // 5 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    // Handle lock contention gracefully
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[TrainingProcessor] Sweep already running on another instance, skipping');
      return { processed: 0, failed: 0, totalXpAwarded: 0, levelUps: 0 };
    }

    logger.error('[TrainingProcessor] Error during training sweep:', error);
    Sentry.captureException(error, {
      tags: { job: 'training-sweep' }
    });
    throw error;
  }
}

/**
 * Start a training session for a character
 * Schedules the completion job
 */
export async function scheduleTrainingCompletion(
  characterId: string,
  skillId: string,
  durationMs: number,
  xpAmount: number,
  queue: any
): Promise<string> {
  const job = await queue.add(
    'TRAINING_COMPLETE',
    { characterId, skillId, xpAmount },
    {
      delay: durationMs,
      jobId: `training-${characterId}-${skillId}`,
      removeOnComplete: true,
      removeOnFail: false
    }
  );

  logger.info(
    `[TrainingProcessor] Scheduled training completion for ${characterId}/${skillId} ` +
    `in ${Math.floor(durationMs / 60000)} minutes`
  );

  return job.id?.toString() || '';
}

/**
 * Cancel a scheduled training completion
 */
export async function cancelTrainingCompletion(
  characterId: string,
  skillId: string,
  queue: any
): Promise<boolean> {
  try {
    const jobId = `training-${characterId}-${skillId}`;
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info(`[TrainingProcessor] Cancelled training job ${jobId}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`[TrainingProcessor] Error cancelling training job:`, error);
    return false;
  }
}

export default {
  processTrainingComplete,
  sweepCompletedTraining,
  scheduleTrainingCompletion,
  cancelTrainingCompletion
};
