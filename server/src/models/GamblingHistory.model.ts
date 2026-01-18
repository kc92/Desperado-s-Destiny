/**
 * Gambling History Model
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Tracks player's lifetime gambling statistics, addiction, and achievements
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  GamblingGameType,
  AddictionLevel,
  GamblingPrize
} from '@desperados/shared';

/**
 * Addiction debuff interface
 */
export interface IAddictionDebuff {
  id: string;
  name: string;
  description: string;
  effects: {
    statModifiers?: Map<string, number>;
    goldDrain?: number;
    actionEnergyCost?: number;
  };
  severity: number;
}

/**
 * Gambling moment interface
 */
export interface IGamblingMoment {
  id: string;
  timestamp: Date;
  gameType: GamblingGameType;
  description: string;
  goldAmount: number;
  wasWin: boolean;
  location: string;
  witnesses: string[];
}

/**
 * Gambling History document interface
 */
export interface IGamblingHistory extends Document {
  characterId: mongoose.Types.ObjectId;

  // Overall statistics
  totalSessions: number;
  totalGoldWagered: number;
  totalGoldWon: number;
  totalGoldLost: number;
  netLifetimeProfit: number;

  // Session breakdown by game
  sessionsByGame: Map<string, number>;
  profitByGame: Map<string, number>;

  // Achievements
  biggestSingleWin: number;
  biggestSingleLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  streakType: 'WIN' | 'LOSS' | 'NONE';

  // High stakes events
  eventsParticipated: number;
  eventsWon: number;
  eventPrizesEarned: any[];

  // Cheating history
  timesCaughtCheating: number;
  successfulCheats: number;
  cheatSuccessRate: number;

  // Addiction tracking
  addictionLevel: AddictionLevel;
  sessionsWithoutGambling: number;
  lastGamblingSession?: Date;
  addictionDebuffs: any[];

  // Reputation
  gamblerReputation: number;
  knownCheater: boolean;
  bannedLocations: string[];

  // Notable wins/losses
  memorableMoments: any[];

  // Timestamps
  firstSession?: Date;
  lastSession?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateAddictionLevel(): void;
  applyAddictionDebuffs(level: AddictionLevel): void;
  recordCheat(successful: boolean, locationId: string): void;
  banFromLocation(locationId: string): void;
  isBannedFrom(locationId: string): boolean;
  recordSession(gameType: GamblingGameType, netProfit: number, goldWagered: number): void;
  recordEventParticipation(eventData: any): void;
}

/**
 * Gambling History model interface
 */
export interface IGamblingHistoryModel extends Model<IGamblingHistory> {
  findByCharacter(characterId: string): Promise<IGamblingHistory | null>;
  createNewHistory(characterId: string): Promise<IGamblingHistory>;
  getLeaderboard(metric: string, limit: number): Promise<any[]>;
}

/**
 * Gambling History schema
 */
