/**
 * Mining Claims Database
 * Defines available mining claim locations and their properties
 *
 * Sprint 7: Mid-Game Content - Mining Claims (L25 unlock)
 */

export type ClaimTier = 1 | 2 | 3 | 4 | 5;

export interface MiningClaimLocation {
  claimId: string;
  name: string;
  description: string;
  region: string;

  // Requirements
  levelRequired: number;
  tier: ClaimTier;

  // Costs
  stakeCost: number;
  upgradeCost?: number;           // Cost to upgrade to next tier

  // Yields
  baseYieldPerHour: { min: number; max: number };
  resources: string[];            // Resource types that can be found

  // Properties
  maxConcurrentClaims: number;    // Total claims available at this location
  contestable: boolean;           // Can other players contest this claim
  dangerLevel: number;            // 1-10, affects random events

  // Flavor
  flavorText: string;
}

/**
 * Claim Tier Configuration
 */
export const CLAIM_TIER_CONFIG: Record<ClaimTier, {
  stakeCost: number;
  upgradeCost: number;
  yieldMultiplier: number;
  collectCooldownHours: number;
  maxStorageHours: number;
}> = {
  1: {
    stakeCost: 5000,
    upgradeCost: 10000,
    yieldMultiplier: 1.0,
    collectCooldownHours: 8,
    maxStorageHours: 24,
  },
  2: {
    stakeCost: 15000,
    upgradeCost: 25000,
    yieldMultiplier: 1.5,
    collectCooldownHours: 6,
    maxStorageHours: 48,
  },
  3: {
    stakeCost: 35000,
    upgradeCost: 50000,
    yieldMultiplier: 2.0,
    collectCooldownHours: 4,
    maxStorageHours: 72,
  },
  4: {
    stakeCost: 75000,
    upgradeCost: 100000,
    yieldMultiplier: 3.0,
    collectCooldownHours: 3,
    maxStorageHours: 96,
  },
  5: {
    stakeCost: 150000,
    upgradeCost: 0, // Max tier
    yieldMultiplier: 5.0,
    collectCooldownHours: 2,
    maxStorageHours: 168,
  },
};

/**
 * Resource types available from mining
 */
export const MINING_RESOURCES = {
  // Basic resources (Tier 1+)
  iron: { name: 'Iron Ore', value: 5, rarity: 'common' },
  coal: { name: 'Coal', value: 3, rarity: 'common' },

  // Intermediate resources (Tier 2+)
  copper: { name: 'Copper Ore', value: 10, rarity: 'uncommon' },
  tin: { name: 'Tin Ore', value: 8, rarity: 'uncommon' },

  // Advanced resources (Tier 3+)
  silver: { name: 'Silver Ore', value: 25, rarity: 'uncommon' },
  lead: { name: 'Lead Ore', value: 15, rarity: 'uncommon' },

  // Rare resources (Tier 4+)
  gold: { name: 'Gold Ore', value: 100, rarity: 'rare' },
  quicksilver: { name: 'Quicksilver', value: 75, rarity: 'rare' },

  // Precious resources (Tier 5)
  gems: { name: 'Raw Gemstones', value: 200, rarity: 'epic' },
  platinum: { name: 'Platinum Ore', value: 150, rarity: 'epic' },
};

/**
 * Mining Claim Locations
 */
