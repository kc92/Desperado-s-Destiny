/**
 * Moral Reputation Constants
 *
 * Phase 19.3: Frontier Justice - Marshal/Outlaw cross-cutting reputation system
 *
 * This system is SEPARATE from faction reputation. A player can be:
 * - A Nahi warrior who is a respected lawman (Legendary Marshal)
 * - A Settler who became a feared outlaw (Notorious Outlaw)
 * - Any combination in between
 *
 * Creates 6 distinct character archetypes:
 * - 3 factions × 2 moral alignments (though alignment is a spectrum)
 */

/**
 * Moral reputation tiers from Outlaw (-100) to Marshal (+100)
 */
export enum MoralReputationTier {
  NOTORIOUS_OUTLAW = 'NOTORIOUS_OUTLAW',       // -100 to -80: "Shoot on sight" by law
  WANTED_CRIMINAL = 'WANTED_CRIMINAL',          // -79 to -50: Active bounties, jail time
  PETTY_CROOK = 'PETTY_CROOK',                  // -49 to -20: Minor crimes, bribes work
  SHADY = 'SHADY',                              // -19 to -1: Suspicious but not wanted
  NEUTRAL = 'NEUTRAL',                          // 0: No reputation either way
  RESPECTABLE = 'RESPECTABLE',                  // 1 to 19: Good standing
  DEPUTY = 'DEPUTY',                            // 20 to 49: Can make arrests, small authority
  MARSHAL = 'MARSHAL',                          // 50 to 79: Full law enforcement powers
  LEGENDARY_MARSHAL = 'LEGENDARY_MARSHAL',      // 80 to 100: "The Law West of the Pecos"
}

/**
 * Actions that modify moral reputation
 */
export enum MoralAction {
  // Outlaw actions (decrease reputation)
  COMMIT_CRIME = 'COMMIT_CRIME',
  MURDER_NPC = 'MURDER_NPC',
  ROB_CIVILIAN = 'ROB_CIVILIAN',
  BREAK_JAIL = 'BREAK_JAIL',
  FENCE_STOLEN_GOODS = 'FENCE_STOLEN_GOODS',
  ATTACK_LAWMAN = 'ATTACK_LAWMAN',
  SABOTAGE = 'SABOTAGE',
  ASSASSINATION_CONTRACT = 'ASSASSINATION_CONTRACT',

  // Marshal actions (increase reputation)
  ARREST_CRIMINAL = 'ARREST_CRIMINAL',
  COMPLETE_BOUNTY = 'COMPLETE_BOUNTY',
  PROTECT_CIVILIAN = 'PROTECT_CIVILIAN',
  REPORT_CRIME = 'REPORT_CRIME',
  DEFEND_TOWN = 'DEFEND_TOWN',
  CAPTURE_OUTLAW = 'CAPTURE_OUTLAW',
  RESCUE_HOSTAGE = 'RESCUE_HOSTAGE',
  PATROL_DUTY = 'PATROL_DUTY',

  // Neutral actions (context-dependent)
  DUEL = 'DUEL',
  HELP_FACTION_MEMBER = 'HELP_FACTION_MEMBER',
  TRADE = 'TRADE',
}

/**
 * Moral reputation tier thresholds
 */
export const MORAL_REPUTATION_THRESHOLDS = {
  NOTORIOUS_OUTLAW: -80,
  WANTED_CRIMINAL: -50,
  PETTY_CROOK: -20,
  SHADY: -1,
  NEUTRAL: 0,
  RESPECTABLE: 1,
  DEPUTY: 20,
  MARSHAL: 50,
  LEGENDARY_MARSHAL: 80,
} as const;

/**
 * Moral reputation action modifiers
 */
