/**
 * DivineManifestation Model
 *
 * Records all interactions between deities and characters.
 * This creates a history of divine encounters for each player,
 * enabling narrative continuity and preventing spam.
 *
 * Manifestation types:
 * - DREAM: Appears when player rests
 * - OMEN: Environmental signs (good/bad luck symbols)
 * - WHISPER: Internal voice/intuition
 * - STRANGER: Deity disguised as NPC
 * - ANIMAL: Deity manifesting as creature
 * - PHENOMENON: Weather, fire, lightning etc.
 * - BLESSING: Positive divine mark
 * - CURSE: Negative divine mark
 */

import { Schema, model, Document, Types, Model, Query } from 'mongoose';
import logger from '../utils/logger';

export type ManifestationType =
  | 'DREAM'
  | 'OMEN'
  | 'WHISPER'
  | 'STRANGER'
  | 'ANIMAL'
  | 'PHENOMENON'
  | 'BLESSING'
  | 'CURSE';

export type DeityName = 'GAMBLER' | 'OUTLAW_KING';

export interface ITriggeringKarma {
  dimension: string;
  value: number;
  threshold: string;
}

export interface IDivineManifestation extends Document {
  deityName: DeityName;
  targetCharacterId: Types.ObjectId;

  // Manifestation details
  type: ManifestationType;
  disguise: string | null;         // NPC form if type is STRANGER
  location: string | null;         // Where it occurred

  // Content
  message: string;                 // What was communicated
  effect: string | null;           // Game effect if any (JSON string)

  // Player response
  acknowledged: boolean;
  acknowledgedAt: Date | null;
  playerResponse: string | null;
  responseAt: Date | null;

  // Karma context
  triggeringKarma: ITriggeringKarma | null;

  // Metadata
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  delivered: boolean;
  deliveredAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  markDelivered(): Promise<IDivineManifestation>;
  markAcknowledged(response?: string): Promise<IDivineManifestation>;
  getEffectData(): Record<string, unknown> | null;
}

// Static methods interface
export interface IDivineManifestationModel extends Model<IDivineManifestation> {
  findRecentForCharacter(
    characterId: string | Types.ObjectId,
    hours?: number
  ): Query<IDivineManifestation[], IDivineManifestation>;

  findUndelivered(
    characterId: string | Types.ObjectId
  ): Query<IDivineManifestation[], IDivineManifestation>;

  findUnacknowledged(
    characterId: string | Types.ObjectId
  ): Query<IDivineManifestation[], IDivineManifestation>;

  countByType(
    characterId: string | Types.ObjectId,
    type: ManifestationType
  ): Query<number, IDivineManifestation>;

  hasRecentManifestation(
    characterId: string | Types.ObjectId,
    deityName: DeityName,
    hours?: number
  ): Promise<boolean>;

  getManifestationHistory(
    characterId: string | Types.ObjectId,
    options?: {
      deity?: DeityName;
      type?: ManifestationType;
      limit?: number;
      skip?: number;
    }
  ): Query<IDivineManifestation[], IDivineManifestation>;
}

const TriggeringKarmaSchema = new Schema({
  dimension: { type: String, required: true },
  value: { type: Number, required: true },
  threshold: { type: String, required: true }
}, { _id: false });

const DivineManifestationSchema = new Schema<IDivineManifestation>({
  deityName: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING'],
    required: true
  },
  targetCharacterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },

  // Manifestation details
  type: {
    type: String,
    enum: ['DREAM', 'OMEN', 'WHISPER', 'STRANGER', 'ANIMAL', 'PHENOMENON', 'BLESSING', 'CURSE'],
    required: true
  },
  disguise: { type: String, default: null },
  location: { type: String, default: null },

  // Content
  message: { type: String, required: true },
  effect: { type: String, default: null },

  // Player response
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date, default: null },
  playerResponse: { type: String, default: null },
  responseAt: { type: Date, default: null },

  // Karma context
  triggeringKarma: { type: TriggeringKarmaSchema, default: null },

  // Metadata
  urgency: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'divinemanifestations'
});

// Indexes for efficient queries
DivineManifestationSchema.index({ targetCharacterId: 1, createdAt: -1 });
DivineManifestationSchema.index({ deityName: 1, createdAt: -1 });
DivineManifestationSchema.index({ type: 1, createdAt: -1 });
DivineManifestationSchema.index({ targetCharacterId: 1, deityName: 1, createdAt: -1 });
DivineManifestationSchema.index({ targetCharacterId: 1, acknowledged: 1 });
DivineManifestationSchema.index({ delivered: 1, createdAt: -1 });

