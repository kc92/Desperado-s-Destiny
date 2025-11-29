/**
 * Legacy Service
 * Business logic for cross-character progression system
 */

import mongoose from 'mongoose';
import { LegacyProfileModel, ILegacyProfile } from '../models/LegacyProfile.model';
import {
  LegacyProfile,
  LegacyTier,
  LegacyEventType,
  LegacyEventPayload,
  LifetimeStats,
  MilestoneProgress,
  LegacyReward,
  ActiveLegacyBonuses,
  NewCharacterBonuses,
  CharacterLegacyContribution,
  LegacyBonusType,
  ClaimLegacyRewardRequest,
  ClaimLegacyRewardResponse,
} from '@desperados/shared';
import { LEGACY_MILESTONES, getMilestoneById } from '../data/legacy/milestones';
import {
  getTierDefinition,
  getNextTier,
  calculateTierFromMilestones,
  getMilestonesUntilNextTier,
} from '../data/legacy/tiers';

/**
 * Legacy Service Class
 */
class LegacyService {
  /**
   * Get or create legacy profile for a user
   */
  async getLegacyProfile(userId: string): Promise<LegacyProfile> {
    const profile = await LegacyProfileModel.getOrCreate(userId);
    return this.toLegacyProfile(profile);
  }

  /**
   * Update legacy progress based on an event
   */
  async updateLegacyProgress(
    payload: LegacyEventPayload
  ): Promise<LegacyProfile> {
    const profile = await LegacyProfileModel.getOrCreate(payload.userId);

    // Map event to stat updates
    const statUpdates = this.mapEventToStats(payload);

    // Update stats
    for (const [statKey, value] of Object.entries(statUpdates)) {
      profile.updateStat(
        statKey as keyof LifetimeStats,
        value as number,
        true
      );
    }

    // Check milestones
    await this.checkMilestones(profile);

    // Update tier
    const newTier = calculateTierFromMilestones(
      profile.totalMilestonesCompleted
    );
    if (newTier !== profile.currentTier) {
      profile.updateTier(newTier);
    }

    await profile.save();
    return this.toLegacyProfile(profile);
  }

