/**
 * World Boss Session Model
 * Persists active world boss fight state to survive server restarts
 * Auto-deletes via TTL index after completion or 1 hour timeout
 */

import mongoose, { Schema, Document } from 'mongoose';

// =============================================================================
// TYPES
// =============================================================================

export type WorldBossType = 'THE_WARDEN' | 'EL_CARNICERO' | 'PALE_RIDER' | 'WENDIGO' | 'GENERAL_SANGRE';

export interface ParticipantData {
  characterId: string;
  characterName: string;
  damageDealt: number;
  healingDone: number;
  damageTaken: number;
  joinedAt: Date;
  lastActionAt: Date;
}

export interface IWorldBossSession extends Document {
  bossId: WorldBossType;
  currentHealth: number;
  maxHealth: number;
  currentPhase: number;
  participants: ParticipantData[];
  startedAt: Date;
  endsAt: Date;
  expiresAt: Date; // TTL index
  status: 'active' | 'completed' | 'failed';
}

// =============================================================================
// SCHEMA
// =============================================================================

const WorldBossSessionSchema = new Schema<IWorldBossSession>({
  bossId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    comment: 'Unique boss identifier for this session',
  },
  currentHealth: {
    type: Number,
    required: true,
    min: 0,
  },
  maxHealth: {
    type: Number,
    required: true,
    min: 1,
  },
  currentPhase: {
    type: Number,
    default: 1,
    min: 1,
    comment: 'Boss phase (some bosses have multiple phases)',
  },
  participants: [
    {
      characterId: {
        type: String,
        required: true,
      },
      characterName: {
        type: String,
        required: true,
      },
      damageDealt: {
        type: Number,
        default: 0,
        min: 0,
      },
      healingDone: {
        type: Number,
        default: 0,
        min: 0,
      },
      damageTaken: {
        type: Number,
        default: 0,
        min: 0,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      lastActionAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  startedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endsAt: {
    type: Date,
    required: true,
    comment: 'Boss fight must complete before this time',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    comment: 'Session auto-deleted after this time',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed'],
    default: 'active',
    required: true,
  },
});

// TTL index - MongoDB will automatically delete expired sessions
WorldBossSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for active boss queries
WorldBossSessionSchema.index({ status: 1, expiresAt: 1 });

// Virtual for health percentage
WorldBossSessionSchema.virtual('healthPercent').get(function () {
  return (this.currentHealth / this.maxHealth) * 100;
});

// Virtual for is defeated
WorldBossSessionSchema.virtual('isDefeated').get(function () {
  return this.currentHealth <= 0;
});

// Virtual for time remaining
WorldBossSessionSchema.virtual('timeRemainingMs').get(function () {
  return Math.max(0, this.endsAt.getTime() - Date.now());
});

// Ensure virtuals are included in JSON output
WorldBossSessionSchema.set('toJSON', { virtuals: true });
WorldBossSessionSchema.set('toObject', { virtuals: true });

export const WorldBossSession = mongoose.model<IWorldBossSession>(
  'WorldBossSession',
  WorldBossSessionSchema
);
