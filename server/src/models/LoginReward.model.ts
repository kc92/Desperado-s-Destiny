/**
 * Login Reward Model
 * Phase B - Competitor Parity Plan
 *
 * Tracks player daily login rewards with a 28-day cycle (4 weeks)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Reward item types
 */
export type RewardType = 'gold' | 'item' | 'energy' | 'material' | 'premium';

/**
 * Individual reward item
 */
export interface RewardItem {
  type: RewardType;
  amount?: number;
  itemId?: string;
  itemName?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description?: string;
}

/**
 * Claimed reward record
 */
export interface ClaimedReward {
  day: number; // 1-7 within the week
  week: number; // 1-4
  absoluteDay: number; // 1-28 overall
  reward: RewardItem;
  claimedAt: Date;
}

/**
 * Login Reward document interface
 */
export interface ILoginReward extends Document {
  characterId: mongoose.Types.ObjectId;
  currentDay: number; // 1-28 (absolute day in 4-week cycle)
  currentWeek: number; // 1-4
  lastClaimDate: Date | null;
  totalDaysClaimed: number;
  claimedRewards: ClaimedReward[];
  monthlyBonusClaimed: boolean;
  cycleStartDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Login Reward model static methods
 */
export interface ILoginRewardModel extends Model<ILoginReward> {
  findByCharacterId(characterId: string | mongoose.Types.ObjectId): Promise<ILoginReward | null>;
  createForCharacter(characterId: string | mongoose.Types.ObjectId): Promise<ILoginReward>;
}

/**
 * Claimed reward schema
 */
const ClaimedRewardSchema = new Schema<ClaimedReward>({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  absoluteDay: {
    type: Number,
    required: true,
    min: 1,
    max: 28
  },
  reward: {
    type: {
      type: String,
      enum: ['gold', 'item', 'energy', 'material', 'premium'],
      required: true
    },
    amount: { type: Number },
    itemId: { type: String },
    itemName: { type: String },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
    },
    description: { type: String }
  },
  claimedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: false });

/**
 * Login Reward schema definition
 */
const LoginRewardSchema = new Schema<ILoginReward>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },
    currentDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 28
    },
    currentWeek: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    lastClaimDate: {
      type: Date,
      default: null
    },
    totalDaysClaimed: {
      type: Number,
      default: 0,
      min: 0
    },
    claimedRewards: {
      type: [ClaimedRewardSchema],
      default: []
    },
    monthlyBonusClaimed: {
      type: Boolean,
      default: false
    },
    cycleStartDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
LoginRewardSchema.index({ characterId: 1, lastClaimDate: -1 });
LoginRewardSchema.index({ lastClaimDate: 1 }); // For finding stale records

/**
 * Static method: Find login reward record by character ID
 */
LoginRewardSchema.statics.findByCharacterId = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<ILoginReward | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId.toString())
  });
};

/**
 * Static method: Create new login reward record for character
 */
LoginRewardSchema.statics.createForCharacter = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<ILoginReward> {
  return this.create({
    characterId: new mongoose.Types.ObjectId(characterId.toString()),
    currentDay: 1,
    currentWeek: 1,
    lastClaimDate: null,
    totalDaysClaimed: 0,
    claimedRewards: [],
    monthlyBonusClaimed: false,
    cycleStartDate: new Date()
  });
};

export const LoginReward = mongoose.model<ILoginReward, ILoginRewardModel>(
  'LoginReward',
  LoginRewardSchema
);
