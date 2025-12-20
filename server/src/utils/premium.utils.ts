/**
 * Premium Utility
 * Handles premium status checks and benefit calculations
 * Caches results for 5 minutes to reduce database load
 */

import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import logger from './logger';

// Redis client for caching (loaded dynamically)
let redisClient: any = null;

function getRedisClient() {
  if (!redisClient) {
    try {
      const redis = require('../config/redis');
      redisClient = redis.redisClient || redis.default;
    } catch (error) {
      logger.warn('Redis not available for premium caching, will query DB each time');
      return null;
    }
  }
  return redisClient;
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
    maxEnergyBonus: number; // Flat bonus
    hpBonus: number; // Percentage bonus (e.g., 1.2 = 20% more HP)
    goldBonus: number; // Percentage bonus on gold drops
    xpBonus: number; // Percentage bonus on XP
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
    hpBonus: 1.0,
    goldBonus: 1.0,
    xpBonus: 1.0,
  },
};

const PREMIUM_PLAN: SubscriptionPlan = {
  id: 'premium',
  name: 'Premium',
  monthlyPrice: 9.99,
  benefits: {
    energyRegenBonus: 1.5, // 50% faster energy regen
    maxEnergyBonus: 50, // +50 max energy
    hpBonus: 1.2, // +20% HP in combat
    goldBonus: 1.25, // +25% gold from all sources
    xpBonus: 1.15, // +15% XP from all sources
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
   * @param baseHP - Base HP amount
   * @param characterId - Character ID
   * @returns HP with premium bonus applied
   */
  static async calculateHPWithBonus(baseHP: number, characterId: string): Promise<number> {
    const benefits = await this.getPremiumBenefitsByCharacter(characterId);
    return Math.floor(baseHP * benefits.plan.benefits.hpBonus);
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
