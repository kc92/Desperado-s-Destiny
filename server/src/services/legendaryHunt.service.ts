/**
 * Legendary Hunt Service
 *
 * Core service for legendary animal hunt mechanics including
 * discovery, spawn checking, initiation, and rewards
 */

import mongoose from 'mongoose';
import {
  LegendaryAnimal,
  LegendaryHuntRecord,
  DiscoveryStatus,
  SpawnCondition,
  LegendaryHuntSession,
  InitiateLegendaryHuntResponse,
  GetLegendaryAnimalsResponse,
  DiscoverClueResponse,
  HearRumorResponse,
  LegendaryTrophy,
} from '@desperados/shared';
import { LegendaryHunt, ILegendaryHunt } from '../models/LegendaryHunt.model';
import { Character } from '../models/Character.model';
import { Achievement } from '../models/Achievement.model';
import {
  LEGENDARY_ANIMALS,
  getLegendaryById,
  getLegendariesByCategory,
  getLegendariesByLocation,
} from '../data/legendaryAnimals';
import {
  getRumorsForLegendary,
  getRandomRumor,
  getClueText,
  DISCOVERY_MILESTONES,
} from '../data/legendaryClues';

/**
 * Get all legendary animals with character's progress
 */
export async function getLegendaryAnimals(
  characterId: mongoose.Types.ObjectId,
  filters?: {
    category?: string;
    location?: string;
    discoveryStatus?: DiscoveryStatus;
  }
): Promise<GetLegendaryAnimalsResponse> {
  try {
    const character = await Character.findById(characterId);
    if (!character) {
      return {
        success: false,
        legendaries: [],
      };
    }

    let legendaries = [...LEGENDARY_ANIMALS];

    // Apply filters
    if (filters?.category) {
      legendaries = legendaries.filter(l => l.category === filters.category);
    }

    if (filters?.location) {
      legendaries = getLegendariesByLocation(filters.location);
    }

    // Get hunt records for all legendaries
    const huntRecords = await LegendaryHunt.find({ characterId });
    const recordMap = new Map<string, ILegendaryHunt>();
    huntRecords.forEach(record => {
      recordMap.set(record.legendaryId, record);
    });

    // Build response
    const result = legendaries.map(legendary => {
      const record = recordMap.get(legendary.id);

      // Filter by discovery status if specified
      if (filters?.discoveryStatus && record?.discoveryStatus !== filters.discoveryStatus) {
        return null;
      }

      // Check if character meets requirements
      const meetsLevel = character.level >= legendary.levelRequirement;
      let meetsReputation = true;

      if (legendary.reputationRequirement) {
        const charRep = character.reputation?.[legendary.reputationRequirement.faction] || 0;
        meetsReputation = Math.abs(charRep) >= Math.abs(legendary.reputationRequirement.reputation);
      }

      const available = meetsLevel && meetsReputation;

      // Check spawn conditions
      const canSpawn = checkSpawnConditions(legendary);

      return {
        legendary,
        record: record ? convertToHuntRecord(record) : undefined,
        available,
        canSpawn,
      };
    }).filter(Boolean);

    return {
      success: true,
      legendaries: result as any[],
    };
  } catch (error) {
    console.error('Error getting legendary animals:', error);
    return {
      success: false,
      legendaries: [],
    };
  }
}

/**
 * Discover a clue for a legendary animal
 */
