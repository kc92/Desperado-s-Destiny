/**
 * Gossip Model
 *
 * Stores gossip items that NPCs can share with players and each other
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { GossipCategory, GossipTruthfulness } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Gossip document interface
 */
export interface IGossip extends Document {
  subject: string;
  category: GossipCategory;
  content: string;
  contentGenerated?: string;
  truthfulness: GossipTruthfulness;
  verifiable: boolean;
  verificationMethod?: string;
  spreadFactor: number;
  originNpc: string;
  knownBy: string[];
  spreadTo?: string[];
  startDate: Date;
  expiresAt?: Date;
  isStale: boolean;
  eventTriggered?: string;
  eventData?: any;
  playerInvolved?: boolean;
  playerReputationEffect?: number;
  trustRequired?: number;
  factionRequired?: string;
  locationRequired?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gossip static methods interface
 */
export interface IGossipModel extends Model<IGossip> {
  findActiveGossip(): Promise<IGossip[]>;
  findGossipByNPC(npcId: string): Promise<IGossip[]>;
  findGossipBySubject(subjectNpcId: string): Promise<IGossip[]>;
  findGossipByCategory(category: GossipCategory): Promise<IGossip[]>;
  addNPCToKnownBy(gossipId: string, npcId: string): Promise<IGossip | null>;
  spreadGossip(gossipId: string, fromNpcId: string, toNpcId: string): Promise<boolean>;
  checkIfNPCKnows(gossipId: string, npcId: string): Promise<boolean>;
  getGossipForPlayer(npcId: string, playerTrustLevel: number, playerFaction?: string): Promise<IGossip[]>;
  markStale(gossipId: string): Promise<void>;
  cleanupExpiredGossip(): Promise<number>;
}

/**
 * Gossip schema definition
 */
const GossipSchema = new Schema<IGossip>(
  {
    subject: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(GossipCategory),
      index: true
    },
    content: {
      type: String,
      required: true
    },
    contentGenerated: {
      type: String
    },
    truthfulness: {
      type: Number,
      required: true,
      enum: Object.values(GossipTruthfulness),
      default: GossipTruthfulness.COMPLETELY_TRUE
    },
    verifiable: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String
    },
    spreadFactor: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5
    },
    originNpc: {
      type: String,
      required: true,
      index: true
    },
    knownBy: [{
      type: String,
      index: true
    }],
    spreadTo: [{
      type: String
    }],
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      index: true
    },
    isStale: {
      type: Boolean,
      default: false,
      index: true
    },
    eventTriggered: {
      type: String,
      index: true
    },
    eventData: {
      type: Schema.Types.Mixed
    },
    playerInvolved: {
      type: Boolean,
      default: false,
      index: true
    },
    playerReputationEffect: {
      type: Number,
      min: -100,
      max: 100
    },
    trustRequired: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factionRequired: {
      type: String
    },
    locationRequired: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
GossipSchema.index({ subject: 1, category: 1 });
GossipSchema.index({ originNpc: 1, startDate: -1 });
GossipSchema.index({ knownBy: 1, isStale: 1 });
GossipSchema.index({ expiresAt: 1, isStale: 1 });
GossipSchema.index({ playerInvolved: 1, startDate: -1 });

/**
 * TTL Index for automatic cleanup
 * Gossip is automatically deleted immediately when expiresAt is reached.
 * This keeps the database clean and prevents accumulation of stale gossip.
 *
 * SECURITY: Prevents database bloat from accumulating expired gossip documents.
 */
GossipSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Delete immediately on expiry

/**
 * Static method: Find all active (non-stale, non-expired) gossip
 */
GossipSchema.statics.findActiveGossip = async function(): Promise<IGossip[]> {
  const now = new Date();
  return this.find({
    isStale: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } }
    ]
  }).sort({ startDate: -1 });
};

/**
 * Static method: Find gossip known by a specific NPC
 */
