/**
 * Skill System Constants
 *
 * Defines all trainable skills in Desperados Destiny MMORPG
 */

import { TIME } from './game.constants';
import { SkillCategory, DestinySuit } from '../types/skill.types';

// Re-export for convenience
export { SkillCategory } from '../types/skill.types';

/**
 * Skill definition
 */
export interface SkillDefinition {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what the skill does */
  description: string;
  /** Which Destiny Deck suit this skill improves */
  suit: DestinySuit;
  /** Category for organization */
  category: SkillCategory;
  /** Maximum level */
  maxLevel: number;
  /** Base training time in milliseconds (scales with level) */
  baseTrainingTime: number;
  /** Icon emoji */
  icon: string;
}

/**
 * All available skills in Desperados Destiny
 */
export const SKILLS: Record<string, SkillDefinition> = {
  // ============================================
  // COMBAT SKILLS (Clubs Suit)
  // ============================================
  MELEE_COMBAT: {
    id: 'melee_combat',
    name: 'Melee Combat',
    description: 'Hand-to-hand fighting with fists, knives, and close weapons',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR, // 1 hour
    icon: '🗡️'
  },
  RANGED_COMBAT: {
    id: 'ranged_combat',
    name: 'Ranged Combat',
    description: 'Accuracy with rifles, pistols, and bows',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🔫'
  },
  DEFENSIVE_TACTICS: {
    id: 'defensive_tactics',
    name: 'Defensive Tactics',
    description: 'Blocking, dodging, and defensive maneuvers',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🛡️'
  },
  MOUNTED_COMBAT: {
    id: 'mounted_combat',
    name: 'Mounted Combat',
    description: 'Fighting on horseback',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '🏇'
  },
  EXPLOSIVES: {
    id: 'explosives',
    name: 'Explosives',
    description: 'Using and defusing dynamite and explosives',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '💣'
  },

  // ============================================
  // CUNNING SKILLS (Spades Suit)
  // ============================================
  LOCKPICKING: {
    id: 'lockpicking',
    name: 'Lockpicking',
    description: 'Opening locks without keys',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🔓'
  },
  STEALTH: {
    id: 'stealth',
    name: 'Stealth',
    description: 'Moving unseen and unheard',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '👤'
  },
  PICKPOCKET: {
    id: 'pickpocket',
    name: 'Pickpocket',
    description: 'Stealing from others without detection',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '💰'
  },
  TRACKING: {
    id: 'tracking',
    name: 'Tracking',
    description: 'Following trails and finding hidden things',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '👣'
  },
  DECEPTION: {
    id: 'deception',
    name: 'Deception',
    description: 'Lying, disguises, and trickery',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🎭'
  },
  GAMBLING: {
    id: 'gambling',
    name: 'Gambling',
    description: 'Card games, dice, and games of chance',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🎲'
  },
  DUEL_INSTINCT: {
    id: 'duel_instinct',
    name: 'Duel Instinct',
    description: 'Reading opponents and masking your own tells during showdowns',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🎯'
  },
  SLEIGHT_OF_HAND: {
    id: 'sleight_of_hand',
    name: 'Sleight of Hand',
    description: 'Card manipulation and subtle cheating techniques',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '🃏'
  },

  // ============================================
  // SPIRIT SKILLS (Hearts Suit)
  // ============================================
  MEDICINE: {
    id: 'medicine',
    name: 'Medicine',
    description: 'Healing wounds and curing ailments',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '💊'
  },
  PERSUASION: {
    id: 'persuasion',
    name: 'Persuasion',
    description: 'Convincing others through words',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '💬'
  },
  ANIMAL_HANDLING: {
    id: 'animal_handling',
    name: 'Animal Handling',
    description: 'Training and calming animals',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🐴'
  },
  LEADERSHIP: {
    id: 'leadership',
    name: 'Leadership',
    description: 'Inspiring and commanding others',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '⭐'
  },
  RITUAL_KNOWLEDGE: {
    id: 'ritual_knowledge',
    name: 'Ritual Knowledge',
    description: 'Understanding supernatural rituals and traditions',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🔮'
  },
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance',
    description: 'Music, storytelling, and entertainment',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🎵'
  },

  // ============================================
  // CRAFT SKILLS (Diamonds Suit)
  // ============================================
  BLACKSMITHING: {
    id: 'blacksmithing',
    name: 'Blacksmithing',
    description: 'Forging metal tools and weapons',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '⚒️'
  },
  LEATHERWORKING: {
    id: 'leatherworking',
    name: 'Leatherworking',
    description: 'Crafting leather goods and armor',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🧳'
  },
  COOKING: {
    id: 'cooking',
    name: 'Cooking',
    description: 'Preparing food and tonics',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR,
    icon: '🍖'
  },
  ALCHEMY: {
    id: 'alchemy',
    name: 'Alchemy',
    description: 'Gathering herbs, identifying plants, and brewing potions, elixirs, and tonics',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🧪'
  },
  ENGINEERING: {
    id: 'engineering',
    name: 'Engineering',
    description: 'Building traps, mechanisms, and devices',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '⚙️'
  },
  MINING: {
    id: 'mining',
    name: 'Mining',
    description: 'Finding deposits, assessing ore quality, and extracting minerals and gems',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '⛏️'
  },
  CARPENTRY: {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Woodworking and furniture crafting',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '🪵'
  },
  GUNSMITHING: {
    id: 'gunsmithing',
    name: 'Gunsmithing',
    description: 'Crafting and modifying firearms, from pistols to rifles',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 99,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🔧'
  },

};

