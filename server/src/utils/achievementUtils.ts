/**
 * Achievement Utility Functions
 *
 * Provides safe wrappers for fire-and-forget achievement updates
 * with proper error handling and caller context.
 *
 * Phase 1.3: Updated to use AchievementService instead of controller functions
 */

import { AchievementService } from '../services/achievement.service';
import logger from './logger';

/**
 * Safely update achievement progress with caller context
 * This is a fire-and-forget wrapper that ensures errors are properly logged
 * with context about where the call originated.
 *
 * @param characterId - The character to update
 * @param achievementType - The type of achievement to update
 * @param progressIncrement - Amount to increment (default: 1)
 * @param callerContext - Context string for error logging (e.g., 'combat:victory', 'crime:success')
 */
export function safeAchievementUpdate(
  characterId: string,
  achievementType: string,
  progressIncrement: number = 1,
  callerContext?: string
): void {
  // Validate inputs before making the async call
  if (!characterId || !achievementType) {
    logger.warn('safeAchievementUpdate called with invalid params', {
      characterId: characterId || 'missing',
      achievementType: achievementType || 'missing',
      callerContext
    });
    return;
  }

  AchievementService.incrementProgress(characterId, achievementType, progressIncrement)
    .catch((error: Error) => {
      logger.error('Achievement update failed', {
        error: error.message,
        characterId,
        achievementType,
        progressIncrement,
        callerContext: callerContext || 'unknown'
      });
    });
}

/**
 * Safely set achievement progress to a specific value
 * Fire-and-forget wrapper with proper error logging.
 *
 * @param characterId - The character to update
 * @param achievementType - The type of achievement to update
 * @param progress - The value to set progress to
 * @param callerContext - Context string for error logging
 */
export function safeAchievementSet(
  characterId: string,
  achievementType: string,
  progress: number,
  callerContext?: string
): void {
  if (!characterId || !achievementType) {
    logger.warn('safeAchievementSet called with invalid params', {
      characterId: characterId || 'missing',
      achievementType: achievementType || 'missing',
      callerContext
    });
    return;
  }

  AchievementService.setProgress(characterId, achievementType, progress)
    .catch((error: Error) => {
      logger.error('Achievement set failed', {
        error: error.message,
        characterId,
        achievementType,
        progress,
        callerContext: callerContext || 'unknown'
      });
    });
}

/**
 * Batch update multiple achievements safely
 * Useful when a single action triggers multiple achievement updates.
 *
 * @param characterId - The character to update
 * @param updates - Array of achievement updates to apply
 * @param callerContext - Context string for error logging
 */
export function safeAchievementBatch(
  characterId: string,
  updates: Array<{ type: string; increment?: number }>,
  callerContext?: string
): void {
  if (!characterId || !updates.length) {
    return;
  }

  for (const update of updates) {
    safeAchievementUpdate(
      characterId,
      update.type,
      update.increment ?? 1,
      callerContext
    );
  }
}
