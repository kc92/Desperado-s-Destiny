/**
 * Crafting Profile Model
 * Phase 7, Wave 7.1 - Desperados Destiny
 *
 * Stores player crafting progress, professions, recipes, and facilities
 */

import mongoose, { Schema, Document } from 'mongoose';
import {
  ProfessionId,
  CraftingSkillTier,
  CraftingFacilityType,
  CraftingToolQuality,
  ProfessionProgress,
  CraftingStatistics,
  OwnedFacility,
  ActiveCraftingSession,
  FacilityUpgrade,
  SkillTier
} from '@desperados/shared';

// ============================================================================
// SUBDOCUMENT INTERFACES
// ============================================================================

export interface IProfessionProgress extends Document {
  professionId: ProfessionId;
  level: number;
  xp: number;
  xpToNextLevel: number;
  tier: CraftingSkillTier;
  totalItemsCrafted: number;
  criticalCrafts: number;
  firstCraftedDate: Date;
  lastCraftedDate: Date;
}

export interface IFacilityUpgrade extends Document {
  id: string;
  name: string;
  description: string;
  effect: {
    speedBonus?: number;
    qualityBonus?: number;
    materialSavings?: number;
    durabilityReduction?: number;
  };
  cost: number;
  installed: boolean;
}

export interface IOwnedFacility extends Document {
  type: CraftingFacilityType;
  tier: number;
  locationId?: mongoose.Types.ObjectId;
  locationName?: string;
  condition: number;
  lastMaintenanceDate: Date;
  upgrades: IFacilityUpgrade[];
}

export interface IActiveCraftingSession extends Document {
  recipeId: string;
  startTime: Date;
  endTime: Date;
  facilityUsed?: CraftingFacilityType;
  toolQuality: CraftingToolQuality;
  qualityRoll?: number;
  canceled?: boolean;
}

export interface ICraftingStatistics extends Document {
  totalCrafts: number;
  totalCriticals: number;
  totalMasterworks: number;
  totalLegendaries: number;
  goldEarned: number;
  goldSpent: number;
  materialsUsed: Map<string, number>;
  favoriteRecipe?: string;
  fastestCraft?: {
    recipeId: string;
    timeInSeconds: number;
    date: Date;
  };
}

// ============================================================================
// MAIN DOCUMENT INTERFACE
// ============================================================================

export interface ICraftingProfile extends Document {
  characterId: mongoose.Types.ObjectId;
  professions: Map<ProfessionId, IProfessionProgress>;
  specializations: [ProfessionId?, ProfessionId?];
  craftingStats: ICraftingStatistics;
  unlockedRecipes: string[];
  facilities: IOwnedFacility[];
  activeCraftingSession?: IActiveCraftingSession;
  reputation: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getProfessionLevel(professionId: ProfessionId): number;
  canSpecialize(professionId: ProfessionId): boolean;
  addSpecialization(professionId: ProfessionId, slot: 0 | 1): Promise<void>;
  isSpecialized(professionId: ProfessionId): boolean;
  learnRecipe(recipeId: string): Promise<void>;
  hasRecipe(recipeId: string): boolean;
  addProfessionXP(professionId: ProfessionId, xp: number): Promise<ProfessionProgress>;
  getFacility(type: CraftingFacilityType): IOwnedFacility | null;
  startCraftingSession(session: ActiveCraftingSession): Promise<void>;
  completeCraftingSession(): Promise<ActiveCraftingSession | null>;
}

// ============================================================================
// SUBDOCUMENT SCHEMAS
// ============================================================================

const FacilityUpgradeSchema = new Schema<IFacilityUpgrade>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  effect: {
    speedBonus: { type: Number },
    qualityBonus: { type: Number },
    materialSavings: { type: Number },
    durabilityReduction: { type: Number }
  },
  cost: { type: Number, required: true },
  installed: { type: Boolean, required: true, default: false }
}, { _id: false });

const OwnedFacilitySchema = new Schema<IOwnedFacility>({
  type: {
    type: String,
    enum: Object.values(CraftingFacilityType),
    required: true
  },
  tier: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  locationId: { type: Schema.Types.ObjectId },
  locationName: { type: String },
  condition: {
    type: Number,
    required: true,
    default: 100,
    min: 0,
    max: 100
  },
  lastMaintenanceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  upgrades: [FacilityUpgradeSchema]
}, { _id: false });

