/**
 * Crafting Profession System Types
 * Phase 7, Wave 7.1 - Desperados Destiny
 *
 * Complete type definitions for the 6-profession crafting system
 */

import { ObjectId } from 'mongodb';

// ============================================================================
// CORE ENUMS
// ============================================================================

export enum ProfessionId {
  BLACKSMITHING = 'blacksmithing',
  LEATHERWORKING = 'leatherworking',
  ALCHEMY = 'alchemy',
  COOKING = 'cooking',
  TAILORING = 'tailoring',
  GUNSMITHING = 'gunsmithing'
}

export enum CraftingSkillTier {
  NOVICE = 'novice',           // 1-15
  APPRENTICE = 'apprentice',   // 16-30
  JOURNEYMAN = 'journeyman',   // 31-50
  EXPERT = 'expert',           // 51-70
  MASTER = 'master',           // 71-90
  GRANDMASTER = 'grandmaster'  // 91-100
}

export enum CharacterStat {
  STRENGTH = 'strength',
  DEXTERITY = 'dexterity',
  INTELLIGENCE = 'intelligence',
  WISDOM = 'wisdom',
  CHARISMA = 'charisma',
  PERCEPTION = 'perception'
}

export enum CraftingFacilityType {
  // Blacksmithing
  FORGE = 'forge',
  ANVIL = 'anvil',
  QUENCH_TANK = 'quench_tank',

  // Leatherworking
  TANNING_RACK = 'tanning_rack',
  LEATHER_WORKBENCH = 'leather_workbench',
  DYE_VAT = 'dye_vat',

  // Alchemy
  DISTILLERY = 'distillery',
  CAULDRON = 'cauldron',
  STORAGE_RACKS = 'storage_racks',

  // Cooking
  STOVE = 'stove',
  SMOKER = 'smoker',
  ICE_BOX = 'ice_box',

  // Tailoring
  LOOM = 'loom',
  SEWING_TABLE = 'sewing_table',
  MANNEQUIN = 'mannequin',

  // Gunsmithing
  GUN_LATHE = 'gun_lathe',
  POWDER_PRESS = 'powder_press',
  TEST_RANGE = 'test_range'
}

export enum MaterialCategory {
  // Blacksmithing materials
  METAL_ORE = 'metal_ore',
  REFINED_METAL = 'refined_metal',
  PRECIOUS_METAL = 'precious_metal',

  // Leatherworking materials
  RAW_HIDE = 'raw_hide',
  TANNED_LEATHER = 'tanned_leather',
  EXOTIC_HIDE = 'exotic_hide',

  // Alchemy materials
  HERB = 'herb',
  MINERAL = 'mineral',
  ANIMAL_PART = 'animal_part',
  RARE_REAGENT = 'rare_reagent',

  // Cooking materials
  MEAT = 'meat',
  VEGETABLE = 'vegetable',
  SPICE = 'spice',
  ALCOHOL = 'alcohol',

  // Tailoring materials
  FABRIC = 'fabric',
  DYE = 'dye',
  ACCESSORY = 'accessory',

  // Gunsmithing materials
  GUNPOWDER = 'gunpowder',
  AMMUNITION_COMPONENT = 'ammunition_component',
  GUN_PART = 'gun_part',
  WOOD = 'wood'
}

export enum CraftingQuality {
  POOR = 'poor',           // 50-69% of base stats
  COMMON = 'common',       // 70-89% of base stats
  GOOD = 'good',           // 90-99% of base stats
  EXCELLENT = 'excellent', // 100-119% of base stats
  MASTERWORK = 'masterwork', // 120-149% of base stats
  LEGENDARY = 'legendary'  // 150%+ of base stats
}

export enum RecipeSource {
  TRAINER = 'trainer',           // Learned from profession trainer
  DISCOVERY = 'discovery',       // Random discovery while crafting
  WORLD_DROP = 'world_drop',     // Found as loot
  QUEST_REWARD = 'quest_reward', // Reward from quest
  VENDOR = 'vendor',             // Purchased from vendor
  REPUTATION = 'reputation',     // Unlocked via reputation
  ACHIEVEMENT = 'achievement'    // Unlocked via achievement
}

export enum CraftingToolQuality {
  BASIC = 'basic',           // 1.0x speed, 0% quality bonus
  GOOD = 'good',             // 1.2x speed, 5% quality bonus
  FINE = 'fine',             // 1.5x speed, 10% quality bonus
  MASTERWORK = 'masterwork', // 2.0x speed, 20% quality bonus
  LEGENDARY = 'legendary'    // 3.0x speed, 30% quality bonus
}

