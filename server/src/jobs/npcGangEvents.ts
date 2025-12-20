/**
 * NPC Gang Events Job
 *
 * Handles random NPC gang events, attacks, and world state changes
 *
 * NOTE: Scheduling is handled by Bull queues in queues.ts
 * This file only contains job logic and helper functions
 *
 * SECURITY: World events are now persisted to Redis to survive server restarts
 * and ensure consistency across multiple server instances.
 */

import { Gang } from '../models/Gang.model';
import { NPCGangRelationship } from '../models/NPCGangRelationship.model';
import { NPCGangConflictService } from '../services/npcGangConflict.service';
import {
  NPCGangEventType,
  NPCGangWorldEvent,
  RelationshipAttitude,
} from '@desperados/shared';
import { ALL_NPC_GANGS } from '../data/npcGangs';
import { withLock } from '../utils/distributedLock';
import { RedisStateManager } from '../services/base/RedisStateManager';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Redis-backed storage for NPC world events
 * Persists events across server restarts and ensures consistency across instances
 */
class NPCWorldEventManager extends RedisStateManager<NPCGangWorldEvent[]> {
  protected keyPrefix = 'npc-gang:world-events:';
  protected ttlSeconds = 8 * 24 * 60 * 60; // 8 days (slightly longer than max event duration)

  /**
   * Get all active world events (filtering expired ones)
   */
  async getActiveEvents(): Promise<NPCGangWorldEvent[]> {
    try {
      const events = await this.getState('active') || [];
      const now = new Date();
      return events.filter(e => e.isActive && (!e.endsAt || new Date(e.endsAt) > now));
    } catch (error) {
      logger.error('[NPCWorldEvents] Error getting active events:', error);
      return []; // Return empty array on error to not break game functionality
    }
  }

  /**
   * Add a new world event
   */
  async addEvent(event: NPCGangWorldEvent): Promise<void> {
    try {
      const events = await this.getState('active') || [];
      events.push(event);
      await this.setState('active', events);
      logger.debug(`[NPCWorldEvents] Added event: ${event.title}`);
    } catch (error) {
      logger.error('[NPCWorldEvents] Error adding event:', error);
      throw error;
    }
  }

  /**
   * Remove expired events from storage
   * @returns Number of events cleaned up
   */
  async cleanExpiredEvents(): Promise<number> {
    try {
      const events = await this.getState('active') || [];
      const now = new Date();
      const activeEvents = events.filter(e => e.isActive && (!e.endsAt || new Date(e.endsAt) > now));
      const expiredCount = events.length - activeEvents.length;

      if (expiredCount > 0) {
        await this.setState('active', activeEvents);
        logger.info(`[NPCWorldEvents] Cleaned up ${expiredCount} expired events`);
      }

      return expiredCount;
    } catch (error) {
      logger.error('[NPCWorldEvents] Error cleaning expired events:', error);
      return 0;
    }
  }

  /**
   * Get count of active events
   */
  async getActiveEventCount(): Promise<number> {
    const events = await this.getActiveEvents();
    return events.length;
  }
}

// Singleton instance for world event management
const worldEventManager = new NPCWorldEventManager();

/**
 * Process NPC gang attacks on player gangs
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function processNPCAttacks(): Promise<void> {
  const lockKey = 'job:npc-attacks';

  try {
    await withLock(lockKey, async () => {
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
            if (SecureRNG.chance(attackChance)) {
              const npcGang = ALL_NPC_GANGS.find(g => g.id === relationship.npcGangId);
              if (!npcGang) continue;

              // Random attack type
              const attackPattern = SecureRNG.select(npcGang.attackPatterns);

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
            if (SecureRNG.chance(attackChance)) {
              const npcGang = ALL_NPC_GANGS.find(g => g.id === relationship.npcGangId);
              if (!npcGang) continue;

              const attackPattern = SecureRNG.select(npcGang.attackPatterns);

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
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('NPC gang attacks already running on another instance, skipping');
      return;
    }
    logger.error('Error processing NPC gang attacks:', error);
  }
}

/**
 * Generate random world events
 * Called by Bull queue - scheduling handled in queues.ts
 *
 * SECURITY: Events are now persisted to Redis for crash recovery and multi-instance support
 */
export async function generateWorldEvents(): Promise<void> {
  const lockKey = 'job:npc-world-events';

  try {
    await withLock(lockKey, async () => {
      logger.info('Generating NPC gang world events...');

      // Clear expired events from Redis storage
      const expiredCount = await worldEventManager.cleanExpiredEvents();
      if (expiredCount > 0) {
        logger.info(`Cleaned up ${expiredCount} expired world events`);
      }

      // Chance to generate new event
      if (SecureRNG.chance(0.6)) { // 60% chance every 3 days
        const eventType = getRandomEventType();
        const event = await generateEvent(eventType);

        if (event) {
          await worldEventManager.addEvent(event);
          logger.info(`Generated world event: ${event.title}`);
        }
      }

      const activeCount = await worldEventManager.getActiveEventCount();
      logger.info(`Active world events: ${activeCount}`);
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('NPC gang world events already running on another instance, skipping');
      return;
    }
    logger.error('Error generating world events:', error);
  }
}

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

  return SecureRNG.select(types);
}

/**
 * Generate specific event
 */
async function generateEvent(type: NPCGangEventType): Promise<NPCGangWorldEvent | null> {
  const npcGang = SecureRNG.select(ALL_NPC_GANGS);
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
      const enemyId = SecureRNG.select(npcGang.enemies);
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
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function resetTributeStatus(): Promise<void> {
  const lockKey = 'job:npc-tribute-reset';

  try {
    await withLock(lockKey, async () => {
      logger.info('Resetting tribute status for all gangs...');

      const result = await NPCGangRelationship.updateMany(
        { tributePaid: true },
        {
          $set: { tributePaid: false },
          $inc: { tributeStreak: -1 },
        }
      );

      logger.info(`Reset tribute status for ${result.modifiedCount} relationships`);
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('NPC tribute reset already running on another instance, skipping');
      return;
    }
    logger.error('Error resetting tribute status:', error);
  }
}

/**
 * Expire old challenges
 * Called by Bull queue - scheduling handled in queues.ts
 */
export async function expireChallenges(): Promise<void> {
  const lockKey = 'job:npc-expire-challenges';

  try {
    await withLock(lockKey, async () => {
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
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('NPC expire challenges already running on another instance, skipping');
      return;
    }
    logger.error('Error expiring challenges:', error);
  }
}

/**
 * Get active world events (from Redis)
 *
 * SECURITY: Now fetches from Redis for consistency across server instances
 */
export async function getActiveWorldEvents(): Promise<NPCGangWorldEvent[]> {
  return worldEventManager.getActiveEvents();
}

// NOTE: Scheduling is now handled by Bull queues in queues.ts
// The exported functions (processNPCAttacks, generateWorldEvents, etc.)
// are called directly by Bull job processors. No manual start/stop needed.
