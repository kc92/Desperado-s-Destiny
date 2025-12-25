/**
 * Contract Constants
 *
 * Phase 3: Contract Expansion - Balancing constants
 * Tier-based rewards targeting 70% of optimal gold/hour from contracts
 */

import {
  ContractType,
  ContractDifficulty,
  ContractUrgency,
  CharacterTier,
  IStreakBonus,
} from '../types/contract.types';

/**
 * Get character tier for contract rewards based on level
 */
export function getContractTierForLevel(level: number): CharacterTier {
  if (level <= 10) return 'NOVICE';
  if (level <= 20) return 'JOURNEYMAN';
  if (level <= 30) return 'VETERAN';
  if (level <= 40) return 'EXPERT';
  return 'MASTER';
}

/**
 * Contract constants for balancing and configuration
 */
export const CONTRACT_CONSTANTS = {
  // ============================================
  // TIER-BASED REWARDS (70% of target gold/hour)
  // ============================================
  // Target gold/hour: Novice 300, Journeyman 1500, Veteran 8000, Expert 35000, Master 120000
  // 70% target ÷ 3 contracts/hour = base reward per contract

  TIER_BASE_REWARDS: {
    NOVICE: { gold: 70, xp: 35 },       // L1-10: 210/hr ÷ 3
    JOURNEYMAN: { gold: 350, xp: 175 }, // L11-20: 1050/hr ÷ 3
    VETERAN: { gold: 1850, xp: 925 },   // L21-30: 5600/hr ÷ 3
    EXPERT: { gold: 8150, xp: 4075 },   // L31-40: 24500/hr ÷ 3
    MASTER: { gold: 28000, xp: 14000 }, // L41-50: 84000/hr ÷ 3
  } as const,

  // ============================================
  // DIFFICULTY MULTIPLIERS
  // ============================================

  DIFFICULTY_MULTIPLIERS: {
    easy: 0.7,
    medium: 1.0,
    hard: 1.5,
  } as const,

  // ============================================
  // URGENCY SETTINGS
  // ============================================

  URGENCY_MULTIPLIERS: {
    standard: 1.0,
    urgent: 1.5,      // +50% rewards
    critical: 2.0,    // +100% rewards
  } as const,

  URGENCY_DURATIONS_MS: {
    standard: 24 * 60 * 60 * 1000,  // 24 hours
    urgent: 2 * 60 * 60 * 1000,      // 2 hours
    critical: 1 * 60 * 60 * 1000,    // 1 hour
  } as const,

  // ============================================
  // GANG CONTRACT BONUSES
  // ============================================

  GANG_CONTRACT_BONUS: 0.25,       // +25% for gang contracts
  GANG_TERRITORY_BONUS: 0.15,      // +15% in controlled territory

  // ============================================
  // CHAIN CONTRACT SETTINGS
  // ============================================

  CHAIN_MIN_STEPS: 2,
  CHAIN_MAX_STEPS: 5,
  CHAIN_COMPLETION_BONUS: 0.5,     // +50% bonus for completing full chain

  // Step reward distribution (fraction of total)
  CHAIN_STEP_REWARDS: {
    2: [0.4, 0.6],                           // 2-step: 40%, 60%
    3: [0.2, 0.3, 0.5],                      // 3-step: 20%, 30%, 50%
    4: [0.15, 0.20, 0.25, 0.40],             // 4-step: 15%, 20%, 25%, 40%
    5: [0.10, 0.15, 0.20, 0.25, 0.30],       // 5-step: 10%, 15%, 20%, 25%, 30%
  } as const,

  // ============================================
  // BOSS CONTRACT SETTINGS
  // ============================================

  BOSS_CONTRACT_BASE_REWARD: 500,    // Base gold for boss contracts
  BOSS_FIRST_KILL_BONUS: 2.0,        // 2x rewards for first kill
  BOSS_LEVEL_REQUIREMENT: 25,        // Minimum level for boss contracts

  // ============================================
  // COMBAT CONTRACT SETTINGS
  // ============================================

  COMBAT_STREAK_REQUIREMENTS: {
    3: 1.2,   // 3-win streak: 1.2x multiplier
    5: 1.5,   // 5-win streak: 1.5x multiplier
    10: 2.0,  // 10-win streak: 2.0x multiplier
  } as const,

  FLAWLESS_VICTORY_MULTIPLIER: 2.0,  // 2x for no damage taken
  ROYAL_FLUSH_MULTIPLIER: 2.5,        // 2.5x for royal flush win
  QUICK_VICTORY_MULTIPLIER: 1.3,      // 1.3x for 3 rounds or less

  // ============================================
  // CONTRACT GENERATION
  // ============================================

  CONTRACTS_PER_DAY: 6,              // Standard contracts per day
  GANG_CONTRACTS_PER_DAY: 2,         // Additional gang contracts
  URGENT_SPAWN_INTERVAL_MS: 30 * 60 * 1000, // Check every 30 minutes
  URGENT_SPAWN_CHANCE: 0.20,         // 20% chance per check

  // Type weights for random selection (higher = more common)
  CONTRACT_TYPE_WEIGHTS: {
    combat: 25,
    crime: 20,
    social: 15,
    delivery: 15,
    investigation: 15,
    crafting: 10,
    gang: 0,          // Not in random pool (generated separately)
    boss: 0,          // Not in random pool (level-gated)
    urgent: 0,        // Not in random pool (spawned by job)
    chain: 0,         // Not in random pool (special generation)
    bounty: 0,        // Future integration
    territory: 0,     // Gang-specific
  } as const,

  // ============================================
  // EXPERIENCE SCALING
  // ============================================

  XP_TO_GOLD_RATIO: 0.5,             // XP is 50% of gold value

  // ============================================
  // STREAK BONUSES
  // ============================================

  STREAK_BONUSES: [
    { day: 1, gold: 50, xp: 25, description: 'First Day Bonus' },
    { day: 2, gold: 75, xp: 40, description: 'Building Momentum' },
    { day: 3, gold: 100, xp: 60, description: 'Three Day Streak' },
    { day: 4, gold: 150, xp: 80, description: 'Getting Reliable' },
    { day: 5, gold: 200, xp: 100, description: 'Halfway There' },
    { day: 6, gold: 250, xp: 125, description: 'Almost Weekly' },
    { day: 7, gold: 500, xp: 250, item: 'rare_lockpick_set', premiumCurrency: 5, description: 'Weekly Champion' },
    { day: 14, gold: 1000, xp: 500, item: 'golden_revolver', premiumCurrency: 15, description: 'Two Week Warrior' },
    { day: 21, gold: 1500, xp: 750, item: 'silver_sheriff_badge', premiumCurrency: 25, description: 'Three Week Legend' },
    { day: 30, gold: 2500, xp: 1000, item: 'legendary_duster_coat', premiumCurrency: 50, description: 'Monthly Master' },
  ] as IStreakBonus[],

} as const;

