/**
 * Gravestone Model
 *
 * Records permanently dead characters and stores their legacy for inheritance.
 * When a character faces permadeath, they become a gravestone that future
 * characters can visit to claim inheritance.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { DeathType, InheritanceTier } from '@desperados/shared';

/**
 * Heirloom item stored in gravestone
 */
export interface GravestoneHeirloom {
  itemId: string;
  itemName: string;
  itemType: string;
  rarity: string;
  originalStats?: Record<string, number>;
}

/**
 * Gravestone document interface
 */
export interface IGravestone extends Document {
  // Character info
  characterId: mongoose.Types.ObjectId;
  characterName: string;
  userId: mongoose.Types.ObjectId;

  // Death circumstances
  level: number;
  deathLocation: string;
  causeOfDeath: DeathType;
  killerName?: string;
  epitaph: string;
  diedAt: Date;

  // Character stats at death (for display)
  faction: string;
  totalPlayTime: number;  // Hours played
  totalKills: number;
  totalDeaths: number;    // Before this final one
  highestBounty: number;

  // Inheritance pool
  goldPool: number;
  heirloomItems: GravestoneHeirloom[];
  skillMemory: Map<string, number>;  // Skill ID -> level at death
  prestigeTier: number;

  // Claiming
  claimed: boolean;
  claimedBy?: mongoose.Types.ObjectId;  // Character ID that claimed
  claimedAt?: Date;
  inheritanceTier?: InheritanceTier;
  inheritanceResult?: {
    goldReceived: number;
    heirloomsReceived: string[];
    skillBoosts: Record<string, number>;
    destinyHand: string[];
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gravestone static methods
 */
export interface IGravestoneModel extends Model<IGravestone> {
  findByUser(userId: string | mongoose.Types.ObjectId): Promise<IGravestone[]>;
  findUnclaimedByUser(userId: string | mongoose.Types.ObjectId): Promise<IGravestone[]>;
  findNearLocation(locationId: string, limit?: number): Promise<IGravestone[]>;
  getRecentDeaths(limit?: number): Promise<IGravestone[]>;
}

/**
 * Gravestone schema
 */
const GravestoneSchema = new Schema<IGravestone>(
  {
    // Character info
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    characterName: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Death circumstances
    level: {
      type: Number,
      required: true,
      min: 1
    },
    deathLocation: {
      type: String,
      required: true,
      index: true
    },
    causeOfDeath: {
      type: String,
      enum: Object.values(DeathType),
      required: true
    },
    killerName: {
      type: String,
      default: undefined
    },
    epitaph: {
      type: String,
      required: true,
      maxlength: 200
    },
    diedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    // Character stats at death
    faction: {
      type: String,
      required: true
    },
    totalPlayTime: {
      type: Number,
      default: 0
    },
    totalKills: {
      type: Number,
      default: 0
    },
    totalDeaths: {
      type: Number,
      default: 0
    },
    highestBounty: {
      type: Number,
      default: 0
    },

    // Inheritance pool
    goldPool: {
      type: Number,
      default: 0,
      min: 0
    },
    heirloomItems: {
      type: [{
        itemId: { type: String, required: true },
        itemName: { type: String, required: true },
        itemType: { type: String, required: true },
        rarity: { type: String, default: 'common' },
        originalStats: { type: Map, of: Number }
      }],
      default: []
    },
    skillMemory: {
      type: Map,
      of: Number,
      default: new Map()
    },
    prestigeTier: {
      type: Number,
      default: 0,
      min: 0
    },

    // Claiming
    claimed: {
      type: Boolean,
      default: false,
      index: true
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      default: undefined
    },
    claimedAt: {
      type: Date,
      default: undefined
    },
    inheritanceTier: {
      type: String,
      enum: Object.values(InheritanceTier),
      default: undefined
    },
    inheritanceResult: {
      type: {
        goldReceived: { type: Number },
        heirloomsReceived: [String],
        skillBoosts: { type: Map, of: Number },
        destinyHand: [String]
      },
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
GravestoneSchema.index({ userId: 1, claimed: 1 });
GravestoneSchema.index({ deathLocation: 1, claimed: 1 });
GravestoneSchema.index({ diedAt: -1 });

/**
 * Find all gravestones for a user
 */
GravestoneSchema.statics.findByUser = async function(
  userId: string | mongoose.Types.ObjectId
): Promise<IGravestone[]> {
  return this.find({ userId }).sort({ diedAt: -1 });
};

/**
 * Find unclaimed gravestones for a user
 */
GravestoneSchema.statics.findUnclaimedByUser = async function(
  userId: string | mongoose.Types.ObjectId
): Promise<IGravestone[]> {
  return this.find({ userId, claimed: false }).sort({ diedAt: -1 });
};

/**
 * Find gravestones near a location (same location or region)
 */
GravestoneSchema.statics.findNearLocation = async function(
  locationId: string,
  limit: number = 10
): Promise<IGravestone[]> {
  return this.find({ deathLocation: locationId })
    .sort({ diedAt: -1 })
    .limit(limit);
};

/**
 * Get recent deaths for world news/graveyard display
 */
GravestoneSchema.statics.getRecentDeaths = async function(
  limit: number = 20
): Promise<IGravestone[]> {
  return this.find({})
    .sort({ diedAt: -1 })
    .limit(limit)
    .select('characterName level deathLocation causeOfDeath epitaph diedAt faction');
};

export const Gravestone = mongoose.model<IGravestone, IGravestoneModel>('Gravestone', GravestoneSchema);
