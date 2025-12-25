/**
 * MiningShaft Model
 *
 * Phase 13: Deep Mining System
 *
 * Mongoose schema for underground mining shafts with levels, hazards,
 * equipment, and resource tracking.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ShaftLevel,
  HazardType,
  HazardSeverity,
  MiningEquipmentType,
  DeepResourceType,
  DeepResourceTier,
  IShaftHazard,
} from '@desperados/shared';

/**
 * Installed equipment subdocument interface
 */
export interface IInstalledEquipment {
  type: MiningEquipmentType;
  installedAt: Date;
  condition: number; // 0-100
  lastMaintenanceAt?: Date;
}

/**
 * Discovered resource subdocument interface
 */
export interface IDiscoveredResource {
  resourceType: DeepResourceType;
  tier: DeepResourceTier;
  quantity: number;
  discoveredAt: Date;
  collected: boolean;
}

/**
 * Hazard incident subdocument interface
 */
export interface IHazardIncident {
  hazardType: HazardType;
  severity: HazardSeverity;
  outcome: 'avoided' | 'minor_damage' | 'major_damage' | 'injury';
  timestamp: Date;
  damageValue?: number;
}

/**
 * Active hazard subdocument interface
 */
export interface IActiveHazard {
  type: HazardType;
  severity: HazardSeverity;
  level: ShaftLevel;
  mitigatedBy: MiningEquipmentType[];
  currentMitigation: number; // 0-100
  lastTriggered?: Date;
}

/**
 * MiningShaft document interface
 */
export interface IMiningShaftDoc extends Document {
  _id: mongoose.Types.ObjectId;
  claimId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;

  // Shaft progression
  currentLevel: ShaftLevel;
  maxLevelReached: ShaftLevel;
  levelProgress: number; // 0-100 towards next level

  // Equipment
  installedEquipment: IInstalledEquipment[];

  // Hazards
  activeHazards: IActiveHazard[];
  hazardMitigation: number; // Overall % mitigation

  // Resources discovered
  discoveredResources: IDiscoveredResource[];

