/**
 * Daily Contract Model
 *
 * Procedurally generated daily missions with streak bonuses
 * Part of the Competitor Parity Plan - Phase B
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Contract types - 6 categories matching Torn's variety
 */
export type ContractType = 'combat' | 'crime' | 'social' | 'delivery' | 'investigation' | 'crafting';

/**
 * Contract difficulty levels
 */
export type ContractDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Contract status
 */
export type ContractStatus = 'available' | 'in_progress' | 'completed' | 'expired';

/**
 * Contract target information
 */
export interface ContractTarget {
  type: string;       // 'npc', 'location', 'item', 'faction', 'enemy', 'skill'
  id?: string;        // Specific ID if applicable
  name: string;       // Display name
  location?: string;  // Location where target can be found
}

/**
 * Contract requirements
 */
export interface ContractRequirements {
  amount?: number;    // Quantity needed
  item?: string;      // Item ID if applicable
  npc?: string;       // NPC ID if applicable
  skillLevel?: number; // Minimum skill level required
  location?: string;  // Location to visit
}

/**
 * Contract rewards
 */
export interface ContractRewards {
  gold: number;
  xp: number;
  items?: string[];   // Item IDs
  reputation?: Record<string, number>; // Faction reputation changes
}

/**
 * Individual contract
 */
export interface IContract {
  id: string;                   // Unique contract instance ID
  templateId: string;           // Reference to template used
  type: ContractType;
  title: string;
  description: string;
  target: ContractTarget;
  requirements: ContractRequirements;
  rewards: ContractRewards;
  difficulty: ContractDifficulty;
  status: ContractStatus;
  progress: number;             // Current progress
  progressMax: number;          // Target progress
  acceptedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
}

/**
 * Streak bonus tier
 */
export interface StreakBonus {
  day: number;
  gold: number;
  xp: number;
  item?: string;        // Special item reward
  premiumCurrency?: number; // Gold coins (premium)
  description: string;
}

/**
 * Daily Contract document for a character
 */
export interface IDailyContract extends Document {
  characterId: mongoose.Types.ObjectId;
  date: Date;                    // The day these contracts are for (midnight UTC)
  contracts: IContract[];
  completedCount: number;        // Contracts completed today
  streak: number;                // Consecutive days with at least 1 completion
  lastCompletedDate: Date | null;
  streakBonusClaimed: boolean;   // Whether weekly streak bonus was claimed
  lastStreakBonusClaimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods for DailyContract model
 */
export interface IDailyContractModel extends Model<IDailyContract> {
  findOrCreateForToday(characterId: string): Promise<IDailyContract>;
  getStreakLeaderboard(limit?: number): Promise<Array<{ characterId: string; streak: number; name: string }>>;
}

/**
 * Contract subdocument schema
 */
const ContractSchema = new Schema<IContract>(
  {
    id: {
      type: String,
      required: true
    },
    templateId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['combat', 'crime', 'social', 'delivery', 'investigation', 'crafting']
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    target: {
      type: {
        type: String,
        required: true
      },
      id: String,
      name: {
        type: String,
        required: true
      },
      location: String
    },
    requirements: {
      amount: Number,
      item: String,
      npc: String,
      skillLevel: Number,
      location: String
    },
    rewards: {
      gold: {
        type: Number,
        required: true,
        min: 0
      },
      xp: {
        type: Number,
        required: true,
        min: 0
      },
      items: [String],
      reputation: {
        type: Map,
        of: Number
      }
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard']
    },
    status: {
      type: String,
      required: true,
      enum: ['available', 'in_progress', 'completed', 'expired'],
      default: 'available'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0
    },
    progressMax: {
      type: Number,
      required: true,
      min: 1
    },
    acceptedAt: Date,
    completedAt: Date,
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

/**
 * Daily Contract schema
 */
const DailyContractSchema = new Schema<IDailyContract>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    contracts: {
      type: [ContractSchema],
      default: []
    },
    completedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    streak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCompletedDate: {
      type: Date,
      default: null
    },
    streakBonusClaimed: {
      type: Boolean,
      default: false
    },
    lastStreakBonusClaimedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient lookups
DailyContractSchema.index({ characterId: 1, date: -1 }, { unique: true });

// Index for streak leaderboard
DailyContractSchema.index({ streak: -1 });

// Index for expired contracts cleanup
DailyContractSchema.index({ 'contracts.expiresAt': 1 });

/**
 * Static method: Find or create daily contracts for today
 */
DailyContractSchema.statics.findOrCreateForToday = async function(
  characterId: string
): Promise<IDailyContract> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let dailyContract = await this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    date: today
  });