/**
 * Skill Tier definitions
 */
export enum SkillTier {
  NOVICE = 'NOVICE',
  APPRENTICE = 'APPRENTICE',
  JOURNEYMAN = 'JOURNEYMAN',
  EXPERT = 'EXPERT',
  MASTER = 'MASTER'
}

export interface TierDefinition {
  name: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  color: string;
}

export const SKILL_TIERS: Record<SkillTier, TierDefinition> = {
  [SkillTier.NOVICE]: {
    name: 'Novice',
    minLevel: 1,
    maxLevel: 20,
    description: 'Just starting out - learning the basics',
    color: 'gray'
  },
  [SkillTier.APPRENTICE]: {
    name: 'Apprentice',
    minLevel: 21,
    maxLevel: 40,
    description: 'Developing competency - intermediate skills unlocked',
    color: 'green'
  },
  [SkillTier.JOURNEYMAN]: {
    name: 'Journeyman',
    minLevel: 41,
    maxLevel: 60,
    description: 'Skilled practitioner - advanced abilities available',
    color: 'blue'
  },
  [SkillTier.EXPERT]: {
    name: 'Expert',
    minLevel: 61,
    maxLevel: 80,
    description: 'Highly skilled - expert-level content unlocked',
    color: 'purple'
  },
  [SkillTier.MASTER]: {
    name: 'Master',
    minLevel: 81,
    maxLevel: 99,
    description: 'True mastery achieved - legendary abilities unlocked',
    color: 'gold'
  }
};

/**
 * Content unlock definitions per skill category
 */
export interface SkillUnlock {
  level: number;
  tier: SkillTier;
  name: string;
  description: string;
  type: 'action' | 'ability' | 'bonus' | 'recipe';
}

