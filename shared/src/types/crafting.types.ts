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
  // Original 6 professions
  BLACKSMITHING = 'blacksmithing',
  LEATHERWORKING = 'leatherworking',
  ALCHEMY = 'alchemy',
  COOKING = 'cooking',
  TAILORING = 'tailoring',
  GUNSMITHING = 'gunsmithing',

  // New professions (Phase 7.2 expansion)
  NATIVE_CRAFTS = 'native_crafts',   // Bows, totems, beadwork, medicine bags
  PROSPECTING = 'prospecting',       // Refined ores, explosives, mining gear
  WOODWORKING = 'woodworking',       // Tool handles, gun stocks, bows, furniture
  TRAPPING = 'trapping',             // Traps, bait, furs, taxidermy mounts
  LEADERSHIP = 'leadership'          // Banners, documents, forgeries, war drums
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
  TEST_RANGE = 'test_range',

  // Native Crafts (Phase 7.2)
  MEDICINE_LODGE = 'medicine_lodge',
  CRAFT_CIRCLE = 'craft_circle',
  SACRED_FIRE = 'sacred_fire',

  // Prospecting (Phase 7.2)
  ASSAY_TABLE = 'assay_table',
  ORE_REFINERY = 'ore_refinery',
  BLAST_FURNACE = 'blast_furnace',

  // Woodworking (Phase 7.2)
  WOODWORKING_BENCH = 'woodworking_bench',
  WOOD_LATHE = 'wood_lathe',
  SAWMILL = 'sawmill',

  // Trapping (Phase 7.2)
  SKINNING_RACK = 'skinning_rack',
  TAXIDERMY_STAND = 'taxidermy_stand',
  BAIT_STATION = 'bait_station',

  // Leadership (Phase 7.2)
  COMMAND_TENT = 'command_tent',
  PRINTING_PRESS = 'printing_press',
  WAR_ROOM = 'war_room'
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
  FOOD_COMPONENT = 'food_component', // Generic food ingredients for bait/crafting

  // Tailoring materials
  FABRIC = 'fabric',
  DYE = 'dye',
  ACCESSORY = 'accessory',

  // Gunsmithing materials
  GUNPOWDER = 'gunpowder',
  AMMUNITION_COMPONENT = 'ammunition_component',
  GUN_PART = 'gun_part',
  WOOD = 'wood',

  // Native Crafts materials (Phase 7.2)
  QUILL = 'quill',
  BEAD = 'bead',
  SACRED_HERB = 'sacred_herb',
  SPIRIT_COMPONENT = 'spirit_component',
  TOTEM_PART = 'totem_part',
  FEATHER = 'feather',
  BONE = 'bone',

  // Prospecting materials (Phase 7.2)
  CRUDE_ORE = 'crude_ore',
  GEOLOGICAL_SAMPLE = 'geological_sample',
  EXPLOSIVE_COMPONENT = 'explosive_component',
  GEM = 'gem',

  // Woodworking materials (Phase 7.2)
  RAW_WOOD = 'raw_wood',
  LUMBER = 'lumber',
  EXOTIC_WOOD = 'exotic_wood',
  RESIN = 'resin',

  // Trapping materials (Phase 7.2)
  FUR = 'fur',
  TROPHY_PART = 'trophy_part',
  BAIT_COMPONENT = 'bait_component',

  // General crafting materials (Phase 7.2)
  FIBER = 'fiber',           // Plant fibers for cordage
  STONE = 'stone',           // Stone materials (flint, granite, obsidian)
  HIDE = 'hide',             // Generic hide category
  HORN = 'horn',             // Horns from animals
  ADHESIVE = 'adhesive',     // Glues and bonding agents
  GEMSTONE = 'gemstone',     // Precious and semi-precious gems
  TRAP_COMPONENT = 'trap_component',

  // Leadership materials (Phase 7.2)
  PAPER = 'paper',
  INK = 'ink',
  SEAL_COMPONENT = 'seal_component',
  MORALE_ITEM = 'morale_item',

  // Supernatural materials (Phase 7.2)
  CURSED_MATERIAL = 'cursed_material',
  BLESSED_MATERIAL = 'blessed_material',
  ELDRITCH_COMPONENT = 'eldritch_component',
  SPIRIT_ESSENCE = 'spirit_essence'
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

  // Faction requirements (Phase 7.2)
  factionId?: CraftingFactionId;
  factionRepRequired?: number; // Minimum reputation to craft

  // Supernatural integration (Phase 7.2)
  faithCost?: number; // Faith points consumed on craft
  karmaCost?: number; // Karma shift on craft (negative = darker)
  sanityCost?: number; // Sanity damage on craft
  curseEffect?: CraftingCurseEffect;
  blessingEffect?: BlessingEffect;
  eldritchTaint?: boolean; // Marks item as eldritch-touched
}

// Faction types for crafting (Phase 7.2)
// Named CraftingFactionId to avoid conflict with newspaper.types FactionId
export enum CraftingFactionId {
  SETTLER_ALLIANCE = 'settler_alliance',
  NAHI_COALITION = 'nahi_coalition',
  FRONTERA = 'frontera'
}

// Supernatural effects for crafted items (Phase 7.2)
// Named CraftingCurseEffect to avoid conflict with divineStruggle.types CurseEffect
export interface CraftingCurseEffect {
  type: CurseType;
  severity: number; // 1-5
  description: string;
  triggerChance?: number; // % chance to activate
}

export enum CurseType {
  BLOODTHIRST = 'bloodthirst',       // Must deal damage or suffer
  SOUL_DRAIN = 'soul_drain',         // Drains faith over time
  MADNESS = 'madness',               // Sanity damage over time
  MISFORTUNE = 'misfortune',         // Reduced luck/quality
  CORRUPTION = 'corruption',         // Karma decay
  HUNGER = 'hunger',                 // Increased food consumption
  PARANOIA = 'paranoia'              // Negative social effects
}

export interface BlessingEffect {
  type: BlessingType;
  potency: number; // 1-5
  description: string;
  duration?: number; // In seconds, if temporary
}

export enum BlessingType {
  HOLY_LIGHT = 'holy_light',         // Bonus vs undead/eldritch
  PROTECTION = 'protection',         // Damage reduction
  FORTUNE = 'fortune',               // Increased luck
  PURITY = 'purity',                 // Curse resistance
  HEALING = 'healing',               // Regeneration
  GUIDANCE = 'guidance',             // Skill bonuses
  SANCTITY = 'sanctity'              // Karma protection
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
