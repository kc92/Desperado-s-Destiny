/**
 * Player Influence Contribution Model
 *
 * Tracks individual player contributions to faction influence
 * Supports milestone progression and leaderboards
 * Phase 11, Wave 11.1
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  TerritoryFactionId,
  ContributionMilestone,
  ActionCategory,
  MILESTONE_THRESHOLDS,
} from '@desperados/shared';

/**
 * Daily contribution entry
 */
export interface DailyContribution {
  date: Date;
  amount: number;
  actionCount: number;
}

/**
 * Territory contribution entry
 */
export interface TerritoryContribution {
  territoryId: string;
  amount: number;
}

/**
 * Action category contribution entry
 */
export interface ActionCategoryContribution {
  category: ActionCategory;
  amount: number;
}

/**
 * Player Influence Contribution document interface
 */
export interface IPlayerInfluenceContribution extends Document {
  characterId: mongoose.Types.ObjectId;
  characterName: string;

  factionId: TerritoryFactionId;
  totalInfluenceContributed: number;

  currentMilestone: ContributionMilestone | null;
  milestonesAchieved: ContributionMilestone[];

  contributionsByType: ActionCategoryContribution[];
  contributionsByTerritory: TerritoryContribution[];

  dailyContributions: DailyContribution[];
  weeklyInfluence: number;
  monthlyInfluence: number;

  lastContribution: Date;
  firstContribution: Date;

  // Metadata
  lastMilestoneReached: Date | null;
  totalActionsPerformed: number;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addContribution(
    amount: number,
    actionCategory: ActionCategory,
    territoryId?: string
  ): ContributionMilestone | null;

  getContributionForCategory(category: ActionCategory): number;
  getContributionForTerritory(territoryId: string): number;
  calculateWeeklyInfluence(): number;
  calculateMonthlyInfluence(): number;
  getNextMilestone(): { milestone: ContributionMilestone; remaining: number } | null;
}

/**
 * Player Influence Contribution static methods interface
 */
export interface IPlayerInfluenceContributionModel extends Model<IPlayerInfluenceContribution> {
  findByCharacter(characterId: mongoose.Types.ObjectId, factionId: TerritoryFactionId): Promise<IPlayerInfluenceContribution | null>;

  getTopContributors(
    factionId: TerritoryFactionId,
    limit: number,
    period?: 'all' | 'weekly' | 'monthly'
  ): Promise<IPlayerInfluenceContribution[]>;

  getCharacterRank(
    characterId: mongoose.Types.ObjectId,
    factionId: TerritoryFactionId
  ): Promise<number>;

  getFactionTotalInfluence(factionId: TerritoryFactionId): Promise<number>;
}

/**
 * Player Influence Contribution schema definition
 */
const PlayerInfluenceContributionSchema = new Schema<IPlayerInfluenceContribution>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    characterName: {
      type: String,
      required: true,
    },

    factionId: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFactionId),
      index: true,
    },
    totalInfluenceContributed: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    currentMilestone: {
      type: String,
      enum: [...Object.values(ContributionMilestone), null],
      default: null,
    },
    milestonesAchieved: [{
      type: String,
      enum: Object.values(ContributionMilestone),
    }],

    contributionsByType: [{
      category: {
        type: String,
        enum: Object.values(ActionCategory),
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    }],

    contributionsByTerritory: [{
      territoryId: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    }],

    dailyContributions: [{
      date: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      actionCount: {
        type: Number,
        required: true,
        min: 0,
      },
    }],

    weeklyInfluence: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyInfluence: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastContribution: {
      type: Date,
      default: Date.now,
    },
    firstContribution: {
      type: Date,
      default: Date.now,
    },

    lastMilestoneReached: {
      type: Date,
      default: null,
    },
    totalActionsPerformed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
PlayerInfluenceContributionSchema.index({ characterId: 1, factionId: 1 }, { unique: true });
PlayerInfluenceContributionSchema.index({ factionId: 1, totalInfluenceContributed: -1 });
PlayerInfluenceContributionSchema.index({ factionId: 1, weeklyInfluence: -1 });
PlayerInfluenceContributionSchema.index({ factionId: 1, monthlyInfluence: -1 });
PlayerInfluenceContributionSchema.index({ lastContribution: 1 });

/**
 * Instance method: Add contribution and check for milestone
 */
PlayerInfluenceContributionSchema.methods.addContribution = function(
  this: IPlayerInfluenceContribution,
  amount: number,
  actionCategory: ActionCategory,
  territoryId?: string
): ContributionMilestone | null {
  const previousTotal = this.totalInfluenceContributed;
  this.totalInfluenceContributed += amount;
  this.lastContribution = new Date();
  this.totalActionsPerformed += 1;

  // Update contribution by type
  const categoryEntry = this.contributionsByType.find(
    c => c.category === actionCategory
  );
  if (categoryEntry) {
    categoryEntry.amount += amount;
  } else {
    this.contributionsByType.push({
      category: actionCategory,
      amount,
    });
  }

  // Update contribution by territory
  if (territoryId) {
    const territoryEntry = this.contributionsByTerritory.find(
      t => t.territoryId === territoryId
    );
    if (territoryEntry) {
      territoryEntry.amount += amount;
    } else {
      this.contributionsByTerritory.push({
        territoryId,
        amount,
      });
    }
  }

  // Update daily contribution
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntry = this.dailyContributions.find(
    d => d.date.getTime() === today.getTime()
  );
  if (todayEntry) {
    todayEntry.amount += amount;
    todayEntry.actionCount += 1;
  } else {
    this.dailyContributions.push({
      date: today,
      amount,
      actionCount: 1,
    });

    // Keep only last 90 days
    if (this.dailyContributions.length > 90) {
      this.dailyContributions.sort((a, b) => b.date.getTime() - a.date.getTime());
      this.dailyContributions = this.dailyContributions.slice(0, 90);
    }
  }

  // Check for milestone progression
  const milestones = [
    ContributionMilestone.ALLY,
    ContributionMilestone.CHAMPION,
    ContributionMilestone.HERO,
    ContributionMilestone.LEGEND,
    ContributionMilestone.MYTHIC,
  ];

  let newMilestone: ContributionMilestone | null = null;

  for (const milestone of milestones) {
    const threshold = MILESTONE_THRESHOLDS[milestone];

    // Check if we just crossed this threshold
    if (previousTotal < threshold && this.totalInfluenceContributed >= threshold) {
      // Only award if not already achieved
      if (!this.milestonesAchieved.includes(milestone)) {
        this.milestonesAchieved.push(milestone);
        this.currentMilestone = milestone;
        this.lastMilestoneReached = new Date();
        newMilestone = milestone;
      }
    }
  }

  return newMilestone;
};

/**
 * Instance method: Get contribution for specific category
 */
PlayerInfluenceContributionSchema.methods.getContributionForCategory = function(
  this: IPlayerInfluenceContribution,
  category: ActionCategory
): number {
  const entry = this.contributionsByType.find(c => c.category === category);
  return entry ? entry.amount : 0;
};

/**
 * Instance method: Get contribution for specific territory
 */
PlayerInfluenceContributionSchema.methods.getContributionForTerritory = function(
  this: IPlayerInfluenceContribution,
  territoryId: string
): number {
  const entry = this.contributionsByTerritory.find(t => t.territoryId === territoryId);
  return entry ? entry.amount : 0;
};

/**
 * Instance method: Calculate weekly influence
 */
PlayerInfluenceContributionSchema.methods.calculateWeeklyInfluence = function(
  this: IPlayerInfluenceContribution
): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  let total = 0;
  for (const daily of this.dailyContributions) {
    if (daily.date >= weekAgo) {
      total += daily.amount;
    }
  }

  this.weeklyInfluence = total;
  return total;
};

