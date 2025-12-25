/**
 * Daily Contract Model
 *
 * Procedurally generated daily missions with streak bonuses
 * Part of the Competitor Parity Plan - Phase B
 * Extended in Phase 3: Contract Expansion
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ContractType,
  ContractDifficulty,
  ContractStatus,
  ContractUrgency,
  CombatTargetType,
  GangRankRequirement,
  IContractTarget,
  ISkillRequirement,
  IContractRequirements,
  ISkillXpReward,
  IContractRewards,
  IChainData,
  IStreakBonus,
} from '@desperados/shared';

// Re-export shared types for backwards compatibility
export type {
  ContractType,
  ContractDifficulty,
  ContractStatus,
  ContractUrgency,
  CombatTargetType,
  GangRankRequirement,
} from '@desperados/shared';

// Alias for backwards compatibility
export type ContractTarget = IContractTarget;
export type SkillRequirement = ISkillRequirement;
export type ContractRequirements = IContractRequirements;
export type SkillXpReward = ISkillXpReward;
export type ContractRewards = IContractRewards;
export type StreakBonus = IStreakBonus;


/**
 * Individual contract
 */
export interface IContract {
  id: string;                   // Unique contract instance ID
  templateId: string;           // Reference to template used
  type: ContractType;
  title: string;
  description: string;
  target: IContractTarget;
  requirements: IContractRequirements;
  rewards: IContractRewards;
  difficulty: ContractDifficulty;
  status: ContractStatus;
  progress: number;             // Current progress
  progressMax: number;          // Target progress
  acceptedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;

  // Phase 3: Urgency and Chain contracts
  urgency?: ContractUrgency;    // Time-limited urgency level
  chainData?: IChainData;       // Multi-step chain contract data

  // Premium contract fields (Sprint 7)
  isPremium?: boolean;          // Whether this is a premium contract
  premiumTemplateId?: string;   // Reference to premium template
  energyCost?: number;          // Energy required per phase
  phaseProgress?: number;       // Current phase for multi-phase contracts
  factionImpact?: Record<string, number>; // Faction reputation changes
  factionImpactApplied?: boolean; // Whether faction impact was applied
  cooldownExpiresAt?: Date;     // When the cooldown for this template ends
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

  // Premium contracts (Sprint 7)
  premiumContracts: IContract[]; // Separate array for premium contracts
  premiumCooldowns: Record<string, Date>; // templateId -> cooldown expiry
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
      enum: ['combat', 'crime', 'social', 'delivery', 'investigation', 'crafting', 'gang', 'boss', 'urgent', 'chain', 'bounty', 'territory']
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
      location: String,
      skills: [{
        skillId: { type: String, required: true },
        minLevel: { type: Number, required: true, min: 1 }
      }],
      // Phase 3: Combat-specific requirements
      combatTargetType: {
        type: String,
        enum: ['any', 'outlaw', 'wildlife', 'lawman', 'boss']
      },
      combatKillCount: Number,
      damageThreshold: Number,
      flawlessVictory: Boolean,
      handRank: String,
      bossId: String,
      // Phase 3: Gang-specific requirements
      gangRequired: Boolean,
      gangRankRequired: {
        type: String,
        enum: ['member', 'officer', 'leader']
      },
      territoryZoneId: String
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
      },
      skillXp: [{
        skillId: { type: String, required: true },
        amount: { type: Number, required: true, min: 1 }
      }]
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
    },
    // Phase 3: Urgency level
    urgency: {
      type: String,
      enum: ['standard', 'urgent', 'critical'],
      default: 'standard'
    },
    // Phase 3: Chain contract data
    chainData: {
      chainId: String,
      currentStep: { type: Number, default: 1 },
      totalSteps: Number,
      stepProgress: { type: Number, default: 0 },
      stepProgressMax: Number,
      stepsCompleted: [String],
      startedAt: Date,
      stepRewardsCollected: { type: Number, default: 0 }
    },
    // Premium contract fields (Sprint 7)
    isPremium: {
      type: Boolean,
      default: false
    },
    premiumTemplateId: String,
    energyCost: {
      type: Number,
      min: 0
    },
    phaseProgress: {
      type: Number,
      default: 0,
      min: 0
    },
    factionImpact: {
      type: Map,
      of: Number
    },
    factionImpactApplied: {
      type: Boolean,
      default: false
    },
    cooldownExpiresAt: Date
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
    },
    // Premium contracts (Sprint 7)
    premiumContracts: {
      type: [ContractSchema],
      default: []
    },
    premiumCooldowns: {
      type: Map,
      of: Date,
      default: {}
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
      // Copy streak from yesterday (will be incremented when first contract completed today)
      streak = yesterdayContract.streak;
    }
    // If yesterdayContract doesn't exist or completedCount === 0, streak stays at 0

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