// ============================================================================
// FACILITY TYPES
// ============================================================================

export interface FacilityRequirement {
  type: CraftingFacilityType;
  tier: number; // 1-5, higher tier = better facilities
  optional?: boolean;
  bonusDescription?: string;
}

export interface OwnedFacility {
  type: CraftingFacilityType;
  tier: number;
  locationId?: ObjectId; // Gang hideout, personal property, or town
  locationName?: string;
  condition: number; // 0-100, degrades with use
  lastMaintenanceDate: Date;
  upgrades: FacilityUpgrade[];
}

export interface FacilityUpgrade {
  id: string;
  name: string;
  description: string;
  effect: {
    speedBonus?: number;
    qualityBonus?: number;
    materialSavings?: number;
    durabilityReduction?: number;
  };
  cost: number; // Gold cost
  installed: boolean;
}

// ============================================================================
// PROFESSION TYPES
// ============================================================================

export interface ProfessionBonus {
  tier: CraftingSkillTier;
  unlockLevel: number;
  name: string;
  description: string;
  effect: {
    craftingSpeed?: number;      // Percentage increase
    qualityChance?: number;       // Percentage increase
    materialSavings?: number;     // Percentage chance to save materials
    xpGain?: number;              // Percentage increase
    criticalChance?: number;      // Percentage chance for critical craft
    specialAbility?: string;      // Unique ability unlock
  };
}

export interface CraftingSkillTierDefinition {
  tier: CraftingSkillTier;
  minLevel: number;
  maxLevel: number;
  xpMultiplier: number; // Affects XP needed per level
  title: string; // Display title for this tier
  color: string; // UI color code
}

export interface CraftingProfession {
  id: ProfessionId;
  name: string;
  description: string;
  primaryStat: CharacterStat;
  facilities: FacilityRequirement[];
  materialCategories: MaterialCategory[];
  skillTiers: CraftingSkillTierDefinition[];
  bonuses: ProfessionBonus[];
  trainerLocations: string[]; // Where to find trainers
  specialization: {
    name: string;
    description: string;
    bonus: string; // What you get for specializing
  };
}

// ============================================================================
// CRAFTING PROFILE TYPES
// ============================================================================

export interface ProfessionProgress {
  professionId: ProfessionId;
  level: number; // 1-100
  xp: number;
  xpToNextLevel: number;
  tier: CraftingSkillTier;
  totalItemsCrafted: number;
  criticalCrafts: number; // Times quality bonus triggered
  firstCraftedDate: Date;
  lastCraftedDate: Date;
}

export interface CraftingStatistics {
  totalCrafts: number;
  totalCriticals: number;
  totalMasterworks: number;
  totalLegendaries: number;
  goldEarned: number; // From selling crafted items
  goldSpent: number; // On materials and facilities
  materialsUsed: { [materialId: string]: number };
  favoriteRecipe?: string;
  fastestCraft?: {
    recipeId: string;
    timeInSeconds: number;
    date: Date;
  };
}

