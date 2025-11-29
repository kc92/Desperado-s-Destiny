/**
 * Legacy Profile Model
 * Player-level (not character-level) progression tracking
 */

import mongoose, { Schema, Document } from 'mongoose';
import {
  LegacyProfile,
  LegacyTier,
  MilestoneProgress,
  CharacterLegacyContribution,
  LegacyReward,
  LifetimeStats,
} from '@desperados/shared';

export interface ILegacyProfile extends Omit<LegacyProfile, 'userId'>, Document {
  userId: mongoose.Types.ObjectId;

  // Instance methods
  updateStat(statKey: keyof LifetimeStats, value: number, increment?: boolean): void;
  completeMilestone(milestoneId: string): void;
  updateMilestoneProgress(milestoneId: string, currentValue: number, requirement: number): void;
  addCharacterContribution(contribution: CharacterLegacyContribution): void;
  updateTier(newTier: LegacyTier): void;
  addReward(reward: LegacyReward): void;
  claimReward(rewardId: string, characterId: string): LegacyReward | null;
}

export interface ILegacyProfileModel extends mongoose.Model<ILegacyProfile> {
  getOrCreate(userId: mongoose.Types.ObjectId | string): Promise<ILegacyProfile>;
}

const LifetimeStatsSchema = new Schema<LifetimeStats>(
  {
    // Combat
    totalEnemiesDefeated: { type: Number, default: 0 },
    totalBossesKilled: { type: Number, default: 0 },
    totalDuelsWon: { type: Number, default: 0 },
    totalDuelsLost: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    totalDamageTaken: { type: Number, default: 0 },

    // Economic
    totalGoldEarned: { type: Number, default: 0 },
    totalGoldSpent: { type: Number, default: 0 },
    totalPropertiesOwned: { type: Number, default: 0 },
    totalTradesCompleted: { type: Number, default: 0 },
    totalItemsCrafted: { type: Number, default: 0 },
    totalItemsBought: { type: Number, default: 0 },
    totalItemsSold: { type: Number, default: 0 },

    // Social
    highestGangRank: { type: Number, default: 0 },
    totalFriendsMade: { type: Number, default: 0 },
    totalMailSent: { type: Number, default: 0 },
    totalReputationEarned: { type: Number, default: 0 },

    // Exploration
    totalLocationsDiscovered: { type: Number, default: 0 },
    totalSecretsFound: { type: Number, default: 0 },
    totalRareEventsWitnessed: { type: Number, default: 0 },
    totalTerritoriesControlled: { type: Number, default: 0 },

    // Quests
    totalQuestsCompleted: { type: Number, default: 0 },
    totalLegendaryQuestsCompleted: { type: Number, default: 0 },
    totalStoryQuestsCompleted: { type: Number, default: 0 },
    totalSideQuestsCompleted: { type: Number, default: 0 },

    // Skills
    totalSkillsMaxed: { type: Number, default: 0 },
    totalSkillPointsEarned: { type: Number, default: 0 },
    totalProfessionsMastered: { type: Number, default: 0 },

    // Time
    totalDaysPlayed: { type: Number, default: 0 },
    totalHoursActive: { type: Number, default: 0 },
    totalLoginsCount: { type: Number, default: 0 },
    totalSeasonalEventsParticipated: { type: Number, default: 0 },

    // Special
    totalAchievementsUnlocked: { type: Number, default: 0 },
    totalCharactersCreated: { type: Number, default: 0 },
    totalCharactersRetired: { type: Number, default: 0 },
    highestLevelReached: { type: Number, default: 0 },
    highestFameReached: { type: Number, default: 0 },
  },
  { _id: false }
);

const MilestoneProgressSchema = new Schema<MilestoneProgress>(
  {
    milestoneId: { type: String, required: true },
    currentValue: { type: Number, required: true, default: 0 },
    requirement: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    timesCompleted: { type: Number, default: 0 },
  },
  { _id: false }
);

const CharacterLegacyContributionSchema =
  new Schema<CharacterLegacyContribution>(
    {
      characterId: { type: String, required: true },
      characterName: { type: String, required: true },
      level: { type: Number, required: true },
      playedFrom: { type: Date, required: true },
      playedUntil: { type: Date, required: true },
      retired: { type: Boolean, default: false },
      stats: { type: Schema.Types.Mixed, default: {} },
      notableMilestones: { type: [String], default: [] },
    },
    { _id: false }
  );

const LegacyRewardSchema = new Schema<LegacyReward>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    bonus: {
      type: {
        type: String,
        required: true,
      },
      value: { type: Schema.Types.Mixed, required: true },
      description: { type: String, required: true },
      displayName: { type: String, required: true },
      icon: { type: String },
    },
    unlockedAt: { type: Date, required: true },
    claimed: { type: Boolean, default: false },
    claimedBy: { type: String },
    claimedAt: { type: Date },
    oneTimeUse: { type: Boolean, default: true },
  },
  { _id: false }
);

