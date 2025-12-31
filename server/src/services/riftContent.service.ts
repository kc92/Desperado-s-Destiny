/**
 * Rift Content Service - Divine Struggle System
 *
 * Manages end-game content, zone access, challenges, and progression in The Rift
 * Rebranded from Scar Content Service (cosmic horror → angels & demons)
 */

import { ScarProgressModel, ScarProgressDocument } from '../models/ScarProgress.model';
import { SCAR_ZONES as RIFT_ZONES, getScarZone as getRiftZone, getAccessibleZones } from '../data/scarZones';
import { ELITE_ENEMIES, getEliteEnemy } from '../data/eliteEnemies';
import {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  CORRUPTION_ABILITIES as SIN_ABILITIES,
  getRandomDailyChallenge,
  getRandomWeeklyChallenge,
  getAvailableAbilities,
} from '../data/endGameRewards';
import {
  ScarZone as RiftZone,
  EndGameZone,
  ScarProgress as RiftProgress,
  DailyChallenge,
  WeeklyChallenge,
  CorruptionAbility as SinAbility,
  CorruptionAbilityType as SinAbilityType,
  AttackEliteRequest,
  AttackEliteResponse,
  UseCorruptionAbilityRequest as UseSinAbilityRequest,
  UseCorruptionAbilityResponse as UseSinAbilityResponse,
  canEnterZone,
  SCAR_CONSTANTS as RIFT_CONSTANTS,
} from '@desperados/shared';
import { SecureRNG } from './base/SecureRNG';

// Import original service for reference (use ScarContentService directly if you need the original)
import { ScarContentService as OriginalScarContentService } from './scarContent.service';
export const ScarContentServiceRef = OriginalScarContentService;

/**
 * Rift Content Service - Divine end-game content
 */
