/**
 * Territory Conquest State Model
 *
 * Mongoose schema for territory conquest state and fortifications
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { TerritoryFactionId as FactionId, OccupationStatus, FortificationType, ResistanceActivityType } from '@desperados/shared';
import type {
  ControlChange,
  DefenseBonus,
  TerritoryFortification,
  ResistanceActivity,
} from '@desperados/shared';

/**
 * Territory Conquest State document interface
 */
export interface ITerritoryConquestState extends Document {
  territoryId: string;
  territoryName: string;
  currentController: FactionId;
  controlEstablishedAt: Date;

  stabilityPeriodEnds?: Date;
  occupationStatus: OccupationStatus;
  occupationEfficiency: number;

  underSiege: boolean;
  siegeAttemptId?: mongoose.Types.ObjectId;
  contestedBy: FactionId[];

  previousControllers: ControlChange[];
  totalSiegesDefended: number;
  totalSiegesFallen: number;
  lastSiegeAt?: Date;

  conquestCooldownUntil?: Date;
  immunityReason?: string;

  fortificationLevel: number;
  fortifications: TerritoryFortification[];
  defenseBonuses: DefenseBonus[];
  totalDefenseBonus: number;

  hasActiveResistance: boolean;
  resistanceStrength: number;
  resistanceActivities: ResistanceActivity[];

  createdAt: Date;
  updatedAt: Date;

  // Methods
  isUnderSiege(): boolean;
  canBeSieged(): boolean;
  getTotalDefenseBonus(): number;
  addFortification(type: FortificationType): void;
  damageFortification(type: FortificationType, damage: number): void;
  addResistanceActivity(activity: ResistanceActivity): void;
  updateOccupationStatus(): void;
}

/**
 * Territory Conquest State model interface
 */
export interface ITerritoryConquestStateModel extends Model<ITerritoryConquestState> {
  findByTerritory(territoryId: string): Promise<ITerritoryConquestState | null>;
  findByController(factionId: FactionId): Promise<ITerritoryConquestState[]>;
  findUnderSiege(): Promise<ITerritoryConquestState[]>;
  findWithActiveResistance(): Promise<ITerritoryConquestState[]>;
}

/**
 * Territory Conquest State schema definition
 */
const TerritoryConquestStateSchema = new Schema<ITerritoryConquestState>(
  {
    territoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    territoryName: {
      type: String,
      required: true,
    },
    currentController: {
      type: String,
      required: true,
      enum: Object.values(FactionId),
      index: true,
    },
    controlEstablishedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    stabilityPeriodEnds: {
      type: Date,
    },
    occupationStatus: {
      type: String,
      required: true,
      enum: Object.values(OccupationStatus),
      default: OccupationStatus.STABLE,
    },
    occupationEfficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100,
    },

    underSiege: {
      type: Boolean,
      default: false,
      index: true,
    },
    siegeAttemptId: {
      type: Schema.Types.ObjectId,
      ref: 'ConquestAttempt',
    },
    contestedBy: [
      {
        type: String,
        enum: Object.values(FactionId),
      },
    ],

    previousControllers: [
      {
        previousController: {
          type: String,
          required: true,
          enum: Object.values(FactionId),
        },
        newController: {
          type: String,
          required: true,
          enum: Object.values(FactionId),
        },
        changedAt: {
          type: Date,
          required: true,
        },
        influenceChange: {
          type: Number,
          required: true,
        },
        warEventId: {
          type: String,
        },
        method: {
          type: String,
          required: true,
          enum: ['conquest', 'liberation', 'diplomatic', 'abandonment'],
        },
      },
    ],
    totalSiegesDefended: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSiegesFallen: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSiegeAt: {
      type: Date,
    },

    conquestCooldownUntil: {
      type: Date,
      index: true,
    },
    immunityReason: {
      type: String,
    },

    fortificationLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    fortifications: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: Object.values(FortificationType),
        },
        level: {
          type: Number,
          required: true,
          min: 0,
          max: 10,
          default: 1,
        },
        healthPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
          default: 100,
        },
        defenseBonus: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },
        constructedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        lastUpgradedAt: {
          type: Date,
        },
        damagedAt: {
          type: Date,
        },
      },
    ],
    defenseBonuses: [
      {
        source: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        bonus: {
          type: Number,
          required: true,
          min: 0,
        },
        expiresAt: {
          type: Date,
        },
      },
    ],
    totalDefenseBonus: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    hasActiveResistance: {
      type: Boolean,
      default: false,
      index: true,
    },
    resistanceStrength: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    resistanceActivities: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: Object.values(ResistanceActivityType),
        },
        faction: {
          type: String,
          required: true,
          enum: Object.values(FactionId),
        },
        strength: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        frequency: {
          type: Number,
          required: true,
          min: 0,
        },
        lastOccurred: {
          type: Date,
          required: true,
        },
        effectDescription: {
          type: String,
          required: true,
        },
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
TerritoryConquestStateSchema.index({ currentController: 1 });
TerritoryConquestStateSchema.index({ underSiege: 1 });
TerritoryConquestStateSchema.index({ hasActiveResistance: 1 });
TerritoryConquestStateSchema.index({ occupationStatus: 1 });

