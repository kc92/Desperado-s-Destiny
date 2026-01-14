/**
 * Monetization Service
 *
 * Core service for calculating player bonuses from subscriptions and ad rewards.
 * Implements the FAIR monetization model where:
 * - Subscribers get permanent +50% bonuses
 * - Free players get the SAME +50% bonuses but time-limited (from ads)
 *
 * This service is the single source of truth for player multipliers.
 */

import mongoose from 'mongoose';
import { Subscription, SUBSCRIPTION_BENEFITS } from '../models/Subscription.model';
import { AdReward, AdRewardType, AD_REWARD_CONFIG, IActiveBonus } from '../models/AdReward.model';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * Player's current effective bonuses
 */
export interface PlayerBonuses {
  // Multipliers (1.0 = no bonus, 1.5 = +50%)
  xpMultiplier: number;
  goldMultiplier: number;
  energyRegenMultiplier: number;

  // Source of bonuses
  isSubscriber: boolean;
  hasAdBoost: {
    xp: boolean;
    gold: boolean;
    energy: boolean;
  };

  // Time remaining on ad boosts (seconds)
  adBoostTimeRemaining: {
    xp: number;
    gold: number;
    energy: number;
  };

  // Can watch more ads today?
  canWatchAds: {
    xpBoost: boolean;
    goldBoost: boolean;
    energyBoost: boolean;
    energyRefill: boolean;
  };

  // Daily ad views
  dailyAdViews: {
    xpBoost: number;
    goldBoost: number;
    energyBoost: number;
    energyRefill: number;
  };
}

/**
 * Monetization Service
 */
