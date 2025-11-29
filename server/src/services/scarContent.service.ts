/**
 * Scar Content Service
 *
 * Manages end-game content, zone access, challenges, and progression
 */

import { ScarProgressModel, ScarProgressDocument } from '../models/ScarProgress.model';
import { SCAR_ZONES, getScarZone, getAccessibleZones } from '../data/scarZones';
import { ELITE_ENEMIES, getEliteEnemy } from '../data/eliteEnemies';
import {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  CORRUPTION_ABILITIES,
  getRandomDailyChallenge,
  getRandomWeeklyChallenge,
  getAvailableAbilities,
} from '../data/endGameRewards';
import {
  ScarZone,
  EndGameZone,
  ScarProgress,
  DailyChallenge,
  WeeklyChallenge,
  CorruptionAbility,
  CorruptionAbilityType,
  AttackEliteRequest,
  AttackEliteResponse,
  UseCorruptionAbilityRequest,
  UseCorruptionAbilityResponse,
  canEnterZone,
  SCAR_CONSTANTS,
} from '@desperados/shared';

/**
 * Scar Content Service
 */
export class ScarContentService {
  /**
   * Get or create player's Scar progress
   */
  static async getProgress(characterId: string): Promise<ScarProgress> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    return progress.toObject();
  }

  /**
   * Check if player can enter a zone
   */
  static async canEnterZone(
    characterId: string,
    characterLevel: number,
    zone: ScarZone
  ): Promise<{ canEnter: boolean; requirements: string[] }> {
    const zoneData = getScarZone(zone);
    if (!zoneData) {
      return { canEnter: false, requirements: ['Zone not found'] };
    }

    const progress = await ScarProgressModel.findOrCreate(characterId);
    const missingRequirements: string[] = [];

    // Check level requirement
    if (!canEnterZone(characterLevel, zone)) {
      missingRequirements.push(
        `Level ${SCAR_CONSTANTS.ZONE_LEVEL_REQUIREMENTS[zone]} required`
      );
    }

    // Check zone-specific requirements
    for (const req of zoneData.requirements) {
      switch (req.type) {
        case 'level':
          if (characterLevel < Number(req.value)) {
            missingRequirements.push(req.description);
          }
          break;

        case 'reputation':
          if (progress.reputation < Number(req.value)) {
            missingRequirements.push(req.description);
          }
          break;

        case 'corruption_resistance':
          // This would check character stats - simplified for now
          break;

        case 'quest':
          // This would check quest completion - simplified for now
          break;
      }
    }

    return {
      canEnter: missingRequirements.length === 0,
      requirements: missingRequirements,
    };
  }

  /**
   * Enter a Scar zone
   */
  static async enterZone(
    characterId: string,
    characterLevel: number,
    zone: ScarZone
  ): Promise<{ success: boolean; zone?: EndGameZone; message?: string }> {
    const canEnter = await this.canEnterZone(characterId, characterLevel, zone);

    if (!canEnter.canEnter) {
      return {
        success: false,
        message: `Cannot enter zone. Requirements: ${canEnter.requirements.join(', ')}`,
      };
    }

    const progress = await ScarProgressModel.findOrCreate(characterId);
    progress.currentZone = zone;

    // Unlock zone if first visit
    if (!progress.unlockedZones.includes(zone)) {
      progress.unlockedZones.push(zone);
    }

    await progress.save();

    const zoneData = getScarZone(zone);
    return {
      success: true,
      zone: zoneData,
      message: `Entered ${zoneData?.name}`,
    };
  }

  /**
   * Get available daily challenge
   */
  static async getDailyChallenge(characterId: string): Promise<DailyChallenge | null> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    // Check if daily challenge needs reset
    const now = new Date();
    const lastReset = new Date(progress.lastDailyChallengeReset);
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      // Reset daily challenge
      progress.activeDailyChallenge = undefined;
      progress.lastDailyChallengeReset = now;
      await progress.save();
    }

    // If no active challenge, assign one
    if (!progress.activeDailyChallenge) {
      const challenge = getRandomDailyChallenge();
      progress.activeDailyChallenge = challenge.id;
      await progress.save();
      return challenge;
    }

    // Return active challenge
    return DAILY_CHALLENGES.find(c => c.id === progress.activeDailyChallenge) || null;
  }

  /**
   * Get available weekly challenge
   */
  static async getWeeklyChallenge(characterId: string): Promise<WeeklyChallenge | null> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    // Check if weekly challenge needs reset
    const now = new Date();
    const lastReset = new Date(progress.lastWeeklyChallengeReset);
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 7) {
      // Reset weekly challenge
      progress.activeWeeklyChallenge = undefined;
      progress.lastWeeklyChallengeReset = now;
      await progress.save();
    }

    // If no active challenge, assign one
    if (!progress.activeWeeklyChallenge) {
      const challenge = getRandomWeeklyChallenge();
      progress.activeWeeklyChallenge = challenge.id;
      await progress.save();
      return challenge;
    }

    // Return active challenge
    return WEEKLY_CHALLENGES.find(c => c.id === progress.activeWeeklyChallenge) || null;
  }

  /**
   * Complete daily challenge
   */
  static async completeDailyChallenge(
    characterId: string
  ): Promise<{ success: boolean; rewards?: any; message?: string }> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    if (!progress.activeDailyChallenge) {
      return { success: false, message: 'No active daily challenge' };
    }

    const challenge = DAILY_CHALLENGES.find(c => c.id === progress.activeDailyChallenge);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }

    // Award rewards
    await progress.addReputation(challenge.rewards.scarReputation);
    progress.dailyChallengesCompleted += 1;
    progress.activeDailyChallenge = undefined;

    await progress.save();

    return {
      success: true,
      rewards: challenge.rewards,
      message: `Completed: ${challenge.name}`,
    };
  }

  /**
   * Complete weekly challenge
   */
  static async completeWeeklyChallenge(
    characterId: string
  ): Promise<{ success: boolean; rewards?: any; message?: string }> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    if (!progress.activeWeeklyChallenge) {
      return { success: false, message: 'No active weekly challenge' };
    }

    const challenge = WEEKLY_CHALLENGES.find(c => c.id === progress.activeWeeklyChallenge);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }

    // Award rewards
    await progress.addReputation(challenge.rewards.scarReputation);
    progress.weeklyChallengesCompleted += 1;
    progress.activeWeeklyChallenge = undefined;

    await progress.save();

    return {
      success: true,
      rewards: challenge.rewards,
      message: `Completed: ${challenge.name}`,
    };
  }

  /**
   * Attack elite enemy (simplified combat)
   */
  static async attackElite(
    characterId: string,
    request: AttackEliteRequest
  ): Promise<AttackEliteResponse> {
    const elite = getEliteEnemy(request.eliteId);
    if (!elite) {
      return {
        success: false,
        turnResult: {
          playerDamage: 0,
          eliteDamage: 0,
          sanityLost: 0,
          corruptionGained: 0,
          effects: [],
        },
        message: 'Elite enemy not found',
      };
    }

    const progress = await ScarProgressModel.findOrCreate(characterId);

    // Simplified combat calculation
    const playerDamage = Math.floor(Math.random() * 200) + 100;
    const eliteDamage = Math.floor(Math.random() * elite.damage) + elite.damage / 2;
    const sanityLost = elite.sanityDamage;
    const corruptionGained = Math.floor(elite.corruptionOnKill / 10);

    // Track stats
    progress.totalSanityLost += sanityLost;
    progress.totalCorruptionGained += corruptionGained;
    progress.currentCorruption = Math.min(100, progress.currentCorruption + corruptionGained);

    // Simulate defeat chance (20% per attack)
    const defeated = Math.random() < 0.2;

    if (defeated) {
      await progress.recordEliteDefeat(request.eliteId);
      await progress.addReputation(SCAR_CONSTANTS.ELITE_REPUTATION_BONUS);

      return {
        success: true,
        turnResult: {
          playerDamage,
          eliteDamage,
          sanityLost,
          corruptionGained,
          effects: ['Elite defeated!'],
          defeated: true,
        },
        loot: elite.lootTable.filter(item => Math.random() < item.dropChance),
        message: `Defeated ${elite.name}!`,
      };
    }

    await progress.save();

    return {
      success: true,
      turnResult: {
        playerDamage,
        eliteDamage,
        sanityLost,
        corruptionGained,
        effects: [],
      },
      message: 'Combat continues...',
    };
  }

  /**
   * Use corruption ability
   */
  static async useCorruptionAbility(
    characterId: string,
    request: UseCorruptionAbilityRequest
  ): Promise<UseCorruptionAbilityResponse> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    // Check if ability is unlocked
    if (!progress.unlockedCorruptionAbilities.includes(request.abilityId)) {
      return {
        success: false,
        corruptionGained: 0,
        message: 'Ability not unlocked',
      };
    }

    const ability = CORRUPTION_ABILITIES.find(a => a.id === request.abilityId);
    if (!ability) {
      return {
        success: false,
        corruptionGained: 0,
        message: 'Ability not found',
      };
    }

    // Check corruption mastery requirement
    if (progress.corruptionMastery < ability.requiredMastery) {
      return {
        success: false,
        corruptionGained: 0,
        message: `Requires ${ability.requiredMastery} corruption mastery`,
      };
    }

    // Apply corruption cost
    const corruptionGained = ability.corruptionCost;
    progress.currentCorruption = Math.min(100, progress.currentCorruption + corruptionGained);
    progress.totalCorruptionGained += corruptionGained;

    // Check for backfire
    const backfired = Math.random() < ability.backfireChance;

    await progress.save();

    if (backfired) {
      return {
        success: false,
        corruptionGained,
        backfired: true,
        message: `${ability.name} backfired! ${ability.backfireEffect}`,
      };
    }

    return {
      success: true,
      damage: ability.damage,
      effects: ability.effects.map(e => e.type),
      corruptionGained,
      message: `Used ${ability.name}!`,
    };
  }

  /**
   * Unlock corruption ability
   */
  static async unlockCorruptionAbility(
    characterId: string,
    abilityId: CorruptionAbilityType
  ): Promise<{ success: boolean; message: string }> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    const ability = CORRUPTION_ABILITIES.find(a => a.id === abilityId);
    if (!ability) {
      return { success: false, message: 'Ability not found' };
    }

    if (progress.corruptionMastery < ability.requiredMastery) {
      return {
        success: false,
        message: `Requires ${ability.requiredMastery} corruption mastery`,
      };
    }

    await progress.unlockCorruptionAbility(abilityId);

    return {
      success: true,
      message: `Unlocked ${ability.name}!`,
    };
  }

  /**
   * Get available corruption abilities
   */
  static async getAvailableAbilities(characterId: string): Promise<CorruptionAbility[]> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    return getAvailableAbilities(progress.corruptionMastery);
  }

  /**
   * Reduce corruption (decay over time)
   */
  static async reduceCorruption(characterId: string, amount: number): Promise<void> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    progress.currentCorruption = Math.max(0, progress.currentCorruption - amount);
    await progress.save();
  }

  /**
   * Add time spent in Scar
   */
  static async addTimeInScar(characterId: string, minutes: number): Promise<void> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    progress.timeInScar += minutes;
    await progress.save();
  }

  /**
   * Record death in Scar
   */
  static async recordDeath(characterId: string): Promise<void> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    progress.deathsInScar += 1;
    await progress.save();
  }

  /**
   * Get leaderboard by reputation
   */
  static async getReputationLeaderboard(limit: number = 100) {
    return ScarProgressModel.getTopByReputation(limit);
  }

  /**
   * Get leaderboard by corruption mastery
   */
  static async getCorruptionMasteryLeaderboard(limit: number = 100) {
    return ScarProgressModel.getTopByCorruptionMastery(limit);
  }
}