export const SKILL_UNLOCKS: Record<SkillCategory, SkillUnlock[]> = {
  [SkillCategory.COMBAT]: [
    { level: 1, tier: SkillTier.NOVICE, name: 'Basic Combat', description: 'Access to basic combat actions', type: 'action' },
    { level: 10, tier: SkillTier.NOVICE, name: 'Advanced Strikes', description: 'Unlock advanced combat moves', type: 'action' },
    { level: 15, tier: SkillTier.APPRENTICE, name: 'Combat Stance', description: '+5% damage in combat', type: 'bonus' },
    { level: 25, tier: SkillTier.APPRENTICE, name: 'PvP Dueling', description: 'Challenge other players to duels', type: 'ability' },
    { level: 30, tier: SkillTier.JOURNEYMAN, name: 'Veteran Fighter', description: '+10% damage in combat', type: 'bonus' },
    { level: 40, tier: SkillTier.JOURNEYMAN, name: 'Gang War Leader', description: 'Lead gang war attacks', type: 'ability' },
    { level: 45, tier: SkillTier.EXPERT, name: 'Deadly Force', description: '+15% damage in combat', type: 'bonus' },
    { level: 50, tier: SkillTier.MASTER, name: 'Legendary Gunslinger', description: 'Master combat abilities and titles', type: 'ability' }
  ],
  [SkillCategory.CUNNING]: [
    { level: 1, tier: SkillTier.NOVICE, name: 'Petty Theft', description: 'Access to basic crime actions', type: 'action' },
    { level: 5, tier: SkillTier.NOVICE, name: 'Read Confidence', description: 'Sense opponent nervousness in duels', type: 'ability' },
    { level: 10, tier: SkillTier.NOVICE, name: 'Intermediate Crimes', description: 'Unlock burglary and mugging', type: 'action' },
    { level: 15, tier: SkillTier.APPRENTICE, name: 'Quick Fingers', description: '+5% crime success rate', type: 'bonus' },
    { level: 20, tier: SkillTier.APPRENTICE, name: 'Hand Range Sense', description: 'Estimate opponent hand strength in duels', type: 'ability' },
    { level: 25, tier: SkillTier.APPRENTICE, name: 'Heist Planning', description: 'Participate in heists', type: 'ability' },
    { level: 30, tier: SkillTier.JOURNEYMAN, name: 'Shadow Walker', description: '+10% crime success rate', type: 'bonus' },
    { level: 35, tier: SkillTier.JOURNEYMAN, name: 'Read Opponent', description: 'Active ability to reveal opponent cards', type: 'ability' },
    { level: 40, tier: SkillTier.JOURNEYMAN, name: 'Bank Robbery', description: 'Rob banks for massive rewards', type: 'action' },
    { level: 45, tier: SkillTier.EXPERT, name: 'Partial Reveal', description: 'Passively glimpse one opponent card', type: 'ability' },
    { level: 48, tier: SkillTier.EXPERT, name: 'Ghost', description: '+15% crime success, -20% witness chance', type: 'bonus' },
    { level: 50, tier: SkillTier.MASTER, name: 'Master Thief', description: 'Legendary crime abilities and duel insight', type: 'ability' }
  ],
  [SkillCategory.SPIRIT]: [
    { level: 1, tier: SkillTier.NOVICE, name: 'Basic Diplomacy', description: 'Access to basic social actions', type: 'action' },
    { level: 10, tier: SkillTier.NOVICE, name: 'Intermediate Social', description: 'Unlock advanced social actions', type: 'action' },
    { level: 15, tier: SkillTier.APPRENTICE, name: 'Smooth Talker', description: '+5% social action rewards', type: 'bonus' },
    { level: 25, tier: SkillTier.APPRENTICE, name: 'Gang Recruiter', description: 'Bonus when recruiting gang members', type: 'ability' },
    { level: 30, tier: SkillTier.JOURNEYMAN, name: 'Silver Tongue', description: '+10% social action rewards', type: 'bonus' },
    { level: 40, tier: SkillTier.JOURNEYMAN, name: 'Diplomatic Immunity', description: 'Reduced jail time from crimes', type: 'ability' },
    { level: 45, tier: SkillTier.EXPERT, name: 'Inspiring Leader', description: '+15% gang morale bonus', type: 'bonus' },
    { level: 50, tier: SkillTier.MASTER, name: 'Legendary Orator', description: 'Master social abilities', type: 'ability' }
  ],
  [SkillCategory.CRAFT]: [
    { level: 1, tier: SkillTier.NOVICE, name: 'Basic Crafting', description: 'Craft basic items', type: 'recipe' },
    { level: 10, tier: SkillTier.NOVICE, name: 'Intermediate Recipes', description: 'Unlock intermediate crafting', type: 'recipe' },
    { level: 15, tier: SkillTier.APPRENTICE, name: 'Efficient Crafter', description: '-5% material cost', type: 'bonus' },
    { level: 25, tier: SkillTier.APPRENTICE, name: 'Weapon Crafting', description: 'Craft weapons and armor', type: 'recipe' },
    { level: 30, tier: SkillTier.JOURNEYMAN, name: 'Master Efficiency', description: '-10% material cost', type: 'bonus' },
    { level: 40, tier: SkillTier.JOURNEYMAN, name: 'Rare Crafting', description: 'Craft rare quality items', type: 'recipe' },
    { level: 45, tier: SkillTier.EXPERT, name: 'Expert Craftsman', description: '+15% item quality', type: 'bonus' },
    { level: 50, tier: SkillTier.MASTER, name: 'Legendary Forger', description: 'Craft legendary items', type: 'recipe' }
  ]
};

/**
 * Skill Unlock Bonus multipliers
 * BALANCE FIX (Phase 4.1): Converted from additive to multiplicative bonuses
 *
 * Old (additive): base + 5% + 10% + 15% = base × 1.30 (linear stacking)
 * New (multiplicative): base × 1.05 × 1.10 × 1.15 = base × 1.328 (compound stacking)
 *
 * This makes each unlock feel progressively more powerful
 */
