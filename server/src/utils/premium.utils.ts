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

    // Check subscription status
    const isPremium = this.checkSubscriptionActive(user);
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
    if (!character) {
      return { isPremium: false, plan: FREE_PLAN };
    }
    return this.getPremiumBenefits(character.userId.toString());
  }

  /**
   * Check if user's subscription is currently active
   *
   * @param user - User document
   * @returns true if subscription is active
   */
  private static checkSubscriptionActive(user: any): boolean {
    // PLAYTEST MODE: Everyone gets premium for free!
    if (PLAYTEST_MODE) {
      return true;
    }

    if (!user.subscriptionPlan || user.subscriptionPlan === 'free') {
      return false;
    }

    if (user.subscriptionCancelled) {
      return false;
    }

    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      return false;
    }

    return true;
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
   * Calculate gold with premium bonus
   *
   * @param baseGold - Base gold amount
   * @param userId - User ID
   * @returns Gold with premium bonus applied
   */
  static async calculateGoldWithBonus(baseGold: number, userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return Math.floor(baseGold * benefits.plan.benefits.goldBonus);
  }

  /**
   * Calculate XP with premium bonus
   *
   * @param baseXP - Base XP amount
   * @param userId - User ID
   * @returns XP with premium bonus applied
   */
  static async calculateXPWithBonus(baseXP: number, userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return Math.floor(baseXP * benefits.plan.benefits.xpBonus);
  }

  /**
   * Get energy regeneration rate multiplier
   *
   * @param userId - User ID
   * @returns Multiplier for energy regen rate (1.0 = normal, 1.5 = 50% faster)
   */
  static async getEnergyRegenMultiplier(userId: string): Promise<number> {
    const benefits = await this.getPremiumBenefits(userId);
    return benefits.plan.benefits.energyRegenBonus;
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
