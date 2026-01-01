/**
 * Criminal Skills Constants
 *
 * Defines criminal skill categories that gate access to crimes.
 * Each crime belongs to a category and requires a specific skill level.
 * Completing crimes awards XP to the associated skill.
 */

import { SkillCategory } from '../types/skill.types';

/**
 * Criminal skill categories
 */
export enum CriminalSkillType {
  PICKPOCKETING = 'pickpocketing',
  BURGLARY = 'burglary',
  ROBBERY = 'robbery',
  HEISTING = 'heisting',
  ASSASSINATION = 'assassination'
}

/**
 * Criminal skill definition
 */
export interface CriminalSkillDefinition {
  id: CriminalSkillType;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  /** Icon for UI */
  icon: string;
  /** Base training time in milliseconds */
  baseTrainingTime: number;
}

/**
 * One hour in milliseconds
 */
const HOUR = 60 * 60 * 1000;

/**
 * Criminal skill definitions
 */
export const CRIMINAL_SKILLS: Record<CriminalSkillType, CriminalSkillDefinition> = {
  [CriminalSkillType.PICKPOCKETING]: {
    id: CriminalSkillType.PICKPOCKETING,
    name: 'Pickpocketing',
    description: 'The art of lifting valuables from unsuspecting marks. Quick hands and a cool demeanor are essential.',
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    icon: '🤏',
    baseTrainingTime: HOUR
  },
  [CriminalSkillType.BURGLARY]: {
    id: CriminalSkillType.BURGLARY,
    name: 'Burglary',
    description: 'Breaking and entering establishments after hours. Patience and planning are key.',
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    icon: '🏠',
    baseTrainingTime: HOUR * 1.2
  },
  [CriminalSkillType.ROBBERY]: {
    id: CriminalSkillType.ROBBERY,
    name: 'Robbery',
    description: 'Armed holdups and highway banditry. Requires nerve and firepower.',
    category: SkillCategory.COMBAT,
    maxLevel: 50,
    icon: '🔫',
    baseTrainingTime: HOUR * 1.5
  },
  [CriminalSkillType.HEISTING]: {
    id: CriminalSkillType.HEISTING,
    name: 'Heisting',
    description: 'Large-scale coordinated operations targeting banks and vaults. The big leagues.',
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    icon: '🏦',
    baseTrainingTime: HOUR * 2
  },
  [CriminalSkillType.ASSASSINATION]: {
    id: CriminalSkillType.ASSASSINATION,
    name: 'Assassination',
    description: 'Contract killing and eliminations. The darkest path in the criminal underworld.',
    category: SkillCategory.COMBAT,
    maxLevel: 50,
    icon: '💀',
    baseTrainingTime: HOUR * 2.5
  }
};

/**
 * Crime to criminal skill mapping
 * Maps crime names to their required criminal skill
 */