export const SKILL_BONUS_MULTIPLIERS = {
  /**
   * Combat category bonuses (applied to damage)
   * Levels 15, 30, 45 unlock progressively stronger multipliers
   */
  COMBAT: {
    TIER_1: { level: 15, multiplier: 1.05, name: 'Combat Stance' },
    TIER_2: { level: 30, multiplier: 1.10, name: 'Veteran Fighter' },
    TIER_3: { level: 45, multiplier: 1.15, name: 'Deadly Force' }
  },

  /**
   * Cunning category bonuses (applied to crime success, stealth)
   * Levels 15, 30, 48 unlock progressively stronger multipliers
   */
  CUNNING: {
    TIER_1: { level: 15, multiplier: 1.05, name: 'Quick Fingers' },
    TIER_2: { level: 30, multiplier: 1.10, name: 'Shadow Walker' },
    TIER_3: { level: 48, multiplier: 1.15, name: 'Ghost' }
  },

  /**
   * Spirit category bonuses (applied to social rewards, persuasion)
   * Levels 15, 30, 45 unlock progressively stronger multipliers
   */
  SPIRIT: {
    TIER_1: { level: 15, multiplier: 1.05, name: 'Smooth Talker' },
    TIER_2: { level: 30, multiplier: 1.10, name: 'Silver Tongue' },
    TIER_3: { level: 45, multiplier: 1.15, name: 'Inspiring Leader' }
  },

  /**
   * Craft category bonuses (applied to material costs reduction, quality)
   * Levels 15, 30, 45 unlock progressively stronger multipliers
   * Note: For costs, use 1/multiplier (e.g., 1/1.05 = 0.95 = 5% reduction)
   */
  CRAFT: {
    TIER_1: { level: 15, multiplier: 1.05, name: 'Efficient Crafter' },
    TIER_2: { level: 30, multiplier: 1.10, name: 'Master Efficiency' },
    TIER_3: { level: 45, multiplier: 1.15, name: 'Expert Craftsman' }
  }
} as const;

/**
 * Calculate total multiplicative bonus for a skill category
 * Returns the compound multiplier based on character's highest skill level in the category
 *
 * Example for Combat at level 35:
 * - Has Combat Stance (level 15): ×1.05
 * - Has Veteran Fighter (level 30): ×1.10
 * - Missing Deadly Force (level 45): n/a
 * - Total: 1.05 × 1.10 = 1.155 (15.5% bonus)
 *
 * @param categoryLevel - Highest skill level in the category
 * @param category - The skill category (COMBAT, CUNNING, SPIRIT, CRAFT)
 * @returns Compound multiplier (1.0 = no bonus)
 */
export function calculateCategoryMultiplier(
  categoryLevel: number,
  category: 'COMBAT' | 'CUNNING' | 'SPIRIT' | 'CRAFT'
): number {
  const bonuses = SKILL_BONUS_MULTIPLIERS[category];
  let multiplier = 1.0;

  if (categoryLevel >= bonuses.TIER_1.level) {
    multiplier *= bonuses.TIER_1.multiplier;
  }
  if (categoryLevel >= bonuses.TIER_2.level) {
    multiplier *= bonuses.TIER_2.multiplier;
  }
  if (categoryLevel >= bonuses.TIER_3.level) {
    multiplier *= bonuses.TIER_3.multiplier;
  }

  return multiplier;
}

/**
 * Get descriptive breakdown of unlocked bonuses
 * Useful for UI tooltips
 */
export function getUnlockedBonusBreakdown(
  categoryLevel: number,
  category: 'COMBAT' | 'CUNNING' | 'SPIRIT' | 'CRAFT'
): Array<{ name: string; level: number; multiplier: number; unlocked: boolean }> {
  const bonuses = SKILL_BONUS_MULTIPLIERS[category];

  return [
    {
      name: bonuses.TIER_1.name,
      level: bonuses.TIER_1.level,
      multiplier: bonuses.TIER_1.multiplier,
      unlocked: categoryLevel >= bonuses.TIER_1.level
    },
    {
      name: bonuses.TIER_2.name,
      level: bonuses.TIER_2.level,
      multiplier: bonuses.TIER_2.multiplier,
      unlocked: categoryLevel >= bonuses.TIER_2.level
    },
    {
      name: bonuses.TIER_3.name,
      level: bonuses.TIER_3.level,
      multiplier: bonuses.TIER_3.multiplier,
      unlocked: categoryLevel >= bonuses.TIER_3.level
    }
  ];
}

