/**
 * Crafting Specialization Types
 * Specialization paths for crafting professions
 * Phase 7, Wave 7.1 - Crafting Overhaul
 */

/**
 * The 6 crafting professions that can have specializations
 */
export enum Profession {
  BLACKSMITHING = 'blacksmithing',
  LEATHERWORKING = 'leatherworking',
  ALCHEMY = 'alchemy',
  COOKING = 'cooking',
  TAILORING = 'tailoring',
  GUNSMITHING = 'gunsmithing'
}

/**
 * Requirement to unlock a specialization path
 */
export interface SpecializationRequirement {
  /** Must reach this level in the profession skill */
  professionLevel: number;
  /** Optional quest completion required */
  questId?: string;
  /** Optional gold cost to specialize */
  goldCost?: number;
}

/**
 * Passive bonus provided by a specialization
 */
export interface SpecializationBonus {
  /** Type of bonus */
  type: 'damage' | 'armor' | 'durability' | 'speed' | 'effectiveness' | 'duration' | 'radius' | 'stealth' | 'capacity' | 'resistance' | 'yield' | 'reputation' | 'quality';
  /** Percentage value of the bonus (e.g., 15 for +15%) */
  value: number;
  /** Description of what this bonus applies to */
  appliesTo: string;
}

/**
 * Passive effect that applies to character or crafting
 */
export interface PassiveEffect {
  /** Unique identifier for the effect */
  id: string;
  /** Display name */
  name: string;
  /** What it does */
  description: string;
  /** Effect type for mechanics */
  type: 'crafting' | 'combat' | 'social' | 'survival';
}

/**
 * Reward granted at mastery level (100)
 */
export interface MasteryReward {
  /** Display name of the mastery reward */
  name: string;
  /** What it grants */
  description: string;
  /** Special title granted */
  title?: string;
  /** Additional recipe IDs unlocked */
  legendaryRecipes?: string[];
  /** Special cosmetic item */
  cosmeticItem?: string;
}

/**
 * Definition of a specialization path
 */
export interface SpecializationPath {
  /** Unique identifier */
  id: string;
  /** Parent profession (skill ID) */
  professionId: string;
  /** Display name */
  name: string;
  /** Description of the specialization */
  description: string;
  /** Requirements to unlock this path */
  requirements: SpecializationRequirement;
  /** Passive bonuses provided */
  bonuses: SpecializationBonus[];
  /** Recipe IDs that are unique to this specialization */
  uniqueRecipes: string[];
  /** Passive effects that are always active */
  passiveEffects: PassiveEffect[];
  /** Reward granted at mastery level */
  masteryReward: MasteryReward;
  /** Icon/emoji for display */
  icon: string;
}

/**
 * A player's chosen specialization for a profession
 */
export interface PlayerSpecialization {
  /** The specialization path ID */
  pathId: string;
  /** The profession (skill) ID */
  professionId: string;
  /** When the specialization was chosen */
  unlockedAt: Date;
  /** Mastery progress (0-100) */
  masteryProgress: number;
  /** Recipe IDs that have been unlocked from this specialization */
  uniqueRecipesUnlocked: string[];
}

/**
 * Response when getting available specializations
 */
export interface AvailableSpecializationsResponse {
  /** All available specialization paths */
  paths: SpecializationPath[];
  /** The player's current specializations */
  playerSpecializations: PlayerSpecialization[];
  /** Character's skill levels for professions */
  professionLevels: Record<string, number>;
}

/**
 * Response when choosing a specialization
 */
export interface ChooseSpecializationResponse {
  /** The chosen specialization */
  specialization: PlayerSpecialization;
  /** Message to display */
  message: string;
  /** Recipes unlocked */
  recipesUnlocked: string[];
}

/**
 * Mastery progress update response
 */
export interface MasteryProgressResponse {
  /** The specialization path ID */
  pathId: string;
  /** Old mastery progress */
  oldProgress: number;
  /** New mastery progress */
  newProgress: number;
  /** Whether mastery was achieved */
  masteryAchieved: boolean;
  /** Mastery reward if achieved */
  masteryReward?: MasteryReward;
}

/**
 * Specialization info for UI display
 */
export interface SpecializationDisplayInfo {
  /** The path definition */
  path: SpecializationPath;
  /** Whether player has chosen this */
  isChosen: boolean;
  /** Whether player meets requirements */
  canChoose: boolean;
  /** If can't choose, reason why */
  reason?: string;
  /** Current mastery progress if chosen */
  masteryProgress?: number;
  /** Unlocked recipes count */
  unlockedRecipesCount?: number;
}