  if (!dailyContract) {
    // Check yesterday's record for streak calculation
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const yesterdayContract = await this.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      date: yesterday
    });

    let streak = 0;
    if (yesterdayContract && yesterdayContract.completedCount > 0) {
      // Continue streak if completed at least one contract yesterday
      streak = yesterdayContract.streak + 1;
    } else if (yesterdayContract) {
      // Broke streak - reset
      streak = 0;
    }

    // Create new record (contracts will be generated by service)
    dailyContract = await this.create({
      characterId: new mongoose.Types.ObjectId(characterId),
      date: today,
      contracts: [],
      completedCount: 0,
      streak,
      lastCompletedDate: yesterdayContract?.lastCompletedDate || null,
      streakBonusClaimed: false,
      lastStreakBonusClaimedAt: null
    });
  }

  return dailyContract;
};

/**
 * Static method: Get streak leaderboard
 */
DailyContractSchema.statics.getStreakLeaderboard = async function(
  limit: number = 10
): Promise<Array<{ characterId: string; streak: number; name: string }>> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const results = await this.aggregate([
    { $match: { date: today } },
    { $sort: { streak: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'characters',
        localField: 'characterId',
        foreignField: '_id',
        as: 'character'
      }
    },
    { $unwind: '$character' },
    {
      $project: {
        characterId: { $toString: '$characterId' },
        streak: 1,
        name: '$character.name'
      }
    }
  ]);

  return results;
};

/**
 * Streak bonus configuration
 */
export const STREAK_BONUSES: StreakBonus[] = [
  { day: 1, gold: 50, xp: 25, description: 'First Day Bonus' },
  { day: 2, gold: 75, xp: 40, description: 'Building Momentum' },
  { day: 3, gold: 100, xp: 60, description: 'Three Day Streak' },
  { day: 4, gold: 150, xp: 80, description: 'Getting Reliable' },
  { day: 5, gold: 200, xp: 100, description: 'Halfway There' },
  { day: 6, gold: 250, xp: 125, description: 'Almost Weekly' },
  { day: 7, gold: 500, xp: 250, item: 'rare_lockpick_set', premiumCurrency: 5, description: 'Weekly Champion' },
  { day: 14, gold: 1000, xp: 500, item: 'golden_revolver', premiumCurrency: 15, description: 'Two Week Warrior' },
  { day: 21, gold: 1500, xp: 750, item: 'silver_sheriff_badge', premiumCurrency: 25, description: 'Three Week Legend' },
  { day: 30, gold: 2500, xp: 1000, item: 'legendary_duster_coat', premiumCurrency: 50, description: 'Monthly Master' }
];

/**
 * Get streak bonus for a given day
 */
export function getStreakBonus(day: number): StreakBonus | null {
  // Check for exact milestone matches first
  const exactMatch = STREAK_BONUSES.find(b => b.day === day);
  if (exactMatch) return exactMatch;

  // For days beyond 30, give scaled bonus
  if (day > 30) {
    const multiplier = Math.floor(day / 30);
    return {
      day,
      gold: 2500 * multiplier,
      xp: 1000 * multiplier,
      premiumCurrency: 50 * multiplier,
      description: `${day} Day Legend`
    };
  }

  // For days between milestones, return the last milestone's bonus
  const sortedBonuses = [...STREAK_BONUSES].sort((a, b) => b.day - a.day);
  return sortedBonuses.find(b => b.day <= day) || null;
}

export const DailyContract = mongoose.model<IDailyContract, IDailyContractModel>(
  'DailyContract',
  DailyContractSchema
);
