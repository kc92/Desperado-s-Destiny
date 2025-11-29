/**
 * Gambling Session Model
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Tracks active and completed gambling sessions
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  GamblingGameType,
  GamblingSessionStatus,
  CheatMethod
} from '@desperados/shared';

/**
 * Gambling Session document interface
 */
export interface IGamblingSession extends Document {
  characterId: mongoose.Types.ObjectId;
  gameId: string;
  gameType: GamblingGameType;
  eventId?: string;

  // Session details
  startTime: Date;
  endTime?: Date;
  status: GamblingSessionStatus;
  location: string;

  // Financial tracking
  startingGold: number;
  currentGold: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;

  // Gameplay statistics
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  biggestWin: number;
  biggestLoss: number;

  // Cheating tracking
  cheatAttempts: number;
  successfulCheats: number;
  caughtCheating: boolean;
  cheatMethods: CheatMethod[];

  // Dealer info
  dealerNPC?: string;
  dealerSkillLevel: number;

  // Other players at table
  otherPlayers: mongoose.Types.ObjectId[];

  // Game-specific state (varies by game type)
  gameState?: any;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getDurationMinutes(): number;
  updateFinancials(amount: number): void;
  recordHandResult(result: 'win' | 'loss' | 'push'): void;
  recordCheatAttempt(method: CheatMethod, successful: boolean, caught?: boolean): void;
  completeSession(): void;
}

/**
 * Gambling Session model interface
 */
export interface IGamblingSessionModel extends Model<IGamblingSession> {
  findActiveSessions(characterId: string): Promise<IGamblingSession[]>;
  findActiveSessionByCharacter(characterId: string): Promise<IGamblingSession | null>;
  findSessionsByGame(gameId: string): Promise<IGamblingSession[]>;
  findSessionsByLocation(location: string): Promise<IGamblingSession[]>;
  getSessionStats(sessionId: string): Promise<any>;
}

/**
 * Gambling Session schema
 */
const GamblingSessionSchema = new Schema<IGamblingSession>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    gameId: {
      type: String,
      required: true,
      index: true
    },
    gameType: {
      type: String,
      enum: Object.values(GamblingGameType),
      required: true
    },
    eventId: {
      type: String,
      index: true
    },

    // Session details
    startTime: {
      type: Date,
      default: Date.now,
      index: true
    },
    endTime: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(GamblingSessionStatus),
      default: GamblingSessionStatus.ACTIVE,
      index: true
    },
    location: {
      type: String,
      required: true,
      index: true
    },

    // Financial tracking
    startingGold: {
      type: Number,
      required: true,
      min: 0
    },
    currentGold: {
      type: Number,
      required: true,
      min: 0
    },
    totalWagered: {
      type: Number,
      default: 0,
      min: 0
    },
    totalWon: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLost: {
      type: Number,
      default: 0,
      min: 0
    },
    netProfit: {
      type: Number,
      default: 0
    },

    // Gameplay statistics
    handsPlayed: {
      type: Number,
      default: 0,
      min: 0
    },
    handsWon: {
      type: Number,
      default: 0,
      min: 0
    },
    handsLost: {
      type: Number,
      default: 0,
      min: 0
    },
    handsPushed: {
      type: Number,
      default: 0,
      min: 0
    },
    biggestWin: {
      type: Number,
      default: 0,
      min: 0
    },
    biggestLoss: {
      type: Number,
      default: 0,
      min: 0
    },

    // Cheating tracking
    cheatAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    successfulCheats: {
      type: Number,
      default: 0,
      min: 0
    },
    caughtCheating: {
      type: Boolean,
      default: false
    },
    cheatMethods: [{
      type: String,
      enum: Object.values(CheatMethod)
    }],

    // Dealer info
    dealerNPC: {
      type: String
    },
    dealerSkillLevel: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },

    // Other players at table
    otherPlayers: [{
      type: Schema.Types.ObjectId,
      ref: 'Character'
    }],

    // Game-specific state
    gameState: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// ============================================================================
// INDEXES
// ============================================================================

GamblingSessionSchema.index({ characterId: 1, status: 1 });
GamblingSessionSchema.index({ gameId: 1, status: 1 });
GamblingSessionSchema.index({ location: 1, status: 1 });
GamblingSessionSchema.index({ eventId: 1, status: 1 });
GamblingSessionSchema.index({ startTime: -1 });
GamblingSessionSchema.index({ status: 1, startTime: -1 });

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Update financial stats
 */
