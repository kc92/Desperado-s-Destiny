/**
 * CombatEncounter Model
 *
 * Mongoose schema for turn-based combat encounters
 * Sprint 2: Added currentRound for hold/discard combat system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { CombatStatus, Card, HandRank, PlayerTurnPhase } from '@desperados/shared';

/**
 * Combat round subdocument
 */
export interface ICombatRound {
  roundNum: number;
  playerCards: Card[];
  playerHandRank: HandRank;
  playerDamage: number;
  npcCards: Card[];
  npcHandRank: HandRank;
  npcDamage: number;
  playerHPAfter: number;
  npcHPAfter: number;
}

/**
 * Loot awarded subdocument
 */
export interface ILootAwarded {
  gold: number;
  xp: number;
  items: string[];
}

/**
 * Combat abilities subdocument (Sprint 2)
 * Tracks skill-based abilities like reroll and peek
 */
export interface ICombatAbilities {
  rerollsAvailable: number;
  peeksAvailable: number;
  rerollsUsed: number;
  peeksUsed: number;
  peekedCard?: Card;
  quickDrawUnlocked: boolean;
  deadlyAimUnlocked: boolean;
}

/**
 * Current round state subdocument (Sprint 2)
 * Stores the state of the current round for hold/discard combat
 */
export interface ICurrentRound {
  phase: PlayerTurnPhase;
  deck: Card[];
  playerHand: Card[];
  heldCardIndices: number[];
  finalHand?: Card[];
  handRank?: HandRank;
  playerDamage?: number;
  npcHand?: Card[];
  npcHandRank?: HandRank;
  npcDamage?: number;
  abilities: ICombatAbilities;
  phaseStartedAt: Date;
  timeoutAt: Date;
  discardedCards?: Card[];
}

/**
 * CombatEncounter document interface
 */
export interface ICombatEncounter extends Document {
  characterId: mongoose.Types.ObjectId;
  npcId: mongoose.Types.ObjectId;
  playerHP: number;
  playerMaxHP: number;
  npcHP: number;
  npcMaxHP: number;
  turn: number;
  roundNumber: number;
  rounds: ICombatRound[];
  status: CombatStatus;
  lootAwarded?: ILootAwarded;
  /** Sprint 2: Current round state for hold/discard combat */
  currentRound?: ICurrentRound;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isPlayerTurn(): boolean;
  getCurrentHP(isPlayer: boolean): number;
  canFlee(): boolean;
}

/**
 * CombatEncounter static methods interface
 */
export interface ICombatEncounterModel extends Model<ICombatEncounter> {
  findActiveByCharacter(characterId: string): Promise<ICombatEncounter | null>;
  findHistoryByCharacter(characterId: string, limit?: number): Promise<ICombatEncounter[]>;
}

/**
 * Card subdocument schema
 */
const CardSchema = new Schema({
  suit: { type: String, required: true },
  rank: { type: Number, required: true }
}, { _id: false });

/**
 * Combat round subdocument schema
 */
const CombatRoundSchema = new Schema<ICombatRound>({
  roundNum: { type: Number, required: true },
  playerCards: { type: [CardSchema], required: true },
  playerHandRank: { type: Number, required: true },
  playerDamage: { type: Number, required: true },
  npcCards: { type: [CardSchema], required: true },
  npcHandRank: { type: Number, required: true },
  npcDamage: { type: Number, required: true },
  playerHPAfter: { type: Number, required: true },
  npcHPAfter: { type: Number, required: true }
}, { _id: false });

/**
 * Loot awarded subdocument schema
 */
const LootAwardedSchema = new Schema<ILootAwarded>({
  gold: { type: Number, required: true },
  xp: { type: Number, required: true },
  items: { type: [String], default: [] }
}, { _id: false });

/**
 * Combat abilities subdocument schema (Sprint 2)
 */
const CombatAbilitiesSchema = new Schema<ICombatAbilities>({
  rerollsAvailable: { type: Number, required: true, default: 0 },
  peeksAvailable: { type: Number, required: true, default: 0 },
  rerollsUsed: { type: Number, required: true, default: 0 },
  peeksUsed: { type: Number, required: true, default: 0 },
  peekedCard: { type: CardSchema, required: false },
  quickDrawUnlocked: { type: Boolean, required: true, default: false },
  deadlyAimUnlocked: { type: Boolean, required: true, default: false }
}, { _id: false });