  // Statistics
  totalResourcesExtracted: number;
  totalHazardsEncountered: number;
  hazardIncidents: IHazardIncident[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  hasEquipment(equipmentType: MiningEquipmentType): boolean;
  getEquipmentCondition(equipmentType: MiningEquipmentType): number;
  canDescendTo(level: ShaftLevel): { canDescend: boolean; reason?: string };
  calculateHazardMitigation(): number;
  addHazard(type: HazardType, severity: HazardSeverity, level: ShaftLevel): void;
  resolveHazard(hazardType: HazardType): void;
  recordIncident(hazardType: HazardType, severity: HazardSeverity, outcome: IHazardIncident['outcome'], damageValue?: number): void;
}

/**
 * Installed equipment subdocument schema
 */
const InstalledEquipmentSchema = new Schema<IInstalledEquipment>(
  {
    type: {
      type: String,
      enum: Object.values(MiningEquipmentType),
      required: true,
    },
    installedAt: {
      type: Date,
      default: Date.now,
    },
    condition: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    lastMaintenanceAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

/**
 * Discovered resource subdocument schema
 */
const DiscoveredResourceSchema = new Schema<IDiscoveredResource>(
  {
    resourceType: {
      type: String,
      enum: Object.values(DeepResourceType),
      required: true,
    },
    tier: {
      type: Number,
      enum: [6, 7, 8],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
    collected: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * Active hazard subdocument schema
 */
const ActiveHazardSchema = new Schema<IActiveHazard>(
  {
    type: {
      type: String,
      enum: Object.values(HazardType),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(HazardSeverity),
      required: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    mitigatedBy: {
      type: [String],
      default: [],
    },
    currentMitigation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastTriggered: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

/**
 * Hazard incident subdocument schema
 */
const HazardIncidentSchema = new Schema<IHazardIncident>(
  {
    hazardType: {
      type: String,
      enum: Object.values(HazardType),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(HazardSeverity),
      required: true,
    },
    outcome: {
      type: String,
      enum: ['avoided', 'minor_damage', 'major_damage', 'injury'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    damageValue: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

/**
 * MiningShaft schema definition
 */
const MiningShaftSchema = new Schema<IMiningShaftDoc>(
  {
    claimId: {
      type: Schema.Types.ObjectId,
      ref: 'IllegalClaim',
      required: true,
      index: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },

    // Shaft progression
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
      index: true,
    },
    maxLevelReached: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    levelProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Equipment
    installedEquipment: {
      type: [InstalledEquipmentSchema],
      default: [],
    },

    // Hazards
    activeHazards: {
      type: [ActiveHazardSchema],
      default: [],
    },
    hazardMitigation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Resources discovered
    discoveredResources: {
      type: [DiscoveredResourceSchema],
      default: [],
    },

    // Statistics
    totalResourcesExtracted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHazardsEncountered: {
      type: Number,
      default: 0,
      min: 0,
    },
    hazardIncidents: {
      type: [HazardIncidentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
MiningShaftSchema.index({ characterId: 1, claimId: 1 }, { unique: true });
MiningShaftSchema.index({ characterId: 1, currentLevel: -1 });
MiningShaftSchema.index({ maxLevelReached: -1 }); // For leaderboards

/**
 * Instance methods
 */

// Check if specific equipment is installed
MiningShaftSchema.methods.hasEquipment = function (
  this: IMiningShaftDoc,
  equipmentType: MiningEquipmentType
): boolean {
  return this.installedEquipment.some(
    (eq) => eq.type === equipmentType && eq.condition > 0
  );
};

// Get equipment condition (0 if not installed)
MiningShaftSchema.methods.getEquipmentCondition = function (
  this: IMiningShaftDoc,
  equipmentType: MiningEquipmentType
): number {
  const equipment = this.installedEquipment.find((eq) => eq.type === equipmentType);
  return equipment ? equipment.condition : 0;
};

// Check if player can descend to a level
MiningShaftSchema.methods.canDescendTo = function (
  this: IMiningShaftDoc,
  level: ShaftLevel
): { canDescend: boolean; reason?: string } {
  // Can't skip levels
  if (level > this.currentLevel + 1) {
    return { canDescend: false, reason: 'Must progress through levels sequentially' };
  }

  // Already at or past this level
  if (level <= this.currentLevel) {
    return { canDescend: true };
  }

  // Check equipment requirements for level
  const { SHAFT_LEVEL_CONFIG } = require('@desperados/shared');
  const config = SHAFT_LEVEL_CONFIG[level];

  if (config?.requiredEquipment) {
    for (const reqEquipment of config.requiredEquipment) {
      if (!this.hasEquipment(reqEquipment)) {
        return {
          canDescend: false,
          reason: `Requires ${reqEquipment} to descend to level ${level}`,
        };
      }
    }
  }

  // Check hazard mitigation threshold
  if (config?.minMitigation && this.hazardMitigation < config.minMitigation) {
    return {
      canDescend: false,
      reason: `Requires ${config.minMitigation}% hazard mitigation (currently ${this.hazardMitigation}%)`,
    };
  }

  return { canDescend: true };
};

// Calculate overall hazard mitigation from installed equipment
MiningShaftSchema.methods.calculateHazardMitigation = function (
  this: IMiningShaftDoc
): number {
  const { MINING_EQUIPMENT } = require('@desperados/shared');

  let totalMitigation = 0;
  const hazardCounts: Record<string, number> = {};

  // Count active hazards by type
  for (const hazard of this.activeHazards) {
    hazardCounts[hazard.type] = (hazardCounts[hazard.type] || 0) + 1;
  }

  // Calculate mitigation from each installed equipment
  for (const installed of this.installedEquipment) {
    if (installed.condition <= 0) continue;

    const equipDef = MINING_EQUIPMENT[installed.type];
    if (!equipDef) continue;

    // Condition reduces effectiveness
    const conditionMult = installed.condition / 100;

    for (const mitigation of equipDef.hazardMitigation) {
      if (hazardCounts[mitigation.hazardType] > 0) {
        totalMitigation += mitigation.reductionPercent * conditionMult;
      }
    }
  }

  // Cap at 100%
  this.hazardMitigation = Math.min(100, Math.round(totalMitigation));
  return this.hazardMitigation;
};

// Add a new hazard to the shaft
MiningShaftSchema.methods.addHazard = function (
  this: IMiningShaftDoc,
  type: HazardType,
  severity: HazardSeverity,
  level: ShaftLevel
): void {
  const { MINING_EQUIPMENT } = require('@desperados/shared');

  // Find equipment that mitigates this hazard
  const mitigatingEquipment: MiningEquipmentType[] = [];
  let mitigation = 0;

  for (const installed of this.installedEquipment) {
    if (installed.condition <= 0) continue;

    const equipDef = MINING_EQUIPMENT[installed.type];
    if (!equipDef) continue;

    const mitigationDef = equipDef.hazardMitigation.find(
      (m: { hazardType: HazardType }) => m.hazardType === type
    );
    if (mitigationDef) {
      mitigatingEquipment.push(installed.type);
      mitigation += mitigationDef.reductionPercent * (installed.condition / 100);
    }
  }

  this.activeHazards.push({
    type,
    severity,
    level,
    mitigatedBy: mitigatingEquipment,
    currentMitigation: Math.min(100, Math.round(mitigation)),
    lastTriggered: undefined,
  });

  this.totalHazardsEncountered++;
  this.calculateHazardMitigation();
};

// Resolve/remove a hazard
MiningShaftSchema.methods.resolveHazard = function (
  this: IMiningShaftDoc,
  hazardType: HazardType
): void {
  const index = this.activeHazards.findIndex((h) => h.type === hazardType);
  if (index !== -1) {
    this.activeHazards.splice(index, 1);
    this.calculateHazardMitigation();
  }
};

// Record a hazard incident
MiningShaftSchema.methods.recordIncident = function (
  this: IMiningShaftDoc,
  hazardType: HazardType,
  severity: HazardSeverity,
  outcome: IHazardIncident['outcome'],
  damageValue?: number
): void {
  this.hazardIncidents.push({
    hazardType,
    severity,
    outcome,
    timestamp: new Date(),
    damageValue,
  });

  // Keep only last 100 incidents
  if (this.hazardIncidents.length > 100) {
    this.hazardIncidents = this.hazardIncidents.slice(-100);
  }

  // Update hazard's lastTriggered
  const hazard = this.activeHazards.find((h) => h.type === hazardType);
  if (hazard) {
    hazard.lastTriggered = new Date();
  }
};

/**
 * Static methods interface
 */
interface IMiningShaftModel extends Model<IMiningShaftDoc> {
  getShaftForClaim(claimId: string): Promise<IMiningShaftDoc | null>;
  getShaftsForCharacter(characterId: string): Promise<IMiningShaftDoc[]>;
  getDeepestShafts(limit?: number): Promise<IMiningShaftDoc[]>;
}

/**
 * Static methods
 */

// Get shaft for a specific claim
MiningShaftSchema.statics.getShaftForClaim = async function (
  claimId: string
): Promise<IMiningShaftDoc | null> {
  return this.findOne({
    claimId: new mongoose.Types.ObjectId(claimId),
  });
};

// Get all shafts for a character
MiningShaftSchema.statics.getShaftsForCharacter = async function (
  characterId: string
): Promise<IMiningShaftDoc[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
  }).sort({ maxLevelReached: -1 });
};

// Get deepest shafts (leaderboard)
MiningShaftSchema.statics.getDeepestShafts = async function (
  limit: number = 10
): Promise<IMiningShaftDoc[]> {
  return this.find({})
    .sort({ maxLevelReached: -1, totalResourcesExtracted: -1 })
    .limit(limit)
    .populate('characterId', 'name');
};

/**
 * Export model
 */
export const MiningShaft: IMiningShaftModel = mongoose.model<IMiningShaftDoc, IMiningShaftModel>(
  'MiningShaft',
  MiningShaftSchema
);