export const MINING_CLAIM_LOCATIONS: MiningClaimLocation[] = [
  // ========== TIER 1 CLAIMS (L25) ==========
  {
    claimId: 'dusty-creek-mine',
    name: 'Dusty Creek Mine',
    description: 'An old played-out mine that still has some deposits left.',
    region: 'Red Gulch Territory',
    levelRequired: 25,
    tier: 1,
    stakeCost: 5000,
    baseYieldPerHour: { min: 25, max: 50 },
    resources: ['iron', 'coal'],
    maxConcurrentClaims: 20,
    contestable: false,
    dangerLevel: 2,
    flavorText: 'They said this mine was empty. They were mostly right.',
  },
  {
    claimId: 'rocky-ridge-dig',
    name: 'Rocky Ridge Dig',
    description: 'A hillside claim with easy access to surface deposits.',
    region: 'Red Gulch Territory',
    levelRequired: 25,
    tier: 1,
    stakeCost: 5000,
    baseYieldPerHour: { min: 20, max: 45 },
    resources: ['iron', 'coal'],
    maxConcurrentClaims: 25,
    contestable: false,
    dangerLevel: 1,
    flavorText: 'Good for beginners. Bad for ambitions.',
  },

  // ========== TIER 2 CLAIMS (L27) ==========
  {
    claimId: 'copper-canyon-claim',
    name: 'Copper Canyon Claim',
    description: 'Rich copper deposits in a scenic canyon. Watch for flash floods.',
    region: 'Contested Lands',
    levelRequired: 27,
    tier: 2,
    stakeCost: 15000,
    upgradeCost: 25000,
    baseYieldPerHour: { min: 60, max: 110 },
    resources: ['iron', 'coal', 'copper', 'tin'],
    maxConcurrentClaims: 15,
    contestable: true,
    dangerLevel: 4,
    flavorText: 'The copper here is almost too easy to find.',
  },
  {
    claimId: 'snake-hollow-shaft',
    name: 'Snake Hollow Shaft',
    description: 'A deep shaft mine with good ore but plenty of rattlesnakes.',
    region: 'Contested Lands',
    levelRequired: 27,
    tier: 2,
    stakeCost: 15000,
    upgradeCost: 25000,
    baseYieldPerHour: { min: 55, max: 100 },
    resources: ['iron', 'copper', 'tin'],
    maxConcurrentClaims: 12,
    contestable: true,
    dangerLevel: 5,
    flavorText: 'Bring boots. Thick ones.',
  },

  // ========== TIER 3 CLAIMS (L30) ==========
  {
    claimId: 'silver-strike-vein',
    name: 'Silver Strike Vein',
    description: 'A legendary silver deposit that still yields precious ore.',
    region: 'Silver Creek',
    levelRequired: 30,
    tier: 3,
    stakeCost: 35000,
    upgradeCost: 50000,
    baseYieldPerHour: { min: 125, max: 225 },
    resources: ['iron', 'copper', 'silver', 'lead'],
    maxConcurrentClaims: 10,
    contestable: true,
    dangerLevel: 6,
    flavorText: 'Men have killed for less than what lies in these walls.',
  },
  {
    claimId: 'leadville-excavation',
    name: 'Leadville Excavation',
    description: 'A massive open-pit operation with steady output.',
    region: 'Silver Creek',
    levelRequired: 30,
    tier: 3,
    stakeCost: 35000,
    upgradeCost: 50000,
    baseYieldPerHour: { min: 110, max: 200 },
    resources: ['iron', 'coal', 'copper', 'lead', 'silver'],
    maxConcurrentClaims: 8,
    contestable: true,
    dangerLevel: 5,
    flavorText: 'Work hard and you might make foreman someday.',
  },

  // ========== TIER 4 CLAIMS (L35) ==========
  {
    claimId: 'golden-valley-deposit',
    name: 'Golden Valley Deposit',
    description: 'Real gold country. Fortunes are made and lost here weekly.',
    region: 'Gold Country',
    levelRequired: 35,
    tier: 4,
    stakeCost: 75000,
    upgradeCost: 100000,
    baseYieldPerHour: { min: 250, max: 440 },
    resources: ['copper', 'silver', 'gold', 'quicksilver'],
    maxConcurrentClaims: 6,
    contestable: true,
    dangerLevel: 7,
    flavorText: 'Gold fever is a real disease. There is no cure.',
  },
  {
    claimId: 'bonanza-mother-lode',
    name: 'Bonanza Mother Lode',
    description: 'The richest known gold deposit in the territory.',
    region: 'Gold Country',
    levelRequired: 35,
    tier: 4,
    stakeCost: 75000,
    upgradeCost: 100000,
    baseYieldPerHour: { min: 280, max: 500 },
    resources: ['silver', 'gold', 'quicksilver'],
    maxConcurrentClaims: 4,
    contestable: true,
    dangerLevel: 8,
    flavorText: 'They call it the mother lode for a reason.',
  },

  // ========== TIER 5 CLAIMS (L40) ==========
  {
    claimId: 'emperors-treasure',
    name: "Emperor's Treasure",
    description: 'A hidden mine said to contain gems of every color.',
    region: 'Mysterious Mountains',
    levelRequired: 40,
    tier: 5,
    stakeCost: 150000,
    baseYieldPerHour: { min: 500, max: 875 },
    resources: ['gold', 'quicksilver', 'gems', 'platinum'],
    maxConcurrentClaims: 3,
    contestable: true,
    dangerLevel: 9,
    flavorText: 'Legends speak of jewels that glow in the dark.',
  },
  {
    claimId: 'cosmic-depths',
    name: 'Cosmic Depths',
    description: 'A mine so deep it touches something... otherworldly.',
    region: 'The Scar',
    levelRequired: 40,
    tier: 5,
    stakeCost: 150000,
    baseYieldPerHour: { min: 550, max: 1000 },
    resources: ['gold', 'platinum', 'gems'],
    maxConcurrentClaims: 2,
    contestable: true,
    dangerLevel: 10,
    flavorText: 'What we pull from these depths is not entirely of this world.',
  },
];

/**
 * Get claim location by ID
 */
export function getClaimLocationById(claimId: string): MiningClaimLocation | undefined {
  return MINING_CLAIM_LOCATIONS.find(c => c.claimId === claimId);
}

/**
 * Get claims available at a player level
 */
export function getAvailableClaims(playerLevel: number): MiningClaimLocation[] {
  return MINING_CLAIM_LOCATIONS.filter(c => c.levelRequired <= playerLevel);
}

/**
 * Get claims by tier
 */
export function getClaimsByTier(tier: ClaimTier): MiningClaimLocation[] {
  return MINING_CLAIM_LOCATIONS.filter(c => c.tier === tier);
}

/**
 * Calculate yield value for a collection
 */
export function calculateYieldValue(resources: Record<string, number>): number {
  let total = 0;
  for (const [resourceId, quantity] of Object.entries(resources)) {
    const resource = MINING_RESOURCES[resourceId as keyof typeof MINING_RESOURCES];
    if (resource) {
      total += resource.value * quantity;
    }
  }
  return total;
}
