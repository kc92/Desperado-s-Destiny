/**
 * Subscription Service
 * Handles premium subscriptions and benefits
 */

import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  benefits: {
    maxEnergy: number;
    energyRegen: number;
    bonusXp: number;
    bonusGold: number;
  };
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    benefits: {
      maxEnergy: 150,
      energyRegen: 5,
      bonusXp: 0,
      bonusGold: 0
    }
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 5,
    interval: 'month',
    benefits: {
      maxEnergy: 250,
      energyRegen: 8,
      bonusXp: 10,
      bonusGold: 10
    }
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 50,
    interval: 'year',
    benefits: {
      maxEnergy: 250,
      energyRegen: 8,
      bonusXp: 15,
      bonusGold: 15
    }
  }
];

export class SubscriptionService {
  /**
   * Get all available plans
   */
  static getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Get user's current subscription
   */
  static async getSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    expiresAt?: Date;
    isActive: boolean;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const planId = user.subscriptionPlan || 'free';
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];

    const isActive = planId === 'free' ||
      (user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

    return {
      plan,
      expiresAt: user.subscriptionExpiresAt,
      isActive
    };
  }

  /**
   * Subscribe to a plan (placeholder for Stripe integration)
   */
  static async subscribe(
    userId: string,
    planId: string,
    _paymentMethodId?: string
  ): Promise<{ success: boolean; message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan || plan.id === 'free') {
        throw new AppError('Invalid plan', 400);
      }

      // TODO: Integrate Stripe payment processing here
      // For now, just activate the subscription

      const expiresAt = new Date();
      if (plan.interval === 'month') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      user.subscriptionPlan = planId;
      user.subscriptionExpiresAt = expiresAt;
      await user.save({ session });

      // Update all character benefits
      await Character.updateMany(
        { userId: user._id },
        {
          $set: {
            maxEnergy: plan.benefits.maxEnergy,
            isPremium: true
          }
        },
        { session }
      );

      await session.commitTransaction();

      logger.info(`User ${userId} subscribed to ${plan.name}`);

      return {
        success: true,
        message: `Successfully subscribed to ${plan.name}`
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Keep benefits until expiration
    user.subscriptionCancelled = true;
    await user.save();

    logger.info(`User ${userId} cancelled subscription (expires: ${user.subscriptionExpiresAt})`);

    return {
      success: true,
      message: 'Subscription cancelled. Benefits remain until expiration.'
    };
  }

  /**
   * Check and apply premium benefits
   */
  static async applyBenefits(characterId: string): Promise<void> {
    const character = await Character.findById(characterId).populate('userId');
    if (!character) return;

    const user = character.userId as any;
    if (!user) return;

    const { plan, isActive } = await this.getSubscription(user._id);

    if (isActive) {
      character.maxEnergy = plan.benefits.maxEnergy;
      // Energy regen handled in energy service
      await character.save();
    }
  }

  /**
   * Process expired subscriptions (cron job)
   */
  static async processExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    const expiredUsers = await User.find({
      subscriptionPlan: { $ne: 'free' },
      subscriptionExpiresAt: { $lt: now }
    });

    let processed = 0;

    for (const user of expiredUsers) {
      user.subscriptionPlan = 'free';
      user.subscriptionExpiresAt = undefined;
      user.subscriptionCancelled = false;
      await user.save();

      // Reset character benefits
      await Character.updateMany(
        { userId: user._id },
        {
          $set: {
            maxEnergy: 150,
            isPremium: false
          }
        }
      );

      processed++;
    }

    if (processed > 0) {
      logger.info(`Processed ${processed} expired subscriptions`);
    }

    return processed;
  }
}
