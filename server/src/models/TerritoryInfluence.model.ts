/**
 * Territory Influence Model
 *
 * Mongoose schema for tracking faction influence in territories
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { TerritoryFactionId as FactionId, TerritoryType, ControlLevel } from '@desperados/shared';
import type {
  TerritoryInfluence as ITerritoryInfluence,
  FactionInfluence,
  TerritoryEffect,
} from '@desperados/shared';

/**
 * Territory Influence document interface
 */
export interface ITerritoryInfluenceDocument extends Document, Omit<ITerritoryInfluence, '_id'> {
  calculateControlLevel(): ControlLevel;
  getControllingFaction(): FactionId | undefined;
  updateFactionInfluence(factionId: FactionId, amount: number): void;
  applyDecay(decayRate: number): void;
  updateTrends(): void;
  cleanExpiredEffects(): void;
}

/**
 * Territory Influence model interface
 */
export interface ITerritoryInfluenceModel extends Model<ITerritoryInfluenceDocument> {
  findByTerritoryId(territoryId: string): Promise<ITerritoryInfluenceDocument | null>;
  findControlledByFaction(factionId: FactionId): Promise<ITerritoryInfluenceDocument[]>;
  findContested(): Promise<ITerritoryInfluenceDocument[]>;
  getGlobalInfluence(factionId: FactionId): Promise<number>;
}

/**
 * Faction influence sub-schema
 */
const FactionInfluenceSchema = new Schema<FactionInfluence>(
  {
    factionId: {
      type: String,
      required: true,
      enum: Object.values(FactionId),
    },
    influence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    trend: {
      type: String,
      enum: ['rising', 'falling', 'stable'],
      default: 'stable',
    },
    lastChange: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Territory effect sub-schema
 */
const TerritoryEffectSchema = new Schema<TerritoryEffect>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    affectedFactions: [{
      type: String,
      enum: Object.values(FactionId),
    }],
    magnitude: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
    },
    appliedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { _id: false }
);

/**
 * Territory Influence schema
 */
const TerritoryInfluenceSchema = new Schema<ITerritoryInfluenceDocument>(
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
    territoryType: {
      type: String,
      required: true,
      enum: Object.values(TerritoryType),
    },

    factionInfluence: {
      type: [FactionInfluenceSchema],
      required: true,
      default: [],
    },

    controllingFaction: {
      type: String,
      enum: Object.values(FactionId),
    },
    controlLevel: {
      type: String,
      required: true,
      enum: Object.values(ControlLevel),
      default: ControlLevel.CONTESTED,
    },

    stability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },
    lawLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },
    economicHealth: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },

    previousController: {
      type: String,
      enum: Object.values(FactionId),
    },
    controlChangedAt: {
      type: Date,
    },
    contestedSince: {
      type: Date,
    },

    activeBuffs: {
      type: [TerritoryEffectSchema],
      default: [],
    },
    activeDebuffs: {
      type: [TerritoryEffectSchema],
      default: [],
    },

    lastDecayAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
TerritoryInfluenceSchema.index({ controllingFaction: 1 });
TerritoryInfluenceSchema.index({ controlLevel: 1 });
TerritoryInfluenceSchema.index({ territoryType: 1 });
TerritoryInfluenceSchema.index({ 'factionInfluence.factionId': 1 });

/**
 * Instance method: Calculate control level based on faction influence
 */
TerritoryInfluenceSchema.methods.calculateControlLevel = function(
  this: ITerritoryInfluenceDocument
): ControlLevel {
  if (this.factionInfluence.length === 0) {
    return ControlLevel.CONTESTED;
  }

  // Sort factions by influence
  const sorted = [...this.factionInfluence].sort((a, b) => b.influence - a.influence);
  const top = sorted[0];
  const second = sorted[1];

  // Check dominance (70%+)
  if (top.influence >= 70) {
    return ControlLevel.DOMINATED;
  }

  // Check control (50-69%)
  if (top.influence >= 50) {
    return ControlLevel.CONTROLLED;
  }

  // Check dispute (30-49% with clear lead)
  if (top.influence >= 30) {
    const lead = second ? top.influence - second.influence : top.influence;
    if (lead >= 10) {
      return ControlLevel.DISPUTED;
    }
  }

  // Default to contested
  return ControlLevel.CONTESTED;
};

/**
 * Instance method: Get controlling faction
 */
