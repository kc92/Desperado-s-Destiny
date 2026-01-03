/**
 * Tavern Constants
 *
 * Defines tavern activities, regen buffs, and social gameplay constants.
 * Part of the Tavern Rest & Social System.
 */

/**
 * XP reward definition for tavern activities
 */
export interface TavernXPReward {
  skill: string;
  amount: number;
}

/**
 * Tavern activity definition
 */
export interface TavernActivityDefinition {
  /** Unique activity identifier */
  id: string;
  /** Display name */
  name: string;
  /** Activity description */
  description: string;
  /** Base cost in dollars */
  baseCost: number;
  /** Cooldown in minutes */
  cooldownMinutes: number;
  /** Energy regen bonus (0.10 = +10%) */
  regenBonus: number;
  /** Buff duration in minutes */
  durationMinutes: number;
  /** XP reward for performing activity */
  xpReward: TavernXPReward;
  /** Energy cost to perform activity */
  energyCost: number;
}

/**
 * Tavern activities and their effects
 */
export const TAVERN_ACTIVITIES: Record<string, TavernActivityDefinition> = {
  DRINK: {
    id: 'tavern_drink',
    name: 'Have a Drink',
    description: 'Enjoy a refreshing beverage at the bar',
    baseCost: 3,
    cooldownMinutes: 30,
    regenBonus: 0.10,
    durationMinutes: 60,
    xpReward: { skill: 'charisma', amount: 5 },
    energyCost: 0
  },
  SOCIALIZE: {
    id: 'tavern_socialize',
    name: 'Socialize',
    description: 'Chat with locals and other travelers',
    baseCost: 0,
    cooldownMinutes: 15,
    regenBonus: 0.05,
    durationMinutes: 45,
    xpReward: { skill: 'charisma', amount: 8 },
    energyCost: 5
  },
  CARDS: {
    id: 'tavern_cards',
    name: 'Play Cards',
    description: 'Join a friendly game of poker',
    baseCost: 10,
    cooldownMinutes: 60,
    regenBonus: 0.15,
    durationMinutes: 90,
    xpReward: { skill: 'gambling', amount: 10 },
    energyCost: 10
  },
  BATH: {
    id: 'tavern_bath',
    name: 'Take a Bath',
    description: 'Wash off the trail dust and relax',
    baseCost: 15,
    cooldownMinutes: 240,
    regenBonus: 0.20,
    durationMinutes: 120,
    xpReward: { skill: 'charisma', amount: 5 },
    energyCost: 0
  },
  REST: {
    id: 'tavern_rest',
    name: 'Full Rest',
    description: 'Get a proper night\'s sleep',
    baseCost: 75,
    cooldownMinutes: 600,
    regenBonus: 0.35,
    durationMinutes: 120,
    xpReward: { skill: 'charisma', amount: 15 },
    energyCost: 0
  }
} as const;

/**
 * Get activity by ID
 */
export function getTavernActivityById(activityId: string): TavernActivityDefinition | undefined {
  return Object.values(TAVERN_ACTIVITIES).find(a => a.id === activityId);
}

/**
 * Tavern configuration constants
 */
export const TAVERN_CONFIG = {
  /** Maximum combined regen buff from all sources (50%) */
  MAX_REGEN_BUFF: 0.50,
  /** Multiplier for buff effectiveness while in tavern (+50%) */
  IN_TAVERN_MULTIPLIER: 1.50,
  /** Minimum time between effect pruning (ms) */
  EFFECT_PRUNE_INTERVAL_MS: 60000
} as const;

/**
 * Saloon-specific bonuses
 * Some saloons offer extra bonuses to certain activities
 */
export const SALOON_BONUSES: Record<string, Partial<Record<string, number>>> = {
  // The Golden Spur - known for drinks and card games
  'the_golden_spur': {
    tavern_drink: 0.05,
    tavern_cards: 0.05
  },
  // Lucky Strike - gambling haven
  'lucky_strike': {
    tavern_cards: 0.10
  },
  // Casa de Placer - luxury establishment
  'casa_de_placer': {
    tavern_bath: 0.10,
    tavern_rest: 0.05
  },
  // Red Mesa Cantina - social hotspot
  'red_mesa_cantina': {
    tavern_socialize: 0.10,
    tavern_drink: 0.05
  },
  // Dusty Trails Hotel - comfortable rest
  'dusty_trails_hotel': {
    tavern_rest: 0.10
  }
};

/**
 * Get bonus for a specific activity at a location
 */
export function getSaloonBonus(locationId: string, activityId: string): number {
  const locationBonuses = SALOON_BONUSES[locationId];
  if (!locationBonuses) return 0;
  return locationBonuses[activityId] || 0;
}

/**
 * Location types that support tavern activities
 */
export const TAVERN_LOCATION_TYPES = [
  'saloon',
  'hotel',
  'cantina',
  'tavern'
] as const;

export type TavernLocationType = typeof TAVERN_LOCATION_TYPES[number];

/**
 * Check if a location type supports tavern activities
 */
export function isTavernLocationType(locationType: string): boolean {
  return TAVERN_LOCATION_TYPES.includes(locationType as TavernLocationType);
}
