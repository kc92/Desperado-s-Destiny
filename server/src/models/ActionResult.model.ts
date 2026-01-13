/**
 * ActionResult Model
 *
 * Mongoose schema for recording the outcomes of player actions
 * performed using the Destiny Deck system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Card, HandRank } from '@desperados/shared';

/**
 * Suit bonuses applied to action result
 */
export interface SuitBonuses {
  spades: number;
  hearts: number;
  clubs: number;
  diamonds: number;
}

/**
 * Rewards gained from action
 */
export interface RewardsGained {
  xp: number;
  gold: number;
  items: string[];
}

/**
 * Game mode for action results
 * - poker: Traditional 5-card poker hand evaluation
 * - press_your_luck: Variable 1-10 card draw with danger tracking
 */
export type ActionGameMode = 'poker' | 'press_your_luck';

/**
 * ActionResult document interface
 */
export interface IActionResult extends Document {
  // References
  characterId: mongoose.Types.ObjectId;
  actionId: mongoose.Types.ObjectId;

  // Game mode (determines validation rules)
  gameMode: ActionGameMode;

  // Cards drawn and evaluation
  cardsDrawn: Card[];
  handRank: HandRank | string; // Number for poker, string for press_your_luck
  handScore: number;
  handDescription: string;

  // Bonuses applied
  suitBonuses: SuitBonuses;
  totalScore: number;

  // Outcome
  success: boolean;
  rewardsGained: RewardsGained;

  // Timestamp
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  toSafeObject(): any;
}

/**
 * ActionResult static methods interface
 */
export interface IActionResultModel extends Model<IActionResult> {
  findByCharacter(characterId: string, limit?: number, offset?: number): Promise<IActionResult[]>;
  getCharacterStats(characterId: string): Promise<{
    totalActions: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    totalXpGained: number;
    totalGoldGained: number;
  }>;
}

/**
 * Card subdocument schema
 */
const CardSchema = new Schema({
  suit: {
    type: String,
    required: true
  },
  rank: {
    type: Number,
    required: true
  }
}, { _id: false });

/**
 * ActionResult schema definition
 */
const ActionResultSchema = new Schema<IActionResult>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true
      // Note: indexed via compound indexes below
    },
    actionId: {
      type: Schema.Types.ObjectId,
      ref: 'Action',
      required: true
      // Note: indexed via compound indexes below
    },
    gameMode: {
      type: String,
      enum: ['poker', 'press_your_luck'],
      default: 'poker'
    },
    cardsDrawn: {
      type: [CardSchema],
      required: true,
      validate: {
        validator: function(this: IActionResult, cards: Card[]) {
          // press_your_luck allows 1-10 cards, poker requires exactly 5
          if (this.gameMode === 'press_your_luck') {
            return cards.length >= 1 && cards.length <= 10;
          }
          return cards.length === 5;
        },
        message: 'Invalid card count for game mode'
      }
    },
    handRank: {
      type: Schema.Types.Mixed, // Number for poker, string for press_your_luck
      required: true
    },
    handScore: {
      type: Number,
      required: true,
      min: 0
    },
    handDescription: {
      type: String,
      required: true
    },
    suitBonuses: {
      spades: { type: Number, default: 0 },
      hearts: { type: Number, default: 0 },
      clubs: { type: Number, default: 0 },
      diamonds: { type: Number, default: 0 }
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0
    },
    success: {
      type: Boolean,
      required: true
    },
    rewardsGained: {
      xp: { type: Number, default: 0, min: 0 },
      gold: { type: Number, default: 0, min: 0 },
      items: [{ type: String }]
    },
    timestamp: {
      type: Date,
      default: Date.now
      // Note: indexed via compound indexes below
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
ActionResultSchema.index({ characterId: 1, timestamp: -1 });
ActionResultSchema.index({ actionId: 1, timestamp: -1 });
ActionResultSchema.index({ characterId: 1, success: 1 });
ActionResultSchema.index({ characterId: 1, success: 1, timestamp: -1 }); // For stats aggregation queries

/**
 * Instance method: Return safe action result object
 */
ActionResultSchema.methods.toSafeObject = function(this: IActionResult) {
  return {
    _id: this._id.toString(),
    characterId: this.characterId.toString(),
    actionId: this.actionId.toString(),
    gameMode: this.gameMode,
    cardsDrawn: this.cardsDrawn,
    handRank: this.handRank,
    handScore: this.handScore,
    handDescription: this.handDescription,
    suitBonuses: this.suitBonuses,
    totalScore: this.totalScore,
    success: this.success,
    rewardsGained: this.rewardsGained,
    timestamp: this.timestamp
  };
};

/**
 * Static method: Find action results for a character
 */
ActionResultSchema.statics.findByCharacter = async function(
  characterId: string,
  limit: number = 50,
  offset: number = 0
): Promise<IActionResult[]> {
  return this.find({ characterId: new mongoose.Types.ObjectId(characterId) })
    .sort({ timestamp: -1 })
    .skip(offset)
    .limit(limit)
    .populate('actionId');
};

/**
 * Static method: Get character statistics
 * Uses MongoDB aggregation pipeline for efficient database-side computation
 */
ActionResultSchema.statics.getCharacterStats = async function(
  characterId: string
): Promise<{
  totalActions: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  totalXpGained: number;
  totalGoldGained: number;
}> {
  const result = await this.aggregate([
    {
      $match: {
        characterId: new mongoose.Types.ObjectId(characterId)
      }
    },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
        },
        totalXpGained: { $sum: '$rewardsGained.xp' },
        totalGoldGained: { $sum: '$rewardsGained.gold' }
      }
    },
    {
      $project: {
        _id: 0,
        totalActions: 1,
        successCount: 1,
        failureCount: { $subtract: ['$totalActions', '$successCount'] },
        successRate: {
          $cond: [
            { $eq: ['$totalActions', 0] },
            0,
            { $multiply: [{ $divide: ['$successCount', '$totalActions'] }, 100] }
          ]
        },
        totalXpGained: 1,
        totalGoldGained: 1
      }
    }
  ]);

  // Return default values if no results
  if (result.length === 0) {
    return {
      totalActions: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      totalXpGained: 0,
      totalGoldGained: 0
    };
  }

  return result[0];
};

/**
 * ActionResult model
 */
export const ActionResult = mongoose.model<IActionResult, IActionResultModel>(
  'ActionResult',
  ActionResultSchema
);
