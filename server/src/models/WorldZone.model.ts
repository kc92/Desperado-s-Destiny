/**
 * WorldZone Model
 * Geographic zones within regions:
 * Continent → Region → Zone → Location
 *
 * Note: This is different from TerritoryZone which handles gang control.
 * WorldZone is for geographic/navigation purposes.
 */

import mongoose, { Document, Schema } from 'mongoose';
import type { FactionType, UnlockRequirement, WorldZoneType } from '@desperados/shared';

export interface IWorldZone extends Document {
  _id: mongoose.Types.ObjectId;
  id: WorldZoneType;
  regionId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  theme: string;
  dangerRange: [number, number];
  primaryFaction: FactionType;
  icon: string;
  adjacentZones: string[];
  isUnlocked: boolean;
  unlockRequirements: UnlockRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

const UnlockRequirementSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['level', 'quest', 'reputation', 'item', 'discovery'],
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const WorldZoneSchema = new Schema<IWorldZone>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      enum: [
        'settler_territory',
        'sangre_canyon',
        'coalition_lands',
        'outlaw_territory',
        'frontier',
        'ranch_country',
        'sacred_mountains',
      ],
    },
    regionId: {
      type: Schema.Types.ObjectId,
      ref: 'Region',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
    dangerRange: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2 && v[0] <= v[1],
        message: 'dangerRange must be [min, max] with min <= max',
      },
    },
    primaryFaction: {
      type: String,
      required: true,
      enum: ['settler', 'nahi', 'frontera', 'neutral'],
    },
    icon: {
      type: String,
      default: 'map',
    },
    adjacentZones: {
      type: [String],
      default: [],
    },
    isUnlocked: {
      type: Boolean,
      default: true,
    },
    unlockRequirements: {
      type: [UnlockRequirementSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WorldZoneSchema.index({ regionId: 1, isUnlocked: 1 });
WorldZoneSchema.index({ primaryFaction: 1 });

// Virtual for getting all locations in this zone
WorldZoneSchema.virtual('locations', {
  ref: 'Location',
  localField: 'id',
  foreignField: 'zone',
});

// Virtual for populating region
WorldZoneSchema.virtual('region', {
  ref: 'Region',
  localField: 'regionId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtuals are included in JSON
WorldZoneSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

// Static methods
WorldZoneSchema.statics.findByStringId = function (id: string) {
  return this.findOne({ id });
};

WorldZoneSchema.statics.findByRegion = function (regionId: mongoose.Types.ObjectId) {
  return this.find({ regionId });
};

WorldZoneSchema.statics.findUnlocked = function () {
  return this.find({ isUnlocked: true });
};

WorldZoneSchema.statics.findAdjacent = function (zoneId: string) {
  return this.find({ adjacentZones: zoneId });
};

export const WorldZone = mongoose.model<IWorldZone>('WorldZone', WorldZoneSchema);
export default WorldZone;