export const CRIME_SKILL_REQUIREMENTS: Record<string, { skill: CriminalSkillType; level: number }> = {
  // Pickpocketing crimes (Levels 1-15)
  'Pickpocket Drunk': { skill: CriminalSkillType.PICKPOCKETING, level: 1 },
  'Pick Lock': { skill: CriminalSkillType.PICKPOCKETING, level: 5 },
  'Forge Documents': { skill: CriminalSkillType.PICKPOCKETING, level: 10 },

  // Burglary crimes (Levels 1-20)
  'Steal from Market': { skill: CriminalSkillType.BURGLARY, level: 1 },
  'Burglarize Store': { skill: CriminalSkillType.BURGLARY, level: 10 },
  'Rob Saloon': { skill: CriminalSkillType.BURGLARY, level: 15 },
  'Bootlegging': { skill: CriminalSkillType.BURGLARY, level: 8 },

  // Robbery crimes (Levels 5-30)
  'Cattle Rustling': { skill: CriminalSkillType.ROBBERY, level: 5 },
  'Stage Coach Robbery': { skill: CriminalSkillType.ROBBERY, level: 10 },
  'Steal Horse': { skill: CriminalSkillType.ROBBERY, level: 15 },
  'Smuggling Run': { skill: CriminalSkillType.ROBBERY, level: 8 },
  'Train Robbery': { skill: CriminalSkillType.ROBBERY, level: 25 },
  'The Iron Horse': { skill: CriminalSkillType.ROBBERY, level: 30 },

  // Heisting crimes (Levels 15-40)
  "The Preacher's Ledger": { skill: CriminalSkillType.HEISTING, level: 15 },
  'Territorial Extortion': { skill: CriminalSkillType.HEISTING, level: 18 },
  'The Counterfeit Ring': { skill: CriminalSkillType.HEISTING, level: 22 },
  'Ghost Town Heist': { skill: CriminalSkillType.HEISTING, level: 28 },
  "The Judge's Pocket": { skill: CriminalSkillType.HEISTING, level: 32 },
  'Bank Heist': { skill: CriminalSkillType.HEISTING, level: 35 },

  // Assassination crimes (Level 30+)
  'Murder for Hire': { skill: CriminalSkillType.ASSASSINATION, level: 30 },
  'Arson': { skill: CriminalSkillType.ASSASSINATION, level: 25 }
};

/**
 * Calculate skill XP gained from completing a crime
 * Formula: crimeXP * 0.5
 */
export function calculateCriminalSkillXP(crimeXP: number): number {
  return Math.floor(crimeXP * 0.5);
}

/**
 * Get the criminal skill requirement for a crime
 */
export function getCrimeSkillRequirement(crimeName: string): { skill: CriminalSkillType; level: number } | null {
  return CRIME_SKILL_REQUIREMENTS[crimeName] || null;
}

/**
 * Check if a character has the required criminal skill level for a crime
 */
export function canAttemptCrime(
  crimeName: string,
  characterSkills: Record<CriminalSkillType, number>
): { canAttempt: boolean; reason?: string } {
  const requirement = getCrimeSkillRequirement(crimeName);

  if (!requirement) {
    // Crime has no skill requirement (legacy crimes or special events)
    return { canAttempt: true };
  }

  const characterLevel = characterSkills[requirement.skill] || 0;

  if (characterLevel < requirement.level) {
    const skillDef = CRIMINAL_SKILLS[requirement.skill];
    return {
      canAttempt: false,
      reason: `Requires ${skillDef.name} level ${requirement.level} (you have ${characterLevel})`
    };
  }

  return { canAttempt: true };
}

/**
 * Get all crimes unlocked at a specific skill level
 */
export function getCrimesUnlockedAtLevel(
  skill: CriminalSkillType,
  level: number
): string[] {
  return Object.entries(CRIME_SKILL_REQUIREMENTS)
    .filter(([_, req]) => req.skill === skill && req.level <= level)
    .map(([crimeName]) => crimeName);
}

/**
 * Get the next crime unlock for a skill
 */
export function getNextCrimeUnlock(
  skill: CriminalSkillType,
  currentLevel: number
): { crimeName: string; level: number } | null {
  const unlocks = Object.entries(CRIME_SKILL_REQUIREMENTS)
    .filter(([_, req]) => req.skill === skill && req.level > currentLevel)
    .sort((a, b) => a[1].level - b[1].level);

  if (unlocks.length === 0) return null;

  return {
    crimeName: unlocks[0][0],
    level: unlocks[0][1].level
  };
}

/**
 * XP requirements for criminal skill levels
 * Uses same formula as regular skills: level^2 * 50
 */
export function calculateCriminalSkillXPForLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.floor(Math.pow(level, 2) * 50);
}

/**
 * Calculate total XP needed to reach a criminal skill level
 */
export function calculateTotalCriminalSkillXP(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += calculateCriminalSkillXPForLevel(i);
  }
  return total;
}
