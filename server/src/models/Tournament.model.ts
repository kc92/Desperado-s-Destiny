/**
 * Tournament Model
 * Represents PvP deck game tournaments with brackets
 */

import mongoose, { Schema, Document } from 'mongoose';

export enum TournamentStatus {
  REGISTRATION = 'registration',  // Open for sign-ups
  IN_PROGRESS = 'in_progress',    // Tournament running
  COMPLETED = 'completed',        // Tournament finished
  CANCELLED = 'cancelled'         // Tournament cancelled
}

export enum TournamentType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination'
}

export interface TournamentMatch {
  matchId: string;
  round: number;
  position: number;           // Position in bracket
  player1Id?: mongoose.Types.ObjectId;
  player2Id?: mongoose.Types.ObjectId;
  player1Name?: string;
  player2Name?: string;
  player1Score?: number;
  player2Score?: number;
  player1Hand?: string;
  player2Hand?: string;
  winnerId?: mongoose.Types.ObjectId;
  gameId?: string;
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'bye';
  completedAt?: Date;
}

export interface ITournament extends Document {
  name: string;
  status: TournamentStatus;
  type: TournamentType;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  minParticipants: number;
  participants: {
    characterId: mongoose.Types.ObjectId;
    characterName: string;
    joinedAt: Date;
    eliminated: boolean;
    placement?: number;
  }[];
  matches: TournamentMatch[];
  currentRound: number;
  totalRounds: number;
  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;
  registrationEndsAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentMatchSchema = new Schema<TournamentMatch>(
  {
    matchId: { type: String, required: true },
    round: { type: Number, required: true },
    position: { type: Number, required: true },
    player1Id: { type: Schema.Types.ObjectId, ref: 'Character' },
    player2Id: { type: Schema.Types.ObjectId, ref: 'Character' },
    player1Name: { type: String },
    player2Name: { type: String },
    player1Score: { type: Number },
    player2Score: { type: Number },
    player1Hand: { type: String },
    player2Hand: { type: String },
    winnerId: { type: Schema.Types.ObjectId, ref: 'Character' },
    gameId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'ready', 'in_progress', 'completed', 'bye'],
      default: 'pending'
    },
    completedAt: { type: Date }
  },
  { _id: false }
);

const TournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TournamentStatus),
      default: TournamentStatus.REGISTRATION,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(TournamentType),
      default: TournamentType.SINGLE_ELIMINATION
    },
    entryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    prizePool: {
      type: Number,
      default: 0,
      min: 0
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
      max: 64
    },
    minParticipants: {
      type: Number,
      default: 2,
      min: 2
    },
    participants: [{
      characterId: {
        type: Schema.Types.ObjectId,
        ref: 'Character',
        required: true
      },
      characterName: {
        type: String,
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      eliminated: {
        type: Boolean,
        default: false
      },
      placement: {
        type: Number
      }
    }],
    matches: [TournamentMatchSchema],
    currentRound: {
      type: Number,
      default: 0
    },
    totalRounds: {
      type: Number,
      default: 0
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character'
    },
    winnerName: {
      type: String
    },
    registrationEndsAt: {
      type: Date,
      required: true,
      index: true
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
TournamentSchema.index({ status: 1, registrationEndsAt: 1 });
TournamentSchema.index({ 'participants.characterId': 1 });

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);
