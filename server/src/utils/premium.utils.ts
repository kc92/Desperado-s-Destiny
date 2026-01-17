/**
 * Premium Utility
 * Handles premium status checks and benefit calculations
 * Caches results for 5 minutes to reduce database load
 *
 * PHASE 19 BALANCE: Premium = TIME ADVANTAGE ONLY
 * - NO power bonuses (HP, damage, etc.)
 * - Faster progression (energy regen, XP bonuses)
 * - Convenience features (extra slots, discounts)
 *
 * This ensures premium never feels "pay to win" - it just saves time.
 *
 * PLAYTEST MODE: Set PLAYTEST_MODE=true to give everyone premium for free
 */

/**
 * PLAYTEST MODE: When enabled, all players get premium benefits for free
 * Set PLAYTEST_MODE=true in environment to enable
 */
const PLAYTEST_MODE = process.env.PLAYTEST_MODE === 'true';

import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import { Subscription, SubscriptionStatus } from '../models/Subscription.model';
import { AdReward, AdRewardType } from '../models/AdReward.model';
import logger from './logger';

// Redis client for caching (loaded dynamically)
let redisClientCache: any = null;

function getRedisClient() {
  if (!redisClientCache) {
    try {
      const redis = require('../config/redis');
      // Use the exported getRedisClient function to get the connected client
      if (redis.isRedisConnected && redis.isRedisConnected()) {
        redisClientCache = redis.getRedisClient();
      } else {
        return null;
      }
    } catch (error) {
      logger.warn('Redis not available for premium caching, will query DB each time');
      return null;
    }
  }
  return redisClientCache;
}

// =============================================================================
// TYPES
// =============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  benefits: {
    energyRegenBonus: number; // Percentage faster (e.g., 1.5 = 50% faster)
    maxEnergyBonus: number; // Flat bonus to max energy
    /**
     * @deprecated PHASE 19: HP bonus removed - premium should not affect combat power
     * Kept at 1.0 for backwards compatibility with any code that references it
     */
    hpBonus: number;
    goldBonus: number; // Percentage bonus on gold drops (REDUCED in Phase 19)
    xpBonus: number; // Character XP bonus
    skillXpBonus: number; // Skill training XP bonus (NEW in Phase 19)
    bankSlotBonus: number; // Extra bank slots (convenience)
    fastTravelDiscount: number; // Discount on fast travel costs (convenience)
    trainingTimeReduction: number; // Percentage reduction (e.g., 0.25 = 25% faster)
    maxConcurrentTraining: number; // Number of skills that can train simultaneously
  };
}

export interface PremiumBenefits {
  isPremium: boolean;
  plan: SubscriptionPlan;
}

// =============================================================================
// DEFAULT PLANS
// =============================================================================

const FREE_PLAN: SubscriptionPlan = {
  id: 'free',
  name: 'Free',
  monthlyPrice: 0,
  benefits: {
    energyRegenBonus: 1.0,
    maxEnergyBonus: 0,
    hpBonus: 1.0, // No bonus
    goldBonus: 1.0,
    xpBonus: 1.0,
    skillXpBonus: 1.0,
    bankSlotBonus: 0,
    fastTravelDiscount: 0,
    trainingTimeReduction: 0, // No reduction
    maxConcurrentTraining: 1, // 1 skill at a time
  },
};

/**
 * PHASE 19 BALANCE: Premium benefits rebalanced for TIME ADVANTAGE ONLY
 *
 * REMOVED:
 * - hpBonus: Was 1.2 (+20% HP) - POWER CREEP, now 1.0
 *
 * REDUCED:
 * - goldBonus: Was 1.25 (+25%), now 1.10 (+10%)
 *
 * KEPT:
 * - energyRegenBonus: 1.5 (+50% faster) - TIME advantage
 * - maxEnergyBonus: 50 - Convenience
 * - xpBonus: 1.10 (+10% character XP) - TIME advantage
 *
 * ADDED:
 * - skillXpBonus: 1.25 (+25% skill XP) - TIME advantage for skill training
 * - bankSlotBonus: 50 extra slots - Convenience
 * - fastTravelDiscount: 0.50 (50% off) - Convenience
 * - trainingTimeReduction: 0.25 (25% faster) - TIME advantage for passive training
 * - maxConcurrentTraining: 2 (train 2 skills at once) - Convenience
 */
