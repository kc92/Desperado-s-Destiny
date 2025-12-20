/**
 * DeityStranger Model
 *
 * Represents a divine stranger NPC that appears at locations.
 * Strangers are manifestations of the deities in disguise,
 * providing tests, gifts, warnings, or dialogue to players.
 *
 * Strangers can be:
 * - Targeted at a specific character
 * - Available to anyone at a location
 * - One-time encounters or recurring
 */

import { Schema, model, Document, Types, Model, Query } from 'mongoose';
import { DeityName } from './DeityAttention.model';

/**
 * Stranger disguise types
 */
export type StrangerDisguise =
  // Gambler disguises
  | 'card_sharp'
  | 'fortune_teller'
  | 'gambler'
  | 'traveling_preacher'
  | 'mysterious_merchant'
  // Outlaw King disguises
  | 'grizzled_outlaw'
  | 'masked_rider'
  | 'wild_woman'
  | 'escaped_prisoner'
  | 'frontier_hermit';

/**
 * Interaction types the stranger can offer
 */
export type InteractionType = 'DIALOGUE' | 'TRADE' | 'TEST' | 'GIFT' | 'WARNING';

/**
 * Stranger status
 */
export type StrangerStatus = 'WAITING' | 'INTERACTING' | 'COMPLETED' | 'EXPIRED';

/**
 * Test types for TEST interactions
 */
export type TestType = 'MORAL_CHOICE' | 'RIDDLE' | 'CARD_GAME' | 'WAGER' | 'TRUST_TEST';

/**
 * Payload for stranger interactions
 */
export interface IStrangerPayload {
  // For DIALOGUE
  dialogue?: string[];
  responseOptions?: Array<{
    text: string;
    karmaEffect?: { dimension: string; delta: number };
    reward?: string;
  }>;

  // For TEST
  testType?: TestType;
  testDescription?: string;
  passReward?: {
    type: 'BLESSING' | 'GOLD' | 'ITEM' | 'INFORMATION';
    value: string | number;
  };
  failPenalty?: {
    type: 'CURSE' | 'GOLD_LOSS' | 'KARMA_LOSS';
    value: string | number;
  };

  // For TRADE
  tradeOffer?: {
    gives: string;
    wants: string;
    goldCost?: number;
  };

  // For GIFT
  giftType?: string;
  giftDescription?: string;

  // For WARNING
  warningMessage?: string;
  warningAbout?: string;
}

export interface IDeityStranger extends Document {
  _id: Types.ObjectId;
  deitySource: DeityName;

  // Stranger identity
  name: string;
  description: string;
  disguise: StrangerDisguise;

  // Location binding
  locationId: Types.ObjectId | null;
  locationName: string;
  spawnedAt: Date;
  expiresAt: Date;

  // Target tracking
  targetCharacterId: Types.ObjectId | null;  // Null = available to anyone
  encounteredBy: Types.ObjectId[];           // Characters who have encountered this stranger

  // Interaction state
  interactionType: InteractionType;
  payload: IStrangerPayload;

  // Status
  status: StrangerStatus;
  currentlyInteractingWith: Types.ObjectId | null;
  interactionStartedAt: Date | null;

  // Statistics
  totalEncounters: number;
  successfulTests: number;
  failedTests: number;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  isAvailableFor(characterId: string | Types.ObjectId): boolean;
  startInteraction(characterId: string | Types.ObjectId): Promise<void>;
  completeInteraction(success?: boolean): Promise<void>;
  hasExpired(): boolean;
}

// Static methods interface
export interface IDeityStrangerModel extends Model<IDeityStranger> {
  findAtLocation(
    locationId: string | Types.ObjectId
  ): Query<IDeityStranger[], IDeityStranger>;

  findAvailableForCharacter(
    characterId: string | Types.ObjectId,
    locationId?: string | Types.ObjectId
  ): Query<IDeityStranger[], IDeityStranger>;

  findByDeity(
    deityName: DeityName,
    limit?: number
  ): Query<IDeityStranger[], IDeityStranger>;

  cleanupExpired(): Promise<{ deleted: number }>;
}

const StrangerPayloadSchema = new Schema({
  dialogue: { type: [String], default: undefined },
  responseOptions: { type: [Schema.Types.Mixed], default: undefined },
  testType: {
    type: String,
    enum: ['MORAL_CHOICE', 'RIDDLE', 'CARD_GAME', 'WAGER', 'TRUST_TEST'],
    default: undefined
  },
  testDescription: { type: String, default: undefined },
  passReward: { type: Schema.Types.Mixed, default: undefined },
  failPenalty: { type: Schema.Types.Mixed, default: undefined },
  tradeOffer: { type: Schema.Types.Mixed, default: undefined },
  giftType: { type: String, default: undefined },
  giftDescription: { type: String, default: undefined },
  warningMessage: { type: String, default: undefined },
  warningAbout: { type: String, default: undefined }
}, { _id: false });

