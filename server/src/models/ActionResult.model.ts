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
 * ActionResult document interface
 */
export interface IActionResult extends Document {
  // References
  characterId: mongoose.Types.ObjectId;
  actionId: mongoose.Types.ObjectId;

  // Cards drawn and evaluation
  cardsDrawn: Card[];
  handRank: HandRank;
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
      required: true,
      index: true
    },
    actionId: {
      type: Schema.Types.ObjectId,
      ref: 'Action',
      required: true,
      index: true
    },
    cardsDrawn: {
      type: [CardSchema],
      required: true,
      validate: {
        validator: (cards: Card[]) => cards.length >= 1 && cards.length <= 10,
        message: 'Must draw between 1 and 10 cards'
      }
    },
    handRank: {
      type: Schema.Types.Mixed,
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
      default: Date.now,
      index: true
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

/**
 * Instance method: Return safe action result object
 */
ActionResultSchema.methods.toSafeObject = function(this: IActionResult) {
  return {
    _id: this._id.toString(),
    characterId: this.characterId.toString(),
    actionId: this.actionId.toString(),
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
  const results = await this.find({
    characterId: new mongoose.Types.ObjectId(characterId)
  });

  const totalActions = results.length;
  const successCount = results.filter(r => r.success).length;
  const failureCount = totalActions - successCount;
  const successRate = totalActions > 0 ? (successCount / totalActions) * 100 : 0;
  const totalXpGained = results.reduce((sum, r) => sum + r.rewardsGained.xp, 0);
  const totalGoldGained = results.reduce((sum, r) => sum + r.rewardsGained.gold, 0);

  return {
    totalActions,
    successCount,
    failureCount,
    successRate,
    totalXpGained,
    totalGoldGained
  };
};

/**
 * ActionResult model
 */
export const ActionResult = mongoose.model<IActionResult, IActionResultModel>(
  'ActionResult',
  ActionResultSchema
);
