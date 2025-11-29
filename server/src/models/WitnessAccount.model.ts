import { model, Schema, Document } from 'mongoose';
import { WitnessAccount } from '@desperados/shared';

/**
 * WITNESS ACCOUNT MODEL
 * Tracks NPCs who witnessed events firsthand
 */

const WitnessAccountSchema = new Schema<WitnessAccount>(
  {
    npcId: {
      type: Schema.Types.ObjectId,
      ref: 'NPC',
      required: true,
      index: true
    },
    eventId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    // What they saw
    eventType: {
      type: String,
      required: true,
      index: true
    },
    eventDescription: {
      type: String,
      required: true,
      maxlength: 1000
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'Character'
    }],
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },

    // Details
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 80
    },
    details: [{
      type: String,
      maxlength: 200
    }],
    misidentifications: [{
      type: String,
      maxlength: 200
    }],

    // Sharing
    hasShared: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      type: Schema.Types.ObjectId,
      ref: 'NPC'
    }],
    timesShared: {
      type: Number,
      default: 0,
      min: 0
    },

    // Temporal
    witnessedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'witness_accounts'
  }
);

// ============================================================================
// INDEXES
// ============================================================================

WitnessAccountSchema.index({ npcId: 1, eventId: 1 }, { unique: true });
WitnessAccountSchema.index({ eventId: 1, witnessedAt: -1 });
WitnessAccountSchema.index({ participants: 1 });
WitnessAccountSchema.index({ eventType: 1, witnessedAt: -1 });

// ============================================================================
// METHODS
// ============================================================================

WitnessAccountSchema.methods.share = function(
  this: Document & WitnessAccount,
  targetNPCId: string
): void {
  const npcIdStr = targetNPCId.toString();

  if (!this.sharedWith.some(id => id.toString() === npcIdStr)) {
    this.sharedWith.push(targetNPCId as any);
    this.timesShared++;
    this.hasShared = true;
  }
};

WitnessAccountSchema.methods.hasSharedWith = function(
  this: Document & WitnessAccount,
  npcId: string
): boolean {
  return this.sharedWith.some(id => id.toString() === npcId.toString());
};

WitnessAccountSchema.methods.getAccuracyModifier = function(
  this: Document & WitnessAccount
): number {
  // Accuracy decreases with each sharing (like a game of telephone)
  const degradation = Math.min(20, this.timesShared * 2);
  return Math.max(50, this.accuracy - degradation);
};

// ============================================================================
// STATICS
// ============================================================================

WitnessAccountSchema.statics.findByEvent = function(eventId: string) {
  return this.find({ eventId }).sort({ accuracy: -1 });
};

WitnessAccountSchema.statics.findByNPC = function(npcId: string) {
  return this.find({ npcId }).sort({ witnessedAt: -1 });
};

WitnessAccountSchema.statics.findByParticipant = function(characterId: string) {
  return this.find({ participants: characterId }).sort({ witnessedAt: -1 });
};

WitnessAccountSchema.statics.findUnshared = function(npcId: string) {
  return this.find({
    npcId,
    hasShared: false
  }).sort({ witnessedAt: -1 });
};

// ============================================================================
// EXPORT
// ============================================================================

export const WitnessAccountModel = model<WitnessAccount>('WitnessAccount', WitnessAccountSchema);
