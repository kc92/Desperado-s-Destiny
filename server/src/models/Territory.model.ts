/**
 * Territory Model
 *
 * Mongoose schema for territories in the Sangre Territory system
 * Supports gang warfare, conquest, and territory benefits
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Territory faction enum
 */
export enum TerritoryFaction {
  SETTLER = 'SETTLER',
  NAHI = 'NAHI',
  FRONTERA = 'FRONTERA',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Territory benefits interface
 */
export interface TerritoryBenefits {
  goldBonus: number;
  xpBonus: number;
  energyRegen: number;
}

/**
 * Conquest history entry interface
 */
export interface ConquestHistory {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  conqueredAt: Date;
  capturePoints: number;
}

/**
 * Territory document interface
 */
export interface ITerritory extends Document {
  id: string;
  name: string;
  description: string;
  faction: TerritoryFaction;

  controllingGangId: mongoose.Types.ObjectId | null;
  capturePoints: number;

  benefits: TerritoryBenefits;

  difficulty: number;

  lastConqueredAt: Date | null;
  conquestHistory: ConquestHistory[];

  createdAt: Date;
  updatedAt: Date;

  isControlled(): boolean;
  conquerBy(gangId: mongoose.Types.ObjectId, gangName: string, capturePoints: number): void;
  getBenefitsDisplay(): string;
}

/**
 * Territory model interface
 */
export interface ITerritoryModel extends Model<ITerritory> {
  findBySlug(slug: string): Promise<ITerritory | null>;
  findControlledByGang(gangId: mongoose.Types.ObjectId): Promise<ITerritory[]>;
  findAvailable(): Promise<ITerritory[]>;
}

/**
 * Territory schema definition
 */
const TerritorySchema = new Schema<ITerritory>(
  {
    id: {
      type: String,
      required: true,
      // Note: unique index defined below
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
      trim: true,
    },
    faction: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFaction),
    },

    controllingGangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      default: null,
      // Note: index defined below
    },
    capturePoints: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    benefits: {
      goldBonus: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
      },
      xpBonus: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
      },
      energyRegen: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
        default: 0,
      },
    },

    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    lastConqueredAt: {
      type: Date,
      default: null,
    },
    conquestHistory: [{
      gangId: {
        type: Schema.Types.ObjectId,
        ref: 'Gang',
        required: true,
      },
      gangName: {
        type: String,
        required: true,
      },
      conqueredAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      capturePoints: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
TerritorySchema.index({ id: 1 }, { unique: true });
TerritorySchema.index({ controllingGangId: 1 });
TerritorySchema.index({ faction: 1 });
TerritorySchema.index({ difficulty: 1 });

/**
 * Instance method: Check if territory is controlled by a gang
 */
TerritorySchema.methods.isControlled = function(this: ITerritory): boolean {
  return this.controllingGangId !== null;
};

/**
 * Instance method: Conquer territory by a gang
 */
TerritorySchema.methods.conquerBy = function(
  this: ITerritory,
  gangId: mongoose.Types.ObjectId,
  gangName: string,
  capturePoints: number
): void {
  this.controllingGangId = gangId;
  this.capturePoints = Math.round(capturePoints * 100) / 100;
  this.lastConqueredAt = new Date();

  this.conquestHistory.push({
    gangId,
    gangName,
    conqueredAt: new Date(),
    capturePoints: this.capturePoints,
  });

  if (this.conquestHistory.length > 50) {
    this.conquestHistory = this.conquestHistory.slice(-50);
  }
};

/**
 * Instance method: Get formatted benefits display
 */
TerritorySchema.methods.getBenefitsDisplay = function(this: ITerritory): string {
  const parts: string[] = [];

  if (this.benefits.goldBonus > 0) {
    parts.push(`+${this.benefits.goldBonus}% Gold`);
  }
  if (this.benefits.xpBonus > 0) {
    parts.push(`+${this.benefits.xpBonus}% XP`);
  }
  if (this.benefits.energyRegen > 0) {
    parts.push(`+${this.benefits.energyRegen} Energy/hour`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No bonuses';
};

/**
 * Static method: Find territory by slug
 */
TerritorySchema.statics.findBySlug = async function(
  slug: string
): Promise<ITerritory | null> {
  return this.findOne({ id: slug.toLowerCase() })
    .populate('controllingGangId', 'name tag');
};

/**
 * Static method: Find all territories controlled by a gang
 */
TerritorySchema.statics.findControlledByGang = async function(
  gangId: mongoose.Types.ObjectId
): Promise<ITerritory[]> {
  return this.find({ controllingGangId: gangId })
    .sort({ name: 1 });
};

/**
 * Static method: Find all available (uncontrolled) territories
 */
TerritorySchema.statics.findAvailable = async function(): Promise<ITerritory[]> {
  return this.find({ controllingGangId: null })
    .sort({ difficulty: 1, name: 1 });
};

/**
 * Territory model
 */
export const Territory = mongoose.model<ITerritory, ITerritoryModel>(
  'Territory',
  TerritorySchema
);
