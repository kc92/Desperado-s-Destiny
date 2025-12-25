/**
 * Continent Model
 * Top-level geographic entity in the world hierarchy:
 * Continent → Region → Zone → Location
 */

import mongoose, { Document, Schema } from 'mongoose';
import type { UnlockRequirement } from '@desperados/shared';

export interface IContinent extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  description: string;
  icon: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  isUnlocked: boolean;
  unlockRequirements: UnlockRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

const UnlockRequirementSchema = new Schema<UnlockRequirement>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(['achievement', 'legacy_tier', 'purchase', 'event', 'time_played', 'character_level', 'gold_earned', 'crimes_committed', 'duels_won', 'gang_rank']),
    },
    achievementId: { type: String },
    legacyTier: { type: Number },
    purchaseId: { type: String },
    premiumCurrency: { type: Number },
    eventId: { type: String },
    minValue: { type: Number },
  },
  { _id: false }
);

const ContinentSchema = new Schema<IContinent>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    icon: {
      type: String,
      default: 'globe',
    },
    bounds: {
      north: { type: Number, required: true },
      south: { type: Number, required: true },
      east: { type: Number, required: true },
      west: { type: Number, required: true },
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
ContinentSchema.index({ isUnlocked: 1 });

// Virtual for getting all regions in this continent
ContinentSchema.virtual('regions', {
  ref: 'Region',
  localField: '_id',
  foreignField: 'continentId',
});

// Ensure virtuals are included in JSON
ContinentSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

// Static methods
ContinentSchema.statics.findByStringId = function (id: string) {
  return this.findOne({ id });
};

ContinentSchema.statics.findUnlocked = function () {
  return this.find({ isUnlocked: true });
};

export const Continent = mongoose.model<IContinent>('Continent', ContinentSchema);
export default Continent;