/**
 * Current round state subdocument schema (Sprint 2)
 * Stores the active state during hold/discard combat
 */
const CurrentRoundSchema = new Schema<ICurrentRound>({
  phase: {
    type: String,
    required: true,
    enum: Object.values(PlayerTurnPhase),
    default: PlayerTurnPhase.DRAW
  },
  deck: { type: [CardSchema], required: true, default: [] },
  playerHand: { type: [CardSchema], required: true, default: [] },
  heldCardIndices: { type: [Number], required: true, default: [] },
  finalHand: { type: [CardSchema], required: false },
  handRank: { type: Number, required: false },
  playerDamage: { type: Number, required: false },
  npcHand: { type: [CardSchema], required: false },
  npcHandRank: { type: Number, required: false },
  npcDamage: { type: Number, required: false },
  abilities: { type: CombatAbilitiesSchema, required: true },
  phaseStartedAt: { type: Date, required: true, default: Date.now },
  timeoutAt: { type: Date, required: true },
  discardedCards: { type: [CardSchema], required: false }
}, { _id: false });

/**
 * CombatEncounter schema definition
 */
const CombatEncounterSchema = new Schema<ICombatEncounter>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    npcId: {
      type: Schema.Types.ObjectId,
      ref: 'NPC',
      required: true
    },
    playerHP: {
      type: Number,
      required: true,
      min: 0
    },
    playerMaxHP: {
      type: Number,
      required: true,
      min: 1
    },
    npcHP: {
      type: Number,
      required: true,
      min: 0
    },
    npcMaxHP: {
      type: Number,
      required: true,
      min: 1
    },
    turn: {
      type: Number,
      required: true,
      enum: [0, 1], // 0 = player, 1 = NPC
      default: 0
    },
    roundNumber: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    rounds: {
      type: [CombatRoundSchema],
      default: []
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(CombatStatus),
      default: CombatStatus.ACTIVE
    },
    lootAwarded: {
      type: LootAwardedSchema,
      required: false
    },
    /** Sprint 2: Current round state for hold/discard combat */
    currentRound: {
      type: CurrentRoundSchema,
      required: false
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    endedAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
CombatEncounterSchema.index({ characterId: 1, status: 1 });
CombatEncounterSchema.index({ status: 1, createdAt: -1 });
// Performance optimization indexes
CombatEncounterSchema.index({ characterId: 1, createdAt: -1 }); // For combat history
CombatEncounterSchema.index({ endedAt: 1 }); // For cleanup jobs

/**
 * Instance method: Check if it's player's turn
 */
CombatEncounterSchema.methods['isPlayerTurn'] = function(this: ICombatEncounter): boolean {
  return this.turn === 0;
};

/**
 * Instance method: Get current HP for player or NPC
 */
CombatEncounterSchema.methods['getCurrentHP'] = function(
  this: ICombatEncounter,
  isPlayer: boolean
): number {
  return isPlayer ? this.playerHP : this.npcHP;
};

/**
 * Instance method: Check if player can flee (only in first 3 rounds)
 */
CombatEncounterSchema.methods['canFlee'] = function(this: ICombatEncounter): boolean {
  return this.status === CombatStatus.ACTIVE && this.roundNumber <= 3;
};

/**
 * Static method: Find active combat encounter for a character
 */
CombatEncounterSchema.statics['findActiveByCharacter'] = async function(
  characterId: string
): Promise<ICombatEncounter | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: CombatStatus.ACTIVE
  })
    .populate('npcId')
    .sort({ createdAt: -1 });
};

/**
 * Static method: Find combat history for a character
 */
CombatEncounterSchema.statics['findHistoryByCharacter'] = async function(
  characterId: string,
  limit: number = 50
): Promise<ICombatEncounter[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $ne: CombatStatus.ACTIVE }
  })
    .populate('npcId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * CombatEncounter model
 */
export const CombatEncounter = mongoose.model<ICombatEncounter, ICombatEncounterModel>(
  'CombatEncounter',
  CombatEncounterSchema
);
