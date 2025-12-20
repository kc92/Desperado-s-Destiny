/**
 * Unlock Trigger Service
 * Handles automatic unlock granting based on game events
 */

import { getTriggersForEvent, getUnlocksForEvent } from '../data/unlocks/triggers';
import * as unlockService from './permanentUnlock.service';
import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Process unlock triggers when an achievement is earned
 */
export async function processAchievementUnlock(
  userId: string,
  achievementId: string
): Promise<void> {
  const event = `achievement:${achievementId}`;
  const unlockIds = getUnlocksForEvent(event);

  for (const unlockId of unlockIds) {
    try {
      await unlockService.grantUnlock(userId, unlockId, event);
    } catch (error) {
      logger.error('Failed to grant unlock for achievement', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
    }
  }
}

/**
 * Process unlock triggers when reaching a legacy tier
 */
export async function processLegacyTierUnlock(
  userId: string,
  newTier: number
): Promise<void> {
  const event = `legacy:tier_${newTier}`;
  const unlockIds = getUnlocksForEvent(event);

  for (const unlockId of unlockIds) {
    try {
      await unlockService.grantUnlock(userId, unlockId, event);
    } catch (error) {
      logger.error('Failed to grant unlock for legacy tier', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
    }
  }
}

/**
 * Process unlock triggers when reaching a character level milestone
 */
export async function processLevelMilestone(
  userId: string,
  level: number
): Promise<void> {
  const milestones = [5, 10, 15, 25, 30, 50];

  if (milestones.includes(level)) {
    const event = `milestone:level_${level}`;
    const unlockIds = getUnlocksForEvent(event);

    for (const unlockId of unlockIds) {
      try {
        await unlockService.grantUnlock(userId, unlockId, event);
      } catch (error) {
        logger.error('Failed to grant unlock for level milestone', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
      }
    }
  }
}

/**
 * Process unlock triggers when reaching duel milestone
 */
export async function processDuelMilestone(
  userId: string,
  duelsWon: number
): Promise<void> {
  const milestones = [10, 25, 100, 250];

  for (const milestone of milestones) {
    if (duelsWon === milestone) {
      const event = `milestone:duels_${milestone}`;
      const unlockIds = getUnlocksForEvent(event);

      for (const unlockId of unlockIds) {
        try {
          await unlockService.grantUnlock(userId, unlockId, event);
        } catch (error) {
          logger.error('Failed to grant unlock for duel milestone', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
        }
      }
    }
  }
}

/**
 * Process unlock triggers when reaching crime milestone
 */
export async function processCrimeMilestone(
  userId: string,
  crimesCommitted: number
): Promise<void> {
  const milestones = [50, 100, 200, 500];

  for (const milestone of milestones) {
    if (crimesCommitted === milestone) {
      const event = `milestone:crimes_${milestone}`;
      const unlockIds = getUnlocksForEvent(event);

      for (const unlockId of unlockIds) {
        try {
          await unlockService.grantUnlock(userId, unlockId, event);
        } catch (error) {
          logger.error('Failed to grant unlock for crime milestone', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
        }
      }
    }
  }
}

/**
 * Process unlock triggers when reaching gold milestone
 */
export async function processGoldMilestone(
  userId: string,
  totalGoldEarned: number
): Promise<void> {
  const milestones = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 10000000];

  for (const milestone of milestones) {
    if (totalGoldEarned >= milestone) {
      const event = `milestone:gold_${milestone}`;
      const unlockIds = getUnlocksForEvent(event);

      for (const unlockId of unlockIds) {
        try {
          await unlockService.grantUnlock(userId, unlockId, event);
        } catch (error) {
          logger.error('Failed to grant unlock for gold milestone', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
        }
      }
    }
  }
}

/**
 * Process unlock triggers when reaching time played milestone
 */
export async function processTimePlayedMilestone(
  userId: string,
  timePlayed: number
): Promise<void> {
  const milestones = [
    { seconds: 86400, label: '1day' },
    { seconds: 2592000, label: '30days' }
  ];

  for (const milestone of milestones) {
    if (timePlayed >= milestone.seconds) {
      const event = `milestone:time_${milestone.label}`;
      const unlockIds = getUnlocksForEvent(event);

      for (const unlockId of unlockIds) {
        try {
          await unlockService.grantUnlock(userId, unlockId, event);
        } catch (error) {
          logger.error('Failed to grant unlock for time played milestone', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
        }
      }
    }
  }
}

/**
 * Process unlock triggers when becoming gang leader
 */
export async function processGangLeaderUnlock(
  userId: string,
  gangRank: number
): Promise<void> {
  if (gangRank >= 5) {
    const event = 'milestone:gang_leader';
    const unlockIds = getUnlocksForEvent(event);

    for (const unlockId of unlockIds) {
      try {
        await unlockService.grantUnlock(userId, unlockId, event);
      } catch (error) {
        logger.error('Failed to grant unlock for gang leader', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
      }
    }
  }

  if (gangRank >= 3) {
    const event = 'milestone:gang_rank_3';
    const unlockIds = getUnlocksForEvent(event);

    for (const unlockId of unlockIds) {
      try {
        await unlockService.grantUnlock(userId, unlockId, event);
      } catch (error) {
        logger.error('Failed to grant unlock for gang rank 3', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
      }
    }
  }
}

/**
 * Process unlock triggers for special events
 */
export async function processEventUnlock(
  userId: string,
  eventId: string
): Promise<void> {
  const event = `event:${eventId}`;
  const unlockIds = getUnlocksForEvent(event);

  for (const unlockId of unlockIds) {
    try {
      await unlockService.grantUnlock(userId, unlockId, event);
    } catch (error) {
      logger.error('Failed to grant unlock for event', { unlockId, event, error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
    }
  }
}

/**
 * Check and process all milestone unlocks for a user
 * Useful for retroactive unlock granting or sync operations
 */
export async function syncAllMilestoneUnlocks(userId: string): Promise<void> {
  const objectId = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(objectId);

  if (!user) {
    throw new Error('User not found');
  }

  // Process all applicable milestones
  // TODO: Add these tracking fields to User model
  const userAny = user as any;

  if (userAny.totalGoldEarned) {
    await processGoldMilestone(userId, userAny.totalGoldEarned);
  }

  if (userAny.totalDuelsWon) {
    await processDuelMilestone(userId, userAny.totalDuelsWon);
  }

  if (userAny.totalCrimesCommitted) {
    await processCrimeMilestone(userId, userAny.totalCrimesCommitted);
  }

  if (userAny.totalTimePlayed) {
    await processTimePlayedMilestone(userId, userAny.totalTimePlayed);
  }

  if (userAny.legacyTier) {
    for (let tier = 1; tier <= userAny.legacyTier; tier++) {
      await processLegacyTierUnlock(userId, tier);
    }
  }

  // Check character-level milestones
  const characters = await Character.find({ userId: objectId });
  const maxLevel = Math.max(...characters.map(c => c.level || 1), 0);

  if (maxLevel >= 5) await processLevelMilestone(userId, 5);
  if (maxLevel >= 10) await processLevelMilestone(userId, 10);
  if (maxLevel >= 15) await processLevelMilestone(userId, 15);
  if (maxLevel >= 25) await processLevelMilestone(userId, 25);
  if (maxLevel >= 30) await processLevelMilestone(userId, 30);
  if (maxLevel >= 50) await processLevelMilestone(userId, 50);
}