const LegacyProfileSchema = new Schema<ILegacyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentTier: {
      type: String,
      enum: Object.values(LegacyTier),
      default: LegacyTier.NONE,
    },
    lifetimeStats: {
      type: LifetimeStatsSchema,
      default: () => ({}),
    },
    milestoneProgress: {
      type: [MilestoneProgressSchema],
      default: [],
    },
    completedMilestones: {
      type: [String],
      default: [],
      index: true,
    },
    rewards: {
      type: [LegacyRewardSchema],
      default: [],
    },
    characterContributions: {
      type: [CharacterLegacyContributionSchema],
      default: [],
    },
    totalMilestonesCompleted: {
      type: Number,
      default: 0,
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
LegacyProfileSchema.index({ userId: 1 });
LegacyProfileSchema.index({ currentTier: 1 });
LegacyProfileSchema.index({ totalMilestonesCompleted: -1 });
LegacyProfileSchema.index({ lastUpdated: -1 });

// Virtual for getting userId as string
LegacyProfileSchema.virtual('userIdString').get(function () {
  return this.userId.toString();
});

// Instance method to update a stat
LegacyProfileSchema.methods.updateStat = function (
  statKey: keyof LifetimeStats,
  value: number,
  increment: boolean = true
): void {
  if (increment) {
    this.lifetimeStats[statKey] =
      ((this.lifetimeStats[statKey] as number) || 0) + value;
  } else {
    this.lifetimeStats[statKey] = value;
  }
  this.lastUpdated = new Date();
};

// Instance method to complete a milestone
LegacyProfileSchema.methods.completeMilestone = function (
  milestoneId: string
): void {
  if (!this.completedMilestones.includes(milestoneId)) {
    this.completedMilestones.push(milestoneId);
    this.totalMilestonesCompleted += 1;
  }

  const progress = this.milestoneProgress.find(
    (p: MilestoneProgress) => p.milestoneId === milestoneId
  );

  if (progress) {
    progress.completed = true;
    progress.completedAt = new Date();
    progress.timesCompleted = (progress.timesCompleted || 0) + 1;
  }

  this.lastUpdated = new Date();
};

// Instance method to update milestone progress
LegacyProfileSchema.methods.updateMilestoneProgress = function (
  milestoneId: string,
  currentValue: number,
  requirement: number
): void {
  const existingProgress = this.milestoneProgress.find(
    (p: MilestoneProgress) => p.milestoneId === milestoneId
  );

  if (existingProgress) {
    existingProgress.currentValue = currentValue;
    existingProgress.requirement = requirement;
  } else {
    this.milestoneProgress.push({
      milestoneId,
      currentValue,
      requirement,
      completed: false,
      timesCompleted: 0,
    });
  }

  this.lastUpdated = new Date();
};

// Instance method to add character contribution
LegacyProfileSchema.methods.addCharacterContribution = function (
  contribution: CharacterLegacyContribution
): void {
  this.characterContributions.push(contribution);
  this.lastUpdated = new Date();
};

// Instance method to update tier
LegacyProfileSchema.methods.updateTier = function (newTier: LegacyTier): void {
  this.currentTier = newTier;
  this.lastUpdated = new Date();
};

// Instance method to add reward
LegacyProfileSchema.methods.addReward = function (reward: LegacyReward): void {
  this.rewards.push(reward);
  this.lastUpdated = new Date();
};

// Instance method to claim reward
LegacyProfileSchema.methods.claimReward = function (
  rewardId: string,
  characterId: string
): LegacyReward | null {
  const reward = this.rewards.find((r: LegacyReward) => r.id === rewardId);

  if (!reward) return null;
  if (reward.claimed && reward.oneTimeUse) return null;

  reward.claimed = true;
  reward.claimedBy = characterId;
  reward.claimedAt = new Date();
  this.lastUpdated = new Date();

  return reward;
};

// Static method to get or create legacy profile
LegacyProfileSchema.statics.getOrCreate = async function (
  userId: mongoose.Types.ObjectId | string
): Promise<ILegacyProfile> {
  const objectId =
    typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  let profile = await this.findOne({ userId: objectId });

  if (!profile) {
    profile = await this.create({
      userId: objectId,
      currentTier: LegacyTier.NONE,
      lifetimeStats: {},
      milestoneProgress: [],
      completedMilestones: [],
      rewards: [],
      characterContributions: [],
      totalMilestonesCompleted: 0,
    });
  }

  return profile;
};

// Pre-save hook to update lastUpdated
LegacyProfileSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

export const LegacyProfileModel = mongoose.model<ILegacyProfile, ILegacyProfileModel>(
  'LegacyProfile',
  LegacyProfileSchema
);
