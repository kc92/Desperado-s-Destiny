/**
 * Taming Attempt Model
 * Persists taming attempts to survive server restarts
 * Replaces the in-memory tamingAttempts Map in taming.service.ts
 * Auto-deletes via TTL index after 24 hours of inactivity
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { CompanionSpecies } from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

export interface ITamingAttempt extends Document {
  characterId: mongoose.Types.ObjectId;
  species: CompanionSpecies;
  location: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  startedAt: Date;
  lastAttemptAt: Date;
  expiresAt: Date;
  status: 'in_progress' | 'success' | 'failed' | 'expired';
}

export interface ITamingAttemptModel extends Model<ITamingAttempt> {
  findActiveByCharacter(characterId: string | mongoose.Types.ObjectId): Promise<ITamingAttempt | null>;
  hasActiveAttempt(characterId: string | mongoose.Types.ObjectId): Promise<boolean>;
  cleanupExpired(): Promise<number>;
}

// =============================================================================
// SCHEMA
// =============================================================================

const TamingAttemptSchema = new Schema<ITamingAttempt>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    species: {
      type: String,
      enum: Object.values(CompanionSpecies),
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'success', 'failed', 'expired'],
      default: 'in_progress',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// TTL index - MongoDB will automatically delete expired attempts
TamingAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for finding active attempts by character
TamingAttemptSchema.index({ characterId: 1, status: 1 });

// Compound index for finding active attempts by character and species
TamingAttemptSchema.index({ characterId: 1, species: 1, status: 1 });

// =============================================================================
// STATIC METHODS
// =============================================================================

TamingAttemptSchema.statics.findActiveByCharacter = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<ITamingAttempt | null> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;

  return this.findOne({
    characterId: id,
    status: 'in_progress',
    expiresAt: { $gt: new Date() },
  });
};

TamingAttemptSchema.statics.hasActiveAttempt = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  const attempt = await (this as ITamingAttemptModel).findActiveByCharacter(characterId);
  return attempt !== null;
};

TamingAttemptSchema.statics.cleanupExpired = async function (): Promise<number> {
  const result = await this.updateMany(
    {
      status: 'in_progress',
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { status: 'expired' },
    }
  );
  return result.modifiedCount;
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

TamingAttemptSchema.methods.addProgress = function (amount: number): number {
  this.progress = Math.min(100, this.progress + amount);
  this.attempts += 1;
  this.lastAttemptAt = new Date();

  // Extend expiry on activity (24 hours from last attempt)
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return this.progress;
};

TamingAttemptSchema.methods.hasReachedMaxAttempts = function (): boolean {
  return this.attempts >= this.maxAttempts;
};

TamingAttemptSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

TamingAttemptSchema.methods.markSuccess = function (): void {
  this.status = 'success';
  this.progress = 100;
};

TamingAttemptSchema.methods.markFailed = function (reason: string): void {
  this.status = 'failed';
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

TamingAttemptSchema.pre('save', function (next) {
  // Set default expiry of 24 hours on creation
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// =============================================================================
// EXPORT
// =============================================================================

export const TamingAttempt = mongoose.model<ITamingAttempt, ITamingAttemptModel>(
  'TamingAttempt',
  TamingAttemptSchema
);
