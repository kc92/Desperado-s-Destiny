/**
 * NPC Gang Events Job
 *
 * Handles random NPC gang events, attacks, and world state changes
 */

import cron from 'node-cron';
import { Gang } from '../models/Gang.model';
import { NPCGangRelationship } from '../models/NPCGangRelationship.model';
import { TerritoryZone } from '../models/TerritoryZone.model';
import { NPCGangConflictService } from '../services/npcGangConflict.service';
import {
  NPCGangId,
  AttackType,
  NPCGangEventType,
  NPCGangWorldEvent,
  RelationshipAttitude,
} from '@desperados/shared';
import { ALL_NPC_GANGS } from '../data/npcGangs';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Active world events
 */
const activeWorldEvents: NPCGangWorldEvent[] = [];

/**
 * Process NPC gang attacks on player gangs
 * Runs daily at midnight
 */
export const processNPCAttacks = cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Processing NPC gang attacks...');

    // Get all player gangs
    const playerGangs = await Gang.find({ isActive: true });

    for (const playerGang of playerGangs) {
      // Check relationships with each NPC gang
      const relationships = await NPCGangRelationship.findByPlayerGang(
        playerGang._id as mongoose.Types.ObjectId
      );

      for (const relationship of relationships) {
        // Hostile or in conflict = higher attack chance
        if (
          relationship.attitude === RelationshipAttitude.HOSTILE ||
          relationship.activeConflict
        ) {
          const attackChance = 0.7; // 70% chance daily
          if (Math.random() < attackChance) {
            const npcGang = ALL_NPC_GANGS.find(g => g.id === relationship.npcGangId);
            if (!npcGang) continue;

            // Random attack type
            const attackPattern = npcGang.attackPatterns[
              Math.floor(Math.random() * npcGang.attackPatterns.length)
            ];

            try {
              await NPCGangConflictService.processNPCAttack(
                playerGang._id as mongoose.Types.ObjectId,
                npcGang.id,
                attackPattern.type
              );

              logger.info(
                `${npcGang.name} attacked ${playerGang.name} (${attackPattern.type})`
              );
            } catch (error) {
              logger.error(`Error processing attack from ${npcGang.name}:`, error);
            }
          }
        }
        // Unfriendly = lower attack chance
        else if (relationship.attitude === RelationshipAttitude.UNFRIENDLY) {
          const attackChance = 0.2; // 20% chance daily
          if (Math.random() < attackChance) {
            const npcGang = ALL_NPC_GANGS.find(g => g.id === relationship.npcGangId);
            if (!npcGang) continue;

            const attackPattern = npcGang.attackPatterns[
              Math.floor(Math.random() * npcGang.attackPatterns.length)
            ];

            try {
              await NPCGangConflictService.processNPCAttack(
                playerGang._id as mongoose.Types.ObjectId,
                npcGang.id,
                attackPattern.type
              );

              logger.info(
                `${npcGang.name} attacked ${playerGang.name} (${attackPattern.type})`
              );
            } catch (error) {
              logger.error(`Error processing attack from ${npcGang.name}:`, error);
            }
          }
        }
      }
    }

    logger.info('NPC gang attacks processed successfully');
  } catch (error) {
    logger.error('Error processing NPC gang attacks:', error);
  }
});

/**
 * Generate random world events
 * Runs every 3 days at noon
 */
export const generateWorldEvents = cron.schedule('0 12 */3 * *', async () => {
  try {
    logger.info('Generating NPC gang world events...');

    // Clear expired events
    const now = new Date();
    for (let i = activeWorldEvents.length - 1; i >= 0; i--) {
      if (activeWorldEvents[i].endsAt && activeWorldEvents[i].endsAt! < now) {
        activeWorldEvents.splice(i, 1);
      }
    }

    // Chance to generate new event
    if (Math.random() < 0.6) { // 60% chance every 3 days
      const eventType = getRandomEventType();
      const event = await generateEvent(eventType);

      if (event) {
        activeWorldEvents.push(event);
        logger.info(`Generated world event: ${event.title}`);
      }
    }

    logger.info(`Active world events: ${activeWorldEvents.length}`);
  } catch (error) {
    logger.error('Error generating world events:', error);
  }
});

/**
 * Get random event type
 */
