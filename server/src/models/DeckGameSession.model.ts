/**
 * DeckGameSession Model
 * Stores standalone deck game sessions with TTL
 * Replaces in-memory Map for better reliability and page refresh recovery
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IDeckGameSession extends Document {
  sessionId: string;
  characterId: mongoose.Types.ObjectId;
  gameType: string;
  context: 'action' | 'duel' | 'tournament' | 'raid' | 'job';

  // Game state data (stored as flexible object)
  gameState: any;

  // Optional context-specific data
  jobId?: string;
  actionId?: string;

  // Timestamps
  startedAt: Date;
  expiresAt: Date;
}

const DeckGameSessionSchema = new Schema<IDeckGameSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['pokerHoldDraw', 'pressYourLuck', 'blackjack', 'deckbuilder', 'combatDuel']
  },
  context: {
    type: String,
    required: true,
    enum: ['action', 'duel', 'tournament', 'raid', 'job'],
    default: 'action'
  },

  // Game state (full GameState object)
  gameState: {
    type: Schema.Types.Mixed,
    required: true
  },

  // Optional context-specific IDs
  jobId: {
    type: String,
    required: false,
    index: true
  },
  actionId: {
    type: String,
    required: false,
    index: true
  },

  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: false // We manage our own timestamps
});

// TTL index - MongoDB will automatically delete documents when expiresAt is reached
DeckGameSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to set expiry if not already set
DeckGameSessionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set expiry to 10 minutes from now
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

export const DeckGameSession = mongoose.model<IDeckGameSession>(
  'DeckGameSession',
  DeckGameSessionSchema
);