export async function discoverClue(
  characterId: mongoose.Types.ObjectId,
  legendaryId: string,
  location: string
): Promise<DiscoverClueResponse> {
  try {
    const legendary = getLegendaryById(legendaryId);
    if (!legendary) {
      return {
        success: false,
        message: 'Legendary animal not found',
      };
    }

    // Find clue at this location
    const clue = legendary.clueLocations.find(c => c.location === location);
    if (!clue) {
      return {
        success: false,
        message: 'No clues found at this location',
      };
    }

    // Check skill requirement
    if (clue.requiresSkill) {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, message: 'Character not found' };
      }

      const skill = character.skills?.find(s => s.skillId === clue.requiresSkill?.skill);
      const skillLevel = skill?.level || 0;

      if (skillLevel < (clue.requiresSkill.level || 0)) {
        return {
          success: false,
          message: `Requires ${clue.requiresSkill.skill} level ${clue.requiresSkill.level}`,
        };
      }
    }

    // Get or create hunt record
    const hunt = await (LegendaryHunt as any).getOrCreate(characterId, legendaryId);

    // Check if already found this clue
    const clueId = `${location}_${clue.clueType}`;
    if (hunt.cluesFound.includes(clueId)) {
      return {
        success: false,
        message: 'You\'ve already discovered this clue',
      };
    }

    // Add clue
    hunt.addClue(clueId);

    // Update discovery status
    const progress = hunt.getDiscoveryProgress();
    if (progress >= DISCOVERY_MILESTONES.DISCOVERY_THRESHOLD) {
      hunt.updateDiscoveryStatus(DiscoveryStatus.LOCATED);
    } else if (hunt.discoveryStatus === DiscoveryStatus.UNKNOWN) {
      hunt.updateDiscoveryStatus(DiscoveryStatus.TRACKED);
    }

    await hunt.save();

    // Get clue text
    const clueText = getClueText(legendaryId, clue.clueType);

    return {
      success: true,
      clue: {
        type: clue.clueType,
        description: clueText,
        legendary: legendary.name,
        progress,
      },
      discovered: hunt.discoveryStatus === DiscoveryStatus.LOCATED,
      message: clueText,
    };
  } catch (error) {
    console.error('Error discovering clue:', error);
    return {
      success: false,
      message: 'Failed to discover clue',
    };
  }
}

/**
 * Hear rumor about legendary from NPC
 */
export async function hearRumor(
  characterId: mongoose.Types.ObjectId,
  npcId: string,
  legendaryId?: string
): Promise<HearRumorResponse> {
  try {
    // If no legendary specified, pick random one NPC knows about
    let targetLegendary = legendaryId;
    if (!targetLegendary) {
      // Find legendaries this NPC knows about
      const knownLegendaries = LEGENDARY_ANIMALS.filter(l =>
        l.rumorsFromNPCs.includes(npcId)
      );

      if (knownLegendaries.length === 0) {
        return {
          success: false,
          message: 'This NPC doesn\'t know about any legendary animals',
        };
      }

      targetLegendary = knownLegendaries[Math.floor(Math.random() * knownLegendaries.length)].id;
    }

    const legendary = getLegendaryById(targetLegendary);
    if (!legendary) {
      return {
        success: false,
        message: 'Legendary animal not found',
      };
    }

    // Check if NPC knows about this legendary
    if (!legendary.rumorsFromNPCs.includes(npcId)) {
      return {
        success: false,
        message: 'This NPC doesn\'t know about that legendary animal',
      };
    }

    // Get or create hunt record
    const hunt = await (LegendaryHunt as any).getOrCreate(characterId, targetLegendary);

    // Check if already heard from this NPC
    if (hunt.rumorsHeard.includes(npcId)) {
      return {
        success: false,
        message: 'You\'ve already heard this rumor',
      };
    }

    // Get rumor
    const rumor = getRandomRumor(targetLegendary);
    if (!rumor) {
      return {
        success: false,
        message: 'No rumors available',
      };
    }

    // Add rumor
    hunt.addRumor(npcId);

    // Update discovery status
    const progress = hunt.getDiscoveryProgress();
    if (progress >= DISCOVERY_MILESTONES.DISCOVERY_THRESHOLD) {
      hunt.updateDiscoveryStatus(DiscoveryStatus.LOCATED);
    } else if (hunt.discoveryStatus === DiscoveryStatus.UNKNOWN) {
      hunt.updateDiscoveryStatus(DiscoveryStatus.RUMORED);
    }

    await hunt.save();

    return {
      success: true,
      rumor: {
        npcName: rumor.npcName,
        legendary: legendary.name,
        rumorText: rumor.rumor,
        hintsProvided: rumor.hints,
      },
      message: rumor.rumor,
    };
  } catch (error) {
    console.error('Error hearing rumor:', error);
    return {
      success: false,
      message: 'Failed to hear rumor',
    };
  }
}

/**
 * Check if legendary can spawn based on conditions
 */
export function checkSpawnConditions(legendary: LegendaryAnimal): boolean {
  // Check spawn conditions (simplified - would integrate with time/weather system)
  if (legendary.spawnConditions.length === 0) {
    return true; // Jackalope can spawn anywhere anytime (but rarely)
  }

  // For now, return true if conditions exist
  // In full implementation, would check:
  // - Time of day
  // - Weather
  // - Moon phase
  // - Global cooldown since last spawn
  // - Location

  return true;
}

/**
 * Initiate legendary hunt
 */