function getRandomEventType(): NPCGangEventType {
  const types = [
    NPCGangEventType.EXPANSION,
    NPCGangEventType.NPC_WAR,
    NPCGangEventType.WEAKENED,
    NPCGangEventType.ALLIANCE_OFFER,
    NPCGangEventType.TRIBUTE_DEMAND,
  ];

  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Generate specific event
 */
async function generateEvent(type: NPCGangEventType): Promise<NPCGangWorldEvent | null> {
  const npcGang = ALL_NPC_GANGS[Math.floor(Math.random() * ALL_NPC_GANGS.length)];
  const now = new Date();
  const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  switch (type) {
    case NPCGangEventType.EXPANSION:
      return {
        id: new mongoose.Types.ObjectId().toString(),
        type: NPCGangEventType.EXPANSION,
        npcGangId: npcGang.id,
        title: `${npcGang.name} Expansion`,
        description: `${npcGang.name} is expanding their territory. Neutral zones are at risk!`,
        effects: {
          description: 'NPC gang gaining influence in neutral zones',
          duration: 7,
        },
        startedAt: now,
        endsAt,
        isActive: true,
      };

    case NPCGangEventType.NPC_WAR:
      // Find enemy gang
      const enemyId = npcGang.enemies[Math.floor(Math.random() * npcGang.enemies.length)];
      if (!enemyId) return null;

      const enemy = ALL_NPC_GANGS.find(g => g.id === enemyId);
      if (!enemy) return null;

      return {
        id: new mongoose.Types.ObjectId().toString(),
        type: NPCGangEventType.NPC_WAR,
        npcGangId: npcGang.id,
        targetGangId: enemy.id,
        title: `${npcGang.name} vs ${enemy.name}`,
        description: `War has broken out between ${npcGang.name} and ${enemy.name}!`,
        effects: {
          description: 'Both NPC gangs distracted, easier to challenge their zones',
          duration: 7,
        },
        startedAt: now,
        endsAt,
        isActive: true,
      };

    case NPCGangEventType.WEAKENED:
      return {
        id: new mongoose.Types.ObjectId().toString(),
        type: NPCGangEventType.WEAKENED,
        npcGangId: npcGang.id,
        title: `${npcGang.name} Weakened`,
        description: `${npcGang.name} has suffered major losses. Now is the time to strike!`,
        effects: {
          description: '50% easier to challenge their territory',
          duration: 7,
        },
        startedAt: now,
        endsAt,
        isActive: true,
      };

    case NPCGangEventType.ALLIANCE_OFFER:
      return {
        id: new mongoose.Types.ObjectId().toString(),
        type: NPCGangEventType.ALLIANCE_OFFER,
        npcGangId: npcGang.id,
        title: `${npcGang.name} Seeks Allies`,
        description: `${npcGang.name} is offering favorable terms to new allies.`,
        effects: {
          description: 'Tribute cost reduced by 50%, easier to gain reputation',
          duration: 7,
        },
        startedAt: now,
        endsAt,
        isActive: true,
      };

    case NPCGangEventType.TRIBUTE_DEMAND:
      return {
        id: new mongoose.Types.ObjectId().toString(),
        type: NPCGangEventType.TRIBUTE_DEMAND,
        npcGangId: npcGang.id,
        title: `${npcGang.name} Demands Tribute`,
        description: `${npcGang.name} is demanding increased tribute from all gangs in their territory.`,
        effects: {
          description: 'Tribute cost increased by 100%',
          duration: 7,
        },
        startedAt: now,
        endsAt,
        isActive: true,
      };

    default:
      return null;
  }
}

/**
 * Reset tribute status weekly
 * Runs every Monday at midnight
 */
export const resetTributeStatus = cron.schedule('0 0 * * 1', async () => {
  try {
    logger.info('Resetting tribute status for all gangs...');

    const result = await NPCGangRelationship.updateMany(
      { tributePaid: true },
      {
        $set: { tributePaid: false },
        $inc: { tributeStreak: -1 },
      }
    );

    logger.info(`Reset tribute status for ${result.modifiedCount} relationships`);
  } catch (error) {
    logger.error('Error resetting tribute status:', error);
  }
});

/**
 * Expire old challenges
 * Runs daily at 3 AM
 */
export const expireChallenges = cron.schedule('0 3 * * *', async () => {
  try {
    logger.info('Expiring old challenges...');

    const now = new Date();
    const relationships = await NPCGangRelationship.find({
      'challengeProgress.expiresAt': { $lt: now },
    });

    for (const relationship of relationships) {
      if (relationship.challengeProgress) {
        logger.info(
          `Expiring challenge for gang ${relationship.playerGangId} ` +
          `vs ${relationship.npcGangId}`
        );

        relationship.challengeProgress = undefined;
        await relationship.save();
      }
    }

    logger.info(`Expired ${relationships.length} challenges`);
  } catch (error) {
    logger.error('Error expiring challenges:', error);
  }
});

/**
 * Get active world events
 */
export function getActiveWorldEvents(): NPCGangWorldEvent[] {
  return activeWorldEvents.filter(e => e.isActive);
}

/**
 * Start all NPC gang jobs
 */
export function startNPCGangJobs(): void {
  logger.info('Starting NPC gang event jobs...');

  processNPCAttacks.start();
  generateWorldEvents.start();
  resetTributeStatus.start();
  expireChallenges.start();

  logger.info('NPC gang event jobs started');
}

/**
 * Stop all NPC gang jobs
 */
export function stopNPCGangJobs(): void {
  logger.info('Stopping NPC gang event jobs...');

  processNPCAttacks.stop();
  generateWorldEvents.stop();
  resetTributeStatus.stop();
  expireChallenges.stop();

  logger.info('NPC gang event jobs stopped');
}
