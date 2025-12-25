/**
 * Economic Event Model
 * Phase R2: Economy Foundation
 *
 * Tracks economic events that affect market prices across the game world.
 * Events spawn automatically via the economyTick job based on configurable probabilities.
 */

import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  EconomicEventType,
  EconomicEventSeverity,
  EconomicPriceModifier,
  EconomyItemCategory,
} from '@desperados/shared';

/**
 * Economic Event document interface
 */
export interface IEconomicEvent extends Document {
  // Event identity
  type: EconomicEventType;
  name: string;
  description: string;
  severity: EconomicEventSeverity;

  // Scope
  affectedRegions: string[]; // 'all' or specific region IDs
  affectedCategories: EconomyItemCategory[];

  // Price effects
  priceModifiers: EconomicPriceModifier[];

  // Timing
  duration: number; // Hours
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;

  // News/Gossip integration
  newsHeadline?: string;
  newsPublished: boolean;

  // Metadata
  triggeredBy?: 'system' | 'admin' | 'player_action';
  triggerSource?: string; // Additional context

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Economic Event model static methods
 */
export interface IEconomicEventModel extends Model<IEconomicEvent> {
  getActiveEvents(): Promise<IEconomicEvent[]>;
  getActiveEventsForRegion(regionId: string): Promise<IEconomicEvent[]>;
  getActiveEventsForCategory(category: EconomyItemCategory): Promise<IEconomicEvent[]>;
  expireEvents(): Promise<number>;
  calculateTotalModifier(category: EconomyItemCategory, regionId?: string): Promise<number>;
}

/**
 * Price Modifier subdocument schema
 */
const PriceModifierSchema = new Schema<EconomicPriceModifier>(
  {
    category: {
      type: String,
      required: true,
      enum: Object.values(EconomyItemCategory),
    },
    modifier: {
      type: Number,
      required: true,
      min: -50,
      max: 100,
    },
    description: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Economic Event schema
 */
const EconomicEventSchema = new Schema<IEconomicEvent>(
  {
    // Event identity
    type: {
      type: String,
      required: true,
      enum: Object.values(EconomicEventType),
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
      default: 1,
    },

    // Scope
    affectedRegions: {
      type: [String],
      default: ['all'],
    },
    affectedCategories: {
      type: [String],
      enum: Object.values(EconomyItemCategory),
      default: [EconomyItemCategory.ALL],
    },

    // Price effects
    priceModifiers: {
      type: [PriceModifierSchema],
      required: true,
    },

    // Timing
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 168, // Max 1 week
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },

    // News/Gossip integration
    newsHeadline: { type: String },
    newsPublished: {
      type: Boolean,
      default: false,
    },

    // Metadata
    triggeredBy: {
      type: String,
      enum: ['system', 'admin', 'player_action'],
      default: 'system',
    },
    triggerSource: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
EconomicEventSchema.index({ isActive: 1, expiresAt: 1 });
EconomicEventSchema.index({ type: 1, isActive: 1 });
EconomicEventSchema.index({ affectedRegions: 1 });
EconomicEventSchema.index({ affectedCategories: 1 });

/**
 * Static: Get all active economic events
 */
EconomicEventSchema.statics.getActiveEvents = async function (): Promise<IEconomicEvent[]> {
  return this.find({ isActive: true }).sort({ severity: -1, startedAt: -1 });
};

/**
 * Static: Get active events affecting a specific region
 */
EconomicEventSchema.statics.getActiveEventsForRegion = async function (
  regionId: string
): Promise<IEconomicEvent[]> {
  return this.find({
    isActive: true,
    $or: [
      { affectedRegions: 'all' },
      { affectedRegions: regionId },
    ],
  }).sort({ severity: -1 });
};

/**
 * Static: Get active events affecting a specific category
 */
EconomicEventSchema.statics.getActiveEventsForCategory = async function (
  category: EconomyItemCategory
): Promise<IEconomicEvent[]> {
  return this.find({
    isActive: true,
    $or: [
      { affectedCategories: EconomyItemCategory.ALL },
      { affectedCategories: category },
    ],
  }).sort({ severity: -1 });
};

/**
 * Static: Expire events that have passed their expiration time
 */
EconomicEventSchema.statics.expireEvents = async function (): Promise<number> {
  const now = new Date();
  const result = await this.updateMany(
    {
      isActive: true,
      expiresAt: { $lte: now },
    },
    {
      $set: { isActive: false },
    }
  );
  return result.modifiedCount;
};

/**
 * Static: Calculate total price modifier for a category in a region
 */
EconomicEventSchema.statics.calculateTotalModifier = async function (
  category: EconomyItemCategory,
  regionId?: string
): Promise<number> {
  // Build query based on region
  const regionQuery = regionId
    ? { $or: [{ affectedRegions: 'all' }, { affectedRegions: regionId }] }
    : { affectedRegions: 'all' };

  const events = await this.find({
    isActive: true,
    ...regionQuery,
    $or: [
      { affectedCategories: EconomyItemCategory.ALL },
      { affectedCategories: category },
    ],
  });

  // Sum up all applicable modifiers
  let totalModifier = 0;
  for (const event of events) {
    for (const priceModifier of event.priceModifiers) {
      if (
        priceModifier.category === EconomyItemCategory.ALL ||
        priceModifier.category === category
      ) {
        // Weight by severity
        const weight = event.severity === 3 ? 1.5 : event.severity === 2 ? 1.2 : 1.0;
        totalModifier += priceModifier.modifier * weight;
      }
    }
  }

  // Cap total modifier between -40% and +80%
  return Math.max(-40, Math.min(80, totalModifier));
};

// Virtual for id
EconomicEventSchema.virtual('id').get(function () {
  return this._id?.toString();
});

// Pre-save: Calculate expiresAt if not set
EconomicEventSchema.pre('save', function (next) {
  if (!this.expiresAt && this.startedAt && this.duration) {
    this.expiresAt = new Date(this.startedAt.getTime() + this.duration * 60 * 60 * 1000);
  }
  next();
});

// Ensure virtuals are included
EconomicEventSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const EconomicEvent = mongoose.model<IEconomicEvent, IEconomicEventModel>(
  'EconomicEvent',
  EconomicEventSchema
);

export default EconomicEvent;
