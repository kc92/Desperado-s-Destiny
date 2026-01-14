/**
 * Ad Reward Model
 *
 * Tracks rewarded video ad views and timed bonuses for free players.
 * Free players get THE SAME bonuses as subscribers (+50% XP, gold, energy regen)
 * but TIME-LIMITED (30-60 min per ad watched).
 *
 * This is the FAIR monetization model - equal power for everyone,
 * subscribers just don't need to watch ads.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Ad reward types - what bonus the player gets
 */
export enum AdRewardType {
  // Core bonuses (same as subscription)
  XP_BOOST = 'xp_boost',           // +50% XP for 30 min
  GOLD_BOOST = 'gold_boost',       // +50% gold for 30 min
  ENERGY_BOOST = 'energy_boost',   // +50% energy regen for 30 min

  // Instant rewards
  ENERGY_REFILL = 'energy_refill', // +25 energy instantly
  BONUS_GOLD = 'bonus_gold',       // +25% gold on next action

  // Utility rewards
  SKIP_TIMER = 'skip_timer',       // -30 min on skill training
  COMBAT_REVIVE = 'combat_revive', // Full HP restore in combat
  EXTRA_CONTRACT = 'extra_contract' // +1 daily contract
}

/**
 * Ad reward configuration
 */
export const AD_REWARD_CONFIG = {
  [AdRewardType.XP_BOOST]: {
    durationMinutes: 30,
    multiplier: 1.5,
    dailyCap: 10,
    description: '+50% XP for 30 minutes'
  },
  [AdRewardType.GOLD_BOOST]: {
    durationMinutes: 30,
    multiplier: 1.5,
    dailyCap: 10,
    description: '+50% gold for 30 minutes'
  },
  [AdRewardType.ENERGY_BOOST]: {
    durationMinutes: 30,
    multiplier: 1.5,
    dailyCap: 10,
    description: '+50% energy regen for 30 minutes'
  },
  [AdRewardType.ENERGY_REFILL]: {
    instantReward: 25,
    dailyCap: 5,
    description: '+25 energy instantly'
  },
  [AdRewardType.BONUS_GOLD]: {
    multiplier: 1.25,
    usesPerReward: 1,
    dailyCap: 3,
    description: '+25% gold on next action'
  },
  [AdRewardType.SKIP_TIMER]: {
    minutesSkipped: 30,
    dailyCap: 3,
    description: 'Skip 30 min of skill training'
  },
  [AdRewardType.COMBAT_REVIVE]: {
    dailyCap: 2,
    description: 'Full HP restore in combat'
  },
  [AdRewardType.EXTRA_CONTRACT]: {
    dailyCap: 1,
    description: '+1 daily contract'
  }
} as const;

/**
 * Active timed bonus from watching an ad
 */
export interface IActiveBonus {
  type: AdRewardType;
  multiplier: number;
  startedAt: Date;
  expiresAt: Date;
}

/**
 * Daily ad view tracking
 */
export interface IDailyAdViews {
  date: string; // YYYY-MM-DD format
  views: Map<AdRewardType, number>;
}

/**
 * Ad Reward document interface
 */
export interface IAdReward extends Document {
  characterId: mongoose.Types.ObjectId;

  // Active timed bonuses
  activeBonuses: IActiveBonus[];

  // Daily tracking (reset at midnight UTC)
  dailyViews: Map<AdRewardType, number>;
  lastDailyReset: Date;

  // One-time use rewards pending
  pendingBonusGoldUses: number;
  pendingExtraContracts: number;

  // Lifetime stats
  totalAdsWatched: number;
  totalXpBoostMinutes: number;
  totalGoldBoostMinutes: number;
  totalEnergyBoostMinutes: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  canWatchAd(type: AdRewardType): boolean;
  getActiveBonus(type: AdRewardType): IActiveBonus | null;
  hasActiveBonus(type: AdRewardType): boolean;
  getEffectiveMultiplier(type: 'xp' | 'gold' | 'energy'): number;
  cleanExpiredBonuses(): void;
  resetDailyIfNeeded(): void;
}

/**
 * Ad Reward model interface with statics
 */
export interface IAdRewardModel extends Model<IAdReward> {
  findByCharacterId(characterId: mongoose.Types.ObjectId): Promise<IAdReward | null>;
  getOrCreateForCharacter(characterId: mongoose.Types.ObjectId): Promise<IAdReward>;
}