const PREMIUM_PLAN: SubscriptionPlan = {
  id: 'premium',
  name: 'Premium',
  monthlyPrice: 9.99,
  benefits: {
    energyRegenBonus: 1.5, // 50% faster energy regen (TIME advantage)
    maxEnergyBonus: 50, // +50 max energy (convenience)
    hpBonus: 1.0, // REMOVED: No HP bonus - premium should not affect combat power
    goldBonus: 1.10, // REDUCED: +10% gold (was +25%)
    xpBonus: 1.10, // +10% character XP (TIME advantage)
    skillXpBonus: 1.25, // NEW: +25% skill training XP (TIME advantage)
    bankSlotBonus: 50, // NEW: +50 bank slots (convenience)
    fastTravelDiscount: 0.50, // NEW: 50% off fast travel (convenience)
    trainingTimeReduction: 0.25, // NEW: 25% faster passive training (TIME advantage)
    maxConcurrentTraining: 2, // NEW: Train 2 skills simultaneously (convenience)
  },
};

// =============================================================================
// PREMIUM UTILS
// =============================================================================

export class PremiumUtils {
  static readonly CACHE_TTL_SECONDS = 300; // 5 minutes

  /**
   * Get user's premium status and benefits
   * Caches result for 5 minutes to reduce DB load
   *
   * @param userId - User ID
   * @returns Premium benefits object
   */
  static async getPremiumBenefits(userId: string): Promise<PremiumBenefits> {
    // Check cache first
    const redis = getRedisClient();
    if (redis) {
      try {
        const cacheKey = `premium:${userId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        logger.warn('Redis cache check failed for premium status:', error);
      }
    }

    // Fetch from database
    const user = await User.findById(userId);
    if (!user) {
      return { isPremium: false, plan: FREE_PLAN };
    }

    // Check subscription status (now async)
    const isPremium = await this.checkSubscriptionActive(user);
    const plan = isPremium ? PREMIUM_PLAN : FREE_PLAN;

    const result: PremiumBenefits = { isPremium, plan };

    // Cache result
    if (redis) {
      try {
        const cacheKey = `premium:${userId}`;
        await redis.setEx(cacheKey, this.CACHE_TTL_SECONDS, JSON.stringify(result));
      } catch (error) {
        logger.warn('Failed to cache premium status:', error);
      }
    }

    return result;
  }

  /**
   * Get premium benefits by character ID
   * Looks up the character's user and returns their premium status
   *
   * @param characterId - Character ID
   * @returns Premium benefits object
   */
  static async getPremiumBenefitsByCharacter(
    characterId: string
  ): Promise<PremiumBenefits> {
    const character = await Character.findById(characterId);
    if (!character || !character.userId) {
      return { isPremium: false, plan: FREE_PLAN };
    }
    return this.getPremiumBenefits(character.userId.toString());
  }

  /**
   * Check if user's subscription is currently active
   * Uses the Subscription model with Stripe integration
   *
   * @param user - User document
   * @returns true if subscription is active
   */
  private static async checkSubscriptionActive(user: any): Promise<boolean> {
    // PLAYTEST MODE: Everyone gets premium for free!
    if (PLAYTEST_MODE) {
      return true;
    }

    // Check Subscription model
    const subscription = await Subscription.findByUserId(user._id);
    return subscription?.isActive() ?? false;
  }

  /**
   * Calculate HP with premium bonus
   *
   * @deprecated PHASE 19: Premium no longer affects HP - this always returns base HP
   * Kept for backwards compatibility but logs a warning if called
   *
   * @param baseHP - Base HP amount
   * @param characterId - Character ID
   * @returns HP unchanged (premium HP bonus removed)
   */
  static async calculateHPWithBonus(baseHP: number, characterId: string): Promise<number> {
    // PHASE 19: HP bonus removed - premium should not affect combat power
    // Log warning to help identify code that still calls this
    logger.warn(
      'calculateHPWithBonus called but HP bonus has been removed in Phase 19. ' +
      'Premium no longer affects combat power. Returning base HP unchanged.',
      { characterId, baseHP }
    );
    return baseHP; // Always return base HP - no premium bonus
  }

  /**
   * Calculate gold with premium OR ad bonus
   * Subscribers get permanent bonus, free players can get same bonus from ads
   *
   * @param baseGold - Base gold amount
   * @param userId - User ID
   * @param characterId - Character ID (optional, for ad bonus check)
   * @returns Gold with bonus applied
   */
  static async calculateGoldWithBonus(baseGold: number, userId: string, characterId?: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);

    // If subscriber, use premium bonus
    if (benefits.isPremium) {
      return Math.floor(baseGold * benefits.plan.benefits.goldBonus);
    }

    // Check for ad-based gold boost (free players)
    if (characterId) {
      const adMultiplier = await this.getAdBasedMultiplier(characterId, 'gold');
      if (adMultiplier > 1.0) {
        return Math.floor(baseGold * adMultiplier);
      }
    }

    return baseGold;
  }

  /**
   * Calculate XP with premium OR ad bonus
   * Subscribers get permanent bonus, free players can get same bonus from ads
   *
   * @param baseXP - Base XP amount
   * @param userId - User ID
   * @param characterId - Character ID (optional, for ad bonus check)
   * @returns XP with bonus applied
   */
  static async calculateXPWithBonus(baseXP: number, userId: string, characterId?: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);

    // If subscriber, use premium bonus
    if (benefits.isPremium) {
      return Math.floor(baseXP * benefits.plan.benefits.xpBonus);
    }

    // Check for ad-based XP boost (free players)
    if (characterId) {
      const adMultiplier = await this.getAdBasedMultiplier(characterId, 'xp');
      if (adMultiplier > 1.0) {
        return Math.floor(baseXP * adMultiplier);
      }
    }

    return baseXP;
  }

  /**
   * Get energy regeneration rate multiplier
   * Includes both subscription benefits and ad-based timed bonuses
   *
   * @param userId - User ID
   * @param characterId - Character ID (optional, for ad bonus check)
   * @returns Multiplier for energy regen rate (1.0 = normal, 1.5 = 50% faster)
   */
  static async getEnergyRegenMultiplier(userId: string, characterId?: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);

    // If subscriber, use premium bonus
    if (benefits.isPremium) {
      return benefits.plan.benefits.energyRegenBonus;
    }

    // Check for ad-based energy boost (free players)
    if (characterId) {
      const adMultiplier = await this.getAdBasedMultiplier(characterId, 'energy');
      if (adMultiplier > 1.0) {
        return adMultiplier;
      }
    }

    return 1.0;
  }

  /**
   * Get ad-based timed multiplier for a specific bonus type
   * Free players can watch ads to get the same bonuses as subscribers, but time-limited
   *
   * @param characterId - Character ID
   * @param bonusType - Type of bonus ('xp' | 'gold' | 'energy')
   * @returns Multiplier (1.0 if no active bonus, 1.5 if ad bonus active)
   */
  static async getAdBasedMultiplier(characterId: string, bonusType: 'xp' | 'gold' | 'energy'): Promise<number> {
    try {
      const adReward = await AdReward.findByCharacterId(
        new (await import('mongoose')).Types.ObjectId(characterId)
      );

      if (!adReward) {
        return 1.0;
      }

      // Clean expired bonuses
      adReward.cleanExpiredBonuses();

      // Map bonus type to ad reward type
      const typeMap: Record<string, AdRewardType> = {
        xp: AdRewardType.XP_BOOST,
        gold: AdRewardType.GOLD_BOOST,
        energy: AdRewardType.ENERGY_BOOST
      };

      const bonus = adReward.getActiveBonus(typeMap[bonusType]);
      return bonus ? bonus.multiplier : 1.0;
    } catch (error) {
      logger.warn('Failed to get ad-based multiplier:', error);
      return 1.0;
    }
  }

  /**
   * Get max energy bonus
   *
   * @param userId - User ID
   * @returns Flat bonus to max energy
   */
  static async getMaxEnergyBonus(userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return benefits.plan.benefits.maxEnergyBonus;
  }

  // =============================================================================
  // PHASE 19: New Premium Benefit Methods
  // =============================================================================

  /**
   * Calculate skill XP with premium bonus
   * Used for skill training progression
   *
   * @param baseXP - Base skill XP amount
   * @param userId - User ID
   * @returns Skill XP with premium bonus applied
   */
  static async calculateSkillXPWithBonus(baseXP: number, userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return Math.floor(baseXP * benefits.plan.benefits.skillXpBonus);
  }

  /**
   * Get bank slot bonus
   *
   * @param userId - User ID
   * @returns Extra bank slots granted by premium
   */
  static async getBankSlotBonus(userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return benefits.plan.benefits.bankSlotBonus;
  }

  /**
   * Get fast travel discount
   *
   * @param userId - User ID
   * @returns Discount multiplier (0.5 = 50% off)
   */
  static async getFastTravelDiscount(userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return benefits.plan.benefits.fastTravelDiscount;
  }

  /**
   * Calculate fast travel cost with premium discount
   *
   * @param baseCost - Base travel cost
   * @param userId - User ID
   * @returns Cost after premium discount applied
   */
  static async calculateFastTravelCost(baseCost: number, userId: string): Promise<number> {
    const discount = await this.getFastTravelDiscount(userId);
    return Math.floor(baseCost * (1 - discount));
  }

  /**
   * Get training time multiplier for passive skill training
   * Premium users get 25% faster training (multiplier of 0.75)
   *
   * @param userId - User ID
   * @returns Multiplier for training time (1.0 = normal, 0.75 = 25% faster)
   */
  static async getTrainingTimeMultiplier(userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    // Convert reduction percentage to multiplier (0.25 reduction = 0.75 multiplier)
    return 1 - benefits.plan.benefits.trainingTimeReduction;
  }

  /**
   * Get maximum concurrent training slots
   * Free users can train 1 skill, Premium users can train 2
   *
   * @param userId - User ID
   * @returns Maximum number of skills that can train simultaneously
   */
  static async getMaxConcurrentTraining(userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return benefits.plan.benefits.maxConcurrentTraining;
  }

  /**
   * Get training time multiplier by character ID
   * Convenience wrapper for skill.service.ts
   *
   * @param characterId - Character ID
   * @returns Multiplier for training time
   */
  static async getTrainingTimeMultiplierByCharacter(characterId: string): Promise<number> {
    const character = await Character.findById(characterId);
    if (!character || !character.userId) {
      return 1.0; // No reduction for unknown character or missing userId
    }
    return this.getTrainingTimeMultiplier(character.userId.toString());
  }

  /**
   * Get max concurrent training slots by character ID
   * Convenience wrapper for skill.service.ts
   *
   * @param characterId - Character ID
   * @returns Maximum concurrent training slots
   */
  static async getMaxConcurrentTrainingByCharacter(characterId: string): Promise<number> {
    const character = await Character.findById(characterId);
    if (!character || !character.userId) {
      return 1; // Default to 1 for unknown character or missing userId
    }
    return this.getMaxConcurrentTraining(character.userId.toString());
  }

  /**
   * Invalidate cache for a user (call when subscription changes)
   *
   * @param userId - User ID
   */
  static async invalidateCache(userId: string): Promise<void> {
    const redis = getRedisClient();
    if (redis) {
      try {
        const cacheKey = `premium:${userId}`;
        await redis.del(cacheKey);
        logger.debug(`Invalidated premium cache for user ${userId}`);
      } catch (error) {
        logger.warn('Failed to invalidate premium cache:', error);
      }
    }
  }

  /**
   * Get all premium plans (for display to users)
   */
  static getAllPlans(): SubscriptionPlan[] {
    return [FREE_PLAN, PREMIUM_PLAN];
  }

  /**
   * Get plan by ID
   */
  static getPlanById(planId: string): SubscriptionPlan {
    if (planId === 'premium') {
      return PREMIUM_PLAN;
    }
    return FREE_PLAN;
  }
}