export const MORAL_ACTION_VALUES: Record<MoralAction, number> = {
  // Outlaw actions
  [MoralAction.COMMIT_CRIME]: -5,
  [MoralAction.MURDER_NPC]: -25,
  [MoralAction.ROB_CIVILIAN]: -10,
  [MoralAction.BREAK_JAIL]: -15,
  [MoralAction.FENCE_STOLEN_GOODS]: -3,
  [MoralAction.ATTACK_LAWMAN]: -20,
  [MoralAction.SABOTAGE]: -8,
  [MoralAction.ASSASSINATION_CONTRACT]: -30,

  // Marshal actions
  [MoralAction.ARREST_CRIMINAL]: 10,
  [MoralAction.COMPLETE_BOUNTY]: 8,
  [MoralAction.PROTECT_CIVILIAN]: 5,
  [MoralAction.REPORT_CRIME]: 2,
  [MoralAction.DEFEND_TOWN]: 15,
  [MoralAction.CAPTURE_OUTLAW]: 12,
  [MoralAction.RESCUE_HOSTAGE]: 20,
  [MoralAction.PATROL_DUTY]: 3,

  // Neutral actions (0 - modified by context in service)
  [MoralAction.DUEL]: 0,
  [MoralAction.HELP_FACTION_MEMBER]: 0,
  [MoralAction.TRADE]: 0,
};

/**
 * Main moral reputation constants
 */
export const MORAL_REPUTATION = {
  // Range
  MIN_VALUE: -100,
  MAX_VALUE: 100,
  DEFAULT_VALUE: 0,

  // Thresholds for tier access
  TIERS: MORAL_REPUTATION_THRESHOLDS,

  // Gameplay effects
  EFFECTS: {
    // Marshal benefits
    marshalAccess: {
      threshold: 20,  // Deputy tier
      features: ['arrest_npcs', 'jail_access', 'law_quests', 'badge_equipment'],
    },
    marshalBonuses: {
      threshold: 50,  // Marshal tier
      bountyRewardBonus: 0.25,      // +25% bounty rewards
      escortPayBonus: 0.15,         // +15% escort contract pay
      townPriceDiscount: 0.10,      // -10% shop prices in lawful towns
    },
    legendaryMarshal: {
      threshold: 80,
      features: ['judge_authority', 'execution_rights', 'marshal_badge', 'posse_command'],
      bountyRewardBonus: 0.50,      // +50% bounty rewards
    },

    // Outlaw benefits
    outlawAccess: {
      threshold: -20,  // Petty Crook tier
      features: ['fence_access', 'hideout_network', 'crime_contracts', 'gang_recruitment'],
    },
    outlawBonuses: {
      threshold: -50,  // Wanted Criminal tier
      crimePayoutBonus: 0.25,       // +25% crime payouts
      fenceRateBonus: 0.15,         // +15% better fence rates
      intimidationBonus: 0.20,      // +20% intimidation success
    },
    notoriousOutlaw: {
      threshold: -80,
      features: ['legendary_hideouts', 'assassination_contracts', 'outlaw_legends_quests'],
      crimePayoutBonus: 0.50,       // +50% crime payouts
    },

    // Cross-faction respect (high reputation either direction)
    crossFactionRespect: {
      threshold: 60,  // Absolute value
      description: 'A Settler Marshal is respected by a Nahi Marshal (professional courtesy)',
    },
  },

  // Decay and recovery
  DECAY: {
    ratePerDay: 1,                  // Reputation decays 1 point toward 0 per day
    minimumForDecay: 10,            // Only decay if |reputation| > 10
    maxDecayPerDay: 3,              // Cap decay at 3 per day
  },

  // Reputation change limits
  LIMITS: {
    maxChangePerAction: 30,         // Cap single action impact
    dailyChangeLimit: 50,           // Cap daily reputation change
    minLevelForExtreme: 15,         // Must be L15+ to reach extreme tiers
  },

  // Title mappings for display
  TITLES: {
    [MoralReputationTier.NOTORIOUS_OUTLAW]: {
      name: 'Notorious Outlaw',
      description: 'Shoot on sight by law enforcement',
      icon: 'skull-crossbones',
    },
    [MoralReputationTier.WANTED_CRIMINAL]: {
      name: 'Wanted Criminal',
      description: 'Active bounties and jail time',
      icon: 'wanted-poster',
    },
    [MoralReputationTier.PETTY_CROOK]: {
      name: 'Petty Crook',
      description: 'Minor crimes, bribes work',
      icon: 'mask',
    },
    [MoralReputationTier.SHADY]: {
      name: 'Shady Character',
      description: 'Suspicious but not wanted',
      icon: 'shadow',
    },
    [MoralReputationTier.NEUTRAL]: {
      name: 'Neutral',
      description: 'No reputation either way',
      icon: 'balance-scale',
    },
    [MoralReputationTier.RESPECTABLE]: {
      name: 'Respectable Citizen',
      description: 'Good standing in society',
      icon: 'handshake',
    },
    [MoralReputationTier.DEPUTY]: {
      name: 'Deputy',
      description: 'Can make arrests, minor authority',
      icon: 'badge-deputy',
    },
    [MoralReputationTier.MARSHAL]: {
      name: 'Marshal',
      description: 'Full law enforcement powers',
      icon: 'badge-marshal',
    },
    [MoralReputationTier.LEGENDARY_MARSHAL]: {
      name: 'Legendary Marshal',
      description: 'The Law West of the Pecos',
      icon: 'badge-legend',
    },
  },
} as const;

