/**
 * Tournament Match Model
 * Tracks individual matches within tournaments
 * Supports bracket-style elimination tournaments
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITournamentMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;
  round: number;
  matchNumber: number;
  bracketPosition: string; // e.g., "A1", "B2", "FINAL"

  player1Id: mongoose.Types.ObjectId;
  player1Name: string;
  player1Seed?: number;

  player2Id?: mongoose.Types.ObjectId;
  player2Name?: string;
  player2Seed?: number;

  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;
  loserId?: mongoose.Types.ObjectId;

  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'forfeited' | 'bye';

  // Game state for the match
  gameState?: any;
  player1Score?: number;
  player2Score?: number;

  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Next match progression
  nextMatchId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const TournamentMatchSchema = new Schema<ITournamentMatch>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'PokerTournament',
    required: true,
    index: true
  },
  round: {
    type: Number,
    required: true,
    min: 1
  },
  matchNumber: {
    type: Number,
    required: true,
    min: 1
  },
  bracketPosition: {
    type: String,
    required: true
  },

  player1Id: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  player1Name: {
    type: String,
    required: true
  },
  player1Seed: Number,

  player2Id: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    index: true
  },
  player2Name: String,
  player2Seed: Number,

  winnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  winnerName: String,
  loserId: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },

  status: {
    type: String,
    enum: ['pending', 'ready', 'in_progress', 'completed', 'forfeited', 'bye'],
    default: 'pending',
    index: true
  },

  gameState: {
    type: Schema.Types.Mixed
  },
  player1Score: Number,
  player2Score: Number,

  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,

  nextMatchId: {
    type: Schema.Types.ObjectId,
    ref: 'TournamentMatch'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
TournamentMatchSchema.index({ tournamentId: 1, round: 1, matchNumber: 1 }, { unique: true });
TournamentMatchSchema.index({ tournamentId: 1, status: 1 });
TournamentMatchSchema.index({ player1Id: 1, status: 1 });
TournamentMatchSchema.index({ player2Id: 1, status: 1 });

// Static methods for common queries
TournamentMatchSchema.statics.findByTournament = function(tournamentId: string) {
  return this.find({ tournamentId }).sort({ round: 1, matchNumber: 1 });
};

TournamentMatchSchema.statics.findActiveByPlayer = function(playerId: string) {
  return this.find({
    $or: [{ player1Id: playerId }, { player2Id: playerId }],
    status: { $in: ['ready', 'in_progress'] }
  });
};

TournamentMatchSchema.statics.findPendingByRound = function(tournamentId: string, round: number) {
  return this.find({
    tournamentId,
    round,
    status: 'pending'
  }).sort({ matchNumber: 1 });
};

export const TournamentMatch = mongoose.model<ITournamentMatch>('TournamentMatch', TournamentMatchSchema);