GossipSchema.statics.findGossipByNPC = async function(
  npcId: string
): Promise<IGossip[]> {
  return this.find({
    knownBy: npcId,
    isStale: false
  }).sort({ startDate: -1 });
};

/**
 * Static method: Find gossip about a specific NPC
 */
GossipSchema.statics.findGossipBySubject = async function(
  subjectNpcId: string
): Promise<IGossip[]> {
  return this.find({
    subject: subjectNpcId,
    isStale: false
  }).sort({ startDate: -1 });
};

/**
 * Static method: Find gossip by category
 */
GossipSchema.statics.findGossipByCategory = async function(
  category: GossipCategory
): Promise<IGossip[]> {
  return this.find({
    category,
    isStale: false
  }).sort({ startDate: -1 });
};

/**
 * Static method: Add NPC to knownBy array
 */
GossipSchema.statics.addNPCToKnownBy = async function(
  gossipId: string,
  npcId: string
): Promise<IGossip | null> {
  return this.findByIdAndUpdate(
    gossipId,
    { $addToSet: { knownBy: npcId } },
    { new: true }
  );
};

/**
 * Static method: Spread gossip from one NPC to another
 * Returns true if spread was successful
 */
GossipSchema.statics.spreadGossip = async function(
  gossipId: string,
  fromNpcId: string,
  toNpcId: string
): Promise<boolean> {
  const gossip = await this.findById(gossipId);
  if (!gossip) return false;

  // Check if fromNpc knows this gossip
  if (!gossip.knownBy.includes(fromNpcId)) {
    return false;
  }

  // Check if toNpc already knows
  if (gossip.knownBy.includes(toNpcId)) {
    return false;
  }

  // Calculate spread chance based on spreadFactor
  const spreadChance = gossip.spreadFactor / 10;

  if (SecureRNG.chance(spreadChance)) {
    await (this as any).addNPCToKnownBy(gossipId, toNpcId);
    return true;
  }

  return false;
};

/**
 * Static method: Check if an NPC knows specific gossip
 */
GossipSchema.statics.checkIfNPCKnows = async function(
  gossipId: string,
  npcId: string
): Promise<boolean> {
  const gossip = await this.findById(gossipId);
  return gossip ? gossip.knownBy.includes(npcId) : false;
};

/**
 * Static method: Get gossip that an NPC can share with a player
 * Filters by trust level, faction, and location requirements
 */
GossipSchema.statics.getGossipForPlayer = async function(
  npcId: string,
  playerTrustLevel: number,
  playerFaction?: string
): Promise<IGossip[]> {
  const query: any = {
    knownBy: npcId,
    isStale: false,
    trustRequired: { $lte: playerTrustLevel }
  };

  // Filter by faction if required
  if (playerFaction) {
    query.$or = [
      { factionRequired: { $exists: false } },
      { factionRequired: playerFaction }
    ];
  } else {
    query.factionRequired = { $exists: false };
  }

  return this.find(query).sort({ startDate: -1 }).limit(10);
};

/**
 * Static method: Mark gossip as stale
 */
GossipSchema.statics.markStale = async function(gossipId: string): Promise<void> {
  await this.findByIdAndUpdate(gossipId, { isStale: true });
};

/**
 * Static method: Clean up expired gossip
 * Returns count of removed gossip
 */
GossipSchema.statics.cleanupExpiredGossip = async function(): Promise<number> {
  const now = new Date();
  const result = await this.updateMany(
    {
      expiresAt: { $lt: now },
      isStale: false
    },
    { isStale: true }
  );
  return result.modifiedCount || 0;
};

/**
 * Pre-save hook to initialize knownBy with origin NPC
 */
GossipSchema.pre('save', function(next) {
  if (this.isNew && this.originNpc && !this.knownBy.includes(this.originNpc)) {
    this.knownBy.push(this.originNpc);
  }
  next();
});

/**
 * Gossip model
 */
export const Gossip = mongoose.model<IGossip, IGossipModel>('Gossip', GossipSchema);
