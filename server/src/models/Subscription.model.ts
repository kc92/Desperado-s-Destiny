/**
 * Subscription Model
 *
 * Tracks premium subscriptions ("Outlaw Pass") for players.
 * Single tier: $4.99/month
 *
 * Subscribers get PERMANENT bonuses:
 * - +50% energy regeneration
 * - +50% XP from all sources
 * - +50% gold from all sources
 * - No ads
 *
 * Free players can get THE SAME bonuses but TIME-LIMITED (30-60 min)
 * by watching rewarded video ads. This is FAIR - same power, just
 * subscribers don't need to watch ads.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Subscription status enum
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',    // Will expire at period end
  EXPIRED = 'expired',
  PAST_DUE = 'past_due'     // Payment failed, grace period
}

/**
 * Subscription benefits (same bonuses free players get temporarily from ads)
 */
export const SUBSCRIPTION_BENEFITS = {
  energyRegenMultiplier: 1.5,  // +50%
  xpMultiplier: 1.5,           // +50%
  goldMultiplier: 1.5,         // +50%
  adsEnabled: false,
  monthlyPrice: 4.99
} as const;

/**
 * Free player base values
 */
export const FREE_PLAYER_BASE = {
  energyRegenMultiplier: 1.0,
  xpMultiplier: 1.0,
  goldMultiplier: 1.0,
  adsEnabled: true
} as const;

/**
 * Subscription document interface
 */
export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;

  // Subscription status
  status: SubscriptionStatus;

  // Dates
  startedAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;

  // Payment integration (Stripe)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;

  // Stats
  totalMonthsSubscribed: number;
  totalAmountPaid: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isActive(): boolean;
  getMultipliers(): { energyRegen: number; xp: number; gold: number };
  daysUntilExpiry(): number;
}

/**
 * Subscription model interface with statics
 */
export interface ISubscriptionModel extends Model<ISubscription> {
  findByUserId(userId: mongoose.Types.ObjectId): Promise<ISubscription | null>;
  findActiveSubscriptions(): Promise<ISubscription[]>;
  getOrCreateForUser(userId: mongoose.Types.ObjectId): Promise<ISubscription>;
}

/**
 * Subscription schema
 */
const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.EXPIRED,
      index: true
    },

    startedAt: {
      type: Date,
      default: null
    },

    currentPeriodStart: {
      type: Date,
      default: null
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
      index: true
    },

    canceledAt: {
      type: Date,
      default: null
    },

    // Stripe integration
    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true
    },

    stripeSubscriptionId: {
      type: String,
      sparse: true,
      index: true
    },

    stripePriceId: {
      type: String
    },

    // Stats
    totalMonthsSubscribed: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmountPaid: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'subscriptions'
  }
);

// Indexes
SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 }); // For expiry checks

/**
 * Check if subscription is currently active
 */
SubscriptionSchema.methods.isActive = function(this: ISubscription): boolean {
  if (this.status !== SubscriptionStatus.ACTIVE && this.status !== SubscriptionStatus.CANCELED) {
    return false;
  }

  // Canceled subscriptions are active until period end
  if (this.currentPeriodEnd && new Date() > this.currentPeriodEnd) {
    return false;
  }

  return true;
};

/**
 * Get current multipliers based on subscription status
 */
SubscriptionSchema.methods.getMultipliers = function(this: ISubscription): { energyRegen: number; xp: number; gold: number } {
  if (!this.isActive()) {
    return {
      energyRegen: FREE_PLAYER_BASE.energyRegenMultiplier,
      xp: FREE_PLAYER_BASE.xpMultiplier,
      gold: FREE_PLAYER_BASE.goldMultiplier
    };
  }
  return {
    energyRegen: SUBSCRIPTION_BENEFITS.energyRegenMultiplier,
    xp: SUBSCRIPTION_BENEFITS.xpMultiplier,
    gold: SUBSCRIPTION_BENEFITS.goldMultiplier
  };
};

/**
 * Get days until subscription expires
 */
SubscriptionSchema.methods.daysUntilExpiry = function(this: ISubscription): number {
  if (!this.isActive() || !this.currentPeriodEnd) {
    return 0;
  }

  const msUntilExpiry = this.currentPeriodEnd.getTime() - Date.now();
  return Math.max(0, Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24)));
};

/**
 * Find subscription by user ID
 */
SubscriptionSchema.statics.findByUserId = async function(
  userId: mongoose.Types.ObjectId
): Promise<ISubscription | null> {
  return this.findOne({ userId });
};

/**
 * Find all active subscriptions
 */
SubscriptionSchema.statics.findActiveSubscriptions = async function(): Promise<ISubscription[]> {
  return this.find({
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED] },
    currentPeriodEnd: { $gt: new Date() }
  });
};

/**
 * Get or create subscription record for user
 */
SubscriptionSchema.statics.getOrCreateForUser = async function(
  userId: mongoose.Types.ObjectId
): Promise<ISubscription> {
  let subscription = await this.findOne({ userId });

  if (!subscription) {
    subscription = await this.create({
      userId,
      status: SubscriptionStatus.EXPIRED
    });
  }

  return subscription;
};

/**
 * Subscription model
 */
export const Subscription = mongoose.model<ISubscription, ISubscriptionModel>(
  'Subscription',
  SubscriptionSchema
);

export default Subscription;
