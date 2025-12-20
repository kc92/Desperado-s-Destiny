/**
 * Service Provider Relationship Model
 *
 * Tracks relationships between characters and wandering service provider NPCs.
 * Replaces in-memory Map storage in wanderingNpc.service.ts
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for Service Provider Relationship document
 */
export interface IServiceProviderRelationship extends Document {
  /** Character ID who has the relationship */
  characterId: mongoose.Types.ObjectId;
  /** Service provider NPC ID */
  providerId: string;
  /** Trust level with this provider (1-5 typically) */
  trustLevel: number;
  /** Number of services used from this provider */
  servicesUsed: number;
  /** Total gold spent with this provider */
  totalSpent: number;
  /** Number of favors done for this provider */
  favorsDone: number;
  /** Last interaction timestamp */
  lastInteractionAt: Date;
  /** Creation timestamp */
  createdAt: Date;
  /** Update timestamp */
  updatedAt: Date;
}

const ServiceProviderRelationshipSchema = new Schema<IServiceProviderRelationship>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    trustLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    servicesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    favorsDone: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure one relationship per character-provider pair
ServiceProviderRelationshipSchema.index(
  { characterId: 1, providerId: 1 },
  { unique: true }
);

// Index for finding all relationships for a character
ServiceProviderRelationshipSchema.index({ characterId: 1, lastInteractionAt: -1 });

/**
 * Static method to get or create a relationship
 */
ServiceProviderRelationshipSchema.statics.getOrCreate = async function (
  characterId: string | mongoose.Types.ObjectId,
  providerId: string
): Promise<IServiceProviderRelationship> {
  let relationship = await this.findOne({ characterId, providerId });

  if (!relationship) {
    relationship = await this.create({
      characterId,
      providerId,
      trustLevel: 1,
      servicesUsed: 0,
      totalSpent: 0,
      favorsDone: 0,
    });
  }

  return relationship;
};

/**
 * Static method to record a service usage
 */
ServiceProviderRelationshipSchema.statics.recordServiceUsage = async function (
  characterId: string | mongoose.Types.ObjectId,
  providerId: string,
  goldSpent: number = 0
): Promise<IServiceProviderRelationship> {
  const relationship = await this.findOneAndUpdate(
    { characterId, providerId },
    {
      $inc: {
        servicesUsed: 1,
        totalSpent: goldSpent,
      },
      $set: {
        lastInteractionAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return relationship;
};

/**
 * Static method to increase trust level
 */
ServiceProviderRelationshipSchema.statics.increaseTrust = async function (
  characterId: string | mongoose.Types.ObjectId,
  providerId: string,
  amount: number = 1,
  maxTrust: number = 10
): Promise<IServiceProviderRelationship> {
  const relationship = await this.findOneAndUpdate(
    { characterId, providerId },
    [
      {
        $set: {
          trustLevel: {
            $min: [maxTrust, { $add: ['$trustLevel', amount] }],
          },
          lastInteractionAt: new Date(),
        },
      },
    ],
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return relationship;
};

/**
 * Static method to record a favor done
 */
ServiceProviderRelationshipSchema.statics.recordFavor = async function (
  characterId: string | mongoose.Types.ObjectId,
  providerId: string
): Promise<IServiceProviderRelationship> {
  const relationship = await this.findOneAndUpdate(
    { characterId, providerId },
    {
      $inc: { favorsDone: 1 },
      $set: { lastInteractionAt: new Date() },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return relationship;
};

// Add static methods to interface
export interface IServiceProviderRelationshipModel extends mongoose.Model<IServiceProviderRelationship> {
  getOrCreate(
    characterId: string | mongoose.Types.ObjectId,
    providerId: string
  ): Promise<IServiceProviderRelationship>;
  recordServiceUsage(
    characterId: string | mongoose.Types.ObjectId,
    providerId: string,
    goldSpent?: number
  ): Promise<IServiceProviderRelationship>;
  increaseTrust(
    characterId: string | mongoose.Types.ObjectId,
    providerId: string,
    amount?: number,
    maxTrust?: number
  ): Promise<IServiceProviderRelationship>;
  recordFavor(
    characterId: string | mongoose.Types.ObjectId,
    providerId: string
  ): Promise<IServiceProviderRelationship>;
}

export const ServiceProviderRelationship = mongoose.model<
  IServiceProviderRelationship,
  IServiceProviderRelationshipModel
>('ServiceProviderRelationship', ServiceProviderRelationshipSchema);
