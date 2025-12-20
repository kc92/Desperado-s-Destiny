/**
 * Unlock Enforcement Service
 *
 * Enforces skill-based unlock requirements for gameplay content.
 * Addresses the critical "Built but Not Applied" issue where
 * SKILL_UNLOCKS are defined but never checked.
 *
 * @see docs/audits/SKILLS-SYSTEM-COMPREHENSIVE-AUDIT.md
 */

import { Character } from '../models/Character.model';
import {
  SkillCategory,
  SKILL_UNLOCKS,
  SKILLS,
  SkillUnlock,
  getUnlocksForLevel,
} from '@desperados/shared';
import { Types } from 'mongoose';
import logger from '../utils/logger';

/**
 * Result of a skill requirement check
 */
export interface UnlockCheckResult {
  allowed: boolean;
  error?: string;
  currentLevel?: number;
  requiredLevel?: number;
  unlockName?: string;
}

/**
 * Crime type to CUNNING level requirements mapping
 * Used for crime type identifiers
 */
export const CRIME_TYPE_REQUIREMENTS: Record<string, number> = {
  petty_theft: 1,
  pickpocket: 1,
  burglary: 10,
  mugging: 10,
  robbery: 25,
  heist: 25,
  bank_robbery: 40,
  train_robbery: 40,
};

/**
 * Crime name to CUNNING level requirements mapping
 * Maps actual Action model crime names to required skill levels
 */
export const CRIME_NAME_REQUIREMENTS: Record<string, number> = {
  // Tier 1 - Level 1 (Petty Crimes)
  'Pickpocket Drunk': 1,
  'Steal from Market': 1,
  'Forge Documents': 1,
  'Pick Lock': 1,

  // Tier 2 - Level 10 (Medium Crimes)
  'Burglarize Store': 10,
  'Cattle Rustling': 10,
  'Stage Coach Robbery': 10,
  'Rob Saloon': 10,

  // Tier 3 - Level 20-39 (Serious Crimes)
  "The Preacher's Ledger": 20,
  'Territorial Extortion': 20,
  'The Counterfeit Ring': 25,
  'Ghost Town Heist': 25,
  "The Judge's Pocket": 30,
  'The Iron Horse': 35,

  // Tier 4 - Level 40 (Major Crimes)
  'Bank Heist': 40,
  'Train Robbery': 40,
  'Murder for Hire': 40,
  'Steal Horse': 40,

  // Special Crimes
  'Smuggling Run': 15,
  'Bootlegging': 10,
  'Arson': 35,
};

/**
 * Recipe tier to CRAFT level requirements mapping
 */
export const CRAFTING_TIER_REQUIREMENTS: Record<string, number> = {
  basic: 1,
  common: 1,
  intermediate: 10,
  uncommon: 10,
  weapon: 25,
  armor: 25,
  rare: 40,
  epic: 45,
  legendary: 50,
};

/**
 * Service for enforcing skill-based unlock requirements
 */