  /**
   * Map event type to stat updates
   */
  private mapEventToStats(
    payload: LegacyEventPayload
  ): Partial<LifetimeStats> {
    const stats: Partial<LifetimeStats> = {};
    const value = payload.value || 1;

    switch (payload.eventType) {
      case LegacyEventType.COMBAT_VICTORY:
        stats.totalEnemiesDefeated = value;
        break;
      case LegacyEventType.BOSS_DEFEATED:
        stats.totalBossesKilled = value;
        stats.totalEnemiesDefeated = value;
        break;
      case LegacyEventType.DUEL_WON:
        stats.totalDuelsWon = value;
        break;
      case LegacyEventType.DUEL_LOST:
        stats.totalDuelsLost = value;
        break;
      case LegacyEventType.GOLD_EARNED:
        stats.totalGoldEarned = value;
        break;
      case LegacyEventType.GOLD_SPENT:
        stats.totalGoldSpent = value;
        break;
      case LegacyEventType.PROPERTY_ACQUIRED:
        stats.totalPropertiesOwned = value;
        break;
      case LegacyEventType.TRADE_COMPLETED:
        stats.totalTradesCompleted = value;
        break;
      case LegacyEventType.ITEM_CRAFTED:
        stats.totalItemsCrafted = value;
        break;
      case LegacyEventType.ITEM_BOUGHT:
        stats.totalItemsBought = value;
        break;
      case LegacyEventType.ITEM_SOLD:
        stats.totalItemsSold = value;
        break;
      case LegacyEventType.GANG_RANK_INCREASED:
        stats.highestGangRank = value;
        break;
      case LegacyEventType.FRIEND_ADDED:
        stats.totalFriendsMade = value;
        break;
      case LegacyEventType.MAIL_SENT:
        stats.totalMailSent = value;
        break;
      case LegacyEventType.REPUTATION_EARNED:
        stats.totalReputationEarned = value;
        break;
      case LegacyEventType.LOCATION_DISCOVERED:
        stats.totalLocationsDiscovered = value;
        break;
      case LegacyEventType.SECRET_FOUND:
        stats.totalSecretsFound = value;
        break;
      case LegacyEventType.RARE_EVENT:
        stats.totalRareEventsWitnessed = value;
        break;
      case LegacyEventType.TERRITORY_CAPTURED:
        stats.totalTerritoriesControlled = value;
        break;
      case LegacyEventType.QUEST_COMPLETED:
        stats.totalQuestsCompleted = value;
        if (payload.metadata?.questType === 'legendary') {
          stats.totalLegendaryQuestsCompleted = value;
        } else if (payload.metadata?.questType === 'story') {
          stats.totalStoryQuestsCompleted = value;
        } else if (payload.metadata?.questType === 'side') {
          stats.totalSideQuestsCompleted = value;
        }
        break;
      case LegacyEventType.SKILL_MAXED:
        stats.totalSkillsMaxed = value;
        break;
      case LegacyEventType.SKILL_POINT_EARNED:
        stats.totalSkillPointsEarned = value;
        break;
      case LegacyEventType.PROFESSION_MASTERED:
        stats.totalProfessionsMastered = value;
        break;
      case LegacyEventType.DAY_PLAYED:
        stats.totalDaysPlayed = value;
        break;
      case LegacyEventType.LOGIN:
        stats.totalLoginsCount = value;
        break;
      case LegacyEventType.SEASONAL_EVENT:
        stats.totalSeasonalEventsParticipated = value;
        break;
      case LegacyEventType.ACHIEVEMENT_UNLOCKED:
        stats.totalAchievementsUnlocked = value;
        break;
      case LegacyEventType.CHARACTER_CREATED:
        stats.totalCharactersCreated = value;
        break;
      case LegacyEventType.CHARACTER_RETIRED:
        stats.totalCharactersRetired = value;
        break;
      case LegacyEventType.LEVEL_UP:
        if (value > (stats.highestLevelReached || 0)) {
          stats.highestLevelReached = value;
        }
        break;
      case LegacyEventType.FAME_GAINED:
        if (value > (stats.highestFameReached || 0)) {
          stats.highestFameReached = value;
        }
        break;
    }

    return stats;
  }

  /**
   * Check and award milestones
   */
  async checkMilestones(profile: ILegacyProfile): Promise<string[]> {
    const newlyCompleted: string[] = [];

    for (const milestone of LEGACY_MILESTONES) {
      // Skip if already completed (and not repeatable)
      if (
        !milestone.repeatable &&
        profile.completedMilestones.includes(milestone.id)
      ) {
        continue;
      }

      const statKey = milestone.statKey as keyof LifetimeStats;
      const currentValue = (profile.lifetimeStats[statKey] as number) || 0;

      // Update progress
      profile.updateMilestoneProgress(
        milestone.id,
        currentValue,
        milestone.requirement
      );

      // Check if milestone is complete
      if (currentValue >= milestone.requirement) {
        const wasAlreadyCompleted =
          profile.completedMilestones.includes(milestone.id);

        if (!wasAlreadyCompleted || milestone.repeatable) {
          profile.completeMilestone(milestone.id);
          newlyCompleted.push(milestone.id);

          // Add rewards
          for (const bonus of milestone.rewards) {
            const reward: LegacyReward = {
              id: `${milestone.id}_${Date.now()}`,
              name: `${milestone.name} Reward`,
              description: bonus.description,
              icon: bonus.icon,
              bonus: bonus,
              unlockedAt: new Date(),
              claimed: false,
              oneTimeUse: !milestone.repeatable,
            };
            profile.addReward(reward);
          }
        }
      }
    }

    return newlyCompleted;
  }

  /**
   * Calculate tier
   */
  calculateTier(profile: LegacyProfile): LegacyTier {
    return calculateTierFromMilestones(profile.totalMilestonesCompleted);
  }