/**
 * Instance method: Calculate monthly influence
 */
PlayerInfluenceContributionSchema.methods.calculateMonthlyInfluence = function(
  this: IPlayerInfluenceContribution
): number {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  monthAgo.setHours(0, 0, 0, 0);

  let total = 0;
  for (const daily of this.dailyContributions) {
    if (daily.date >= monthAgo) {
      total += daily.amount;
    }
  }

  this.monthlyInfluence = total;
  return total;
};

/**
 * Instance method: Get next milestone and progress
 */
PlayerInfluenceContributionSchema.methods.getNextMilestone = function(
  this: IPlayerInfluenceContribution
): { milestone: ContributionMilestone; remaining: number } | null {
  const milestones = [
    ContributionMilestone.ALLY,
    ContributionMilestone.CHAMPION,
    ContributionMilestone.HERO,
    ContributionMilestone.LEGEND,
    ContributionMilestone.MYTHIC,
  ];

  for (const milestone of milestones) {
    const threshold = MILESTONE_THRESHOLDS[milestone];
    if (this.totalInfluenceContributed < threshold) {
      return {
        milestone,
        remaining: threshold - this.totalInfluenceContributed,
      };
    }
  }

  return null; // Already at max milestone
};

/**
 * Static method: Find contribution record by character and faction
 */
PlayerInfluenceContributionSchema.statics.findByCharacter = async function(
  characterId: mongoose.Types.ObjectId,
  factionId: TerritoryFactionId
): Promise<IPlayerInfluenceContribution | null> {
  return this.findOne({ characterId, factionId });
};

/**
 * Static method: Get top contributors for a faction
 */
PlayerInfluenceContributionSchema.statics.getTopContributors = async function(
  factionId: TerritoryFactionId,
  limit: number = 100,
  period: 'all' | 'weekly' | 'monthly' = 'all'
): Promise<IPlayerInfluenceContribution[]> {
  const sortField = period === 'weekly'
    ? 'weeklyInfluence'
    : period === 'monthly'
    ? 'monthlyInfluence'
    : 'totalInfluenceContributed';

  return this.find({ factionId })
    .sort({ [sortField]: -1 })
    .limit(limit)
    .populate('characterId', 'name level gangId')
    .lean();
};

/**
 * Static method: Get character's rank within faction
 */
PlayerInfluenceContributionSchema.statics.getCharacterRank = async function(
  characterId: mongoose.Types.ObjectId,
  factionId: TerritoryFactionId
): Promise<number> {
  const character = await this.findOne({ characterId, factionId });
  if (!character) {
    return 0;
  }

  const rank = await this.countDocuments({
    factionId,
    totalInfluenceContributed: { $gt: character.totalInfluenceContributed },
  });

  return rank + 1;
};

/**
 * Static method: Get total faction influence from all players
 */
PlayerInfluenceContributionSchema.statics.getFactionTotalInfluence = async function(
  factionId: TerritoryFactionId
): Promise<number> {
  const result = await this.aggregate([
    { $match: { factionId } },
    { $group: { _id: null, total: { $sum: '$totalInfluenceContributed' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

/**
 * Player Influence Contribution model
 */
export const PlayerInfluenceContribution = mongoose.model<
  IPlayerInfluenceContribution,
  IPlayerInfluenceContributionModel
>('PlayerInfluenceContribution', PlayerInfluenceContributionSchema);