export async function initiateLegendaryHunt(
  characterId: mongoose.Types.ObjectId,
  legendaryId: string,
  location: string
): Promise<InitiateLegendaryHuntResponse> {
  try {
    const legendary = getLegendaryById(legendaryId);
    if (!legendary) {
      return {
        success: false,
        error: 'Legendary animal not found',
      };
    }

    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      return {
        success: false,
        error: 'Character not found',
      };
    }

    // Check level requirement
    if (character.level < legendary.levelRequirement) {
      return {
        success: false,
        error: `Requires level ${legendary.levelRequirement}`,
      };
    }

    // Check reputation requirement
    if (legendary.reputationRequirement) {
      const charRep = character.reputation?.[legendary.reputationRequirement.faction] || 0;
      const requiredRep = legendary.reputationRequirement.reputation;

      if (Math.abs(charRep) < Math.abs(requiredRep)) {
        return {
          success: false,
          error: `Requires ${legendary.reputationRequirement.faction} reputation: ${requiredRep}`,
        };
      }
    }

    // Check if location matches
    const validLocation = legendary.location === location ||
                          legendary.alternateLocations?.includes(location);
    if (!validLocation) {
      return {
        success: false,
        error: 'Legendary not found at this location',
      };
    }

    // Check spawn conditions
    if (!checkSpawnConditions(legendary)) {
      return {
        success: false,
        error: 'Spawn conditions not met',
      };
    }

    // Get or create hunt record
    const hunt = await (LegendaryHunt as any).getOrCreate(characterId, legendaryId);

    // Check if discovered
    if (hunt.discoveryStatus < DiscoveryStatus.LOCATED) {
      return {
        success: false,
        error: 'You haven\'t discovered this legendary yet. Find more clues.',
      };
    }

    // Record encounter
    hunt.recordEncounter();
    await hunt.save();

    // Create hunt session
    const session: LegendaryHuntSession = {
      sessionId: new mongoose.Types.ObjectId().toString(),
      characterId: characterId.toString(),
      legendaryId,
      legendary,
      currentPhase: 1,
      legendaryHealth: legendary.health,
      legendaryMaxHealth: legendary.health,
      turnCount: 0,
      totalDamageDone: 0,
      abilitiesUsed: [],
      currentCooldowns: new Map(),
      startedAt: new Date(),
      location,
    };

    return {
      success: true,
      session,
      message: `You've engaged ${legendary.name} - ${legendary.title}!`,
    };
  } catch (error) {
    console.error('Error initiating legendary hunt:', error);
    return {
      success: false,
      error: 'Failed to initiate hunt',
    };
  }
}

/**
 * Get legendary trophy for character
 */
export async function getLegendaryTrophies(
  characterId: mongoose.Types.ObjectId
): Promise<LegendaryTrophy[]> {
  try {
    const hunts = await LegendaryHunt.find({
      characterId,
      defeatedCount: { $gt: 0 },
      trophyObtained: true,
    });

    return hunts.map(hunt => {
      const legendary = getLegendaryById(hunt.legendaryId);
      if (!legendary) return null;

      return {
        legendaryId: hunt.legendaryId,
        legendaryName: legendary.name,
        legendaryTitle: legendary.title,
        defeatedAt: hunt.lastDefeatedAt!,
        defeatedCount: hunt.defeatedCount,
        displayText: `${legendary.name} - ${legendary.title}: Defeated ${hunt.defeatedCount}x`,
        rarity: legendary.tier,
      };
    }).filter(Boolean) as LegendaryTrophy[];
  } catch (error) {
    console.error('Error getting legendary trophies:', error);
    return [];
  }
}

/**
 * Get legendary hunt leaderboard
 */