  /**
   * Get bonuses for new character creation
   */
  async getNewCharacterBonuses(userId: string): Promise<NewCharacterBonuses> {
    const profile = await LegacyProfileModel.getOrCreate(userId);
    const tierDefinition = getTierDefinition(profile.currentTier);

    // Collect all bonuses from tier
    const tierBonuses = tierDefinition.bonuses;

    // Collect all bonuses from completed milestones
    const milestoneBonuses = profile.rewards
      .filter((r) => !r.claimed || !r.oneTimeUse)
      .map((r) => r.bonus);

    // Calculate active bonuses
    const allBonuses = this.calculateActiveBonuses([
      ...tierBonuses,
      ...milestoneBonuses,
    ]);

    // Get available rewards
    const availableRewards = profile.rewards.filter((r) => !r.claimed);

    return {
      tier: profile.currentTier,
      tierBonuses,
      milestoneBonuses,
      allBonuses,
      availableRewards,
    };
  }

  /**
   * Aggregate character stats when character is retired/deleted
   */
  async aggregateCharacterStats(
    userId: string,
    characterId: string,
    characterName: string,
    characterLevel: number,
    characterStats: Partial<LifetimeStats>,
    retired: boolean = false
  ): Promise<LegacyProfile> {
    const profile = await LegacyProfileModel.getOrCreate(userId);

    // Add character contribution
    const contribution: CharacterLegacyContribution = {
      characterId,
      characterName,
      level: characterLevel,
      playedFrom: new Date(), // Should ideally be character creation date
      playedUntil: new Date(),
      retired,
      stats: characterStats,
      notableMilestones: [],
    };

    profile.addCharacterContribution(contribution);

    // Add stats to lifetime totals
    for (const [key, value] of Object.entries(characterStats)) {
      if (typeof value === 'number') {
        profile.updateStat(key as keyof LifetimeStats, value, true);
      }
    }

    // Update retired/created count
    if (retired) {
      profile.updateStat('totalCharactersRetired', 1, true);
    }

    await profile.save();
    return this.toLegacyProfile(profile);
  }

  /**
   * Get bonus multipliers for a user
   */
  async getBonusMultipliers(userId: string): Promise<ActiveLegacyBonuses> {
    const bonuses = await this.getNewCharacterBonuses(userId);
    return bonuses.allBonuses;
  }

  /**
   * Calculate active bonuses from list of legacy bonuses
   */
  private calculateActiveBonuses(
    bonuses: Array<{ type: LegacyBonusType; value: any }>
  ): ActiveLegacyBonuses {
    const active: ActiveLegacyBonuses = {
      xpMultiplier: 1.0,
      goldMultiplier: 1.0,
      energyMultiplier: 1.0,
      fameMultiplier: 1.0,
      startingGold: 0,
      startingItems: [],
      startingSkillBonus: 0,
      startingReputation: 0,
      unlockedClasses: [],
      unlockedFeatures: [],
      cosmetics: [],
    };

    for (const bonus of bonuses) {
      switch (bonus.type) {
        case LegacyBonusType.XP_MULTIPLIER:
          active.xpMultiplier += bonus.value;
          break;
        case LegacyBonusType.GOLD_MULTIPLIER:
          active.goldMultiplier += bonus.value;
          break;
        case LegacyBonusType.ENERGY_BONUS:
          active.energyMultiplier += bonus.value;
          break;
        case LegacyBonusType.FAME_BONUS:
          active.fameMultiplier += bonus.value;
          break;
        case LegacyBonusType.STARTING_GOLD:
          active.startingGold += bonus.value;
          break;
        case LegacyBonusType.STARTING_ITEMS:
          if (Array.isArray(bonus.value)) {
            active.startingItems.push(...bonus.value);
          } else {
            active.startingItems.push(bonus.value);
          }
          break;
        case LegacyBonusType.STARTING_SKILLS:
          active.startingSkillBonus += bonus.value;
          break;
        case LegacyBonusType.STARTING_REPUTATION:
          active.startingReputation += bonus.value;
          break;
        case LegacyBonusType.UNLOCK_CLASS:
          if (!active.unlockedClasses.includes(bonus.value)) {
            active.unlockedClasses.push(bonus.value);
          }
          break;
        case LegacyBonusType.UNLOCK_FEATURE:
          if (!active.unlockedFeatures.includes(bonus.value)) {
            active.unlockedFeatures.push(bonus.value);
          }
          break;
        case LegacyBonusType.COSMETIC:
          if (!active.cosmetics.includes(bonus.value)) {
            active.cosmetics.push(bonus.value);
          }
          break;
      }
    }

    return active;
  }

