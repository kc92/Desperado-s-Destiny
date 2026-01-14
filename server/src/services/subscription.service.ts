/**
 * Subscription Service
 *
 * Handles premium subscription ("Outlaw Pass") management.
 * Integrates with Stripe for payment processing.
 *
 * Single tier: $4.99/month
 * - +50% XP, gold, energy regen (permanent while subscribed)
 * - No ads
 *
 * Free players can get THE SAME bonuses via ads (time-limited).
 */

import mongoose from 'mongoose';
import Stripe from 'stripe';
import {
  Subscription,
  SubscriptionStatus,
  SUBSCRIPTION_BENEFITS,
  FREE_PLAYER_BASE,
  ISubscription
} from '../models/Subscription.model';
import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

// Initialize Stripe (will be undefined if key not set)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Stripe price ID for the subscription (set in env)
const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || '';

/**
 * Legacy plan interface for backward compatibility
 */
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

/**
 * Legacy plans for backward compatibility
 */
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
    id: 'outlaw_pass',
    name: 'Outlaw Pass',
    price: 4.99,
    interval: 'month',
    benefits: {
      maxEnergy: 150,  // Same max, but faster regen
      energyRegen: 7.5, // +50%
      bonusXp: 50,      // +50%
      bonusGold: 50     // +50%
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
   * Get user's subscription status (new model)
   */
  static async getSubscriptionStatus(userId: mongoose.Types.ObjectId): Promise<{
    isActive: boolean;
    status: SubscriptionStatus;
    expiresAt?: Date;
    daysRemaining: number;
    benefits: typeof SUBSCRIPTION_BENEFITS | typeof FREE_PLAYER_BASE;
  }> {
    const subscription = await Subscription.getOrCreateForUser(userId);

    return {
      isActive: subscription.isActive(),
      status: subscription.status,
      expiresAt: subscription.currentPeriodEnd || undefined,
      daysRemaining: subscription.daysUntilExpiry(),
      benefits: subscription.isActive() ? SUBSCRIPTION_BENEFITS : FREE_PLAYER_BASE
    };
  }

  /**
   * Get user's current subscription (legacy interface)
   */
  static async getSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    expiresAt?: Date;
    isActive: boolean;
  }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const subscription = await Subscription.getOrCreateForUser(userObjectId);

    const isActive = subscription.isActive();
    const plan = isActive ? SUBSCRIPTION_PLANS[1] : SUBSCRIPTION_PLANS[0];

    return {
      plan,
      expiresAt: subscription.currentPeriodEnd || undefined,
      isActive
    };
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  static async createCheckoutSession(
    userId: mongoose.Types.ObjectId,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string } | { error: string }> {
    if (!stripe) {
      logger.error('Stripe not configured');
      return { error: 'Payment system not configured' };
    }

    if (!SUBSCRIPTION_PRICE_ID) {
      logger.error('Stripe price ID not configured');
      return { error: 'Subscription price not configured' };
    }

    try {
      const subscription = await Subscription.getOrCreateForUser(userId);
      let customerId = subscription.stripeCustomerId;

      if (!customerId) {
        const user = await User.findById(userId);
        const customer = await stripe.customers.create({
          email: user?.email,
          metadata: { userId: userId.toString() }
        });
        customerId = customer.id;
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: userId.toString() }
      });

      logger.info('Created checkout session', { userId: userId.toString(), sessionId: session.id });
      return { url: session.url! };
    } catch (error) {
      logger.error('Failed to create checkout session', {
        error: error instanceof Error ? error.message : error,
        userId: userId.toString()
      });
      return { error: 'Failed to create checkout session' };
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(
    payload: Buffer,
    signature: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!stripe) {
      return { success: false, error: 'Stripe not configured' };
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { success: false, error: 'Webhook secret not configured' };
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err instanceof Error ? err.message : err
      });
      return { success: false, error: 'Invalid signature' };
    }

    logger.info('Processing webhook event', { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
    }

    return { success: true };
  }

  /**
   * Handle successful checkout
   */
  static async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
      logger.error('No userId in checkout session metadata');
      return;
    }

    const subscription = await Subscription.findByUserId(new mongoose.Types.ObjectId(userId));
    if (!subscription) {
      logger.error('Subscription record not found after checkout', { userId });
      return;
    }

    subscription.stripeSubscriptionId = session.subscription as string;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.startedAt = new Date();
    await subscription.save();

    logger.info('Subscription activated after checkout', { userId, subscriptionId: session.subscription });
  }

  /**
   * Handle subscription update from Stripe
   */
  static async handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription): Promise<void> {
    let subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });

    if (!subscription) {
      subscription = await Subscription.findOne({ stripeCustomerId: stripeSubscription.customer as string });
      if (subscription) {
        subscription.stripeSubscriptionId = stripeSubscription.id;
      }
    }

    if (!subscription) {
      logger.warn('No subscription found for Stripe subscription', { stripeSubscriptionId: stripeSubscription.id });
      return;
    }

    await this.updateSubscriptionFromStripe(subscription, stripeSubscription);
  }

  /**
   * Update local subscription from Stripe data
   */
  static async updateSubscriptionFromStripe(
    subscription: ISubscription,
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      past_due: SubscriptionStatus.PAST_DUE,
      unpaid: SubscriptionStatus.EXPIRED,
      incomplete: SubscriptionStatus.EXPIRED,
      incomplete_expired: SubscriptionStatus.EXPIRED,
      trialing: SubscriptionStatus.ACTIVE,
      paused: SubscriptionStatus.EXPIRED
    };

    subscription.status = statusMap[stripeSubscription.status] || SubscriptionStatus.EXPIRED;
    subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
    subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);

    if (stripeSubscription.canceled_at) {
      subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
    }

    await subscription.save();
    logger.info('Subscription updated from Stripe', {
      subscriptionId: subscription._id.toString(),
      status: subscription.status,
      periodEnd: subscription.currentPeriodEnd
    });
  }

  /**
   * Handle subscription deletion
   */
  static async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
    if (!subscription) return;

    subscription.status = SubscriptionStatus.EXPIRED;
    await subscription.save();
    logger.info('Subscription marked as expired', { subscriptionId: subscription._id.toString() });
  }

  /**
   * Handle payment failure
   */
  static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (!subscription) return;

    subscription.status = SubscriptionStatus.PAST_DUE;
    await subscription.save();
    logger.warn('Subscription payment failed', { subscriptionId: subscription._id.toString() });
  }

  /**
   * Handle successful invoice payment
   */
  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (!subscription) return;

    subscription.totalAmountPaid += (invoice.amount_paid || 0) / 100;
    subscription.totalMonthsSubscribed += 1;
    subscription.status = SubscriptionStatus.ACTIVE;
    await subscription.save();
    logger.info('Subscription invoice paid', { subscriptionId: subscription._id.toString() });
  }

  /**
   * Cancel subscription (will expire at period end)
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!stripe) {
      // Fallback: just mark as canceled locally
      const subscription = await Subscription.findByUserId(userObjectId);
      if (subscription) {
        subscription.status = SubscriptionStatus.CANCELED;
        subscription.canceledAt = new Date();
        await subscription.save();
      }
      return { success: true, message: 'Subscription cancelled. Benefits remain until expiration.' };
    }

    const subscription = await Subscription.findByUserId(userObjectId);
    if (!subscription?.stripeSubscriptionId) {
      return { success: false, message: 'No active subscription found' };
    }

    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      await subscription.save();

      logger.info('Subscription canceled', { userId, willExpireAt: subscription.currentPeriodEnd });
      return { success: true, message: 'Subscription cancelled. Benefits remain until expiration.' };
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, userId });
      return { success: false, message: 'Failed to cancel subscription' };
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  static async reactivateSubscription(userId: mongoose.Types.ObjectId): Promise<{ success: boolean; error?: string }> {
    if (!stripe) {
      return { success: false, error: 'Payment system not configured' };
    }

    const subscription = await Subscription.findByUserId(userId);
    if (!subscription?.stripeSubscriptionId) {
      return { success: false, error: 'No subscription found' };
    }

    if (subscription.status !== SubscriptionStatus.CANCELED) {
      return { success: false, error: 'Subscription is not canceled' };
    }

    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.canceledAt = undefined;
      await subscription.save();

      logger.info('Subscription reactivated', { userId: userId.toString() });
      return { success: true };
    } catch (error) {
      logger.error('Failed to reactivate subscription', { error, userId: userId.toString() });
      return { success: false, error: 'Failed to reactivate subscription' };
    }
  }

  /**
   * Get Stripe customer portal URL
   */
  static async getCustomerPortalUrl(
    userId: mongoose.Types.ObjectId,
    returnUrl: string
  ): Promise<{ url: string } | { error: string }> {
    if (!stripe) {
      return { error: 'Payment system not configured' };
    }

    const subscription = await Subscription.findByUserId(userId);
    if (!subscription?.stripeCustomerId) {
      return { error: 'No customer record found' };
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl
      });
      return { url: session.url };
    } catch (error) {
      logger.error('Failed to create portal session', { error, userId: userId.toString() });
      return { error: 'Failed to create portal session' };
    }
  }

  // ============================================================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================================================

  /**
   * Subscribe to a plan (legacy interface)
   * @deprecated Use createCheckoutSession instead
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

      // Also update new subscription model
      const subscription = await Subscription.getOrCreateForUser(user._id as mongoose.Types.ObjectId);
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.startedAt = new Date();
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await subscription.save({ session });

      await session.commitTransaction();
      logger.info(`User ${userId} subscribed to ${plan.name}`);

      return { success: true, message: `Successfully subscribed to ${plan.name}` };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Check and apply premium benefits (legacy)
   */
  static async applyBenefits(characterId: string): Promise<void> {
    const character = await Character.findById(characterId).populate('userId');
    if (!character) return;

    const user = character.userId as any;
    if (!user) return;

    const { isActive } = await this.getSubscription(user._id);

    if (isActive) {
      // Benefits are now calculated dynamically via MonetizationService
      // This method is kept for backward compatibility
      await character.save();
    }
  }

  /**
   * Process expired subscriptions (cron job)
   */
  static async processExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    // Find subscriptions that have expired
    const expiredSubscriptions = await Subscription.find({
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED] },
      currentPeriodEnd: { $lt: now }
    });

    let processed = 0;

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await subscription.save();
      processed++;
    }

    if (processed > 0) {
      logger.info(`Processed ${processed} expired subscriptions`);
    }

    return processed;
  }
}