export async function getLegendaryLeaderboard(
  legendaryId: string,
  limit: number = 10
) {
  try {
    const legendary = getLegendaryById(legendaryId);
    if (!legendary) {
      return null;
    }

    const topHunters = await (LegendaryHunt as any).getLeaderboard(legendaryId, limit);

    const entries = await Promise.all(
      topHunters.map(async (hunt, index) => {
        const character = await Character.findById(hunt.characterId);
        if (!character) return null;

        return {
          rank: index + 1,
          characterId: hunt.characterId.toString(),
          characterName: character.name,
          defeatedCount: hunt.defeatedCount,
          bestTime: hunt.bestAttempt?.turnsSurvived,
          bestDamage: hunt.bestAttempt?.damageDone,
          firstDefeat: hunt.lastDefeatedAt,
        };
      })
    );

    return {
      legendaryId,
      legendaryName: legendary.name,
      entries: entries.filter(Boolean),
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return null;
  }
}

/**
 * Award legendary hunt rewards
 */
export async function awardLegendaryRewards(
  characterId: mongoose.Types.ObjectId,
  legendaryId: string,
  session: LegendaryHuntSession
): Promise<{
  gold: number;
  experience: number;
  items: any[];
  title?: string;
  achievement?: string;
  permanentBonus?: any;
}> {
  try {
    const legendary = getLegendaryById(legendaryId);
    if (!legendary) {
      throw new Error('Legendary not found');
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const hunt = await LegendaryHunt.findOne({ characterId, legendaryId });
    if (!hunt) {
      throw new Error('Hunt record not found');
    }

    // Calculate gold reward
    const goldReward = Math.floor(
      Math.random() * (legendary.goldReward.max - legendary.goldReward.min) +
      legendary.goldReward.min
    );

    // Award gold
    character.gold += goldReward;

    // Award experience
    character.experience += legendary.experienceReward;

    // Award guaranteed drops
    const items = [...legendary.guaranteedDrops];

    // Roll for possible drops
    if (legendary.possibleDrops) {
      legendary.possibleDrops.forEach(drop => {
        if (Math.random() <= drop.dropChance) {
          items.push(drop);
        }
      });
    }

    // Add items to inventory (simplified)
    // In full implementation, would add to character inventory

    // Award title if first defeat
    let title: string | undefined;
    if (hunt.defeatedCount === 1 && !hunt.titleUnlocked) {
      title = legendary.titleUnlocked;
      hunt.titleUnlocked = true;
      // In full implementation, would add to character titles
    }

    // Award achievement
    let achievement: string | undefined;
    if (hunt.defeatedCount === 1) {
      achievement = legendary.achievementId;
      // Create achievement
      await Achievement.create({
        characterId,
        achievementType: legendary.achievementId,
        title: legendary.titleUnlocked,
        description: `Defeated ${legendary.name} - ${legendary.title}`,
        category: 'special',
        tier: 'legendary',
        progress: 1,
        target: 1,
        completed: true,
        completedAt: new Date(),
        reward: {
          gold: goldReward,
          experience: legendary.experienceReward,
        },
      });
    }

    // Apply permanent bonus if first defeat
    let permanentBonus = undefined;
    if (legendary.permanentBonus && hunt.defeatedCount === 1 && !hunt.permanentBonusApplied) {
      permanentBonus = legendary.permanentBonus;
      hunt.permanentBonusApplied = true;

      // Apply bonus to character
      const bonusType = legendary.permanentBonus.type;
      if (bonusType === 'cunning' || bonusType === 'spirit' || bonusType === 'combat' || bonusType === 'craft') {
        character.stats[bonusType] += legendary.permanentBonus.amount;
      } else if (bonusType === 'max_energy') {
        character.maxEnergy += legendary.permanentBonus.amount;
      }
      // Other bonus types would be applied to appropriate fields
    }

    // Mark trophy obtained
    hunt.trophyObtained = true;
    hunt.rewardsClaimed = true;

    await character.save();
    await hunt.save();

    return {
      gold: goldReward,
      experience: legendary.experienceReward,
      items,
      title,
      achievement,
      permanentBonus,
    };
  } catch (error) {
    console.error('Error awarding legendary rewards:', error);
    throw error;
  }
}

/**
 * Convert ILegendaryHunt to LegendaryHuntRecord
 */
function convertToHuntRecord(hunt: ILegendaryHunt): LegendaryHuntRecord {
  return {
    characterId: hunt.characterId.toString(),
    legendaryId: hunt.legendaryId,
    discoveryStatus: hunt.discoveryStatus,
    rumorsHeard: hunt.rumorsHeard,
    cluesFound: hunt.cluesFound,
    discoveredAt: hunt.discoveredAt,
    encounterCount: hunt.encounterCount,
    defeatedCount: hunt.defeatedCount,
    lastEncounteredAt: hunt.lastEncounteredAt,
    lastDefeatedAt: hunt.lastDefeatedAt,
    bestAttempt: hunt.bestAttempt,
    rewardsClaimed: hunt.rewardsClaimed,
    trophyObtained: hunt.trophyObtained,
    titleUnlocked: hunt.titleUnlocked,
    permanentBonusApplied: hunt.permanentBonusApplied,
  };
}

export default {
  getLegendaryAnimals,
  discoverClue,
  hearRumor,
  checkSpawnConditions,
  initiateLegendaryHunt,
  getLegendaryTrophies,
  getLegendaryLeaderboard,
  awardLegendaryRewards,
};