export class RiftContentService {
  /**
   * Get or create player's Rift progress
   */
  static async getProgress(characterId: string): Promise<RiftProgress> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    return progress.toObject();
  }

  /**
   * Check if player can enter a zone
   */
  static async canEnterZone(
    characterId: string,
    characterLevel: number,
    zone: RiftZone
  ): Promise<{ canEnter: boolean; requirements: string[] }> {
    const zoneData = getRiftZone(zone);
    if (!zoneData) {
      return { canEnter: false, requirements: ['Zone not found'] };
    }

    const progress = await ScarProgressModel.findOrCreate(characterId);
    const missingRequirements: string[] = [];

    // Check level requirement
    if (!canEnterZone(characterLevel, zone)) {
      missingRequirements.push(
        `Level ${RIFT_CONSTANTS.ZONE_LEVEL_REQUIREMENTS[zone]} required`
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
          // This would check character's faith/spiritual fortitude
          break;

        case 'quest':
          // This would check divine quest completion
          break;
      }
    }

    return {
      canEnter: missingRequirements.length === 0,
      requirements: missingRequirements,
    };
  }

  /**
   * Enter a Rift zone
   */
  static async enterZone(
    characterId: string,
    characterLevel: number,
    zone: RiftZone
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

    const zoneData = getRiftZone(zone);
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
   * Attack elite enemy (demon/fallen angel)
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
          sanityLost: 0, // Faith lost
          corruptionGained: 0, // Sin gained
          effects: [],
        },
        message: 'Elite enemy not found',
      };
    }

    const progress = await ScarProgressModel.findOrCreate(characterId);

    // Simplified combat calculation
    const playerDamage = SecureRNG.range(100, 300);
    const eliteDamage = SecureRNG.range(Math.floor(elite.damage / 2), elite.damage);
    const faithLost = elite.sanityDamage;
    const sinGained = Math.floor(elite.corruptionOnKill / 10);

    // Track stats
    progress.totalSanityLost += faithLost;
    progress.totalCorruptionGained += sinGained;
    progress.currentCorruption = Math.min(100, progress.currentCorruption + sinGained);

    // Simulate defeat chance (20% per attack)
    const defeated = SecureRNG.chance(0.2);

    if (defeated) {
      await progress.recordEliteDefeat(request.eliteId);
      await progress.addReputation(RIFT_CONSTANTS.ELITE_REPUTATION_BONUS);

      return {
        success: true,
        turnResult: {
          playerDamage,
          eliteDamage,
          sanityLost: faithLost,
          corruptionGained: sinGained,
          effects: ['Elite vanquished!'],
          defeated: true,
        },
        loot: elite.lootTable.filter(item => SecureRNG.chance(item.dropChance)),
        message: `Vanquished ${elite.name}!`,
      };
    }

    await progress.save();

    return {
      success: true,
      turnResult: {
        playerDamage,
        eliteDamage,
        sanityLost: faithLost,
        corruptionGained: sinGained,
        effects: [],
      },
      message: 'The battle continues...',
    };
  }

  /**
   * Use sin ability (dark power from demonic influence)
   */
  static async useSinAbility(
    characterId: string,
    request: UseSinAbilityRequest
  ): Promise<UseSinAbilityResponse> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    // Check if ability is unlocked
    if (!progress.unlockedCorruptionAbilities.includes(request.abilityId)) {
      return {
        success: false,
        corruptionGained: 0,
        message: 'Ability not unlocked',
      };
    }

    const ability = SIN_ABILITIES.find(a => a.id === request.abilityId);
    if (!ability) {
      return {
        success: false,
        corruptionGained: 0,
        message: 'Ability not found',
      };
    }

    // Check sin mastery requirement
    if (progress.corruptionMastery < ability.requiredMastery) {
      return {
        success: false,
        corruptionGained: 0,
        message: `Requires ${ability.requiredMastery} sin mastery`,
      };
    }

    // Apply sin cost
    const sinGained = ability.corruptionCost;
    progress.currentCorruption = Math.min(100, progress.currentCorruption + sinGained);
    progress.totalCorruptionGained += sinGained;

    // Check for divine rejection (backfire)
    const backfired = SecureRNG.chance(ability.backfireChance);

    await progress.save();

    if (backfired) {
      return {
        success: false,
        corruptionGained: sinGained,
        backfired: true,
        message: `${ability.name} was rejected by the divine! ${ability.backfireEffect}`,
      };
    }

    return {
      success: true,
      damage: ability.damage,
      effects: ability.effects.map(e => e.type),
      corruptionGained: sinGained,
      message: `Invoked ${ability.name}!`,
    };
  }

  /**
   * Unlock sin ability
   */
  static async unlockSinAbility(
    characterId: string,
    abilityId: SinAbilityType
  ): Promise<{ success: boolean; message: string }> {
    const progress = await ScarProgressModel.findOrCreate(characterId);

    const ability = SIN_ABILITIES.find(a => a.id === abilityId);
    if (!ability) {
      return { success: false, message: 'Ability not found' };
    }

    if (progress.corruptionMastery < ability.requiredMastery) {
      return {
        success: false,
        message: `Requires ${ability.requiredMastery} sin mastery`,
      };
    }

    await progress.unlockCorruptionAbility(abilityId);

    return {
      success: true,
      message: `Unlocked ${ability.name}!`,
    };
  }

  /**
   * Get available sin abilities
   */
  static async getAvailableAbilities(characterId: string): Promise<SinAbility[]> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    return getAvailableAbilities(progress.corruptionMastery);
  }

  /**
   * Reduce sin (absolution/decay over time)
   */
  static async reduceSin(characterId: string, amount: number): Promise<void> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    progress.currentCorruption = Math.max(0, progress.currentCorruption - amount);
    await progress.save();
  }

  /**
   * Add time spent in The Rift
   */
  static async addTimeInRift(characterId: string, minutes: number): Promise<void> {
    const progress = await ScarProgressModel.findOrCreate(characterId);
    progress.timeInScar += minutes;
    await progress.save();
  }

  /**
   * Record death in The Rift
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
   * Get leaderboard by sin mastery
   */
  static async getSinMasteryLeaderboard(limit: number = 100) {
    return ScarProgressModel.getTopByCorruptionMastery(limit);
  }
}

// Backwards compatibility alias
export const ScarContentService = RiftContentService;
