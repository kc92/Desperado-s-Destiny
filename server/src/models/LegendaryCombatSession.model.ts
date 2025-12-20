import mongoose, { Schema, Document } from 'mongoose';
import { LegendaryAnimal } from '@desperados/shared';

export interface ILegendaryCombatSession extends Document {
  sessionId: string;
  characterId: mongoose.Types.ObjectId;
  legendaryId: string;
  legendary: LegendaryAnimal;

  // Combat state
  currentPhase: number;
  legendaryHealth: number;
  legendaryMaxHealth: number;
  turnCount: number;

  // Tracking
  totalDamageDone: number;
  abilitiesUsed: string[];
  currentCooldowns: Map<string, number>;

  // Minions (if any)
  activeMinions?: Array<{
    type: string;
    health: number;
    maxHealth: number;
  }>;

  // Started
  startedAt: Date;
  location: string;
  expiresAt: Date;
}

const LegendaryCombatSessionSchema = new Schema<ILegendaryCombatSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true, index: true },
  legendaryId: { type: String, required: true },
  legendary: { type: Schema.Types.Mixed, required: true },

  // Combat state
  currentPhase: { type: Number, default: 1 },
  legendaryHealth: { type: Number, required: true },
  legendaryMaxHealth: { type: Number, required: true },
  turnCount: { type: Number, default: 0 },

  // Tracking
  totalDamageDone: { type: Number, default: 0 },
  abilitiesUsed: [{ type: String }],
  currentCooldowns: { type: Map, of: Number, default: new Map() },

  // Minions (if any)
  activeMinions: [{
    type: { type: String },
    health: { type: Number },
    maxHealth: { type: Number }
  }],

  // Started
  startedAt: { type: Date, default: Date.now },
  location: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true }
});

// TTL index - sessions auto-expire 30 minutes after expiresAt
LegendaryCombatSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Set expiration time on save if not already set
LegendaryCombatSessionSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  next();
});

export const LegendaryCombatSession = mongoose.model<ILegendaryCombatSession>(
  'LegendaryCombatSession',
  LegendaryCombatSessionSchema
);