TerritoryInfluenceSchema.methods.getControllingFaction = function(
  this: ITerritoryInfluenceDocument
): FactionId | undefined {
  const level = this.calculateControlLevel();

  if (level === ControlLevel.CONTESTED) {
    return undefined;
  }

  // Return faction with highest influence
  const sorted = [...this.factionInfluence].sort((a, b) => b.influence - a.influence);
  return sorted[0]?.factionId;
};

/**
 * Instance method: Update faction influence
 */
TerritoryInfluenceSchema.methods.updateFactionInfluence = function(
  this: ITerritoryInfluenceDocument,
  factionId: FactionId,
  amount: number
): void {
  const factionData = this.factionInfluence.find((f) => f.factionId === factionId);

  if (factionData) {
    const oldInfluence = factionData.influence;
    factionData.influence = Math.max(0, Math.min(100, factionData.influence + amount));
    factionData.lastChange = amount;
    factionData.lastUpdated = new Date();

    // Update trend
    if (amount > 0) {
      factionData.trend = 'rising';
    } else if (amount < 0) {
      factionData.trend = 'falling';
    }
  }
};

/**
 * Instance method: Apply daily decay
 */
TerritoryInfluenceSchema.methods.applyDecay = function(
  this: ITerritoryInfluenceDocument,
  decayRate: number = 1
): void {
  const equilibrium = 100 / 6; // ~16.67 for 6 factions

  for (const faction of this.factionInfluence) {
    const current = faction.influence;
    const target = equilibrium;

    if (current > target) {
      // Decay towards equilibrium
      const decay = Math.max(0.5, current * (decayRate / 100));
      faction.influence = Math.max(target, current - decay);
      faction.lastChange = -(current - faction.influence);
      faction.trend = 'falling';
    } else if (current < target && current > 0) {
      // Slight rise towards equilibrium
      const rise = Math.max(0.2, (target - current) * 0.1);
      faction.influence = Math.min(target, current + rise);
      faction.lastChange = faction.influence - current;
      faction.trend = 'rising';
    }

    faction.lastUpdated = new Date();
  }

  this.lastDecayAt = new Date();
};

/**
 * Instance method: Update trends based on recent changes
 */
TerritoryInfluenceSchema.methods.updateTrends = function(this: ITerritoryInfluenceDocument): void {
  for (const faction of this.factionInfluence) {
    if (Math.abs(faction.lastChange) < 0.5) {
      faction.trend = 'stable';
    } else if (faction.lastChange > 0) {
      faction.trend = 'rising';
    } else {
      faction.trend = 'falling';
    }
  }
};

/**
 * Instance method: Clean expired effects
 */
TerritoryInfluenceSchema.methods.cleanExpiredEffects = function(
  this: ITerritoryInfluenceDocument
): void {
  const now = new Date();

  this.activeBuffs = this.activeBuffs.filter((buff) => {
    return !buff.expiresAt || buff.expiresAt > now;
  });

  this.activeDebuffs = this.activeDebuffs.filter((debuff) => {
    return !debuff.expiresAt || debuff.expiresAt > now;
  });
};

/**
 * Static method: Find by territory ID
 */
TerritoryInfluenceSchema.statics.findByTerritoryId = async function(
  territoryId: string
): Promise<ITerritoryInfluenceDocument | null> {
  return this.findOne({ territoryId });
};

/**
 * Static method: Find all territories controlled by faction
 */
TerritoryInfluenceSchema.statics.findControlledByFaction = async function(
  factionId: FactionId
): Promise<ITerritoryInfluenceDocument[]> {
  return this.find({ controllingFaction: factionId });
};

/**
 * Static method: Find all contested territories
 */
TerritoryInfluenceSchema.statics.findContested = async function(): Promise<
  ITerritoryInfluenceDocument[]
> {
  return this.find({ controlLevel: ControlLevel.CONTESTED });
};

/**
 * Static method: Get global influence for faction
 */
TerritoryInfluenceSchema.statics.getGlobalInfluence = async function(
  factionId: FactionId
): Promise<number> {
  const territories = await this.find({});
  let totalInfluence = 0;

  for (const territory of territories) {
    const factionData = territory.factionInfluence.find((f) => f.factionId === factionId);
    if (factionData) {
      totalInfluence += factionData.influence;
    }
  }

  return totalInfluence;
};

/**
 * Territory Influence model
 */
export const TerritoryInfluence = mongoose.model<
  ITerritoryInfluenceDocument,
  ITerritoryInfluenceModel
>('TerritoryInfluence', TerritoryInfluenceSchema);
