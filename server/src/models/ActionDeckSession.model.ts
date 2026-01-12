/**
 * ActionDeckSession Model
 * Replaces in-memory Maps for action deck game sessions
 * Stores both pending action info and active game state with TTL
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IActionDeckSession extends Document {
  sessionId: string;
  characterId: mongoose.Types.ObjectId;
  actionId: string;

  // For jobs, the action data is stored directly since jobs use string IDs
  // that can't be fetched from the Action collection
  action?: any;

  // Game state data (stored as flexible object)
  gameState: any;

  // Timestamps
  startedAt: Date;
  expiresAt: Date;
}

const ActionDeckSessionSchema = new Schema<IActionDeckSession>({
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
  actionId: {
    type: String,
    required: true,
    index: true
  },

  // For jobs, the action data is stored directly since jobs use string IDs
  // that can't be fetched from the Action collection
  action: {
    type: Schema.Types.Mixed,
    required: false
  },

  // Game state (full GameState object)
  gameState: {
    type: Schema.Types.Mixed,
    required: true
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
    // Note: Index defined below as TTL index
  }
}, {
  timestamps: false // We manage our own timestamps
});

// TTL index - MongoDB will automatically delete documents when expiresAt is reached
ActionDeckSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to set expiry if not already set
ActionDeckSessionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set expiry to 5 minutes from now
    this.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  }
  next();
});

export const ActionDeckSession = mongoose.model<IActionDeckSession>(
  'ActionDeckSession',
  ActionDeckSessionSchema
);
