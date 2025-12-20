/**
 * Duel Session Model
 * Persists active duel state to survive server restarts
 * Auto-deletes via TTL index after 1 hour of inactivity
 */

import mongoose, { Schema, Document } from 'mongoose';
import { DuelStatus, DuelPhase, BettingAction, HandRank } from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

export interface DuelPlayerState {
  characterId: string;
  characterName: string;
  hand: any[]; // Card array
  handRank: HandRank;
  gold: number;
  currentBet: number;
  roundsWon: number;
  hasSubmittedAction: boolean;
  lastAction?: BettingAction;
  isReady: boolean;
}

export interface DuelRoundState {
  roundNumber: number;
  phase: DuelPhase;
  pot: number;
  turnStartedAt: Date;
  turnTimeLimit: number; // seconds
}

export interface RoundResultRecord {
  roundNumber: number;
  challengerHand: any[];
  challengerHandRank: HandRank;
  challengerBet: number;
  challengedHand: any[];
  challengedHandRank: HandRank;
  challengedBet: number;
  winnerId: string;
  winnerName: string;
  potWon: number;
  completedAt: Date;
}

export interface AbilityState {
  available: string[];
  cooldowns: Record<string, number>; // ability -> expiry timestamp
  energy: number;
  maxEnergy: number;
  pokerFaceActive: boolean;
  pokerFaceRoundsLeft: number;
}

export interface IDuelSession extends Document {
  duelId: string;
  challengerId: mongoose.Types.ObjectId;
  challengedId: mongoose.Types.ObjectId;
  status: DuelStatus;
  currentRound: number;

  // Player states
  challengerState: DuelPlayerState;
  challengedState: DuelPlayerState;

  // Round state
  roundState: DuelRoundState;

  // Round history
  roundResults: RoundResultRecord[];

  // Ability states
  challengerAbilityState: AbilityState;
  challengedAbilityState: AbilityState;

  // Betting history (for analysis)
  challengerBettingHistory: BettingAction[];
  challengedBettingHistory: BettingAction[];

  // Metadata
  createdAt: Date;
  lastActionAt: Date;
  expiresAt: Date; // Auto-delete after 1 hour
}

// =============================================================================
// SCHEMA
// =============================================================================

const DuelSessionSchema = new Schema<IDuelSession>({
  duelId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    comment: 'Unique duel identifier',
  },
  challengerId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  challengedId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(DuelStatus),
    required: true,
    default: DuelStatus.PENDING,
  },
  currentRound: {
    type: Number,
    default: 1,
    min: 1,
  },

  // Player states (Mixed type for flexibility)
  challengerState: {
    type: Schema.Types.Mixed,
    required: true,
  },
  challengedState: {
    type: Schema.Types.Mixed,
    required: true,
  },

  // Round state
  roundState: {
    type: Schema.Types.Mixed,
    required: true,
  },

  // Round history
  roundResults: [
    {
      type: Schema.Types.Mixed,
    },
  ],

  // Ability states
  challengerAbilityState: {
    type: Schema.Types.Mixed,
    required: true,
  },
  challengedAbilityState: {
    type: Schema.Types.Mixed,
    required: true,
  },

  // Betting history
  challengerBettingHistory: [
    {
      type: String,
      enum: Object.values(BettingAction),
    },
  ],
  challengedBettingHistory: [
    {
      type: String,
      enum: Object.values(BettingAction),
    },
  ],

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  lastActionAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    comment: 'Session expires 1 hour after last action',
  },
});

// TTL index - MongoDB will automatically delete expired sessions
DuelSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for active duel queries
DuelSessionSchema.index({ status: 1, expiresAt: 1 });

// Update expiresAt on every save
DuelSessionSchema.pre('save', function (next) {
  this.lastActionAt = new Date();
  this.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  next();
});

export const DuelSession = mongoose.model<IDuelSession>('DuelSession', DuelSessionSchema);