export const MonetizationService = {
  /**
   * Get player's current effective bonuses
   * Combines subscription bonuses with ad reward bonuses
   */
  async getPlayerBonuses(characterId: mongoose.Types.ObjectId): Promise<PlayerBonuses> {
    // Get character to find userId
    const character = await Character.findById(characterId).select('userId');
    if (!character) {
      throw new Error('Character not found');
    }

    // Get subscription status
    const subscription = await Subscription.getOrCreateForUser(character.userId);
    const isSubscriber = subscription.isActive();

    // Get ad reward status
    const adReward = await AdReward.getOrCreateForCharacter(characterId);
    adReward.cleanExpiredBonuses();
    adReward.resetDailyIfNeeded();

    // Calculate effective multipliers
    // Subscribers get permanent bonuses, free players get from ads
    let xpMultiplier = 1.0;
    let goldMultiplier = 1.0;
    let energyRegenMultiplier = 1.0;

    const hasAdBoost = {
      xp: false,
      gold: false,
      energy: false
    };

    const adBoostTimeRemaining = {
      xp: 0,
      gold: 0,
      energy: 0
    };

    if (isSubscriber) {
      // Subscribers get permanent bonuses
      xpMultiplier = SUBSCRIPTION_BENEFITS.xpMultiplier;
      goldMultiplier = SUBSCRIPTION_BENEFITS.goldMultiplier;
      energyRegenMultiplier = SUBSCRIPTION_BENEFITS.energyRegenMultiplier;
    } else {
      // Free players - check for ad bonuses
      const xpBonus = adReward.getActiveBonus(AdRewardType.XP_BOOST);
      const goldBonus = adReward.getActiveBonus(AdRewardType.GOLD_BOOST);
      const energyBonus = adReward.getActiveBonus(AdRewardType.ENERGY_BOOST);

      if (xpBonus) {
        xpMultiplier = xpBonus.multiplier;
        hasAdBoost.xp = true;
        adBoostTimeRemaining.xp = Math.max(0, Math.floor((xpBonus.expiresAt.getTime() - Date.now()) / 1000));
      }

      if (goldBonus) {
        goldMultiplier = goldBonus.multiplier;
        hasAdBoost.gold = true;
        adBoostTimeRemaining.gold = Math.max(0, Math.floor((goldBonus.expiresAt.getTime() - Date.now()) / 1000));
      }

      if (energyBonus) {
        energyRegenMultiplier = energyBonus.multiplier;
        hasAdBoost.energy = true;
        adBoostTimeRemaining.energy = Math.max(0, Math.floor((energyBonus.expiresAt.getTime() - Date.now()) / 1000));
      }
    }

    // Check what ads can be watched today
    const canWatchAds = {
      xpBoost: !isSubscriber && adReward.canWatchAd(AdRewardType.XP_BOOST),
      goldBoost: !isSubscriber && adReward.canWatchAd(AdRewardType.GOLD_BOOST),
      energyBoost: !isSubscriber && adReward.canWatchAd(AdRewardType.ENERGY_BOOST),
      energyRefill: adReward.canWatchAd(AdRewardType.ENERGY_REFILL) // Even subscribers can get energy refills
    };

    // Get daily view counts
    const dailyAdViews = {
      xpBoost: adReward.dailyViews.get(AdRewardType.XP_BOOST) || 0,
      goldBoost: adReward.dailyViews.get(AdRewardType.GOLD_BOOST) || 0,
      energyBoost: adReward.dailyViews.get(AdRewardType.ENERGY_BOOST) || 0,
      energyRefill: adReward.dailyViews.get(AdRewardType.ENERGY_REFILL) || 0
    };

    return {
      xpMultiplier,
      goldMultiplier,
      energyRegenMultiplier,
      isSubscriber,
      hasAdBoost,
      adBoostTimeRemaining,
      canWatchAds,
      dailyAdViews
    };
  },

  /**
   * Apply XP multiplier to an amount
   */
  async applyXpMultiplier(characterId: mongoose.Types.ObjectId, baseXp: number): Promise<number> {
    const bonuses = await this.getPlayerBonuses(characterId);
    return Math.floor(baseXp * bonuses.xpMultiplier);
  },

  /**
   * Apply gold multiplier to an amount
   */
  async applyGoldMultiplier(characterId: mongoose.Types.ObjectId, baseGold: number): Promise<number> {
    const bonuses = await this.getPlayerBonuses(characterId);
    return Math.floor(baseGold * bonuses.goldMultiplier);
  },

  /**
   * Get energy regen multiplier for a character
   */
  async getEnergyRegenMultiplier(characterId: mongoose.Types.ObjectId): Promise<number> {
    const bonuses = await this.getPlayerBonuses(characterId);
    return bonuses.energyRegenMultiplier;
  },

  /**
   * Record an ad view and grant the reward
   */
  async recordAdView(
    characterId: mongoose.Types.ObjectId,
    rewardType: AdRewardType
  ): Promise<{ success: boolean; reward?: IActiveBonus | number; error?: string }> {
    const adReward = await AdReward.getOrCreateForCharacter(characterId);
    adReward.resetDailyIfNeeded();

    // Check if player can watch this ad type
    if (!adReward.canWatchAd(rewardType)) {
      const config = AD_REWARD_CONFIG[rewardType];
      return {
        success: false,
        error: `Daily limit reached (${config.dailyCap}/day)`
      };
    }

    const config = AD_REWARD_CONFIG[rewardType];

    // Increment daily view count
    const currentViews = adReward.dailyViews.get(rewardType) || 0;
    adReward.dailyViews.set(rewardType, currentViews + 1);
    adReward.totalAdsWatched += 1;

    // Handle different reward types
    if ('durationMinutes' in config) {
      // Timed bonus reward
      const now = new Date();
      const expiresAt = new Date(now.getTime() + config.durationMinutes * 60 * 1000);

      // Remove existing bonus of this type if any
      adReward.activeBonuses = adReward.activeBonuses.filter(b => b.type !== rewardType);

      // Add new bonus
      const newBonus: IActiveBonus = {
        type: rewardType,
        multiplier: config.multiplier,
        startedAt: now,
        expiresAt
      };
      adReward.activeBonuses.push(newBonus);

      // Track stats
      if (rewardType === AdRewardType.XP_BOOST) {
        adReward.totalXpBoostMinutes += config.durationMinutes;
      } else if (rewardType === AdRewardType.GOLD_BOOST) {
        adReward.totalGoldBoostMinutes += config.durationMinutes;
      } else if (rewardType === AdRewardType.ENERGY_BOOST) {
        adReward.totalEnergyBoostMinutes += config.durationMinutes;
      }

      await adReward.save();

      logger.info('Ad reward granted: timed bonus', {
        characterId: characterId.toString(),
        rewardType,
        durationMinutes: config.durationMinutes,
        expiresAt
      });

      return { success: true, reward: newBonus };
    }

    if ('instantReward' in config) {
      // Instant energy refill
      const character = await Character.findById(characterId);
      if (character) {
        character.energy = Math.min(character.maxEnergy, character.energy + config.instantReward);
        await character.save();
      }

      await adReward.save();

      logger.info('Ad reward granted: instant energy', {
        characterId: characterId.toString(),
        rewardType,
        amount: config.instantReward
      });

      return { success: true, reward: config.instantReward };
    }

    if (rewardType === AdRewardType.EXTRA_CONTRACT) {
      adReward.pendingExtraContracts += 1;
      await adReward.save();

      logger.info('Ad reward granted: extra contract', {
        characterId: characterId.toString()
      });

      return { success: true, reward: 1 };
    }

    if (rewardType === AdRewardType.BONUS_GOLD) {
      adReward.pendingBonusGoldUses += 1;
      await adReward.save();

      logger.info('Ad reward granted: bonus gold use', {
        characterId: characterId.toString()
      });

      return { success: true, reward: 1 };
    }

    await adReward.save();
    return { success: true };
  },

  /**
   * Check if player should see ads (not a subscriber)
   */
  async shouldShowAds(characterId: mongoose.Types.ObjectId): Promise<boolean> {
    const character = await Character.findById(characterId).select('userId');
    if (!character) return true;

    const subscription = await Subscription.getOrCreateForUser(character.userId);
    return !subscription.isActive();
  },

  /**
   * Get ad reward status summary for UI
   */
  async getAdRewardStatus(characterId: mongoose.Types.ObjectId): Promise<{
    activeBonuses: Array<{
      type: AdRewardType;
      timeRemainingSeconds: number;
      multiplier: number;
    }>;
    dailyViewsRemaining: Record<string, number>;
    pendingRewards: {
      bonusGoldUses: number;
      extraContracts: number;
    };
  }> {
    const adReward = await AdReward.getOrCreateForCharacter(characterId);
    adReward.cleanExpiredBonuses();
    adReward.resetDailyIfNeeded();

    const now = Date.now();

    // Map active bonuses with time remaining
    const activeBonuses = adReward.activeBonuses.map(bonus => ({
      type: bonus.type,
      timeRemainingSeconds: Math.max(0, Math.floor((bonus.expiresAt.getTime() - now) / 1000)),
      multiplier: bonus.multiplier
    }));

    // Calculate remaining views for each type
    const dailyViewsRemaining: Record<string, number> = {};
    for (const [type, config] of Object.entries(AD_REWARD_CONFIG)) {
      const viewed = adReward.dailyViews.get(type as AdRewardType) || 0;
      dailyViewsRemaining[type] = Math.max(0, config.dailyCap - viewed);
    }

    return {
      activeBonuses,
      dailyViewsRemaining,
      pendingRewards: {
        bonusGoldUses: adReward.pendingBonusGoldUses,
        extraContracts: adReward.pendingExtraContracts
      }
    };
  },

  /**
   * Consume a pending bonus gold use
   */
  async consumeBonusGoldUse(characterId: mongoose.Types.ObjectId): Promise<boolean> {
    const adReward = await AdReward.findByCharacterId(characterId);
    if (!adReward || adReward.pendingBonusGoldUses <= 0) {
      return false;
    }

    adReward.pendingBonusGoldUses -= 1;
    await adReward.save();
    return true;
  },

  /**
   * Consume a pending extra contract
   */
  async consumeExtraContract(characterId: mongoose.Types.ObjectId): Promise<boolean> {
    const adReward = await AdReward.findByCharacterId(characterId);
    if (!adReward || adReward.pendingExtraContracts <= 0) {
      return false;
    }

    adReward.pendingExtraContracts -= 1;
    await adReward.save();
    return true;
  }
};

export default MonetizationService;