/**
 * Skill progression constants
 *
 * LEVELING SYSTEM REFACTOR - RuneScape/Therian Saga Style
 *
 * New formula: 50 + 25 * level^2 + 10 * 1.1^level
 * - Level 10:  ~14,225 total XP (~14 hours)
 * - Level 50:  ~862,500 total XP (~863 hours / 10 months)
 * - Level 99:  ~13M total XP (~13,000 hours / decade)
 *
 * Design Philosophy:
 * - 30 skills × 99 levels = Total Level 2,970 max
 * - First prestige ~1 year (Total Level 1000)
 * - Decade-long max completion journey
 * - Sandbox freedom - train any skill you want
 */
export const SKILL_PROGRESSION = {
  /** Starting level for all skills */
  STARTING_LEVEL: 1,
  /** Maximum level for all skills (RuneScape style) */
  MAX_LEVEL: 99,
  /** Number of trainable skills (26 total after consolidation) */
  SKILL_COUNT: 26,
  /** XP formula coefficients */
  XP_BASE: 50,
  XP_QUADRATIC_COEFFICIENT: 25,
  XP_EXPONENTIAL_BASE: 1.1,
  XP_EXPONENTIAL_COEFFICIENT: 10,
  /**
   * Training time scaling coefficient for sqrt curve
   * Formula: baseTime * (1 + sqrt(level) * TRAINING_TIME_SCALE)
   * L1: 1.15x, L50: 2.06x, L99: 2.64x (gentle curve)
   */
  TRAINING_TIME_SCALE: 0.15,
  /** Only one skill can be trained at a time */
  MAX_CONCURRENT_TRAINING: 1,
  /** Base XP gained per hour of training */
  BASE_XP_PER_HOUR: 1000,
  /** Approximate hours to max one skill to 99 */
  ESTIMATED_HOURS_TO_MAX: 8700,
  /** Hours to reach level 50 in one skill */
  ESTIMATED_HOURS_TO_50: 863
} as const;

/**
 * Calculate XP needed FOR a specific level (not cumulative)
 * Formula: 50 + 25 * level^2 + 10 * 1.1^level
 *
 * LEVELING SYSTEM REFACTOR - Targets 1-2 years to first prestige
 *
 * XP requirements per level:
 * Level 10:  ~2,600 XP
 * Level 20:  ~10,450 XP
 * Level 50:  ~66,350 XP
 * Level 70:  ~127,350 XP
 * Level 99:  ~294,350 XP
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(
    SKILL_PROGRESSION.XP_BASE +
    SKILL_PROGRESSION.XP_QUADRATIC_COEFFICIENT * Math.pow(level, 2) +
    SKILL_PROGRESSION.XP_EXPONENTIAL_COEFFICIENT * Math.pow(SKILL_PROGRESSION.XP_EXPONENTIAL_BASE, level)
  );
}

/**
 * Calculate total XP needed to reach a level from level 1
 *
 * Cumulative XP totals:
 * Level 10:  ~14,225 XP (~14 hours)
 * Level 20:  ~73,400 XP (~73 hours / 1 month)
 * Level 50:  ~862,500 XP (~863 hours / 10 months)
 * Level 70:  ~2,490,000 XP (~2,490 hours / 2 years)
 * Level 99:  ~13,034,431 XP (~13,034 hours / 10+ years)
 */
export function calculateTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += calculateXPForLevel(i);
  }
  return total;
}

/**
 * Get the tier for a given skill level
 */
export function getTierForLevel(level: number): SkillTier {
  if (level >= 81) return SkillTier.MASTER;
  if (level >= 61) return SkillTier.EXPERT;
  if (level >= 41) return SkillTier.JOURNEYMAN;
  if (level >= 21) return SkillTier.APPRENTICE;
  return SkillTier.NOVICE;
}

/**
 * Get tier definition for a given level
 */
export function getTierDefinition(level: number): TierDefinition {
  return SKILL_TIERS[getTierForLevel(level)];
}

/**
 * Get all unlocks for a skill category at or below a given level
 */
export function getUnlocksForLevel(category: SkillCategory, level: number): SkillUnlock[] {
  return SKILL_UNLOCKS[category].filter(unlock => unlock.level <= level);
}