/**
 * Instance method: Check if under siege
 */
TerritoryConquestStateSchema.methods.isUnderSiege = function (
  this: ITerritoryConquestState
): boolean {
  return this.underSiege && this.siegeAttemptId !== undefined;
};

/**
 * Instance method: Check if can be sieged
 */
TerritoryConquestStateSchema.methods.canBeSieged = function (
  this: ITerritoryConquestState
): boolean {
  if (this.underSiege) return false;
  if (this.conquestCooldownUntil && this.conquestCooldownUntil > new Date()) return false;
  if (this.immunityReason) return false;
  return true;
};

/**
 * Instance method: Get total defense bonus
 */
TerritoryConquestStateSchema.methods.getTotalDefenseBonus = function (
  this: ITerritoryConquestState
): number {
  // Calculate from fortifications
  const fortificationBonus = this.fortifications.reduce((total, fort) => {
    return total + fort.defenseBonus;
  }, 0);

  // Add other bonuses
  const now = new Date();
  const otherBonuses = this.defenseBonuses
    .filter((bonus) => !bonus.expiresAt || bonus.expiresAt > now)
    .reduce((total, bonus) => total + bonus.bonus, 0);

  return Math.round((fortificationBonus + otherBonuses) * 10) / 10;
};

/**
 * Instance method: Add fortification
 */
TerritoryConquestStateSchema.methods.addFortification = function (
  this: ITerritoryConquestState,
  type: FortificationType
): void {
  const id = `${type}_${Date.now()}`;

  this.fortifications.push({
    id,
    type,
    level: 1,
    healthPercentage: 100,
    defenseBonus: 2.0, // Base bonus for level 1
    constructedAt: new Date(),
  });

  this.fortificationLevel = Math.max(
    ...this.fortifications.map((f) => f.level),
    this.fortificationLevel
  );
};

/**
 * Instance method: Damage fortification
 */
TerritoryConquestStateSchema.methods.damageFortification = function (
  this: ITerritoryConquestState,
  type: FortificationType,
  damage: number
): void {
  const fortification = this.fortifications.find((f) => f.type === type);
  if (!fortification) return;

  fortification.healthPercentage = Math.max(0, fortification.healthPercentage - damage);
  fortification.damagedAt = new Date();

  // Recalculate defense bonus based on health
  const healthMultiplier =
    fortification.healthPercentage < 20
      ? 0.2
      : fortification.healthPercentage < 40
      ? 0.5
      : fortification.healthPercentage < 70
      ? 0.7
      : fortification.healthPercentage < 90
      ? 0.9
      : 1.0;

  const baseBonus = 2.0 * fortification.level;
  fortification.defenseBonus = Math.round(baseBonus * healthMultiplier * 10) / 10;
};

/**
 * Instance method: Add resistance activity
 */
TerritoryConquestStateSchema.methods.addResistanceActivity = function (
  this: ITerritoryConquestState,
  activity: ResistanceActivity
): void {
  this.resistanceActivities.push(activity);
  this.hasActiveResistance = true;

  // Update resistance strength
  const activeActivities = this.resistanceActivities.filter((a) => a.active);
  this.resistanceStrength = Math.min(
    100,
    activeActivities.reduce((sum, a) => sum + a.strength, 0)
  );
};

/**
 * Instance method: Update occupation status
 */
TerritoryConquestStateSchema.methods.updateOccupationStatus = function (
  this: ITerritoryConquestState
): void {
  const daysSinceControl =
    (Date.now() - this.controlEstablishedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceControl < 3) {
    this.occupationStatus = OccupationStatus.FRESH;
    this.occupationEfficiency = 50;
  } else if (daysSinceControl < 7) {
    this.occupationStatus = OccupationStatus.STABILIZING;
    this.occupationEfficiency = 75;
  } else {
    this.occupationStatus = OccupationStatus.STABLE;
    this.occupationEfficiency = 100;
    this.stabilityPeriodEnds = undefined;
  }
};

/**
 * Static method: Find by territory
 */
TerritoryConquestStateSchema.statics.findByTerritory = async function (
  territoryId: string
): Promise<ITerritoryConquestState | null> {
  return this.findOne({ territoryId });
};

/**
 * Static method: Find by controller
 */
TerritoryConquestStateSchema.statics.findByController = async function (
  factionId: FactionId
): Promise<ITerritoryConquestState[]> {
  return this.find({ currentController: factionId }).sort({ territoryName: 1 });
};

/**
 * Static method: Find territories under siege
 */
TerritoryConquestStateSchema.statics.findUnderSiege = async function (): Promise<
  ITerritoryConquestState[]
> {
  return this.find({ underSiege: true }).populate('siegeAttemptId');
};

/**
 * Static method: Find territories with active resistance
 */
TerritoryConquestStateSchema.statics.findWithActiveResistance = async function (): Promise<
  ITerritoryConquestState[]
> {
  return this.find({ hasActiveResistance: true, resistanceStrength: { $gt: 0 } });
};

/**
 * Export model
 */
export const TerritoryConquestState = mongoose.model<
  ITerritoryConquestState,
  ITerritoryConquestStateModel
>('TerritoryConquestState', TerritoryConquestStateSchema);