GamblingSessionSchema.methods.updateFinancials = function(
  this: IGamblingSession,
  goldChange: number,
  wagerAmount: number
): void {
  this.currentGold += goldChange;
  this.totalWagered += wagerAmount;

  if (goldChange > 0) {
    this.totalWon += goldChange;
    if (goldChange > this.biggestWin) {
      this.biggestWin = goldChange;
    }
  } else if (goldChange < 0) {
    const loss = Math.abs(goldChange);
    this.totalLost += loss;
    if (loss > this.biggestLoss) {
      this.biggestLoss = loss;
    }
  }

  this.netProfit = this.currentGold - this.startingGold;
};

/**
 * Record hand result
 */
GamblingSessionSchema.methods.recordHandResult = function(
  this: IGamblingSession,
  result: 'WIN' | 'LOSS' | 'PUSH'
): void {
  this.handsPlayed += 1;

  switch (result) {
    case 'WIN':
      this.handsWon += 1;
      break;
    case 'LOSS':
      this.handsLost += 1;
      break;
    case 'PUSH':
      this.handsPushed += 1;
      break;
  }
};

/**
 * Record cheat attempt
 */
GamblingSessionSchema.methods.recordCheatAttempt = function(
  this: IGamblingSession,
  method: CheatMethod,
  success: boolean,
  caught: boolean
): void {
  this.cheatAttempts += 1;

  if (!this.cheatMethods.includes(method)) {
    this.cheatMethods.push(method);
  }

  if (success) {
    this.successfulCheats += 1;
  }

  if (caught) {
    this.caughtCheating = true;
    this.status = GamblingSessionStatus.CAUGHT_CHEATING;
  }
};

/**
 * Complete session
 */
GamblingSessionSchema.methods.completeSession = function(
  this: IGamblingSession,
  status: GamblingSessionStatus = GamblingSessionStatus.COMPLETED
): void {
  this.status = status;
  this.endTime = new Date();
  this.netProfit = this.currentGold - this.startingGold;
};

/**
 * Get win rate
 */
GamblingSessionSchema.methods.getWinRate = function(this: IGamblingSession): number {
  if (this.handsPlayed === 0) {
    return 0;
  }
  return (this.handsWon / this.handsPlayed) * 100;
};

/**
 * Get session duration in minutes
 */
GamblingSessionSchema.methods.getDurationMinutes = function(this: IGamblingSession): number {
  const endTime = this.endTime || new Date();
  const durationMs = endTime.getTime() - this.startTime.getTime();
  return Math.floor(durationMs / (60 * 1000));
};

/**
 * Check if session is expired
 */
GamblingSessionSchema.methods.isExpired = function(
  this: IGamblingSession,
  maxDurationMinutes: number
): boolean {
  if (this.status !== GamblingSessionStatus.ACTIVE) {
    return false;
  }
  return this.getDurationMinutes() > maxDurationMinutes;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find all active sessions for a character
 */
GamblingSessionSchema.statics.findActiveSessions = async function(
  characterId: string
): Promise<IGamblingSession[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: GamblingSessionStatus.ACTIVE
  }).sort({ startTime: -1 });
};

/**
 * Find active session for a character
 */
GamblingSessionSchema.statics.findActiveSessionByCharacter = async function(
  characterId: string
): Promise<IGamblingSession | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: GamblingSessionStatus.ACTIVE
  }).sort({ startTime: -1 });
};

/**
 * Find sessions by game
 */
GamblingSessionSchema.statics.findSessionsByGame = async function(
  gameId: string
): Promise<IGamblingSession[]> {
  return this.find({
    gameId,
    status: GamblingSessionStatus.ACTIVE
  }).sort({ startTime: -1 });
};

/**
 * Find active sessions at location
 */
GamblingSessionSchema.statics.findSessionsByLocation = async function(
  location: string
): Promise<IGamblingSession[]> {
  return this.find({
    location,
    status: GamblingSessionStatus.ACTIVE
  }).sort({ startTime: -1 });
};

/**
 * Get session statistics
 */
GamblingSessionSchema.statics.getSessionStats = async function(
  sessionId: string
): Promise<any> {
  const session = await this.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  return {
    sessionId: session._id,
    gameType: session.gameType,
    duration: session.getDurationMinutes(),
    handsPlayed: session.handsPlayed,
    winRate: session.getWinRate(),
    netProfit: session.netProfit,
    biggestWin: session.biggestWin,
    biggestLoss: session.biggestLoss,
    averageWager: session.handsPlayed > 0 ? session.totalWagered / session.handsPlayed : 0,
    cheatAttempts: session.cheatAttempts,
    successfulCheats: session.successfulCheats,
    caughtCheating: session.caughtCheating
  };
};

/**
 * Export model
 */
export const GamblingSession = mongoose.model<IGamblingSession, IGamblingSessionModel>(
  'GamblingSession',
  GamblingSessionSchema
);