/**
 * Get moral reputation tier from numeric value
 */
export function getMoralReputationTier(value: number): MoralReputationTier {
  if (value <= -80) return MoralReputationTier.NOTORIOUS_OUTLAW;
  if (value <= -50) return MoralReputationTier.WANTED_CRIMINAL;
  if (value <= -20) return MoralReputationTier.PETTY_CROOK;
  if (value < 0) return MoralReputationTier.SHADY;
  if (value === 0) return MoralReputationTier.NEUTRAL;
  if (value < 20) return MoralReputationTier.RESPECTABLE;
  if (value < 50) return MoralReputationTier.DEPUTY;
  if (value < 80) return MoralReputationTier.MARSHAL;
  return MoralReputationTier.LEGENDARY_MARSHAL;
}

/**
 * Check if character has marshal access (can perform law enforcement)
 */
export function hasMarshalAccess(moralReputation: number): boolean {
  return moralReputation >= MORAL_REPUTATION.EFFECTS.marshalAccess.threshold;
}

/**
 * Check if character has outlaw access (can use criminal networks)
 */
export function hasOutlawAccess(moralReputation: number): boolean {
  return moralReputation <= -MORAL_REPUTATION.EFFECTS.outlawAccess.threshold;
}

/**
 * Get bounty reward bonus based on moral reputation
 */
export function getBountyRewardBonus(moralReputation: number): number {
  if (moralReputation >= MORAL_REPUTATION.EFFECTS.legendaryMarshal.threshold) {
    return MORAL_REPUTATION.EFFECTS.legendaryMarshal.bountyRewardBonus;
  }
  if (moralReputation >= MORAL_REPUTATION.EFFECTS.marshalBonuses.threshold) {
    return MORAL_REPUTATION.EFFECTS.marshalBonuses.bountyRewardBonus;
  }
  return 0;
}

/**
 * Get crime payout bonus based on moral reputation
 */
export function getCrimePayoutBonus(moralReputation: number): number {
  if (moralReputation <= MORAL_REPUTATION.EFFECTS.notoriousOutlaw.threshold) {
    return MORAL_REPUTATION.EFFECTS.notoriousOutlaw.crimePayoutBonus;
  }
  if (moralReputation <= MORAL_REPUTATION.EFFECTS.outlawBonuses.threshold) {
    return MORAL_REPUTATION.EFFECTS.outlawBonuses.crimePayoutBonus;
  }
  return 0;
}

/**
 * Check if two characters share moral alignment (for cross-faction respect)
 */
export function sharesMoralAlignment(rep1: number, rep2: number): boolean {
  const threshold = MORAL_REPUTATION.EFFECTS.crossFactionRespect.threshold;

  // Both are strongly lawful
  if (rep1 >= threshold && rep2 >= threshold) return true;

  // Both are strongly criminal
  if (rep1 <= -threshold && rep2 <= -threshold) return true;

  return false;
}

/**
 * Calculate reputation change with limits applied
 */
export function calculateReputationChange(
  currentValue: number,
  change: number,
  characterLevel: number
): number {
  // Apply maximum change cap
  const cappedChange = Math.max(
    -MORAL_REPUTATION.LIMITS.maxChangePerAction,
    Math.min(MORAL_REPUTATION.LIMITS.maxChangePerAction, change)
  );

  // Calculate new value
  let newValue = currentValue + cappedChange;

  // Clamp to min/max
  newValue = Math.max(MORAL_REPUTATION.MIN_VALUE, Math.min(MORAL_REPUTATION.MAX_VALUE, newValue));

  // Level gate for extreme tiers
  if (characterLevel < MORAL_REPUTATION.LIMITS.minLevelForExtreme) {
    newValue = Math.max(-60, Math.min(60, newValue));
  }

  return newValue;
}

export default MORAL_REPUTATION;