const ProfessionProgressSchema = new Schema<IProfessionProgress>({
  professionId: {
    type: String,
    enum: Object.values(ProfessionId),
    required: true
  },
  level: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 100
  },
  xp: {
    type: Number,
    required: true,
    default: 0
  },
  xpToNextLevel: {
    type: Number,
    required: true
  },
  tier: {
    type: String,
    enum: Object.values(CraftingSkillTier),
    required: true,
    default: CraftingSkillTier.NOVICE
  },
  totalItemsCrafted: {
    type: Number,
    required: true,
    default: 0
  },
  criticalCrafts: {
    type: Number,
    required: true,
    default: 0
  },
  firstCraftedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastCraftedDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: false });

const ActiveCraftingSessionSchema = new Schema<IActiveCraftingSession>({
  recipeId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  facilityUsed: {
    type: String,
    enum: Object.values(CraftingFacilityType)
  },
  toolQuality: {
    type: String,
    enum: Object.values(CraftingToolQuality),
    required: true,
    default: CraftingToolQuality.BASIC
  },
  qualityRoll: { type: Number },
  canceled: { type: Boolean, default: false }
}, { _id: false });

const CraftingStatisticsSchema = new Schema<ICraftingStatistics>({
  totalCrafts: { type: Number, required: true, default: 0 },
  totalCriticals: { type: Number, required: true, default: 0 },
  totalMasterworks: { type: Number, required: true, default: 0 },
  totalLegendaries: { type: Number, required: true, default: 0 },
  goldEarned: { type: Number, required: true, default: 0 },
  goldSpent: { type: Number, required: true, default: 0 },
  materialsUsed: {
    type: Map,
    of: Number,
    default: new Map()
  },
  favoriteRecipe: { type: String },
  fastestCraft: {
    recipeId: { type: String },
    timeInSeconds: { type: Number },
    date: { type: Date }
  }
}, { _id: false });

// ============================================================================
// MAIN SCHEMA
// ============================================================================

const CraftingProfileSchema = new Schema<ICraftingProfile>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true
      // Note: unique: true creates an index
    },
    professions: {
      type: Map,
      of: ProfessionProgressSchema,
      default: new Map()
    },
    specializations: {
      type: [String],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 2;
        },
        message: 'Cannot have more than 2 specializations'
      },
      default: []
    },
    craftingStats: {
      type: CraftingStatisticsSchema,
      required: true,
      default: () => ({
        totalCrafts: 0,
        totalCriticals: 0,
        totalMasterworks: 0,
        totalLegendaries: 0,
        goldEarned: 0,
        goldSpent: 0,
        materialsUsed: new Map()
      })
    },
    unlockedRecipes: {
      type: [String],
      default: []
    },
    facilities: {
      type: [OwnedFacilitySchema],
      default: []
    },
    activeCraftingSession: {
      type: ActiveCraftingSessionSchema,
      default: undefined
    },
    reputation: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  {
    timestamps: true,
    collection: 'craftingprofiles'
  }
);

// ============================================================================
// INDEXES
// Note: characterId already indexed via unique: true constraint
// ============================================================================

CraftingProfileSchema.index({ 'specializations': 1 });
CraftingProfileSchema.index({ 'activeCraftingSession.endTime': 1 });

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Get the level of a specific profession
 */
CraftingProfileSchema.methods.getProfessionLevel = function(
  professionId: ProfessionId
): number {
  const profession = this.professions.get(professionId);
  return profession ? profession.level : 0;
};

/**
 * Check if character can specialize in a profession
 */
CraftingProfileSchema.methods.canSpecialize = function(
  professionId: ProfessionId
): boolean {
  const profession = this.professions.get(professionId);
  if (!profession) return false;

  // Must be at least level 50 to specialize
  return profession.level >= 50;
};

/**
 * Add a specialization
 */
CraftingProfileSchema.methods.addSpecialization = async function(
  professionId: ProfessionId,
  slot: 0 | 1
): Promise<void> {
  if (!this.canSpecialize(professionId)) {
    throw new Error('Cannot specialize: insufficient profession level (need 50+)');
  }

  const specs = [...this.specializations];
  specs[slot] = professionId;
  this.specializations = specs as [ProfessionId?, ProfessionId?];

  await this.save();
};

