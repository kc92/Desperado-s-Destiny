/**
 * Race Bet Model
 * Phase 13, Wave 13.2
 *
 * Mongoose model for horse racing bets
 */

import { Schema, model, Document } from 'mongoose';
import {
  RaceBet as IRaceBet,
  RaceBetType
} from '@desperados/shared';

// ============================================================================
// MONGOOSE DOCUMENT INTERFACE
// ============================================================================

export interface RaceBetDocument extends Omit<IRaceBet, '_id'>, Document {
  _id: Schema.Types.ObjectId;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const RaceBetSchema = new Schema<RaceBetDocument>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    raceId: {
      type: Schema.Types.ObjectId,
      ref: 'HorseRace',
      required: true,
      index: true
    },

    // Bet details
    betType: {
      type: String,
      enum: Object.values(RaceBetType),
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    // Horse selections (in order for exacta/trifecta)
    selections: [{
      type: Schema.Types.ObjectId,
      ref: 'Horse',
      required: true
    }],

    // Odds at time of bet
    odds: {
      type: Number,
      required: true,
      min: 1
    },

    potentialPayout: {
      type: Number,
      required: true
    },

    // Result
    status: {
      type: String,
      enum: ['PENDING', 'WON', 'LOST', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },

    actualPayout: {
      type: Number,
      default: 0
    },

    // Timestamps
    placedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    settledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// ============================================================================
// INDEXES
// ============================================================================

RaceBetSchema.index({ characterId: 1, status: 1 });
RaceBetSchema.index({ raceId: 1, status: 1 });
RaceBetSchema.index({ characterId: 1, placedAt: -1 });

// ============================================================================
// VIRTUALS
// ============================================================================

RaceBetSchema.virtual('isPending').get(function (this: RaceBetDocument) {
  return this.status === 'PENDING';
});

RaceBetSchema.virtual('isWon').get(function (this: RaceBetDocument) {
  return this.status === 'WON';
});

RaceBetSchema.virtual('profit').get(function (this: RaceBetDocument) {
  if (this.status === 'WON') {
    return this.actualPayout - this.amount;
  } else if (this.status === 'REFUNDED') {
    return 0;
  } else {
    return -this.amount;
  }
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Settle bet as won
 */
RaceBetSchema.methods.settleAsWon = function (
  this: RaceBetDocument,
  payout: number
) {
  this.status = 'WON';
  this.actualPayout = payout;
  this.settledAt = new Date();
};

/**
 * Settle bet as lost
 */
RaceBetSchema.methods.settleAsLost = function (this: RaceBetDocument) {
  this.status = 'LOST';
  this.actualPayout = 0;
  this.settledAt = new Date();
};

/**
 * Refund bet (race cancelled)
 */
RaceBetSchema.methods.refund = function (this: RaceBetDocument) {
  this.status = 'REFUNDED';
  this.actualPayout = this.amount;
  this.settledAt = new Date();
};

// ============================================================================
// STATICS
// ============================================================================

/**
 * Get all bets for a race
 */
RaceBetSchema.statics.getBetsForRace = function (
  raceId: Schema.Types.ObjectId
) {
  return this.find({ raceId });
};

/**
 * Get pending bets for a character
 */
RaceBetSchema.statics.getPendingBets = function (
  characterId: Schema.Types.ObjectId
) {
  return this.find({
    characterId,
    status: 'PENDING'
  }).populate('raceId');
};

/**
 * Get betting history for a character
 */
RaceBetSchema.statics.getBettingHistory = function (
  characterId: Schema.Types.ObjectId,
  limit: number = 50
) {
  return this.find({ characterId })
    .sort({ placedAt: -1 })
    .limit(limit)
    .populate('raceId');
};

/**
 * Calculate betting statistics for a character
 */
RaceBetSchema.statics.getCharacterBettingStats = async function (
  characterId: Schema.Types.ObjectId
) {
  const bets = await this.find({ characterId, status: { $ne: 'PENDING' } });

  const stats = {
    totalBets: bets.length,
    wonBets: 0,
    lostBets: 0,
    refundedBets: 0,
    totalWagered: 0,
    totalWon: 0,
    totalLost: 0,
    netProfit: 0,
    winRate: 0,
    biggestWin: 0,
    biggestLoss: 0,
    favoriteStreak: 0,
    currentStreak: 0,
    streakType: 'NONE' as 'WIN' | 'LOSS' | 'NONE'
  };

  let currentStreak = 0;
  let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';

  bets.forEach((bet, index) => {
    stats.totalWagered += bet.amount;

    if (bet.status === 'WON') {
      stats.wonBets++;
      stats.totalWon += bet.actualPayout || 0;
      const profit = (bet.actualPayout || 0) - bet.amount;
      stats.biggestWin = Math.max(stats.biggestWin, profit);

      // Streak tracking
      if (streakType === 'WIN' || streakType === 'NONE') {
        currentStreak++;
        streakType = 'WIN';
      } else {
        currentStreak = 1;
        streakType = 'WIN';
      }
    } else if (bet.status === 'LOST') {
      stats.lostBets++;
      stats.totalLost += bet.amount;
      stats.biggestLoss = Math.max(stats.biggestLoss, bet.amount);

      // Streak tracking
      if (streakType === 'LOSS' || streakType === 'NONE') {
        currentStreak++;
        streakType = 'LOSS';
      } else {
        currentStreak = 1;
        streakType = 'LOSS';
      }
    } else if (bet.status === 'REFUNDED') {
      stats.refundedBets++;
    }

    // Update favorite streak
    if (currentStreak > stats.favoriteStreak && streakType === 'WIN') {
      stats.favoriteStreak = currentStreak;
    }

    // Last bet determines current streak
    if (index === bets.length - 1) {
      stats.currentStreak = currentStreak;
      stats.streakType = streakType;
    }
  });

  stats.netProfit = stats.totalWon - stats.totalLost;
  stats.winRate = stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0;

  return stats;
};

/**
 * Get total wagered on a race
 */
RaceBetSchema.statics.getTotalWagered = async function (
  raceId: Schema.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { raceId } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return result[0]?.total || 0;
};

/**
 * Get betting breakdown by type for a race
 */
RaceBetSchema.statics.getBettingBreakdown = async function (
  raceId: Schema.Types.ObjectId
) {
  return this.aggregate([
    { $match: { raceId } },
    {
      $group: {
        _id: '$betType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// ============================================================================
// BETTING SLIP MODEL
// ============================================================================

const BettingSlipSchema = new Schema(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    bets: [{
      type: Schema.Types.ObjectId,
      ref: 'RaceBet',
      required: true
    }],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    potentialPayout: {
      type: Number,
      required: true
    },

    actualPayout: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

BettingSlipSchema.index({ characterId: 1, createdAt: -1 });

// ============================================================================
// EXPORTS
// ============================================================================

export const RaceBet = model<RaceBetDocument>('RaceBet', RaceBetSchema);
export const BettingSlip = model('BettingSlip', BettingSlipSchema);