  /**
   * Claim a legacy reward
   */
  async claimReward(
    request: ClaimLegacyRewardRequest
  ): Promise<ClaimLegacyRewardResponse> {
    const profile = await LegacyProfileModel.findOne({
      'rewards.id': request.rewardId,
    });

    if (!profile) {
      throw new Error('Reward not found');
    }

    const reward = profile.claimReward(request.rewardId, request.characterId);

    if (!reward) {
      throw new Error('Reward already claimed or not available');
    }

    await profile.save();

    return {
      success: true,
      reward,
      appliedBonus: reward.bonus,
    };
  }

  /**
   * Get milestone progress for a user
   */
  async getMilestoneProgress(userId: string): Promise<MilestoneProgress[]> {
    const profile = await LegacyProfileModel.getOrCreate(userId);
    return profile.milestoneProgress;
  }

  /**
   * Get completed milestones
   */
  async getCompletedMilestones(userId: string): Promise<string[]> {
    const profile = await LegacyProfileModel.getOrCreate(userId);
    return profile.completedMilestones;
  }

  /**
   * Get available rewards
   */
  async getAvailableRewards(userId: string): Promise<LegacyReward[]> {
    const profile = await LegacyProfileModel.getOrCreate(userId);
    return profile.rewards.filter((r) => !r.claimed);
  }

  /**
   * Get legacy profile with full details
   */
  async getLegacyProfileWithDetails(userId: string) {
    const profile = await this.getLegacyProfile(userId);
    const tierDefinition = getTierDefinition(profile.currentTier);
    const nextTier = getNextTier(profile.currentTier);
    const milestonesUntilNextTier = getMilestonesUntilNextTier(
      profile.totalMilestonesCompleted,
      profile.currentTier
    );
    const activeBonuses = await this.getBonusMultipliers(userId);

    return {
      profile,
      tierDefinition,
      nextTier,
      milestonesUntilNextTier,
      activeBonuses,
    };
  }

  /**
   * Convert Mongoose document to plain LegacyProfile
   */
  private toLegacyProfile(doc: ILegacyProfile): LegacyProfile {
    return {
      userId: doc.userId.toString(),
      currentTier: doc.currentTier,
      lifetimeStats: doc.lifetimeStats,
      milestoneProgress: doc.milestoneProgress,
      completedMilestones: doc.completedMilestones,
      rewards: doc.rewards,
      characterContributions: doc.characterContributions,
      totalMilestonesCompleted: doc.totalMilestonesCompleted,
      lastUpdated: doc.lastUpdated,
      createdAt: doc.createdAt,
    };
  }

  /**
   * Update specific stat directly (for admin/testing)
   */
  async updateStat(
    userId: string,
    statKey: keyof LifetimeStats,
    value: number,
    increment: boolean = true
  ): Promise<LegacyProfile> {
    const profile = await LegacyProfileModel.getOrCreate(userId);
    profile.updateStat(statKey, value, increment);

    // Check milestones after stat update
    await this.checkMilestones(profile);

    // Update tier if needed
    const newTier = calculateTierFromMilestones(profile.totalMilestonesCompleted);
    if (newTier !== profile.currentTier) {
      profile.updateTier(newTier);
    }

    await profile.save();
    return this.toLegacyProfile(profile);
  }
}

export const legacyService = new LegacyService();
