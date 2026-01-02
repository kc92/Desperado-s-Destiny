/**
 * Urgent Contract Spawner Job
 *
 * Phase 3: Contract Expansion
 * Periodically spawns time-limited urgent contracts for active players
 * Runs every 30 minutes, 20% chance per active character
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DailyContract, IContract, ContractStatus } from '../models/DailyContract.model';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import { broadcastToUser } from '../config/socket';
import { withLock } from '../utils/distributedLock';
import { SecureRNG } from '../services/base/SecureRNG';
import {
  URGENT_CONTRACTS,
  ContractTemplate,
  PLACEHOLDER_DATA,
  seededRandom,
  scaleRewards
} from '../data/contractTemplates';
import { CONTRACT_CONSTANTS } from '@desperados/shared';
import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from '../utils/logger';

/**
 * Configuration constants
 */
const URGENT_SPAWN_CHANCE = 0.20; // 20% chance per check
const URGENT_SPAWN_INTERVAL_MINUTES = 30; // Check every 30 minutes
const MAX_URGENT_CONTRACTS_PER_DAY = 3; // Maximum urgent contracts a player can receive per day

/**
 * Redis key prefix for daily spawn trackers
 * Uses HSET for efficient per-character tracking with automatic TTL cleanup
 */
const SPAWN_TRACKER_KEY_PREFIX = 'urgent-spawn:';

/**
 * Track daily urgent contract spawns per character
 */
interface UrgentSpawnTracker {
  characterId: string;
  count: number;
  lastSpawnAt: string; // ISO string for Redis serialization
}

/**
 * Get today's Redis key for spawn trackers (auto-expires at midnight UTC)
 */
function getTodayTrackerKey(): string {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return `${SPAWN_TRACKER_KEY_PREFIX}${today.toISOString().split('T')[0]}`;
}

/**
 * Get spawn tracker from Redis
 */
async function getTracker(characterId: string): Promise<UrgentSpawnTracker | null> {
  if (!isRedisConnected()) {
    return null;
  }
  try {
    const client = getRedisClient();
    const data = await client.hGet(getTodayTrackerKey(), characterId);
    if (!data) return null;
    return JSON.parse(data) as UrgentSpawnTracker;
  } catch (error) {
    logger.warn('[UrgentContractSpawner] Failed to get tracker from Redis:', error);
    return null;
  }
}

/**
 * Set spawn tracker in Redis with TTL until end of day
 */
async function setTracker(characterId: string, tracker: UrgentSpawnTracker): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }
  try {
    const client = getRedisClient();
    const key = getTodayTrackerKey();
    await client.hSet(key, characterId, JSON.stringify(tracker));
    // Set TTL to expire at midnight UTC + 1 hour buffer
    const tomorrow = new Date();
    tomorrow.setUTCHours(25, 0, 0, 0); // 1am UTC next day
    const ttlSeconds = Math.ceil((tomorrow.getTime() - Date.now()) / 1000);
    await client.expire(key, ttlSeconds);
  } catch (error) {
    logger.warn('[UrgentContractSpawner] Failed to set tracker in Redis:', error);
  }
}

/**
 * Main urgent contract spawner function
 * Call this on a 30-minute schedule
 */
export async function spawnUrgentContracts(): Promise<void> {
  const lockKey = 'job:urgent-contract-spawner';

  try {
    await withLock(lockKey, async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        logger.info('[UrgentContractSpawner] Starting urgent contract spawn cycle...');

        // No need to clean up - Redis TTL handles automatic cleanup

        // Get recently active characters (logged in within last 2 hours)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const activeCharacters = await Character.find({
          lastActive: { $gte: twoHoursAgo },
          level: { $gte: 5 } // Minimum level 5 for urgent contracts
        }).session(session).limit(500);

        logger.info(`[UrgentContractSpawner] Found ${activeCharacters.length} active characters`);

        let spawnedCount = 0;

        for (const character of activeCharacters) {
          // Check daily spawn limit (Redis-backed)
          const tracker = await getTracker(character._id.toString());
          if (tracker && tracker.count >= MAX_URGENT_CONTRACTS_PER_DAY) {
            continue;
          }

          // Roll spawn chance
          if (!SecureRNG.chance(URGENT_SPAWN_CHANCE)) {
            continue;
          }

          // Attempt to spawn urgent contract
          const contract = await spawnUrgentContract(character, session);
          if (contract) {
            spawnedCount++;

            // Update tracker (Redis-backed)
            await updateTrackerRedis(character._id.toString());

            // Notify player via Socket.IO
            try {
              broadcastToUser(character._id.toString(), 'urgent_contract:spawned', {
                contract: {
                  id: contract.id,
                  title: contract.title,
                  description: contract.description,
                  urgency: contract.urgency,
                  expiresAt: contract.expiresAt,
                  rewards: contract.rewards
                }
              });
            } catch (socketError) {
              logger.debug('[UrgentContractSpawner] Socket broadcast failed (player may be offline)');
            }
          }
        }

        await session.commitTransaction();
        logger.info(`[UrgentContractSpawner] Spawned ${spawnedCount} urgent contracts`);
      } catch (error) {
        await session.abortTransaction();
        logger.error('[UrgentContractSpawner] Error during spawn cycle', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      } finally {
        session.endSession();
      }
    }, {
      ttl: 1800, // 30 minute lock TTL
      retries: 0 // Don't retry - skip if locked
    });
  } catch (error) {
    if ((error as Error).message?.includes('lock')) {
      logger.debug('[UrgentContractSpawner] Spawner already running on another instance, skipping');
      return;
    }
    throw error;
  }
}

