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
import logger from '../utils/logger';

/**
 * Configuration constants
 */
const URGENT_SPAWN_CHANCE = 0.20; // 20% chance per check
const URGENT_SPAWN_INTERVAL_MINUTES = 30; // Check every 30 minutes
const MAX_URGENT_CONTRACTS_PER_DAY = 3; // Maximum urgent contracts a player can receive per day

/**
 * Track daily urgent contract spawns per character
 */
interface UrgentSpawnTracker {
  characterId: string;
  count: number;
  lastSpawnAt: Date;
}

const dailySpawnTrackers = new Map<string, UrgentSpawnTracker>();

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

        // Clean up old tracker entries (from previous days)
        cleanupOldTrackers();

        // Get recently active characters (logged in within last 2 hours)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const activeCharacters = await Character.find({
          lastActive: { $gte: twoHoursAgo },
          level: { $gte: 5 } // Minimum level 5 for urgent contracts
        }).session(session).limit(500);

        logger.info(`[UrgentContractSpawner] Found ${activeCharacters.length} active characters`);

        let spawnedCount = 0;

        for (const character of activeCharacters) {
          // Check daily spawn limit
          const tracker = dailySpawnTrackers.get(character._id.toString());
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

            // Update tracker
            updateTracker(character._id.toString());

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
    const availableTemplates = URGENT_CONTRACTS.filter(template => {
      // Check level requirement
      if (template.levelRequirement && character.level < template.levelRequirement) {
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
    const contract = generateUrgentContract(template, character.level);

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
 * Update spawn tracker for a character
 */
function updateTracker(characterId: string): void {
  const existing = dailySpawnTrackers.get(characterId);
  if (existing) {
    existing.count += 1;
    existing.lastSpawnAt = new Date();
  } else {
    dailySpawnTrackers.set(characterId, {
      characterId,
      count: 1,
      lastSpawnAt: new Date()
    });
  }
}

/**
 * Clean up old tracker entries from previous days
 */
function cleanupOldTrackers(): void {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const [characterId, tracker] of dailySpawnTrackers.entries()) {
    if (tracker.lastSpawnAt < today) {
      dailySpawnTrackers.delete(characterId);
    }
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

  return {
    trackersCount: dailySpawnTrackers.size,
    nextSpawnWindow: nextSpawn
  };
}

export default {
  spawnUrgentContracts,
  forceSpawnUrgentContract,
  getUrgentSpawnerStatus
};
