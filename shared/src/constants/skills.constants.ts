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
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR, // 1 hour
    icon: '🗡️'
  },
  RANGED_COMBAT: {
    id: 'ranged_combat',
    name: 'Ranged Combat',
    description: 'Accuracy with rifles, pistols, and bows',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🔫'
  },
  DEFENSIVE_TACTICS: {
    id: 'defensive_tactics',
    name: 'Defensive Tactics',
    description: 'Blocking, dodging, and defensive maneuvers',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🛡️'
  },
  MOUNTED_COMBAT: {
    id: 'mounted_combat',
    name: 'Mounted Combat',
    description: 'Fighting on horseback',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '🏇'
  },
  EXPLOSIVES: {
    id: 'explosives',
    name: 'Explosives',
    description: 'Using and defusing dynamite and explosives',
    suit: DestinySuit.CLUBS,
    category: SkillCategory.COMBAT,
    maxLevel: 50,
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
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🔓'
  },
  STEALTH: {
    id: 'stealth',
    name: 'Stealth',
    description: 'Moving unseen and unheard',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '👤'
  },
  PICKPOCKET: {
    id: 'pickpocket',
    name: 'Pickpocket',
    description: 'Stealing from others without detection',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '💰'
  },
  TRACKING: {
    id: 'tracking',
    name: 'Tracking',
    description: 'Following trails and finding hidden things',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '👣'
  },
  DECEPTION: {
    id: 'deception',
    name: 'Deception',
    description: 'Lying, disguises, and trickery',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🎭'
  },
  GAMBLING: {
    id: 'gambling',
    name: 'Gambling',
    description: 'Card games, dice, and games of chance',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🎲'
  },
  PERCEPTION: {
    id: 'perception',
    name: 'Perception',
    description: 'Reading opponents and detecting tells in duels',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '👁️'
  },
  SLEIGHT_OF_HAND: {
    id: 'sleight_of_hand',
    name: 'Sleight of Hand',
    description: 'Card manipulation and subtle cheating techniques',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '🃏'
  },
  POKER_FACE: {
    id: 'poker_face',
    name: 'Poker Face',
    description: 'Hiding tells and blocking opponent reads',
    suit: DestinySuit.SPADES,
    category: SkillCategory.CUNNING,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '😐'
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
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '💊'
  },
  PERSUASION: {
    id: 'persuasion',
    name: 'Persuasion',
    description: 'Convincing others through words',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '💬'
  },
  ANIMAL_HANDLING: {
    id: 'animal_handling',
    name: 'Animal Handling',
    description: 'Training and calming animals',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🐴'
  },
  LEADERSHIP: {
    id: 'leadership',
    name: 'Leadership',
    description: 'Inspiring and commanding others',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '⭐'
  },
  RITUAL_KNOWLEDGE: {
    id: 'ritual_knowledge',
    name: 'Ritual Knowledge',
    description: 'Understanding supernatural rituals and traditions',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🔮'
  },
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance',
    description: 'Music, storytelling, and entertainment',
    suit: DestinySuit.HEARTS,
    category: SkillCategory.SPIRIT,
    maxLevel: 50,
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
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '⚒️'
  },
  LEATHERWORKING: {
    id: 'leatherworking',
    name: 'Leatherworking',
    description: 'Crafting leather goods and armor',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🧳'
  },
  COOKING: {
    id: 'cooking',
    name: 'Cooking',
    description: 'Preparing food and tonics',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🍖'
  },
  ALCHEMY: {
    id: 'alchemy',
    name: 'Alchemy',
    description: 'Brewing potions and elixirs',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '🧪'
  },
  ENGINEERING: {
    id: 'engineering',
    name: 'Engineering',
    description: 'Building traps, mechanisms, and devices',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 2,
    icon: '⚙️'
  },
  MINING: {
    id: 'mining',
    name: 'Mining',
    description: 'Extracting ore and gems from the earth',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '⛏️'
  },
  HERBALISM: {
    id: 'herbalism',
    name: 'Herbalism',
    description: 'Gathering and identifying plants',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR,
    icon: '🌿'
  },
  CARPENTRY: {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Woodworking and furniture crafting',
    suit: DestinySuit.DIAMONDS,
    category: SkillCategory.CRAFT,
    maxLevel: 50,
    baseTrainingTime: TIME.HOUR * 1.5,
    icon: '🪵'
  }
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
    maxLevel: 10,
    description: 'Just starting out - learning the basics',
    color: 'gray'
  },
  [SkillTier.APPRENTICE]: {
    name: 'Apprentice',
    minLevel: 11,
    maxLevel: 25,
    description: 'Developing competency - intermediate skills unlocked',
    color: 'green'
  },
  [SkillTier.JOURNEYMAN]: {
    name: 'Journeyman',
    minLevel: 26,
    maxLevel: 40,
    description: 'Skilled practitioner - advanced abilities available',
    color: 'blue'
  },
  [SkillTier.EXPERT]: {
    name: 'Expert',
    minLevel: 41,
    maxLevel: 49,
    description: 'Highly skilled - expert-level content unlocked',
    color: 'purple'
  },
  [SkillTier.MASTER]: {
    name: 'Master',
    minLevel: 50,
    maxLevel: 50,
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
 */
export const SKILL_PROGRESSION = {
  /** Starting level for all skills */
  STARTING_LEVEL: 1,
  /** Maximum level for all skills */
  MAX_LEVEL: 50,
  /** XP curve exponent (higher = steeper curve) */
  XP_EXPONENT: 2.5,
  /** XP curve base multiplier */
  XP_BASE_MULTIPLIER: 100,
  /** Training time scaling per level (10% increase per level) */
  TRAINING_TIME_SCALE: 0.1,
  /** Only one skill can be trained at a time */
  MAX_CONCURRENT_TRAINING: 1,
  /** Base XP gained per hour of training */
  BASE_XP_PER_HOUR: 1000,
  /** Approximate hours to max one skill */
  ESTIMATED_HOURS_TO_MAX: 2650
} as const;

/**
 * Calculate XP needed to reach a specific level (exponential curve)
 * Formula: floor(level^2.5 * 100)
 *
 * Level progression (XP to reach each level):
 * Level 1: 100 XP
 * Level 10: 3,162 XP
 * Level 25: 31,250 XP
 * Level 40: 101,193 XP
 * Level 50: 353,553 XP
 *
 * Total XP to max: ~2,650,000 XP (~2,650 hours)
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.floor(
    Math.pow(level, SKILL_PROGRESSION.XP_EXPONENT) * SKILL_PROGRESSION.XP_BASE_MULTIPLIER
  );
}

/**
 * Calculate total XP needed to reach a level from level 1
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
  if (level >= 50) return SkillTier.MASTER;
  if (level >= 41) return SkillTier.EXPERT;
  if (level >= 26) return SkillTier.JOURNEYMAN;
  if (level >= 11) return SkillTier.APPRENTICE;
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
 * Formula: baseTime * (1 + level * TRAINING_TIME_SCALE)
 * Gets 10% longer each level
 */
export function calculateTrainingTime(skillId: string, currentLevel: number): number {
  const skill = SKILLS[skillId.toUpperCase()];
  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }

  return Math.floor(
    skill.baseTrainingTime * (1 + currentLevel * SKILL_PROGRESSION.TRAINING_TIME_SCALE)
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