/**
 * Get the next unlock for a skill category above a given level
 */
export function getNextUnlock(category: SkillCategory, level: number): SkillUnlock | undefined {
  return SKILL_UNLOCKS[category].find(unlock => unlock.level > level);
}

/**
 * Calculate estimated hours to reach a level
 */
export function calculateHoursToLevel(targetLevel: number): number {
  const totalXP = calculateTotalXPForLevel(targetLevel);
  return Math.ceil(totalXP / SKILL_PROGRESSION.BASE_XP_PER_HOUR);
}

/**
 * Calculate training time for a skill at a given level
 *
 * PHASE 19 BALANCE: Changed from linear to sqrt scaling
 * Old formula: baseTime * (1 + level * 0.1) = 6x at L50
 * New formula: baseTime * (1 + sqrt(level) * 0.15) = ~2x at L50
 *
 * This creates a gentler progression curve:
 * L1:  1.15x base time
 * L10: 1.47x base time
 * L25: 1.75x base time
 * L40: 1.95x base time
 * L50: 2.06x base time
 */
export function calculateTrainingTime(skillId: string, currentLevel: number): number {
  const skill = SKILLS[skillId.toUpperCase()];
  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }

  return Math.floor(
    skill.baseTrainingTime * (1 + Math.sqrt(currentLevel) * SKILL_PROGRESSION.TRAINING_TIME_SCALE)
  );
}

/**
 * Get all skills for a specific category
 */
export function getSkillsByCategory(category: SkillCategory): SkillDefinition[] {
  return Object.values(SKILLS).filter(skill => skill.category === category);
}

/**
 * Get all skills for a specific suit
 */
export function getSkillsBySuit(suit: DestinySuit): SkillDefinition[] {
  return Object.values(SKILLS).filter(skill => skill.suit === suit);
}

/**
 * Get skill definition by ID
 */
export function getSkillById(skillId: string): SkillDefinition | undefined {
  return SKILLS[skillId.toUpperCase()];
}

// ============================================
// TOTAL LEVEL SYSTEM
// Replaces character level - sum of all skill levels
// ============================================

/**
 * Total Level milestone interface
 */
export interface TotalLevelMilestone {
  /** Total level required */
  totalLevel: number;
  /** Milestone tier name */
  tier: string;
  /** Description of what unlocks */
  unlocks: string[];
  /** Display color */
  color: string;
}

/**
 * Total Level milestones - replaces old character level system
 * 26 skills at level 1 = Total Level 26 (starting)
 * 26 skills at level 99 = Total Level 2,574 (max)
 */
export const TOTAL_LEVEL_MILESTONES: TotalLevelMilestone[] = [
  {
    totalLevel: 26,
    tier: 'Greenhorn',
    unlocks: ['Starting point'],
    color: 'gray'
  },
  {
    totalLevel: 100,
    tier: 'Tenderfoot',
    unlocks: ['Gang creation', 'Basic properties', 'Expanded travel'],
    color: 'green'
  },
  {
    totalLevel: 250,
    tier: 'Frontier Hand',
    unlocks: ['Train robberies', 'Advanced crafting', 'Property upgrades'],
    color: 'blue'
  },
  {
    totalLevel: 500,
    tier: 'Trailblazer',
    unlocks: ['Bank heists', 'Elite equipment', 'Advanced gang features'],
    color: 'purple'
  },
  {
    totalLevel: 750,
    tier: 'Veteran',
    unlocks: ['Legendary quests', 'Rare companions', 'Hidden locations'],
    color: 'orange'
  },
  {
    totalLevel: 1000,
    tier: 'Legend',
    unlocks: ['PRESTIGE UNLOCKS', 'Legendary titles', 'Elite content'],
    color: 'gold'
  },
  {
    totalLevel: 1500,
    tier: 'Living Legend',
    unlocks: ['Hidden locations', 'Secret NPCs', 'Mythic gear'],
    color: 'cyan'
  },
  {
    totalLevel: 2000,
    tier: 'Mythic',
    unlocks: ['Supernatural content', 'Mythic abilities', 'End-game raids'],
    color: 'magenta'
  },
  {
    totalLevel: 2400,
    tier: 'Immortal',
    unlocks: ['Final boss content', 'Immortal gear', 'Ultimate challenges'],
    color: 'red'
  },
  {
    totalLevel: 2574,
    tier: 'God of the West',
    unlocks: ['Hall of Fame', 'Ultimate title', 'Complete mastery'],
    color: 'rainbow'
  }
];