/**
 * Get streak bonus for a given day
 */
export function getStreakBonus(day: number): IStreakBonus | null {
  // Check for exact milestone matches first
  const exactMatch = CONTRACT_CONSTANTS.STREAK_BONUSES.find(b => b.day === day);
  if (exactMatch) return exactMatch;

  // For days beyond 30, give scaled bonus
  if (day > 30) {
    const multiplier = Math.floor(day / 30);
    return {
      day,
      gold: 2500 * multiplier,
      xp: 1000 * multiplier,
      premiumCurrency: 50 * multiplier,
      description: `${day} Day Legend`,
    };
  }

  // For days between milestones, return the last milestone's bonus
  const sortedBonuses = [...CONTRACT_CONSTANTS.STREAK_BONUSES].sort((a, b) => b.day - a.day);
  return sortedBonuses.find(b => b.day <= day) || null;
}

/**
 * Calculate contract reward based on tier, difficulty, and urgency
 */
export function calculateContractReward(
  characterLevel: number,
  difficulty: ContractDifficulty,
  urgency: ContractUrgency = 'standard',
  templateMultiplier: number = 1.0
): { gold: number; xp: number } {
  const tier = getContractTierForLevel(characterLevel);
  const baseReward = CONTRACT_CONSTANTS.TIER_BASE_REWARDS[tier];
  const diffMult = CONTRACT_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty];
  const urgencyMult = CONTRACT_CONSTANTS.URGENCY_MULTIPLIERS[urgency];

  return {
    gold: Math.floor(baseReward.gold * diffMult * urgencyMult * templateMultiplier),
    xp: Math.floor(baseReward.xp * diffMult * urgencyMult * templateMultiplier),
  };
}