// Compound index for finding recent manifestations to a character from a deity
DivineManifestationSchema.index({
  targetCharacterId: 1,
  deityName: 1,
  type: 1,
  createdAt: -1
});

// TTL index to auto-delete old acknowledged manifestations after 90 days
DivineManifestationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { acknowledged: true } }
);

// Methods
DivineManifestationSchema.methods.markDelivered = async function(): Promise<IDivineManifestation> {
  // Use atomic update to prevent double-delivery race condition
  const Model = this.constructor as Model<IDivineManifestation>;
  const result = await Model.findOneAndUpdate(
    {
      _id: this._id,
      delivered: false // Only update if not already delivered
    },
    {
      $set: {
        delivered: true,
        deliveredAt: new Date()
      }
    },
    { new: true }
  );

  if (!result) {
    // Already delivered, return current state
    return this as IDivineManifestation;
  }

  // Update local document state
  this.delivered = result.delivered;
  this.deliveredAt = result.deliveredAt;
  return this as IDivineManifestation;
};

DivineManifestationSchema.methods.markAcknowledged = async function(response?: string): Promise<IDivineManifestation> {
  // Use atomic update to prevent double-acknowledgement race condition
  const Model = this.constructor as Model<IDivineManifestation>;
  const updateData: Record<string, unknown> = {
    acknowledged: true,
    responseAt: new Date()
  };
  if (response) {
    updateData.playerResponse = response;
  }

  const result = await Model.findOneAndUpdate(
    {
      _id: this._id,
      acknowledged: false // Only update if not already acknowledged
    },
    { $set: updateData },
    { new: true }
  );

  if (!result) {
    // Already acknowledged, return current state
    return this as IDivineManifestation;
  }

  // Update local document state
  this.acknowledged = result.acknowledged;
  this.responseAt = result.responseAt;
  if (response) {
    this.playerResponse = result.playerResponse;
  }
  return this as IDivineManifestation;
};

DivineManifestationSchema.methods.getEffectData = function(): Record<string, unknown> | null {
  if (!this.effect) return null;
  try {
    return JSON.parse(this.effect);
  } catch (error) {
    // ERR-1 FIX: Log JSON parsing errors instead of silently failing
    // This helps debug malformed effect data in manifestations
    logger.error(`Failed to parse effect data for manifestation ${this._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

// Statics
DivineManifestationSchema.statics.findRecentForCharacter = function(
  characterId: string | Types.ObjectId,
  hours: number = 24
) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    targetCharacterId: characterId,
    createdAt: { $gte: since }
  }).sort({ createdAt: -1 });
};

DivineManifestationSchema.statics.findUndelivered = function(
  characterId: string | Types.ObjectId
) {
  return this.find({
    targetCharacterId: characterId,
    delivered: false
  }).sort({ urgency: -1, createdAt: 1 });
};

DivineManifestationSchema.statics.findUnacknowledged = function(
  characterId: string | Types.ObjectId
) {
  return this.find({
    targetCharacterId: characterId,
    delivered: true,
    acknowledged: false
  }).sort({ createdAt: -1 });
};

DivineManifestationSchema.statics.countByType = function(
  characterId: string | Types.ObjectId,
  type: ManifestationType
) {
  return this.countDocuments({
    targetCharacterId: characterId,
    type
  });
};

DivineManifestationSchema.statics.hasRecentManifestation = async function(
  characterId: string | Types.ObjectId,
  deityName: DeityName,
  hours: number = 24
): Promise<boolean> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const count = await this.countDocuments({
    targetCharacterId: characterId,
    deityName,
    createdAt: { $gte: since }
  });
  return count > 0;
};

DivineManifestationSchema.statics.getManifestationHistory = function(
  characterId: string | Types.ObjectId,
  options: {
    deity?: DeityName;
    type?: ManifestationType;
    limit?: number;
    skip?: number;
  } = {}
) {
  const query: Record<string, unknown> = { targetCharacterId: characterId };

  if (options.deity) {
    query.deityName = options.deity;
  }
  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 50);
};

export const DivineManifestation = model<IDivineManifestation, IDivineManifestationModel>(
  'DivineManifestation',
  DivineManifestationSchema
);