/**
 * Calculate Total Level from skill levels array
 * @param skills - Array of { level: number } objects
 * @returns Total level (sum of all skill levels)
 */
export function calculateTotalLevel(skills: Array<{ level: number }>): number {
  if (!skills || skills.length === 0) {
    return SKILL_PROGRESSION.SKILL_COUNT; // 26 skills at level 1
  }
  return skills.reduce((sum, skill) => sum + (skill.level || 1), 0);
}

/**
 * Get the Total Level milestone tier for a given total level
 */
export function getTotalLevelMilestone(totalLevel: number): TotalLevelMilestone {
  // Find highest milestone at or below current total level
  for (let i = TOTAL_LEVEL_MILESTONES.length - 1; i >= 0; i--) {
    if (totalLevel >= TOTAL_LEVEL_MILESTONES[i].totalLevel) {
      return TOTAL_LEVEL_MILESTONES[i];
    }
  }
  return TOTAL_LEVEL_MILESTONES[0];
}

/**
 * Get the next Total Level milestone
 */
export function getNextTotalLevelMilestone(totalLevel: number): TotalLevelMilestone | null {
  for (const milestone of TOTAL_LEVEL_MILESTONES) {
    if (milestone.totalLevel > totalLevel) {
      return milestone;
    }
  }
  return null; // Already at max
}

// ============================================
// COMBAT LEVEL SYSTEM
// Derived from total combat XP earned (1-138 scale)
// ============================================

/**
 * Combat Level configuration
 */
export const COMBAT_LEVEL = {
  /** Minimum combat level */
  MIN_LEVEL: 1,
  /** Maximum combat level (RuneScape style) */
  MAX_LEVEL: 138,
  /** XP scaling factors */
  LOG_SCALE: 15,
  SQRT_SCALE: 1000,
  XP_OFFSET: 100
} as const;

/**
 * Combat Level milestone interface
 */
export interface CombatLevelMilestone {
  /** Combat level required */
  level: number;
  /** Title earned */
  title: string;
  /** What unlocks at this level */
  unlocks: string[];
}

/**
 * Combat Level milestones
 */
export const COMBAT_LEVEL_MILESTONES: CombatLevelMilestone[] = [
  { level: 10, title: 'Scrapper', unlocks: ['Basic dueling'] },
  { level: 25, title: 'Brawler', unlocks: ['Gang war participation'] },
  { level: 50, title: 'Gunslinger', unlocks: ['Ranked duels', 'Bounty hunting license'] },
  { level: 75, title: 'Desperado', unlocks: ['Prestige requirement met', 'Elite bounties'] },
  { level: 100, title: 'Legendary', unlocks: ['Challenge legendary NPCs', 'Elite gang positions'] },
  { level: 126, title: 'Death Dealer', unlocks: ['Elite PvP tournaments', 'Legendary duels'] },
  { level: 138, title: 'God of Death', unlocks: ['Ultimate combat title', 'Hall of Fame'] }
];

/**
 * Calculate Combat Level from total combat XP
 *
 * Formula: 15 * log10(xp/100 + 1) + sqrt(xp/1000)
 * - Logarithmic base provides early progression
 * - Square root provides long-term scaling
 *
 * XP requirements:
 * - Level 10: ~5,000 XP
 * - Level 50: ~250,000 XP
 * - Level 100: ~2,500,000 XP
 * - Level 138: ~10,000,000 XP
 */
export function calculateCombatLevel(combatXp: number): number {
  if (combatXp <= 0) return COMBAT_LEVEL.MIN_LEVEL;

  const level = Math.floor(
    COMBAT_LEVEL.LOG_SCALE * Math.log10(combatXp / COMBAT_LEVEL.XP_OFFSET + 1) +
    Math.sqrt(combatXp / COMBAT_LEVEL.SQRT_SCALE)
  );

  return Math.min(Math.max(level, COMBAT_LEVEL.MIN_LEVEL), COMBAT_LEVEL.MAX_LEVEL);
}

/**
 * Calculate XP needed for a specific combat level (inverse of calculateCombatLevel)
 * Used for progress bars and goal tracking
 */
