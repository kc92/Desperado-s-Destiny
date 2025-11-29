/**
 * Poker Hand History Model
 * Records every hand played for analysis and dispute resolution
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { PokerCard, PokerHandRank, PokerAction } from '@desperados/shared';

export interface IPokerHand extends Document {
  handId: string;
  tournamentId: mongoose.Types.ObjectId;
  tableId: string;
  timestamp: Date;

  // Players in the hand
  players: {
    characterId: mongoose.Types.ObjectId;
    characterName: string;
    seatNumber: number;
    startingChips: number;
    holeCards: PokerCard[];
    finalHand?: PokerCard[];
    handRank?: PokerHandRank;
    handDescription?: string;
    won: boolean;
    amountWon?: number;
    endingChips: number;
  }[];

  // Dealer and blinds
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  anteAmount?: number;

  // Board
  communityCards: PokerCard[];

  // Action sequence
  actions: {
    playerId: mongoose.Types.ObjectId;
    playerName: string;
    round: 'preflop' | 'flop' | 'turn' | 'river';
    action: PokerAction;
    amount?: number;
    timestamp: Date;
  }[];

  // Pot information
  totalPot: number;
  sidePots?: {
    amount: number;
    eligiblePlayers: mongoose.Types.ObjectId[];
    winnerId?: mongoose.Types.ObjectId;
  }[];

  // Winner information
  winnerId: mongoose.Types.ObjectId;
  winnerName: string;
  winningHand: PokerHandRank;
  winningHandDescription: string;

  // Hand metadata
  handNumber: number; // Sequential number in tournament
  duration: number; // Seconds
  showdown: boolean; // Did it reach showdown?

  createdAt: Date;
}

const CardSchema = new Schema<PokerCard>(
  {
    suit: {
      type: String,
      required: true,
      enum: ['hearts', 'diamonds', 'clubs', 'spades']
    },
    rank: {
      type: String,
      required: true,
      enum: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    }
  },
  { _id: false }
);

const HandPlayerSchema = new Schema(
  {
    characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    characterName: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    startingChips: { type: Number, required: true },
    holeCards: [CardSchema],
    finalHand: [CardSchema],
    handRank: { type: Number },
    handDescription: { type: String },
    won: { type: Boolean, required: true },
    amountWon: { type: Number },
    endingChips: { type: Number, required: true }
  },
  { _id: false }
);

const ActionSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    playerName: { type: String, required: true },
    round: {
      type: String,
      required: true,
      enum: ['preflop', 'flop', 'turn', 'river']
    },
    action: {
      type: String,
      required: true,
      enum: ['fold', 'check', 'call', 'bet', 'raise', 'all_in']
    },
    amount: { type: Number },
    timestamp: { type: Date, required: true }
  },
  { _id: false }
);

const SidePotSchema = new Schema(
  {
    amount: { type: Number, required: true },
    eligiblePlayers: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    winnerId: { type: Schema.Types.ObjectId, ref: 'Character' }
  },
  { _id: false }
);

const PokerHandSchema = new Schema<IPokerHand>(
  {
    handId: { type: String, required: true, unique: true },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'PokerTournament', required: true },
    tableId: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },

    players: [HandPlayerSchema],

    dealerPosition: { type: Number, required: true },
    smallBlindPosition: { type: Number, required: true },
    bigBlindPosition: { type: Number, required: true },
    smallBlindAmount: { type: Number, required: true },
    bigBlindAmount: { type: Number, required: true },
    anteAmount: { type: Number },

    communityCards: [CardSchema],

    actions: [ActionSchema],

    totalPot: { type: Number, required: true },
    sidePots: [SidePotSchema],

    winnerId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    winnerName: { type: String, required: true },
    winningHand: { type: Number, required: true },
    winningHandDescription: { type: String, required: true },

    handNumber: { type: Number, required: true },
    duration: { type: Number, required: true },
    showdown: { type: Boolean, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Indexes
PokerHandSchema.index({ tournamentId: 1, handNumber: 1 });
PokerHandSchema.index({ 'players.characterId': 1, timestamp: -1 });
PokerHandSchema.index({ tableId: 1, timestamp: -1 });
PokerHandSchema.index({ timestamp: -1 });

export const PokerHand = mongoose.model<IPokerHand>('PokerHand', PokerHandSchema);