const GamblingHistorySchema = new Schema<IGamblingHistory>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },

    // Overall statistics
    totalSessions: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGoldWagered: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGoldWon: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGoldLost: {
      type: Number,
      default: 0,
      min: 0
    },
    netLifetimeProfit: {
      type: Number,
      default: 0
    },

    // Session breakdown by game
    sessionsByGame: {
      type: Map,
      of: Number,
      default: new Map()
    },
    profitByGame: {
      type: Map,
      of: Number,
      default: new Map()
    },

    // Achievements
    biggestSingleWin: {
      type: Number,
      default: 0,
      min: 0
    },
    biggestSingleLoss: {
      type: Number,
      default: 0,
      min: 0
    },
    longestWinStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    longestLossStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    streakType: {
      type: String,
      enum: ['WIN', 'LOSS', 'NONE'],
      default: 'NONE'
    },

    // High stakes events
    eventsParticipated: {
      type: Number,
      default: 0,
      min: 0
    },
    eventsWon: {
      type: Number,
      default: 0,
      min: 0
    },
    eventPrizesEarned: [{
      type: Schema.Types.Mixed
    }],

    // Cheating history
    timesCaughtCheating: {
      type: Number,
      default: 0,
      min: 0
    },
    successfulCheats: {
      type: Number,
      default: 0,
      min: 0
    },
    cheatSuccessRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Addiction tracking
    addictionLevel: {
      type: String,
      enum: Object.values(AddictionLevel),
      default: AddictionLevel.NONE
    },
    sessionsWithoutGambling: {
      type: Number,
      default: 0,
      min: 0
    },
    lastGamblingSession: {
      type: Date
    },
    addictionDebuffs: [{
      type: Schema.Types.Mixed
    }],

    // Reputation
    gamblerReputation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    knownCheater: {
      type: Boolean,
      default: false
    },
    bannedLocations: [{
      type: String
    }],

    // Notable wins/losses
    memorableMoments: [{
      type: Schema.Types.Mixed
    }],

    // Timestamps
    firstSession: {
      type: Date
    },
    lastSession: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// ============================================================================
// INDEXES
// ============================================================================

GamblingHistorySchema.index({ characterId: 1 }, { unique: true });
GamblingHistorySchema.index({ netLifetimeProfit: -1 });
GamblingHistorySchema.index({ gamblerReputation: -1 });
GamblingHistorySchema.index({ biggestSingleWin: -1 });
GamblingHistorySchema.index({ totalSessions: -1 });
GamblingHistorySchema.index({ addictionLevel: 1 });

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Record a new gambling session
 */
GamblingHistorySchema.methods.recordSession = function(
  this: IGamblingHistory,
  gameType: GamblingGameType,
  netProfit: number,
  goldWagered: number
): void {
  this.totalSessions += 1;
  this.totalGoldWagered += goldWagered;

  if (netProfit > 0) {
    this.totalGoldWon += netProfit;
  } else {
    this.totalGoldLost += Math.abs(netProfit);
  }

  this.netLifetimeProfit = this.totalGoldWon - this.totalGoldLost;

  // Update game-specific stats
  const gameTypeName = gameType.toString();
  const currentSessions = this.sessionsByGame.get(gameTypeName) || 0;
  this.sessionsByGame.set(gameTypeName, currentSessions + 1);

  const currentProfit = this.profitByGame.get(gameTypeName) || 0;
  this.profitByGame.set(gameTypeName, currentProfit + netProfit);

  // Update streaks
  if (netProfit > 0) {
    if (this.streakType === 'WIN') {
      this.currentStreak += 1;
    } else {
      this.streakType = 'WIN';
      this.currentStreak = 1;
    }
    if (this.currentStreak > this.longestWinStreak) {
      this.longestWinStreak = this.currentStreak;
    }
  } else if (netProfit < 0) {
    if (this.streakType === 'LOSS') {
      this.currentStreak += 1;
    } else {
      this.streakType = 'LOSS';
      this.currentStreak = 1;
    }
    if (this.currentStreak > this.longestLossStreak) {
      this.longestLossStreak = this.currentStreak;
    }
  }

  // Update biggest wins/losses
  if (netProfit > this.biggestSingleWin) {
    this.biggestSingleWin = netProfit;
  }
  if (netProfit < 0 && Math.abs(netProfit) > this.biggestSingleLoss) {
    this.biggestSingleLoss = Math.abs(netProfit);
  }

  // Update timestamps
  this.lastSession = new Date();
  if (!this.firstSession) {
    this.firstSession = new Date();
  }

  // Reset sessions without gambling counter
  this.sessionsWithoutGambling = 0;

  // Update addiction level
  this.updateAddictionLevel();
};

/**
 * Update addiction level based on total sessions
 */