export class UnlockEnforcementService {
  /**
   * Check if a character meets the skill requirement for an action
   *
   * @param characterId - The character's ID
   * @param category - The skill category to check (COMBAT, CUNNING, SPIRIT, CRAFT)
   * @param requiredUnlockName - The name of the unlock to check (e.g., "Heist Planning")
   * @returns UnlockCheckResult indicating if the action is allowed
   */
  static async canPerformAction(
    characterId: string | Types.ObjectId,
    category: SkillCategory,
    requiredUnlockName: string
  ): Promise<UnlockCheckResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { allowed: false, error: 'Character not found' };
      }

      return this.checkUnlockForCharacter(character, category, requiredUnlockName);
    } catch (error) {
      logger.error('Error checking unlock requirement:', {
        characterId: characterId.toString(),
        category,
        requiredUnlockName,
        error,
      });
      return { allowed: false, error: 'Failed to check unlock requirement' };
    }
  }

  /**
   * Check unlock requirement using an already-loaded character document
   * Use this when you already have the character to avoid an extra DB call
   */
  static checkUnlockForCharacter(
    character: InstanceType<typeof Character>,
    category: SkillCategory,
    requiredUnlockName: string
  ): UnlockCheckResult {
    // Find the unlock requirement in the category
    const unlocks = SKILL_UNLOCKS[category];
    if (!unlocks) {
      logger.warn(`Unknown skill category: ${category}`);
      return { allowed: true }; // Unknown category = no restriction
    }

    const requirement = unlocks.find((u) => u.name === requiredUnlockName);

    if (!requirement) {
      // No requirement defined for this unlock name = allowed
      logger.debug(`No requirement found for unlock: ${requiredUnlockName}`);
      return { allowed: true };
    }

    // Get character's highest skill level in this category
    const categoryLevel = this.getHighestCategoryLevel(character, category);

    if (categoryLevel < requirement.level) {
      const categoryName = this.getCategoryDisplayName(category);
      return {
        allowed: false,
        error: `Requires ${categoryName} level ${requirement.level} (current: ${categoryLevel})`,
        currentLevel: categoryLevel,
        requiredLevel: requirement.level,
        unlockName: requiredUnlockName,
      };
    }

    return { allowed: true };
  }

  /**
   * Get a character's highest skill level in a category
   * This is the "effective" category level for unlock purposes
   */
  static getHighestCategoryLevel(
    character: InstanceType<typeof Character>,
    category: SkillCategory
  ): number {
    if (!character.skills || character.skills.length === 0) {
      return 0;
    }

    const categorySkills = character.skills.filter((s) => {
      const skillDef = this.getSkillDefinition(s.skillId);
      return skillDef && skillDef.category === category;
    });

    if (categorySkills.length === 0) {
      return 0;
    }

    // Return the highest skill level in the category
    return Math.max(...categorySkills.map((s) => s.level || 0));
  }

  /**
   * Get average skill level in a category (alternative calculation)
   */
  static getAverageCategoryLevel(
    character: InstanceType<typeof Character>,
    category: SkillCategory
  ): number {
    if (!character.skills || character.skills.length === 0) {
      return 0;
    }

    const categorySkills = character.skills.filter((s) => {
      const skillDef = this.getSkillDefinition(s.skillId);
      return skillDef && skillDef.category === category;
    });

    if (categorySkills.length === 0) {
      return 0;
    }

    const totalLevel = categorySkills.reduce((sum, s) => sum + (s.level || 0), 0);
    return Math.floor(totalLevel / categorySkills.length);
  }

  /**
   * Get all unlocked abilities for a character in a category
   */
  static getUnlockedAbilities(
    character: InstanceType<typeof Character>,
    category: SkillCategory
  ): SkillUnlock[] {
    const level = this.getHighestCategoryLevel(character, category);
    return getUnlocksForLevel(category, level);
  }

  /**
   * Get names of all unlocked abilities for a character in a category
   */
  static getUnlockedAbilityNames(
    character: InstanceType<typeof Character>,
    category: SkillCategory
  ): string[] {
    return this.getUnlockedAbilities(character, category).map((u) => u.name);
  }

  /**
   * Check if a character can perform a specific crime type or crime name
   */
  static async canPerformCrime(
    characterId: string | Types.ObjectId,
    crimeTypeOrName: string
  ): Promise<UnlockCheckResult> {
    // Check by name first, then by type
    const requiredLevel =
      CRIME_NAME_REQUIREMENTS[crimeTypeOrName] ??
      CRIME_TYPE_REQUIREMENTS[crimeTypeOrName.toLowerCase()] ??
      1;

    const character = await Character.findById(characterId);
    if (!character) {
      return { allowed: false, error: 'Character not found' };
    }

    const cunningLevel = this.getHighestCategoryLevel(character, SkillCategory.CUNNING);

    if (cunningLevel < requiredLevel) {
      return {
        allowed: false,
        error: `${crimeTypeOrName} requires CUNNING level ${requiredLevel} (current: ${cunningLevel})`,
        currentLevel: cunningLevel,
        requiredLevel,
        unlockName: crimeTypeOrName,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a character can craft at a specific tier
   */
  static async canCraftTier(
    characterId: string | Types.ObjectId,
    tier: string
  ): Promise<UnlockCheckResult> {
    const requiredLevel = CRAFTING_TIER_REQUIREMENTS[tier.toLowerCase()] || 1;

    const character = await Character.findById(characterId);
    if (!character) {
      return { allowed: false, error: 'Character not found' };
    }

    const craftLevel = this.getHighestCategoryLevel(character, SkillCategory.CRAFT);

    if (craftLevel < requiredLevel) {
      return {
        allowed: false,
        error: `${tier} crafting requires CRAFT level ${requiredLevel} (current: ${craftLevel})`,
        currentLevel: craftLevel,
        requiredLevel,
        unlockName: `${tier} Crafting`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a character can craft at a specific tier (sync version for already-loaded character)
   */
  static checkCraftTierForCharacter(
    character: InstanceType<typeof Character>,
    tier: string
  ): UnlockCheckResult {
    const requiredLevel = CRAFTING_TIER_REQUIREMENTS[tier.toLowerCase()] || 1;
    const craftLevel = this.getHighestCategoryLevel(character, SkillCategory.CRAFT);

    if (craftLevel < requiredLevel) {
      return {
        allowed: false,
        error: `${tier} crafting requires CRAFT level ${requiredLevel} (current: ${craftLevel})`,
        currentLevel: craftLevel,
        requiredLevel,
        unlockName: `${tier} Crafting`,
      };
    }

    return { allowed: true };
  }

  /**
   * Filter available crimes based on character's CUNNING level
   * Supports both crime type identifiers and actual crime names from Action model
   */
  static filterAvailableCrimes<T extends { type?: string; name?: string }>(
    character: InstanceType<typeof Character>,
    crimes: T[]
  ): T[] {
    const cunningLevel = this.getHighestCategoryLevel(character, SkillCategory.CUNNING);

    return crimes.filter((crime) => {
      // First try to match by name (Action model uses 'name')
      if (crime.name && CRIME_NAME_REQUIREMENTS[crime.name] !== undefined) {
        return cunningLevel >= CRIME_NAME_REQUIREMENTS[crime.name];
      }
      // Fall back to type-based matching
      if (crime.type) {
        const requiredLevel = CRIME_TYPE_REQUIREMENTS[crime.type.toLowerCase()] || 1;
        return cunningLevel >= requiredLevel;
      }
      // If no match found, allow by default (unknown crimes)
      return true;
    });
  }

  /**
   * Get skill definition by ID (handles case sensitivity)
   */
  private static getSkillDefinition(skillId: string) {
    const normalized = skillId.toLowerCase();
    return (
      SKILLS[normalized.toUpperCase()] ||
      Object.values(SKILLS).find((s) => s.id === normalized)
    );
  }

  /**
   * Get display name for a skill category
   */
  private static getCategoryDisplayName(category: SkillCategory): string {
    const names: Record<SkillCategory, string> = {
      [SkillCategory.COMBAT]: 'Combat',
      [SkillCategory.CUNNING]: 'Cunning',
      [SkillCategory.SPIRIT]: 'Spirit',
      [SkillCategory.CRAFT]: 'Craft',
    };
    return names[category] || category;
  }
}

export default UnlockEnforcementService;