const DeityStrangerSchema = new Schema<IDeityStranger>({
  deitySource: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING'],
    required: true
  },

  // Identity
  name: { type: String, required: true },
  description: { type: String, required: true },
  disguise: {
    type: String,
    enum: [
      'card_sharp', 'fortune_teller', 'gambler', 'traveling_preacher', 'mysterious_merchant',
      'grizzled_outlaw', 'masked_rider', 'wild_woman', 'escaped_prisoner', 'frontier_hermit'
    ],
    required: true
  },

  // Location
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  locationName: { type: String, required: true },
  spawnedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },

  // Target
  targetCharacterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  encounteredBy: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],

  // Interaction
  interactionType: {
    type: String,
    enum: ['DIALOGUE', 'TRADE', 'TEST', 'GIFT', 'WARNING'],
    required: true
  },
  payload: { type: StrangerPayloadSchema, required: true },

  // Status
  status: {
    type: String,
    enum: ['WAITING', 'INTERACTING', 'COMPLETED', 'EXPIRED'],
    default: 'WAITING'
  },
  currentlyInteractingWith: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  interactionStartedAt: { type: Date, default: null },

  // Statistics
  totalEncounters: { type: Number, default: 0 },
  successfulTests: { type: Number, default: 0 },
  failedTests: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'deitystrangers'
});

// Indexes
// For finding strangers at a location
DeityStrangerSchema.index({ locationId: 1, status: 1 });

// For finding targeted strangers
DeityStrangerSchema.index({ targetCharacterId: 1, status: 1 });

// For auto-expiration via TTL (cleanup after 24 hours past expiry)
DeityStrangerSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 86400 } // 24 hours after expiresAt
);

// For finding by deity
DeityStrangerSchema.index({ deitySource: 1, status: 1 });

// For efficient cleanup
DeityStrangerSchema.index({ status: 1, expiresAt: 1 });

// Methods
DeityStrangerSchema.methods.isAvailableFor = function(
  characterId: string | Types.ObjectId
): boolean {
  // Check if already completed or expired
  if (this.status !== 'WAITING') return false;

  // Check expiration
  if (this.hasExpired()) return false;

  // Check if character already encountered
  const charIdStr = characterId.toString();
  if (this.encounteredBy.some((id: Types.ObjectId) => id.toString() === charIdStr)) {
    return false;
  }

  // Check if targeted at someone else
  if (this.targetCharacterId && this.targetCharacterId.toString() !== charIdStr) {
    return false;
  }

  return true;
};

DeityStrangerSchema.methods.startInteraction = async function(
  characterId: string | Types.ObjectId
): Promise<void> {
  const charObjId = new Types.ObjectId(characterId.toString());

  // Use atomic findOneAndUpdate to prevent race conditions
  // Only succeeds if status is still 'WAITING'
  const Model = this.constructor as Model<IDeityStranger>;
  const result = await Model.findOneAndUpdate(
    {
      _id: this._id,
      status: 'WAITING' // Only update if still waiting
    },
    {
      $set: {
        status: 'INTERACTING',
        currentlyInteractingWith: charObjId,
        interactionStartedAt: new Date()
      },
      $inc: { totalEncounters: 1 },
      $addToSet: { encounteredBy: charObjId }
    },
    { new: true }
  );

  if (!result) {
    throw new Error('Stranger is no longer available for interaction');
  }

  // Update local document state to reflect changes
  this.status = result.status;
  this.currentlyInteractingWith = result.currentlyInteractingWith;
  this.interactionStartedAt = result.interactionStartedAt;
  this.totalEncounters = result.totalEncounters;
  this.encounteredBy = result.encounteredBy;
};

DeityStrangerSchema.methods.completeInteraction = async function(
  success?: boolean
): Promise<void> {
  // For tests, track success/failure
  if (this.interactionType === 'TEST' && success !== undefined) {
    if (success) {
      this.successfulTests++;
    } else {
      this.failedTests++;
    }
  }

  // If targeted, complete immediately
  // If available to all, return to waiting unless max encounters reached
  if (this.targetCharacterId || this.totalEncounters >= 5) {
    this.status = 'COMPLETED';
  } else {
    this.status = 'WAITING';
  }

  this.currentlyInteractingWith = null;
  this.interactionStartedAt = null;

  await this.save();
};

DeityStrangerSchema.methods.hasExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

// Static methods
DeityStrangerSchema.statics.findAtLocation = function(
  locationId: string | Types.ObjectId
) {
  return this.find({
    locationId,
    status: { $in: ['WAITING', 'INTERACTING'] },
    expiresAt: { $gt: new Date() }
  });
};

DeityStrangerSchema.statics.findAvailableForCharacter = function(
  characterId: string | Types.ObjectId,
  locationId?: string | Types.ObjectId
) {
  const query: Record<string, unknown> = {
    status: 'WAITING',
    expiresAt: { $gt: new Date() },
    encounteredBy: { $ne: new Types.ObjectId(characterId.toString()) },
    $or: [
      { targetCharacterId: null },
      { targetCharacterId: new Types.ObjectId(characterId.toString()) }
    ]
  };

  if (locationId) {
    query.locationId = new Types.ObjectId(locationId.toString());
  }

  return this.find(query);
};

DeityStrangerSchema.statics.findByDeity = function(
  deityName: DeityName,
  limit: number = 50
) {
  return this.find({
    deitySource: deityName,
    status: { $in: ['WAITING', 'INTERACTING'] },
    expiresAt: { $gt: new Date() }
  })
    .sort({ spawnedAt: -1 })
    .limit(limit);
};

DeityStrangerSchema.statics.cleanupExpired = async function(): Promise<{ deleted: number }> {
  const result = await this.deleteMany({
    $or: [
      { status: 'EXPIRED' },
      { status: 'COMPLETED', updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { expiresAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    ]
  });

  return { deleted: result.deletedCount };
};

export const DeityStranger = model<IDeityStranger, IDeityStrangerModel>(
  'DeityStranger',
  DeityStrangerSchema
);