GamblingHistorySchema.methods.updateAddictionLevel = function(
  this: IGamblingHistory
): void {
  const THRESHOLDS = {
    CASUAL: 20,
    REGULAR: 50,
    PROBLEM: 100,
    COMPULSIVE: 200
  };

  if (this.totalSessions >= THRESHOLDS.COMPULSIVE) {
    this.addictionLevel = AddictionLevel.ADDICTED;
    this.applyAddictionDebuffs(AddictionLevel.ADDICTED);
  } else if (this.totalSessions >= THRESHOLDS.PROBLEM) {
    this.addictionLevel = AddictionLevel.COMPULSIVE;
    this.applyAddictionDebuffs(AddictionLevel.COMPULSIVE);
  } else if (this.totalSessions >= THRESHOLDS.REGULAR) {
    this.addictionLevel = AddictionLevel.PROBLEM;
    this.applyAddictionDebuffs(AddictionLevel.PROBLEM);
  } else if (this.totalSessions >= THRESHOLDS.CASUAL) {
    this.addictionLevel = AddictionLevel.REGULAR;
  } else {
    this.addictionLevel = AddictionLevel.CASUAL;
  }
};

/**
 * Apply addiction debuffs based on level
 */
GamblingHistorySchema.methods.applyAddictionDebuffs = function(
  this: IGamblingHistory,
  level: AddictionLevel
): void {
  this.addictionDebuffs = [];

  switch (level) {
    case AddictionLevel.PROBLEM:
      this.addictionDebuffs.push({
        id: 'gambling_itch',
        name: 'Gambling Itch',
        description: 'You feel the urge to gamble constantly',
        effects: {
          statModifiers: new Map([['cunning', -2]]),
          actionEnergyCost: 1
        },
        severity: 2
      });
      break;

    case AddictionLevel.COMPULSIVE:
      this.addictionDebuffs.push({
        id: 'compulsive_gambling',
        name: 'Compulsive Gambling',
        description: 'Your gambling problem affects your daily life',
        effects: {
          statModifiers: new Map([
            ['cunning', -5],
            ['spirit', -3]
          ]),
          goldDrain: 10, // Lose 10 gold per hour
          actionEnergyCost: 2
        },
        severity: 4
      });
      break;

    case AddictionLevel.ADDICTED:
      this.addictionDebuffs.push({
        id: 'gambling_addiction',
        name: 'Gambling Addiction',
        description: 'Severe gambling addiction controls your life',
        effects: {
          statModifiers: new Map([
            ['cunning', -10],
            ['spirit', -5],
            ['combat', -3]
          ]),
          goldDrain: 25, // Lose 25 gold per hour
          actionEnergyCost: 5
        },
        severity: 5
      });
      break;
  }
};

/**
 * Record cheating incident
 */
GamblingHistorySchema.methods.recordCheat = function(
  this: IGamblingHistory,
  success: boolean,
  caught: boolean
): void {
  if (success) {
    this.successfulCheats += 1;
  }

  if (caught) {
    this.timesCaughtCheating += 1;
    this.gamblerReputation = Math.max(0, this.gamblerReputation - 10);

    // Become known cheater after 3 times caught
    if (this.timesCaughtCheating >= 3) {
      this.knownCheater = true;
    }
  }

  // Update cheat success rate
  const totalCheats = this.successfulCheats + this.timesCaughtCheating;
  if (totalCheats > 0) {
    this.cheatSuccessRate = (this.successfulCheats / totalCheats) * 100;
  }
};

/**
 * Ban from location
 */
GamblingHistorySchema.methods.banFromLocation = function(
  this: IGamblingHistory,
  location: string
): void {
  if (!this.bannedLocations.includes(location)) {
    this.bannedLocations.push(location);
  }
};

/**
 * Check if banned from location
 */
GamblingHistorySchema.methods.isBannedFrom = function(
  this: IGamblingHistory,
  location: string
): boolean {
  return this.bannedLocations.includes(location);
};

/**
 * Add memorable moment
 */
