/**
 * Devil Deal Model
 *
 * Tracks devil deals made with The Outlaw King for permadeath protection.
 * These deals offer protection from death in exchange for gold and sin.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { DevilDealType, DEVIL_DEALS } from '@desperados/shared';

/**
 * Devil Deal document interface
 */
export interface IDevilDeal extends Document {
  characterId: mongoose.Types.ObjectId;
  dealType: DevilDealType;

  // Purchase details
  goldPaid: number;
  sinCost: number;
  purchasedAt: Date;
  purchaseLocation: string;

  // Expiration (if applicable)
  expiresAt?: Date;

  // Consumption
  consumed: boolean;
  consumedAt?: Date;
  consumedReason?: string;  // How the deal was used

  // For Ultimate Wager - track the heist
  linkedHeistId?: mongoose.Types.ObjectId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Devil Deal static methods interface
 */
export interface IDevilDealModel extends Model<IDevilDeal> {
  getActiveDeals(characterId: string | mongoose.Types.ObjectId): Promise<IDevilDeal[]>;
  getDealOfType(characterId: string | mongoose.Types.ObjectId, dealType: DevilDealType): Promise<IDevilDeal | null>;
  consumeDeal(dealId: string | mongoose.Types.ObjectId, reason: string): Promise<IDevilDeal | null>;
  getCharacterDealHistory(characterId: string | mongoose.Types.ObjectId): Promise<IDevilDeal[]>;
}

/**
 * Devil Deal schema
 */
const DevilDealSchema = new Schema<IDevilDeal>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    dealType: {
      type: String,
      enum: Object.values(DevilDealType),
      required: true
    },
    goldPaid: {
      type: Number,
      required: true,
      min: 0
    },
    sinCost: {
      type: Number,
      required: true,
      min: 0
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    purchaseLocation: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      default: undefined
    },
    consumed: {
      type: Boolean,
      default: false
    },
    consumedAt: {
      type: Date,
      default: undefined
    },
    consumedReason: {
      type: String,
      default: undefined
    },
    linkedHeistId: {
      type: Schema.Types.ObjectId,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

// Compound index for active deals lookup
DevilDealSchema.index({ characterId: 1, consumed: 1, expiresAt: 1 });

/**
 * Get all active (non-consumed, non-expired) deals for a character
 */
DevilDealSchema.statics.getActiveDeals = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<IDevilDeal[]> {
  const now = new Date();
  return this.find({
    characterId,
    consumed: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  }).sort({ purchasedAt: -1 });
};

/**
 * Get active deal of specific type
 */
DevilDealSchema.statics.getDealOfType = async function(
  characterId: string | mongoose.Types.ObjectId,
  dealType: DevilDealType
): Promise<IDevilDeal | null> {
  const now = new Date();
  return this.findOne({
    characterId,
    dealType,
    consumed: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  });
};

/**
 * Consume a deal
 */
DevilDealSchema.statics.consumeDeal = async function(
  dealId: string | mongoose.Types.ObjectId,
  reason: string
): Promise<IDevilDeal | null> {
  return this.findByIdAndUpdate(
    dealId,
    {
      consumed: true,
      consumedAt: new Date(),
      consumedReason: reason
    },
    { new: true }
  );
};

/**
 * Get full deal history for a character
 */
DevilDealSchema.statics.getCharacterDealHistory = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<IDevilDeal[]> {
  return this.find({ characterId }).sort({ purchasedAt: -1 });
};

export const DevilDeal = mongoose.model<IDevilDeal, IDevilDealModel>('DevilDeal', DevilDealSchema);
