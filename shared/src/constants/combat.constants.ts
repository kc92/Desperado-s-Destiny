/**
 * Combat Configuration Constants
 * Centralized configuration for combat balance and mechanics
 */

// =============================================================================
// COMBAT RULES
// =============================================================================

export const COMBAT_CONFIG = {
  // Round limits
  MAX_COMBAT_ROUNDS: 50,
  TURN_TIMEOUT_SECONDS: 30,

  // HP calculation
  BASE_HP: 100,
  HP_PER_LEVEL: 5,
  HP_PER_COMBAT_SKILL: 2,
  PREMIUM_HP_BONUS_PERCENT: 20, // +20% HP for premium users

  // Damage calculation
  BASE_DAMAGE: {
    HIGH_CARD: 5,
    PAIR: 10,
    TWO_PAIR: 15,
    THREE_OF_A_KIND: 20,
    STRAIGHT: 25,
    FLUSH: 30,
    FULL_HOUSE: 35,
    FOUR_OF_A_KIND: 40,
    STRAIGHT_FLUSH: 50,
    ROYAL_FLUSH: 60,
  },
  DAMAGE_VARIANCE_PERCENT: 15, // ±15% random variance (increased for more dynamic combat)
  SKILL_DAMAGE_PER_LEVEL: 1, // +1 damage per combat skill level

  // NPC redraw mechanic
  NPC_REDRAW: {
    ENABLED: true,
    MAX_CHANCE: 0.35, // Reduced from 0.50 for better player agency
    SCALE_PER_DIFFICULTY: 0.05, // 5% chance per difficulty level
    SHOW_TO_PLAYER: true, // Show "NPC reconsidered their hand!" message
  },

  // Boss mechanics
  BOSS_FIRST_KILL_GUARANTEE_LEGENDARY: true,
  BOSS_COOLDOWN_HOURS: 24,
  BOSS_HEALTH_MULTIPLIER: 3.0, // Bosses have 3x normal NPC health

  // Death penalty
  DEATH_PENALTY_GOLD_PERCENT: 10, // Lose 10% of gold on death
  DEATH_RESPAWN_LOCATION: 'dusthaven', // Default respawn location

  // Energy costs
  COMBAT_START_ENERGY_COST: 10,
  FLEE_ENERGY_COST: 5,

  // Flee mechanics
  MAX_FLEE_ROUNDS: 3, // Can only flee in first 3 rounds
  FLEE_SUCCESS_BASE_CHANCE: 0.70, // 70% base flee chance
  FLEE_CHANCE_PER_ROUND: -0.10, // -10% per round (harder to flee later)
} as const;

// =============================================================================
// HAND RANK DISPLAY NAMES
// =============================================================================

export const HAND_RANK_NAMES = {
  HIGH_CARD: 'High Card',
  PAIR: 'Pair',
  TWO_PAIR: 'Two Pair',
  THREE_OF_A_KIND: 'Three of a Kind',
  STRAIGHT: 'Straight',
  FLUSH: 'Flush',
  FULL_HOUSE: 'Full House',
  FOUR_OF_A_KIND: 'Four of a Kind',
  STRAIGHT_FLUSH: 'Straight Flush',
  ROYAL_FLUSH: 'Royal Flush',
} as const;

// =============================================================================
// COMBAT MESSAGES
// =============================================================================

export const COMBAT_MESSAGES = {
  NPC_REDRAW: 'The enemy reconsidered their hand...',
  NPC_REDRAW_BETTER: 'The enemy found a better hand!',
  NPC_REDRAW_WORSE: 'The enemy kept their original hand.',

  FLEE_SUCCESS: 'You successfully fled from combat!',
  FLEE_FAILURE: 'You failed to escape!',
  FLEE_TOO_LATE: 'It\'s too late to flee now!',

  VICTORY: 'Victory! You defeated the enemy!',
  DEFEAT: 'Defeat! You were defeated in combat.',

  MAX_ROUNDS_REACHED: 'Combat timed out after ${rounds} rounds. Winner determined by remaining HP.',

  BOSS_FIRST_KILL: 'First kill bonus: Guaranteed legendary drop!',
  BOSS_COOLDOWN: 'You must wait ${hours} hours before challenging this boss again.',
} as const;

// =============================================================================
// DIFFICULTY SCALING
// =============================================================================

export const NPC_DIFFICULTY_SCALING = {
  TRIVIAL: {
    level: 1,
    difficultyMod: 0,
    reDrawChance: 0.05, // 5%
    hpMultiplier: 0.8,
  },
  EASY: {
    level: 5,
    difficultyMod: 1,
    reDrawChance: 0.10, // 10%
    hpMultiplier: 1.0,
  },
  NORMAL: {
    level: 10,
    difficultyMod: 2,
    reDrawChance: 0.20, // 20%
    hpMultiplier: 1.2,
  },
  HARD: {
    level: 15,
    difficultyMod: 3,
    reDrawChance: 0.30, // 30%
    hpMultiplier: 1.5,
  },
  EXPERT: {
    level: 20,
    difficultyMod: 4,
    reDrawChance: 0.40, // 40%
    hpMultiplier: 2.0,
  },
  ELITE: {
    level: 25,
    difficultyMod: 5,
    reDrawChance: 0.50, // 50% (MAX)
    hpMultiplier: 2.5,
  },
  BOSS: {
    level: 30,
    difficultyMod: 6,
    reDrawChance: 0.50, // 50% (MAX)
    hpMultiplier: 3.0,
  },
} as const;

// =============================================================================
// LOOT SCALING
// =============================================================================

export const LOOT_SCALING = {
  GOLD_BASE: 10,
  GOLD_PER_LEVEL: 5,
  GOLD_PER_DIFFICULTY: 10,
  GOLD_VARIANCE_PERCENT: 20, // ±20% random variance

  XP_BASE: 20,
  XP_PER_LEVEL: 10,
  XP_PER_DIFFICULTY: 15,

  BOSS_GOLD_MULTIPLIER: 3.0,
  BOSS_XP_MULTIPLIER: 5.0,
} as const;

// =============================================================================
// EXPORT ALL
// =============================================================================

export default COMBAT_CONFIG;