/**
 * Check if specialized in a profession
 */
CraftingProfileSchema.methods.isSpecialized = function(
  professionId: ProfessionId
): boolean {
  return this.specializations.includes(professionId);
};

/**
 * Learn a new recipe
 */
CraftingProfileSchema.methods.learnRecipe = async function(
  recipeId: string
): Promise<void> {
  if (!this.unlockedRecipes.includes(recipeId)) {
    this.unlockedRecipes.push(recipeId);
    await this.save();
  }
};

/**
 * Check if recipe is known
 */
CraftingProfileSchema.methods.hasRecipe = function(
  recipeId: string
): boolean {
  return this.unlockedRecipes.includes(recipeId);
};

/**
 * Add XP to a profession and handle leveling
 */
CraftingProfileSchema.methods.addProfessionXP = async function(
  professionId: ProfessionId,
  xp: number
): Promise<ProfessionProgress> {
  let profession = this.professions.get(professionId);

  if (!profession) {
    // Initialize new profession
    profession = {
      professionId,
      level: 1,
      xp: 0,
      xpToNextLevel: calculateXPForLevel(1),
      tier: SkillTier.NOVICE,
      totalItemsCrafted: 0,
      criticalCrafts: 0,
      firstCraftedDate: new Date(),
      lastCraftedDate: new Date()
    } as unknown as IProfessionProgress;
  }

  profession.xp += xp;
  profession.lastCraftedDate = new Date();

  // Check for level ups
  while (profession.xp >= profession.xpToNextLevel && profession.level < 100) {
    profession.level += 1;
    profession.xpToNextLevel = calculateXPForLevel(profession.level);
    profession.tier = getTierForLevel(profession.level);
  }

  this.professions.set(professionId, profession);
  await this.save();

  return profession;
};

/**
 * Get a facility by type
 */
CraftingProfileSchema.methods.getFacility = function(
  type: CraftingFacilityType
): IOwnedFacility | null {
  return this.facilities.find(f => f.type === type) || null;
};

/**
 * Start a crafting session
 */
CraftingProfileSchema.methods.startCraftingSession = async function(
  session: ActiveCraftingSession
): Promise<void> {
  if (this.activeCraftingSession) {
    throw new Error('Already have an active crafting session');
  }

  this.activeCraftingSession = session as IActiveCraftingSession;
  await this.save();
};

/**
 * Complete the active crafting session
 */
CraftingProfileSchema.methods.completeCraftingSession = async function(): Promise<ActiveCraftingSession | null> {
  const session = this.activeCraftingSession;
  if (!session) return null;

  this.activeCraftingSession = undefined;
  await this.save();

  return session;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find or create crafting profile for a character
 */
CraftingProfileSchema.statics.findOrCreate = async function(
  characterId: mongoose.Types.ObjectId
): Promise<ICraftingProfile> {
  let profile = await this.findOne({ characterId });

  if (!profile) {
    profile = await this.create({
      characterId,
      professions: new Map(),
      specializations: [],
      craftingStats: {
        totalCrafts: 0,
        totalCriticals: 0,
        totalMasterworks: 0,
        totalLegendaries: 0,
        goldEarned: 0,
        goldSpent: 0,
        materialsUsed: new Map()
      },
      unlockedRecipes: [],
      facilities: [],
      reputation: new Map()
    });
  }

  return profile;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate XP required for a level
 */
function calculateXPForLevel(level: number): number {
  // Exponential curve: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Get tier for a given level
 */
function getTierForLevel(level: number): CraftingSkillTier {
  if (level >= 91) return CraftingSkillTier.GRANDMASTER;
  if (level >= 71) return CraftingSkillTier.MASTER;
  if (level >= 51) return CraftingSkillTier.EXPERT;
  if (level >= 31) return CraftingSkillTier.JOURNEYMAN;
  if (level >= 16) return CraftingSkillTier.APPRENTICE;
  return CraftingSkillTier.NOVICE;
}

// ============================================================================
// EXPORT MODEL
// ============================================================================

export const CraftingProfile = mongoose.model<ICraftingProfile>(
  'CraftingProfile',
  CraftingProfileSchema
);

export default CraftingProfile;