export interface CraftingProfile {
  characterId: ObjectId;
  professions: Map<ProfessionId, ProfessionProgress>;
  specializations: [ProfessionId?, ProfessionId?]; // Max 2 specializations
  craftingStats: CraftingStatistics;
  unlockedRecipes: string[]; // Recipe IDs
  facilities: OwnedFacility[];
  activeCraftingSession?: ActiveCraftingSession;
  reputation: Map<string, number>; // Reputation with crafting factions
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveCraftingSession {
  recipeId: string;
  startTime: Date;
  endTime: Date;
  facilityUsed?: CraftingFacilityType;
  toolQuality: CraftingToolQuality;
  qualityRoll?: number; // Determined at start
  canceled?: boolean;
}

// ============================================================================
// RECIPE TYPES
// ============================================================================

export interface RecipeRequirement {
  professionId: ProfessionId;
  minLevel: number;
  minTier: CraftingSkillTier;
  facility?: FacilityRequirement;
  otherProfession?: {
    professionId: ProfessionId;
    minLevel: number;
  };
}

export interface MaterialRequirement {
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  quantity: number;
  optional?: boolean;
  alternativeMaterials?: string[]; // Can substitute with these
}

export interface RecipeOutput {
  itemId: string;
  itemName: string;
  baseQuantity: number;
  minQuantity?: number; // With poor quality
  maxQuantity?: number; // With legendary quality
  qualityAffectsStats: boolean;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  professionId: ProfessionId;
  requirements: RecipeRequirement;
  materials: MaterialRequirement[];
  output: RecipeOutput;
  baseCraftTime: number; // In seconds
  difficulty: number; // 1-100, affects XP and quality calculation
  xpGain: number; // Base XP for crafting
  learningSource: RecipeSource;
  learningCost?: number; // Gold cost to learn
  specialNotes?: string;
  discoveryChance?: number; // If learned by discovery
  category: string; // Weapon, Armor, Consumable, etc.
  tags: string[];
}

// ============================================================================
// CRAFTING ACTION TYPES
// ============================================================================

export interface CraftItemRequest {
  recipeId: string;
  quantity: number;
  useFacility?: CraftingFacilityType;
  toolQuality?: CraftingToolQuality;
  quickCraft?: boolean; // Use energy to instant craft
}

export interface CraftItemResponse {
  success: boolean;
  itemsCrafted: CraftedItem[];
  xpGained: number;
  newLevel?: number;
  newTier?: CraftingSkillTier;
  materialCosts: MaterialRequirement[];
  goldCost: number;
  timeTaken: number; // In seconds
  criticalSuccess: boolean;
  message: string;
}

export interface CraftedItem {
  itemId: string;
  itemName: string;
  quantity: number;
  quality: CraftingQuality;
  statModifier: number; // 0.5 to 1.5+ based on quality
  durability: number;
  createdBy: ObjectId; // Character ID
  createdDate: Date;
  serialNumber?: string; // For unique items
  signature?: string; // Master crafters can sign their work
}

export interface LearnRecipeRequest {
  recipeId: string;
  source: RecipeSource;
  trainerId?: ObjectId; // If learning from trainer
  goldCost?: number;
}

export interface LearnRecipeResponse {
  success: boolean;
  recipeId: string;
  recipeName: string;
  message: string;
}

export interface SpecializationRequest {
  professionId: ProfessionId;
  slot: 0 | 1; // Which specialization slot
  confirm: boolean;
}

export interface SpecializationResponse {
  success: boolean;
  specializations: [ProfessionId?, ProfessionId?];
  message: string;
  warning?: string; // If replacing existing specialization
}

// ============================================================================
// MATERIAL TYPES
// ============================================================================

export interface CraftingMaterial {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  tier: number; // 1-5, quality of material
  stackSize: number;
  vendorValue: number;
  weight: number;
  sources: string[]; // Where to obtain
  usedInProfessions: ProfessionId[];
  rare: boolean;
}

// ============================================================================
// XP CALCULATION TYPES
// ============================================================================

export interface XPCalculation {
  baseXP: number;
  difficultyModifier: number;
  greenModifier: number; // Penalty for crafting below your level
  orangeModifier: number; // Bonus for crafting above your level
  specializationBonus: number;
  toolBonus: number;
  facilityBonus: number;
  totalXP: number;
}

export interface QualityCalculation {
  baseChance: number; // Base chance for each quality tier
  skillModifier: number;
  statModifier: number; // From character's primary stat
  toolModifier: number;
  facilityModifier: number;
  specializationBonus: number;
  criticalChance: number;
  finalRoll: number; // 1-1000
  resultingQuality: CraftingQuality;
  statMultiplier: number; // Final multiplier for item stats
}

// ============================================================================
// LEVELING TYPES
// ============================================================================

export interface LevelingCurve {
  level: number;
  xpRequired: number;
  tier: CraftingSkillTier;
  cumulativeXP: number;
}

export interface ProfessionLevelUp {
  professionId: ProfessionId;
  oldLevel: number;
  newLevel: number;
  oldTier: CraftingSkillTier;
  newTier?: CraftingSkillTier;
  bonusUnlocked?: ProfessionBonus;
  recipesUnlocked: string[];
  congratulations: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface CraftingValidation {
  canCraft: boolean;
  errors: string[];
  warnings: string[];
  requirements: {
    hasProfession: boolean;
    meetsLevelRequirement: boolean;
    hasMaterials: boolean;
    hasFacility: boolean;
    hasEnergy: boolean;
    hasInventorySpace: boolean;
  };
}

// ============================================================================
// DISCOVERY TYPES
// ============================================================================

export interface RecipeDiscovery {
  recipeId: string;
  recipeName: string;
  discoveredBy: ObjectId;
  discoveryDate: Date;
  discoveryMethod: 'experimentation' | 'critical_craft' | 'rare_material' | 'random';
  firstDiscovery: boolean; // Server-wide first discovery
  rewardBonus?: {
    gold?: number;
    reputation?: number;
    achievement?: string;
  };
}

// All types are already exported via their interface/enum declarations above
