/**
 * Character Merchant Discovery Model
 *
 * Tracks which wandering merchants each character has discovered.
 * Replaces in-memory Map storage in wanderingMerchant.service.ts
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for Character Merchant Discovery document
 */
export interface ICharacterMerchantDiscovery extends Document {
  /** Character ID who discovered the merchant */
  characterId: mongoose.Types.ObjectId;
  /** Merchant ID that was discovered */
  merchantId: string;
  /** Location where merchant was discovered */
  discoveredAtLocationId: string;
  /** Timestamp when merchant was discovered */
  discoveredAt: Date;
  /** Has the character traded with this merchant */
  hasTradedWith: boolean;
  /** First trade timestamp */
  firstTradeAt?: Date;
  /** Last interaction timestamp */
  lastInteractionAt: Date;
  /** Total trades made with this merchant */
  totalTrades: number;
  /** Total gold spent with this merchant */
  totalGoldSpent: number;
}

const CharacterMerchantDiscoverySchema = new Schema<ICharacterMerchantDiscovery>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    merchantId: {
      type: String,
      required: true,
      index: true,
    },
    discoveredAtLocationId: {
      type: String,
      required: true,
    },
    discoveredAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    hasTradedWith: {
      type: Boolean,
      default: false,
    },
    firstTradeAt: {
      type: Date,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
    totalTrades: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGoldSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one discovery per character-merchant pair
CharacterMerchantDiscoverySchema.index(
  { characterId: 1, merchantId: 1 },
  { unique: true }
);

// Index for finding all discovered merchants for a character
CharacterMerchantDiscoverySchema.index({ characterId: 1, discoveredAt: -1 });

// Index for finding which characters discovered a specific merchant
CharacterMerchantDiscoverySchema.index({ merchantId: 1, discoveredAt: -1 });

/**
 * Static method to check if character has discovered a merchant
 */
CharacterMerchantDiscoverySchema.statics.hasDiscovered = async function (
  characterId: string | mongoose.Types.ObjectId,
  merchantId: string
): Promise<boolean> {
  const discovery = await this.findOne({ characterId, merchantId });
  return discovery !== null;
};

/**
 * Static method to discover a merchant
 */
CharacterMerchantDiscoverySchema.statics.discoverMerchant = async function (
  characterId: string | mongoose.Types.ObjectId,
  merchantId: string,
  locationId: string
): Promise<ICharacterMerchantDiscovery> {
  // Use upsert to handle race conditions
  const discovery = await this.findOneAndUpdate(
    { characterId, merchantId },
    {
      $setOnInsert: {
        characterId,
        merchantId,
        discoveredAtLocationId: locationId,
        discoveredAt: new Date(),
        hasTradedWith: false,
        totalTrades: 0,
        totalGoldSpent: 0,
      },
      $set: {
        lastInteractionAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return discovery;
};

/**
 * Static method to record a trade with a merchant
 */
CharacterMerchantDiscoverySchema.statics.recordTrade = async function (
  characterId: string | mongoose.Types.ObjectId,
  merchantId: string,
  goldSpent: number = 0
): Promise<ICharacterMerchantDiscovery> {
  const now = new Date();

  const discovery = await this.findOneAndUpdate(
    { characterId, merchantId },
    {
      $inc: {
        totalTrades: 1,
        totalGoldSpent: goldSpent,
      },
      $set: {
        hasTradedWith: true,
        lastInteractionAt: now,
      },
      $setOnInsert: {
        firstTradeAt: now,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  // Set firstTradeAt if this is the first trade
  if (discovery.totalTrades === 1 && !discovery.firstTradeAt) {
    discovery.firstTradeAt = now;
    await discovery.save();
  }

  return discovery;
};

/**
 * Static method to get all discovered merchants for a character
 */
CharacterMerchantDiscoverySchema.statics.getDiscoveredMerchants = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<string[]> {
  const discoveries = await this.find(
    { characterId },
    { merchantId: 1 }
  ).lean();

  return discoveries.map((d: { merchantId: string }) => d.merchantId);
};

/**
 * Static method to get discovery count for a character
 */
CharacterMerchantDiscoverySchema.statics.getDiscoveryCount = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<number> {
  return this.countDocuments({ characterId });
};

/**
 * Static method to get discovery stats for a character
 */
CharacterMerchantDiscoverySchema.statics.getDiscoveryStats = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<{
  totalDiscovered: number;
  tradedWith: number;
  totalGoldSpent: number;
  totalTrades: number;
}> {
  const results = await this.aggregate([
    { $match: { characterId: new mongoose.Types.ObjectId(characterId.toString()) } },
    {
      $group: {
        _id: null,
        totalDiscovered: { $sum: 1 },
        tradedWith: { $sum: { $cond: ['$hasTradedWith', 1, 0] } },
        totalGoldSpent: { $sum: '$totalGoldSpent' },
        totalTrades: { $sum: '$totalTrades' },
      },
    },
  ]);

  if (results.length === 0) {
    return {
      totalDiscovered: 0,
      tradedWith: 0,
      totalGoldSpent: 0,
      totalTrades: 0,
    };
  }

  return {
    totalDiscovered: results[0].totalDiscovered,
    tradedWith: results[0].tradedWith,
    totalGoldSpent: results[0].totalGoldSpent,
    totalTrades: results[0].totalTrades,
  };
};

// Add static methods to interface
export interface ICharacterMerchantDiscoveryModel
  extends mongoose.Model<ICharacterMerchantDiscovery> {
  hasDiscovered(
    characterId: string | mongoose.Types.ObjectId,
    merchantId: string
  ): Promise<boolean>;
  discoverMerchant(
    characterId: string | mongoose.Types.ObjectId,
    merchantId: string,
    locationId: string
  ): Promise<ICharacterMerchantDiscovery>;
  recordTrade(
    characterId: string | mongoose.Types.ObjectId,
    merchantId: string,
    goldSpent?: number
  ): Promise<ICharacterMerchantDiscovery>;
  getDiscoveredMerchants(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<string[]>;
  getDiscoveryCount(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<number>;
  getDiscoveryStats(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<{
    totalDiscovered: number;
    tradedWith: number;
    totalGoldSpent: number;
    totalTrades: number;
  }>;
}

export const CharacterMerchantDiscovery = mongoose.model<
  ICharacterMerchantDiscovery,
  ICharacterMerchantDiscoveryModel
>('CharacterMerchantDiscovery', CharacterMerchantDiscoverySchema);
