/**
 * Conquest Attempt Model
 *
 * Mongoose schema for tracking territory conquest attempts
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ConquestStage,
  ConquestAttemptStatus,
  TerritoryFactionId,
  SiegeRequirement,
  ConquestObjective,
  ConquestResources,
} from '@desperados/shared';

/**
 * Conquest Attempt document interface
 */
export interface IConquestAttempt extends Document {
  territoryId: string;
  territoryName: string;
  attackingFaction: TerritoryFactionId;
  defendingFaction: TerritoryFactionId;

  stage: ConquestStage;
  status: ConquestAttemptStatus;
  declaredAt: Date;
  warEventId?: mongoose.Types.ObjectId;

  requirementsMet: SiegeRequirement[];
  allRequirementsMet: boolean;

  defenseRallied: boolean;
  defendingAllies: TerritoryFactionId[];
  attackingAllies: TerritoryFactionId[];

  attackerResources: ConquestResources;
  defenderResources: ConquestResources;

  warScore?: {
    attacker: number;
    defender: number;
  };
  objectives?: ConquestObjective[];

  completedAt?: Date;
  influenceResult?: number;
  controlTransferred: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  isActive(): boolean;
  canComplete(): boolean;
  determineWinner(): TerritoryFactionId | null;
  getScoreDifference(): number;
}

/**
 * Conquest Attempt model interface
 */
export interface IConquestAttemptModel extends Model<IConquestAttempt> {
  findActiveByTerritory(territoryId: string): Promise<IConquestAttempt | null>;
  findByFaction(factionId: TerritoryFactionId): Promise<IConquestAttempt[]>;
  findRecentCompletedAttempts(limit?: number): Promise<IConquestAttempt[]>;
}

/**
 * Conquest Attempt schema definition
 */
const ConquestAttemptSchema = new Schema<IConquestAttempt>(
  {
    territoryId: {
      type: String,
      required: true,
      index: true,
    },
    territoryName: {
      type: String,
      required: true,
    },
    attackingFaction: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFactionId),
      index: true,
    },
    defendingFaction: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFactionId),
      index: true,
    },

    stage: {
      type: String,
      required: true,
      enum: Object.values(ConquestStage),
      default: ConquestStage.SIEGE_DECLARED,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ConquestAttemptStatus),
      default: ConquestAttemptStatus.PENDING,
      index: true,
    },
    declaredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    warEventId: {
      type: Schema.Types.ObjectId,
      ref: 'GangWar',
    },

    requirementsMet: [
      {
        type: {
          type: String,
          required: true,
          enum: ['influence', 'resources', 'cooldown', 'participants'],
        },
        met: {
          type: Boolean,
          required: true,
        },
        current: {
          type: Number,
          required: true,
        },
        required: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    allRequirementsMet: {
      type: Boolean,
      required: true,
      default: false,
    },

    defenseRallied: {
      type: Boolean,
      default: false,
    },
    defendingAllies: [
      {
        type: String,
        enum: Object.values(TerritoryFactionId),
      },
    ],
    attackingAllies: [
      {
        type: String,
        enum: Object.values(TerritoryFactionId),
      },
    ],

    attackerResources: {
      gold: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      supplies: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      troops: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
    defenderResources: {
      gold: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      supplies: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      troops: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },

    warScore: {
      attacker: {
        type: Number,
        min: 0,
        default: 0,
      },
      defender: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    objectives: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['hold_position', 'destroy_fortification', 'capture_flag', 'eliminate_defenders'],
        },
        description: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
          min: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedBy: {
          type: String,
          enum: Object.values(TerritoryFactionId),
        },
        completedAt: {
          type: Date,
        },
      },
    ],

    completedAt: {
      type: Date,
    },
    influenceResult: {
      type: Number,
      min: -100,
      max: 100,
    },
    controlTransferred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ConquestAttemptSchema.index({ territoryId: 1, status: 1 });
ConquestAttemptSchema.index({ attackingFaction: 1, status: 1 });
ConquestAttemptSchema.index({ defendingFaction: 1, status: 1 });
ConquestAttemptSchema.index({ declaredAt: -1 });

/**
 * Instance method: Check if attempt is active
 */
ConquestAttemptSchema.methods.isActive = function (this: IConquestAttempt): boolean {
  return (
    this.status === ConquestAttemptStatus.PENDING ||
    this.status === ConquestAttemptStatus.ACTIVE
  );
};

/**
 * Instance method: Check if can complete
 */
ConquestAttemptSchema.methods.canComplete = function (this: IConquestAttempt): boolean {
  return (
    this.status === ConquestAttemptStatus.ACTIVE &&
    this.warScore !== undefined &&
    (this.warScore.attacker > 0 || this.warScore.defender > 0)
  );
};

/**
 * Instance method: Determine winner based on score
 */
ConquestAttemptSchema.methods.determineWinner = function (
  this: IConquestAttempt
): TerritoryFactionId | null {
  if (!this.warScore) return null;

  if (this.warScore.attacker > this.warScore.defender) {
    return this.attackingFaction;
  } else if (this.warScore.defender > this.warScore.attacker) {
    return this.defendingFaction;
  }
  return null; // Draw
};

/**
 * Instance method: Get score difference
 */
ConquestAttemptSchema.methods.getScoreDifference = function (this: IConquestAttempt): number {
  if (!this.warScore) return 0;
  return Math.abs(this.warScore.attacker - this.warScore.defender);
};

/**
 * Static method: Find active attempt for territory
 */
ConquestAttemptSchema.statics.findActiveByTerritory = async function (
  territoryId: string
): Promise<IConquestAttempt | null> {
  return this.findOne({
    territoryId,
    status: { $in: [ConquestAttemptStatus.PENDING, ConquestAttemptStatus.ACTIVE] },
  }).sort({ declaredAt: -1 });
};

/**
 * Static method: Find all attempts for a faction
 */
ConquestAttemptSchema.statics.findByFaction = async function (
  factionId: TerritoryFactionId
): Promise<IConquestAttempt[]> {
  return this.find({
    $or: [{ attackingFaction: factionId }, { defendingFaction: factionId }],
  })
    .sort({ declaredAt: -1 })
    .limit(50);
};

/**
 * Static method: Find recent completed attempts
 */
ConquestAttemptSchema.statics.findRecentCompletedAttempts = async function (
  limit: number = 20
): Promise<IConquestAttempt[]> {
  return this.find({
    status: { $in: [ConquestAttemptStatus.SUCCEEDED, ConquestAttemptStatus.FAILED] },
    completedAt: { $exists: true },
  })
    .sort({ completedAt: -1 })
    .limit(limit);
};

/**
 * Export model
 */
export const ConquestAttempt = mongoose.model<IConquestAttempt, IConquestAttemptModel>(
  'ConquestAttempt',
  ConquestAttemptSchema
);
