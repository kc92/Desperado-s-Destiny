/**
 * NPC Trust Model
 *
 * Tracks character-NPC trust relationships for quest unlocking and secrets
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * NPC Trust document interface
 */
export interface INPCTrust extends Document {
  characterId: mongoose.Types.ObjectId;
  npcId: string; // NPC ID string from location data
  trustLevel: number; // 0-100
  interactionCount: number;
  lastInteraction: Date;
  unlockedSecrets: string[]; // Secret IDs this trust has unlocked
  createdAt: Date;
  updatedAt: Date;
}

/**
 * NPC Trust static methods interface
 */
export interface INPCTrustModel extends Model<INPCTrust> {
  getTrustLevel(characterId: string, npcId: string): Promise<number>;
  incrementTrust(characterId: string, npcId: string, amount: number, session?: mongoose.ClientSession): Promise<INPCTrust>;
  getCharacterTrusts(characterId: string): Promise<INPCTrust[]>;
  getUnlockedSecrets(characterId: string, npcId: string): Promise<string[]>;
  addUnlockedSecret(characterId: string, npcId: string, secretId: string): Promise<INPCTrust>;
}

/**
 * NPC Trust schema definition
 */
const NPCTrustSchema = new Schema<INPCTrust>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    npcId: {
      type: String,
      required: true,
      index: true
    },
    trustLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    interactionCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastInteraction: {
      type: Date,
      default: Date.now
    },
    unlockedSecrets: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
NPCTrustSchema.index({ characterId: 1, npcId: 1 }, { unique: true });
NPCTrustSchema.index({ trustLevel: -1 });

/**
 * Static method: Get trust level for character-NPC pair
 */
NPCTrustSchema.statics.getTrustLevel = async function(
  characterId: string,
  npcId: string
): Promise<number> {
  const trust = await this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    npcId
  });
  return trust ? trust.trustLevel : 0;
};

/**
 * Static method: Increment trust level (atomically capped at 0-100)
 */
NPCTrustSchema.statics.incrementTrust = async function(
  characterId: string,
  npcId: string,
  amount: number,
  session?: mongoose.ClientSession
): Promise<INPCTrust> {
  // Use aggregation pipeline for atomic min/max capping
  return this.findOneAndUpdate(
    {
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId
    },
    [
      {
        $set: {
          trustLevel: {
            $min: [
              100,
              {
                $max: [
                  0,
                  { $add: [{ $ifNull: ['$trustLevel', 0] }, amount] }
                ]
              }
            ]
          },
          interactionCount: { $add: [{ $ifNull: ['$interactionCount', 0] }, 1] },
          lastInteraction: new Date()
        }
      }
    ],
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      session
    }
  );
};

/**
 * Static method: Get all trusts for a character
 */
NPCTrustSchema.statics.getCharacterTrusts = async function(
  characterId: string
): Promise<INPCTrust[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId)
  }).sort({ trustLevel: -1 });
};

/**
 * Static method: Get unlocked secrets for character-NPC pair
 */
NPCTrustSchema.statics.getUnlockedSecrets = async function(
  characterId: string,
  npcId: string
): Promise<string[]> {
  const trust = await this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    npcId
  });
  return trust ? trust.unlockedSecrets : [];
};

/**
 * Static method: Add an unlocked secret
 */
NPCTrustSchema.statics.addUnlockedSecret = async function(
  characterId: string,
  npcId: string,
  secretId: string
): Promise<INPCTrust> {
  return this.findOneAndUpdate(
    {
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId
    },
    {
      $addToSet: { unlockedSecrets: secretId }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
};

/**
 * NPC Trust model
 */
export const NPCTrust = mongoose.model<INPCTrust, INPCTrustModel>('NPCTrust', NPCTrustSchema);