/**
 * Active bonus subdocument schema
 */
const ActiveBonusSchema = new Schema<IActiveBonus>(
  {
    type: {
      type: String,
      enum: Object.values(AdRewardType),
      required: true
    },
    multiplier: {
      type: Number,
      required: true,
      default: 1.5
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  { _id: false }
);

/**
 * Ad Reward schema
 */
const AdRewardSchema = new Schema<IAdReward>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },

    activeBonuses: {
      type: [ActiveBonusSchema],
      default: []
    },

    dailyViews: {
      type: Map,
      of: Number,
      default: new Map()
    },

    lastDailyReset: {
      type: Date,
      default: Date.now
    },

    // One-time use rewards
    pendingBonusGoldUses: {
      type: Number,
      default: 0,
      min: 0
    },

    pendingExtraContracts: {
      type: Number,
      default: 0,
      min: 0
    },

    // Lifetime stats
    totalAdsWatched: {
      type: Number,
      default: 0,
      min: 0
    },

    totalXpBoostMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    totalGoldBoostMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    totalEnergyBoostMinutes: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'adrewards'
  }
);

// Indexes
AdRewardSchema.index({ 'activeBonuses.expiresAt': 1 }); // For cleanup jobs

/**
 * Check if player can watch another ad of this type today
 */
AdRewardSchema.methods.canWatchAd = function(this: IAdReward, type: AdRewardType): boolean {
  this.resetDailyIfNeeded();

  const config = AD_REWARD_CONFIG[type];
  const viewsToday = this.dailyViews.get(type) || 0;

  return viewsToday < config.dailyCap;
};

/**
 * Get active bonus of a specific type
 */
AdRewardSchema.methods.getActiveBonus = function(this: IAdReward, type: AdRewardType): IActiveBonus | null {
  this.cleanExpiredBonuses();

  return this.activeBonuses.find(b => b.type === type) || null;
};

/**
 * Check if player has an active bonus of this type
 */
AdRewardSchema.methods.hasActiveBonus = function(this: IAdReward, type: AdRewardType): boolean {
  return this.getActiveBonus(type) !== null;
};

/**
 * Get effective multiplier for a stat type (stacks with existing bonuses)
 */
AdRewardSchema.methods.getEffectiveMultiplier = function(this: IAdReward, type: 'xp' | 'gold' | 'energy'): number {
  this.cleanExpiredBonuses();

  const typeMap: Record<string, AdRewardType> = {
    xp: AdRewardType.XP_BOOST,
    gold: AdRewardType.GOLD_BOOST,
    energy: AdRewardType.ENERGY_BOOST
  };

  const bonus = this.getActiveBonus(typeMap[type]);
  return bonus ? bonus.multiplier : 1.0;
};

/**
 * Remove expired bonuses
 */
AdRewardSchema.methods.cleanExpiredBonuses = function(this: IAdReward): void {
  const now = new Date();
  this.activeBonuses = this.activeBonuses.filter(b => b.expiresAt > now);
};

/**
 * Reset daily views if it's a new day (UTC)
 */
AdRewardSchema.methods.resetDailyIfNeeded = function(this: IAdReward): void {
  const now = new Date();
  const lastReset = this.lastDailyReset;

  // Check if it's a new day in UTC
  const nowDate = now.toISOString().split('T')[0];
  const lastDate = lastReset.toISOString().split('T')[0];

  if (nowDate !== lastDate) {
    this.dailyViews = new Map();
    this.lastDailyReset = now;
  }
};

/**
 * Find ad reward record by character ID
 */
AdRewardSchema.statics.findByCharacterId = async function(
  characterId: mongoose.Types.ObjectId
): Promise<IAdReward | null> {
  return this.findOne({ characterId });
};

/**
 * Get or create ad reward record for character
 */
AdRewardSchema.statics.getOrCreateForCharacter = async function(
  characterId: mongoose.Types.ObjectId
): Promise<IAdReward> {
  let record = await this.findOne({ characterId });

  if (!record) {
    record = await this.create({
      characterId,
      activeBonuses: [],
      dailyViews: new Map(),
      lastDailyReset: new Date()
    });
  }

  return record;
};

/**
 * Ad Reward model
 */
export const AdReward = mongoose.model<IAdReward, IAdRewardModel>(
  'AdReward',
  AdRewardSchema
);

export default AdReward;
