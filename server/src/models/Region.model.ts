/**
 * Region Model
 * Geographic regions within continents:
 * Continent → Region → Zone → Location
 */

import mongoose, { Document, Schema } from 'mongoose';
import type { FactionType, RegionCategory, UnlockRequirement, RegionConnection } from '@desperados/shared';

export interface IRegion extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  continentId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: RegionCategory;
  primaryFaction: FactionType;
  dangerRange: [number, number];
  position: {
    x: number;
    y: number;
  };
  icon: string;
  connections: RegionConnection[];
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

const RegionConnectionSchema = new Schema(
  {
    targetRegionId: {
      type: String,
      required: true,
    },
    travelCost: {
      type: Number,
      required: true,
      default: 10,
    },
    requirements: {
      type: [UnlockRequirementSchema],
      default: [],
    },
  },
  { _id: false }
);

const RegionSchema = new Schema<IRegion>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    continentId: {
      type: Schema.Types.ObjectId,
      ref: 'Continent',
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
    category: {
      type: String,
      required: true,
      enum: ['state', 'territory', 'reservation', 'borderland'],
    },
    primaryFaction: {
      type: String,
      required: true,
      enum: ['settler', 'nahi', 'frontera', 'neutral'],
    },
    dangerRange: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2 && v[0] <= v[1],
        message: 'dangerRange must be [min, max] with min <= max',
      },
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    icon: {
      type: String,
      default: 'map-pin',
    },
    connections: {
      type: [RegionConnectionSchema],
      default: [],
    },
    isUnlocked: {
      type: Boolean,
      default: false,
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
RegionSchema.index({ continentId: 1, isUnlocked: 1 });
RegionSchema.index({ primaryFaction: 1 });

// Virtual for getting all zones in this region
RegionSchema.virtual('zones', {
  ref: 'WorldZone',
  localField: '_id',
  foreignField: 'regionId',
});

// Virtual for populating continent
RegionSchema.virtual('continent', {
  ref: 'Continent',
  localField: 'continentId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtuals are included in JSON
RegionSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

// Static methods
RegionSchema.statics.findByStringId = function (id: string) {
  return this.findOne({ id });
};

RegionSchema.statics.findByContinent = function (continentId: mongoose.Types.ObjectId) {
  return this.find({ continentId });
};

RegionSchema.statics.findUnlocked = function () {
  return this.find({ isUnlocked: true });
};

export const Region = mongoose.model<IRegion>('Region', RegionSchema);
export default Region;