/**
 * Get contract duration based on urgency
 */
export function getContractDuration(urgency: ContractUrgency): number {
  return CONTRACT_CONSTANTS.URGENCY_DURATIONS_MS[urgency];
}

/**
 * Check if a contract type requires gang membership
 */
export function requiresGangMembership(type: ContractType): boolean {
  return type === 'gang' || type === 'territory';
}

/**
 * Get minimum level for contract type
 */
export function getMinLevelForType(type: ContractType): number {
  switch (type) {
    case 'boss':
      return CONTRACT_CONSTANTS.BOSS_LEVEL_REQUIREMENT;
    case 'chain':
      return 15; // Journeyman tier
    default:
      return 1;
  }
}

/**
 * Phase 19.3: Frontier Justice - Faction Warfare Contracts
 *
 * Dual-path contract system:
 * - PvE: Bounty hunting, escort, delivery, sabotage, intel
 * - PvP: Territory raids, supply interdiction, defense, assassination
 */
export const FACTION_WARFARE_CONTRACTS = {
  // ============================================
  // PvE CONTRACT TYPES
  // ============================================

  PVE_TYPES: {
    BOUNTY: {
      id: 'bounty',
      name: 'Bounty Hunt',
      description: 'Hunt named NPC criminals',
      skills: ['tracking', 'shooting', 'intimidation'],
      baseRewardMultiplier: 1.5,
      moralReputationChange: 8,  // +8 Marshal rep
      minMoralReputation: 20,    // Requires Deputy tier
      tiers: ['minor', 'wanted', 'dangerous', 'legendary'],
    },
    ESCORT: {
      id: 'escort',
      name: 'Escort Mission',
      description: 'Protect travelers through dangerous territory',
      skills: ['riding', 'shooting', 'medicine'],
      baseRewardMultiplier: 1.2,
      moralReputationChange: 5,
      minMoralReputation: 1,     // Respectable
      variants: ['stagecoach', 'wagon_train', 'vip'],
    },
    DELIVERY: {
      id: 'delivery',
      name: 'Delivery Contract',
      description: 'Transport goods across faction lines',
      skills: ['riding', 'stealth', 'trading'],
      baseRewardMultiplier: 1.0,
      moralReputationChange: 0,  // Neutral
      minMoralReputation: null,  // Any
      pvpRiskMultiplier: 1.5,    // +50% reward in PvP zones
    },
    SABOTAGE: {
      id: 'sabotage',
      name: 'Sabotage Operation',
      description: 'Disrupt enemy faction operations',
      skills: ['stealth', 'demolition', 'persuasion'],
      baseRewardMultiplier: 1.3,
      moralReputationChange: -8,  // -8 Marshal rep (Outlaw action)
      maxMoralReputation: -20,    // Requires Petty Crook tier
      targets: ['railroad', 'supply_lines', 'communication'],
    },
    INTEL: {
      id: 'intel',
      name: 'Intelligence Gathering',
      description: 'Gather information on enemy movements',
      skills: ['stealth', 'persuasion', 'tracking'],
      baseRewardMultiplier: 0.8,
      moralReputationChange: 0,
      minMoralReputation: null,
      unlocksBonusContent: true,  // Completing intel unlocks faction storylines
    },
  },

  // ============================================
  // PvP CONTRACT TYPES (Faction Warfare)
  // ============================================

  PVP_TYPES: {
    TERRITORY_RAID: {
      id: 'territory_raid',
      name: 'Territory Raid',
      description: 'Attack enemy-controlled territory',
      type: 'pvp',
      baseRewardMultiplier: 2.0,
      factionRepReward: 50,
      cooldownHours: 4,
      minLevel: 16,
      rewards: { territoryControl: true, factionRep: 'high' },
    },
    SUPPLY_INTERDICTION: {
      id: 'supply_interdiction',
      name: 'Supply Interdiction',
      description: 'Intercept enemy supply runs (player deliveries)',
      type: 'pvp',
      baseRewardMultiplier: 1.5,
      factionRepReward: 30,
      riskReputationLoss: -10,   // Lose rep if caught/killed
      minLevel: 18,
      rewards: { stolenGoods: true, factionRep: 'medium' },
    },
    DEFEND_OUTPOST: {
      id: 'defend_outpost',
      name: 'Outpost Defense',
      description: 'Protect faction territory from raiders',
      type: 'pvp',
      baseRewardMultiplier: 1.3,
      factionRepReward: 25,
      durationMinutes: 30,
      minLevel: 16,
      bonusPerKill: 50,          // +$50 per enemy killed
      rewards: { gold: 'bonus_per_kill', factionRep: 'medium' },
    },
    ASSASSINATION: {
      id: 'assassination',
      name: 'Assassination Contract',
      description: 'Eliminate high-value enemy player',
      type: 'pvp',
      baseRewardMultiplier: 3.0,
      moralReputationChange: -30,  // Heavy outlaw action
      maxMoralReputation: -50,     // Requires Wanted Criminal tier
      factionRepReward: 75,
      minLevel: 20,
      rewards: { targetBounty: true, notoriety: true },
    },
  },

  // ============================================
  // FACTION WAR SETTINGS
  // ============================================

  FACTION_SETTINGS: {
    // Factions that can participate in warfare
    FACTIONS: ['settler_alliance', 'nahi_coalition', 'frontera'],

    // Antagonist faction (always hostile)
    ANTAGONIST: 'railroad_tycoons',

    // Contract availability per day
    CONTRACTS_PER_DAY: {
      pve: 6,
      pvp: 3,
    },

    // Reputation thresholds for faction warfare
    MIN_FACTION_REP_FOR_CONTRACTS: 0,      // Neutral or better
    MIN_FACTION_REP_FOR_ELITE: 50,         // Elite contracts

    // Cooldowns
    RAID_COOLDOWN_HOURS: 4,
    ASSASSINATION_COOLDOWN_HOURS: 24,
    DEFENSE_SESSION_COOLDOWN_HOURS: 2,
  },

  // ============================================
  // REWARD SCALING BY LEVEL
  // ============================================

  LEVEL_REWARD_SCALING: {
    16: { gold: 400, xp: 200, factionRep: 15 },
    18: { gold: 600, xp: 300, factionRep: 20 },
    20: { gold: 900, xp: 450, factionRep: 25 },
    22: { gold: 1300, xp: 650, factionRep: 30 },
    24: { gold: 1800, xp: 900, factionRep: 35 },
    25: { gold: 2200, xp: 1100, factionRep: 40 },
  },
} as const;

/**
 * Get faction warfare contract reward scaling for level
 */
export function getFactionWarfareRewardScale(level: number): {
  gold: number;
  xp: number;
  factionRep: number;
} {
  const levels = Object.keys(FACTION_WARFARE_CONTRACTS.LEVEL_REWARD_SCALING)
    .map(Number)
    .sort((a, b) => b - a);

  for (const lvl of levels) {
    if (level >= lvl) {
      return FACTION_WARFARE_CONTRACTS.LEVEL_REWARD_SCALING[
        lvl as keyof typeof FACTION_WARFARE_CONTRACTS.LEVEL_REWARD_SCALING
      ];
    }
  }

  return { gold: 300, xp: 150, factionRep: 10 };
}

/**
 * Check if player can access PvP contracts based on level
 */
export function canAccessPvPContracts(level: number): boolean {
  return level >= 16;
}

/**
 * Check if player can access assassination contracts
 */
export function canAccessAssassinationContracts(
  level: number,
  moralReputation: number
): boolean {
  return level >= 20 && moralReputation <= -50;
}

export default CONTRACT_CONSTANTS;