/**
 * Spawn an urgent contract for a specific character
 */
async function spawnUrgentContract(
  character: any,
  session: mongoose.ClientSession
): Promise<IContract | null> {
  try {
    // Get today's daily contract record
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dailyRecord = await DailyContract.findOne({
      characterId: character._id,
      date: today
    }).session(session);

    if (!dailyRecord) {
      return null;
    }

    // Check if player already has an active urgent contract
    const existingUrgent = dailyRecord.contracts.find(
      c => c.type === 'urgent' && c.status !== 'completed' && c.status !== 'expired'
    );
    if (existingUrgent) {
      return null;
    }

    // Filter available urgent templates based on character requirements
    // Use Total Level / 10 for backward compat with level-based templates
    const effectiveLevel = Math.floor((character.totalLevel || 30) / 10);
    const availableTemplates = URGENT_CONTRACTS.filter(template => {
      // Check level requirement
      if (template.levelRequirement && effectiveLevel < template.levelRequirement) {
        return false;
      }

      // Check gang requirement
      if (template.gangRequired && !character.gangId) {
        return false;
      }

      return true;
    });

    if (availableTemplates.length === 0) {
      return null;
    }

    // Select random template
    const template = SecureRNG.select(availableTemplates);

    // Generate contract from template
    const contract = generateUrgentContract(template, effectiveLevel);

    // Add to daily contracts
    dailyRecord.contracts.push(contract as IContract);
    await dailyRecord.save({ session });

    logger.info(`[UrgentContractSpawner] Spawned urgent contract "${contract.title}" for character ${character._id}`);

    return contract as IContract;
  } catch (error) {
    logger.error('[UrgentContractSpawner] Error spawning urgent contract', {
      characterId: character._id,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

/**
 * Generate an urgent contract from template
 */
function generateUrgentContract(
  template: ContractTemplate,
  characterLevel: number
): Omit<IContract, 'acceptedAt' | 'completedAt'> {
  const now = new Date();

  // Calculate expiry based on urgency
  const urgency = template.urgency || 'urgent';
  const durationMs = CONTRACT_CONSTANTS.URGENCY_DURATIONS_MS[urgency];
  const expiresAt = new Date(now.getTime() + durationMs);

  // Generate title and description with placeholders
  const placeholderData = selectPlaceholders(template);
  const title = replacePlaceholders(template.titleTemplate, placeholderData);
  const description = replacePlaceholders(template.descriptionTemplate, placeholderData);

  // Calculate rewards with urgency multiplier
  const urgencyMultiplier = CONTRACT_CONSTANTS.URGENCY_MULTIPLIERS[urgency];
  const templateMultiplier = template.rewardMultiplier || 1.0;
  const scaledRewards = scaleRewards(template.baseRewards, template.difficulty, characterLevel);

  const rewards = {
    gold: Math.floor(scaledRewards.gold * urgencyMultiplier * templateMultiplier),
    xp: Math.floor(scaledRewards.xp * urgencyMultiplier * templateMultiplier),
    items: template.itemReward ? [template.itemReward] : undefined,
    skillXp: template.skillXpRewards?.map(r => ({
      skillId: r.skillId,
      amount: r.amount
    }))
  };

  // Build target
  const target = {
    type: template.targetType,
    id: placeholderData.npc?.id || placeholderData.location?.id || undefined,
    name: placeholderData.npc?.name || placeholderData.location?.name || 'Target',
    location: placeholderData.location?.name || placeholderData.npc?.location
  };

  // Build requirements
  const requirements: any = {
    amount: template.baseProgressMax,
    ...template.requirements
  };

  if (template.combatTargetType) {
    requirements.combatTargetType = template.combatTargetType;
    requirements.combatKillCount = template.combatKillCount;
  }

  if (template.gangRequired) {
    requirements.gangRequired = true;
    requirements.gangRankRequired = template.gangRankRequired;
  }

  if (template.requiredSkills && template.requiredSkills.length > 0) {
    requirements.skills = template.requiredSkills.map(skill => ({
      skillId: skill.skillId,
      minLevel: skill.minLevel
    }));
  }

  return {
    id: uuidv4(),
    templateId: template.id,
    type: 'urgent',
    title,
    description,
    target,
    requirements,
    rewards,
    difficulty: template.difficulty,
    status: 'available' as ContractStatus,
    progress: 0,
    progressMax: template.baseProgressMax,
    expiresAt,
    urgency
  };
}

/**
 * Select placeholder data for template
 */
function selectPlaceholders(template: ContractTemplate): {
  npc?: { id: string; name: string; location?: string };
  location?: { id: string; name: string };
  enemy?: { id: string; name: string; location?: string };
} {
  const result: any = {};

  const hasNPC = template.titleTemplate.includes('{NPC}') || template.descriptionTemplate.includes('{NPC}');
  const hasLocation = template.titleTemplate.includes('{LOCATION}') || template.descriptionTemplate.includes('{LOCATION}');
  const hasEnemy = template.titleTemplate.includes('{ENEMY}') || template.descriptionTemplate.includes('{ENEMY}');

  if (hasNPC) {
    result.npc = SecureRNG.select(PLACEHOLDER_DATA.NPCS);
  }

  if (hasLocation) {
    result.location = SecureRNG.select(PLACEHOLDER_DATA.LOCATIONS);
  }

  if (hasEnemy) {
    result.enemy = SecureRNG.select(PLACEHOLDER_DATA.ENEMIES);
  }

  return result;
}

/**
 * Replace placeholders in template string
 */
function replacePlaceholders(template: string, data: any): string {
  let result = template;

  if (data.npc) {
    result = result.replace(/{NPC}/g, data.npc.name);
  }
  if (data.location) {
    result = result.replace(/{LOCATION}/g, data.location.name);
  }
  if (data.enemy) {
    result = result.replace(/{ENEMY}/g, data.enemy.name);
  }

  return result;
}

/**
 * Update spawn tracker for a character (Redis-backed)
 */
async function updateTrackerRedis(characterId: string): Promise<void> {
  const existing = await getTracker(characterId);
  const now = new Date().toISOString();

  if (existing) {
    existing.count += 1;
    existing.lastSpawnAt = now;
    await setTracker(characterId, existing);
  } else {
    await setTracker(characterId, {
      characterId,
      count: 1,
      lastSpawnAt: now
    });
  }
}

/**
 * Manually trigger urgent contract check for a specific character
 * Used for testing or admin purposes
 */
export async function forceSpawnUrgentContract(characterId: string): Promise<IContract | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const character = await Character.findById(characterId).session(session);
    if (!character) {
      throw new Error('Character not found');
    }

    const contract = await spawnUrgentContract(character, session);
    await session.commitTransaction();

    if (contract) {
      // Notify player via Socket.IO
      try {
        broadcastToUser(characterId, 'urgent_contract:spawned', {
          contract: {
            id: contract.id,
            title: contract.title,
            description: contract.description,
            urgency: contract.urgency,
            expiresAt: contract.expiresAt,
            rewards: contract.rewards
          }
        });
      } catch (socketError) {
        logger.debug('[UrgentContractSpawner] Socket broadcast failed');
      }
    }

    return contract;
  } catch (error) {
    await session.abortTransaction();
    logger.error('[UrgentContractSpawner] Error force spawning urgent contract', {
      characterId,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get urgent contract spawner status
 */
export async function getUrgentSpawnerStatus(): Promise<{
  trackersCount: number;
  nextSpawnWindow: Date;
}> {
  const now = new Date();
  const nextSpawn = new Date(now);
  nextSpawn.setMinutes(Math.ceil(now.getMinutes() / URGENT_SPAWN_INTERVAL_MINUTES) * URGENT_SPAWN_INTERVAL_MINUTES, 0, 0);

  // Get tracker count from Redis
  let trackersCount = 0;
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      trackersCount = await client.hLen(getTodayTrackerKey());
    } catch (error) {
      logger.warn('[UrgentContractSpawner] Failed to get tracker count from Redis:', error);
    }
  }

  return {
    trackersCount,
    nextSpawnWindow: nextSpawn
  };
}

export default {
  spawnUrgentContracts,
  forceSpawnUrgentContract,
  getUrgentSpawnerStatus
};