export function xpForCombatLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  if (targetLevel >= COMBAT_LEVEL.MAX_LEVEL) targetLevel = COMBAT_LEVEL.MAX_LEVEL;

  // Numerical approximation - find XP where calculateCombatLevel returns target
  let low = 0;
  let high = 50000000; // 50M XP max search

  while (high - low > 100) {
    const mid = Math.floor((low + high) / 2);
    const level = calculateCombatLevel(mid);
    if (level < targetLevel) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

/**
 * Get Combat Level milestone for a given combat level
 */
export function getCombatLevelMilestone(combatLevel: number): CombatLevelMilestone | null {
  for (let i = COMBAT_LEVEL_MILESTONES.length - 1; i >= 0; i--) {
    if (combatLevel >= COMBAT_LEVEL_MILESTONES[i].level) {
      return COMBAT_LEVEL_MILESTONES[i];
    }
  }
  return null;
}

/**
 * Get next Combat Level milestone
 */
export function getNextCombatLevelMilestone(combatLevel: number): CombatLevelMilestone | null {
  for (const milestone of COMBAT_LEVEL_MILESTONES) {
    if (milestone.level > combatLevel) {
      return milestone;
    }
  }
  return null;
}

// ============================================
// PRESTIGE SYSTEM
// Unlock at Total Level 1000, Combat Level 75
// ============================================

/**
 * Prestige requirements
 */
export const PRESTIGE_REQUIREMENTS = {
  /** Minimum Total Level to prestige */
  MIN_TOTAL_LEVEL: 1000,
  /** Minimum Combat Level to prestige */
  MIN_COMBAT_LEVEL: 75,
  /** Minimum number of skills at level 50+ */
  MIN_SKILLS_AT_50: 5,
  /** Maximum prestige rank */
  MAX_PRESTIGE: 10
} as const;

/**
 * Prestige tier bonuses
 */
export interface PrestigeTier {
  rank: number;
  title: string;
  xpMultiplier: number;
  goldMultiplier: number;
  special: string;
}

export const PRESTIGE_TIERS: PrestigeTier[] = [
  { rank: 1, title: 'The Reborn', xpMultiplier: 1.05, goldMultiplier: 1.03, special: 'Gold cosmetics' },
  { rank: 2, title: 'Twice-Lived', xpMultiplier: 1.10, goldMultiplier: 1.06, special: 'Silver horse' },
  { rank: 3, title: 'Thrice-Blessed', xpMultiplier: 1.15, goldMultiplier: 1.09, special: 'Special mount' },
  { rank: 5, title: 'The Phoenix', xpMultiplier: 1.25, goldMultiplier: 1.15, special: 'Legendary weapon' },
  { rank: 10, title: 'Eternal', xpMultiplier: 1.50, goldMultiplier: 1.30, special: 'Hall of Fame' }
];

/**
 * Check if character can prestige
 */
export function canPrestige(
  totalLevel: number,
  combatLevel: number,
  skillsAt50Plus: number,
  currentPrestige: number
): { canPrestige: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (currentPrestige >= PRESTIGE_REQUIREMENTS.MAX_PRESTIGE) {
    reasons.push('Already at maximum prestige');
  }
  if (totalLevel < PRESTIGE_REQUIREMENTS.MIN_TOTAL_LEVEL) {
    reasons.push(`Total Level must be ${PRESTIGE_REQUIREMENTS.MIN_TOTAL_LEVEL}+ (currently ${totalLevel})`);
  }
  if (combatLevel < PRESTIGE_REQUIREMENTS.MIN_COMBAT_LEVEL) {
    reasons.push(`Combat Level must be ${PRESTIGE_REQUIREMENTS.MIN_COMBAT_LEVEL}+ (currently ${combatLevel})`);
  }
  if (skillsAt50Plus < PRESTIGE_REQUIREMENTS.MIN_SKILLS_AT_50) {
    reasons.push(`Need ${PRESTIGE_REQUIREMENTS.MIN_SKILLS_AT_50} skills at level 50+ (currently ${skillsAt50Plus})`);
  }

  return {
    canPrestige: reasons.length === 0,
    reasons
  };
}

/**
 * Get prestige tier for a given prestige rank
 */
export function getPrestigeTier(prestigeRank: number): PrestigeTier | null {
  // Find highest tier at or below current rank
  for (let i = PRESTIGE_TIERS.length - 1; i >= 0; i--) {
    if (prestigeRank >= PRESTIGE_TIERS[i].rank) {
      return PRESTIGE_TIERS[i];
    }
  }
  return null;
}
