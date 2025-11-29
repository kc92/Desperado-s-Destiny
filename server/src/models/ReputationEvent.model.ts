/**
 * ReputationEvent Model
 *
 * Stores reputation-generating events that spread through NPC networks
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { ReputationEventType } from '@desperados/shared';

/**
 * ReputationEvent document interface
 */
export interface IReputationEvent extends Document {
  characterId: mongoose.Types.ObjectId;
  eventType: ReputationEventType;
  magnitude: number;
  sentiment: number;
  faction?: string;
  locationId: string;
  originNpcId?: string;
  spreadRadius: number;
  decayRate: number;
  timestamp: Date;
  expiresAt?: Date;
  description?: string;
  spreadCount: number;
  lastSpreadTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ReputationEvent static methods interface
 */
export interface IReputationEventModel extends Model<IReputationEvent> {
  findActiveEvents(characterId?: string): Promise<IReputationEvent[]>;
  findByLocation(locationId: string): Promise<IReputationEvent[]>;
  findByNPC(npcId: string): Promise<IReputationEvent[]>;
  cleanupExpiredEvents(): Promise<number>;
}

/**
 * ReputationEvent schema
 */
const ReputationEventSchema = new Schema<IReputationEvent>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      enum: Object.values(ReputationEventType),
      index: true
    },
    magnitude: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    sentiment: {
      type: Number,
      required: true,
      min: -100,
      max: 100
    },
    faction: {
      type: String,
      required: false,
      index: true
    },
    locationId: {
      type: String,
      required: true,
      index: true
    },
    originNpcId: {
      type: String,
      required: false,
      index: true
    },
    spreadRadius: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 3
    },
    decayRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.2
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      required: false,
      index: true
    },
    description: {
      type: String,
      required: false
    },
    spreadCount: {
      type: Number,
      required: true,
      default: 0
    },
    lastSpreadTime: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
ReputationEventSchema.index({ characterId: 1, locationId: 1 });
ReputationEventSchema.index({ characterId: 1, eventType: 1 });
ReputationEventSchema.index({ expiresAt: 1 }, { sparse: true });
ReputationEventSchema.index({ timestamp: -1 });

/**
 * Static method: Find all active (non-expired) events
 */
ReputationEventSchema.statics.findActiveEvents = async function(
  characterId?: string
): Promise<IReputationEvent[]> {
  const query: any = {
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  if (characterId) {
    query.characterId = characterId;
  }

  return this.find(query).sort({ timestamp: -1 });
};

/**
 * Static method: Find events by location
 */
ReputationEventSchema.statics.findByLocation = async function(
  locationId: string
): Promise<IReputationEvent[]> {
  return this.find({
    locationId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ timestamp: -1 });
};

/**
 * Static method: Find events by origin NPC
 */
ReputationEventSchema.statics.findByNPC = async function(
  npcId: string
): Promise<IReputationEvent[]> {
  return this.find({
    originNpcId: npcId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ timestamp: -1 });
};

/**
 * Static method: Cleanup expired events
 */
ReputationEventSchema.statics.cleanupExpiredEvents = async function(): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $exists: true, $lt: new Date() }
  });
  return result.deletedCount || 0;
};

/**
 * ReputationEvent model
 */
export const ReputationEvent = mongoose.model<IReputationEvent, IReputationEventModel>(
  'ReputationEvent',
  ReputationEventSchema
);