GamblingHistorySchema.methods.addMemorableMoment = function(
  this: IGamblingHistory,
  moment: IGamblingMoment
): void {
  this.memorableMoments.push(moment);

  // Keep only last 50 moments
  if (this.memorableMoments.length > 50) {
    this.memorableMoments = this.memorableMoments.slice(-50);
  }
};

/**
 * Recover from addiction
 */
GamblingHistorySchema.methods.recoverFromAddiction = function(
  this: IGamblingHistory,
  method: 'SPIRIT_SPRINGS' | 'TIME' | 'COUNSELING'
): void {
  switch (method) {
    case 'SPIRIT_SPRINGS':
      // Full recovery
      this.addictionLevel = AddictionLevel.NONE;
      this.addictionDebuffs = [];
      this.sessionsWithoutGambling = 0;
      break;

    case 'COUNSELING':
      // Reduce one level
      const levels = [
        AddictionLevel.NONE,
        AddictionLevel.CASUAL,
        AddictionLevel.REGULAR,
        AddictionLevel.PROBLEM,
        AddictionLevel.COMPULSIVE,
        AddictionLevel.ADDICTED
      ];
      const currentIndex = levels.indexOf(this.addictionLevel);
      if (currentIndex > 0) {
        this.addictionLevel = levels[currentIndex - 1];
        this.updateAddictionLevel();
      }
      break;

    case 'TIME':
      // Natural recovery through abstinence
      this.sessionsWithoutGambling += 1;
      if (this.sessionsWithoutGambling >= 30) {
        const levels = [
          AddictionLevel.NONE,
          AddictionLevel.CASUAL,
          AddictionLevel.REGULAR,
          AddictionLevel.PROBLEM,
          AddictionLevel.COMPULSIVE,
          AddictionLevel.ADDICTED
        ];
        const currentIndex = levels.indexOf(this.addictionLevel);
        if (currentIndex > 0) {
          this.addictionLevel = levels[currentIndex - 1];
          this.sessionsWithoutGambling = 0;
          this.updateAddictionLevel();
        }
      }
      break;
  }
};

/**
 * Record event participation
 */
GamblingHistorySchema.methods.recordEventParticipation = function(
  this: IGamblingHistory,
  won: boolean,
  prizes?: GamblingPrize[]
): void {
  this.eventsParticipated += 1;

  if (won) {
    this.eventsWon += 1;
    this.gamblerReputation = Math.min(100, this.gamblerReputation + 10);

    if (prizes) {
      this.eventPrizesEarned.push(...prizes);
    }
  }
};

/**
 * Get overall win rate
 */
GamblingHistorySchema.methods.getOverallWinRate = function(
  this: IGamblingHistory
): number {
  const totalOutcomes = this.totalGoldWon + this.totalGoldLost;
  if (totalOutcomes === 0) {
    return 0;
  }
  return (this.totalGoldWon / totalOutcomes) * 100;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find history by character
 */
GamblingHistorySchema.statics.findByCharacter = async function(
  characterId: string
): Promise<IGamblingHistory | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId)
  });
};

/**
 * Create new history for character
 */
GamblingHistorySchema.statics.createNewHistory = async function(
  characterId: string
): Promise<IGamblingHistory> {
  const history = new this({
    characterId: new mongoose.Types.ObjectId(characterId)
  });
  await history.save();
  return history;
};

/**
 * Get leaderboard
 */
GamblingHistorySchema.statics.getLeaderboard = async function(
  metric: string,
  limit: number = 10
): Promise<any[]> {
  const sortField: Record<string, number> = {};
  sortField[metric] = -1;

  return this.find()
    .sort(sortField)
    .limit(limit)
    .populate('characterId', 'name level faction')
    .lean();
};

/**
 * Export model
 */
export const GamblingHistory = mongoose.model<IGamblingHistory, IGamblingHistoryModel>(
  'GamblingHistory',
  GamblingHistorySchema
);
