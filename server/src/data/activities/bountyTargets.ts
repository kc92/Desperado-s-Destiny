/**
 * Bounty Targets Database
 * Defines wanted NPCs that players can hunt for rewards
 *
 * Sprint 7: Mid-Game Content - Bounty Hunting (L20 unlock)
 */

import { SecureRNG } from '../../services/base/SecureRNG';

export type BountyTier = 'petty' | 'wanted' | 'notorious' | 'legendary';

export interface BountyTarget {
  targetId: string;
  name: string;
  alias?: string;
  description: string;
  tier: BountyTier;
  levelRequired: number;

  // Rewards
  goldReward: { min: number; max: number };
  xpReward: number;
  reputationReward?: { faction: string; amount: number };

  // Hunt mechanics
  trackingDifficulty: number;      // 1-100, affects tracking time
  combatDifficulty: number;        // 1-100, affects combat encounter
  escapeChance: number;            // 0-100, chance to escape during confrontation

  // Time limits
  expiresInHours: number;          // How long the hunt can take

  // Location hints
  knownLocations: string[];        // Possible locations to find them

  // Encounter options
  canNegotiate: boolean;           // Can be convinced to surrender
  canAmbush: boolean;              // Can be ambushed for bonus
  hasGang: boolean;                // Comes with gang members
  gangSize?: number;               // Number of gang members

  // Flavor
  wantedPoster: string;            // Description for wanted poster
  captureDialogue?: string;        // What they say when caught
  escapeDialogue?: string;         // What they say if they escape
}

/**
 * Bounty Tier Configuration
 */
export const BOUNTY_TIER_CONFIG: Record<BountyTier, {
  levelRequired: number;
  trackingTimeMinutes: number;
  energyCost: number;
}> = {
  petty: {
    levelRequired: 20,
    trackingTimeMinutes: 30,
    energyCost: 15,
  },
  wanted: {
    levelRequired: 25,
    trackingTimeMinutes: 120,
    energyCost: 25,
  },
  notorious: {
    levelRequired: 30,
    trackingTimeMinutes: 360,
    energyCost: 40,
  },
  legendary: {
    levelRequired: 40,
    trackingTimeMinutes: 1440,
    energyCost: 60,
  },
};

/**
 * Bounty Targets Data
 */
export const BOUNTY_TARGETS: BountyTarget[] = [
  // ========== PETTY BOUNTIES (L20) ==========
  {
    targetId: 'johnny-two-fingers',
    name: 'Johnny Two-Fingers',
    alias: 'The Pickpocket',
    description: 'A petty thief known for his quick hands and quicker feet.',
    tier: 'petty',
    levelRequired: 20,
    goldReward: { min: 500, max: 1000 },
    xpReward: 200,
    trackingDifficulty: 25,
    combatDifficulty: 20,
    escapeChance: 30,
    expiresInHours: 24,
    knownLocations: ['red-gulch-saloon', 'dusty-trails-general-store', 'border-crossing'],
    canNegotiate: true,
    canAmbush: true,
    hasGang: false,
    wantedPoster: 'WANTED: For pickpocketing and petty theft. Missing two fingers on left hand. Reward: $500-$1,000',
    captureDialogue: "Alright, alright! You got me. It was just a few coins!",
  },
  {
    targetId: 'dusty-dan',
    name: 'Dusty Dan',
    alias: 'The Cattle Rustler',
    description: 'A small-time rustler who targets lone travelers and small ranches.',
    tier: 'petty',
    levelRequired: 20,
    goldReward: { min: 600, max: 900 },
    xpReward: 180,
    trackingDifficulty: 30,
    combatDifficulty: 25,
    escapeChance: 25,
    expiresInHours: 24,
    knownLocations: ['cattle-trails', 'abandoned-ranch', 'watering-hole'],
    canNegotiate: true,
    canAmbush: true,
    hasGang: false,
    wantedPoster: 'WANTED: For cattle rustling. Often seen near the old Miller ranch. Reward: $600-$900',
    captureDialogue: "I was just borrowing them cows! I swear I was gonna bring em back!",
  },
  {
    targetId: 'whiskey-jack',
    name: 'Whiskey Jack',
    alias: 'The Drunk',
    description: 'A violent drunk who picks fights in every saloon he visits.',
    tier: 'petty',
    levelRequired: 20,
    goldReward: { min: 400, max: 800 },
    xpReward: 150,
    trackingDifficulty: 15,
    combatDifficulty: 35,
    escapeChance: 15,
    expiresInHours: 24,
    knownLocations: ['red-gulch-saloon', 'tombstone-tavern', 'cantina-frontera'],
    canNegotiate: false,
    canAmbush: false,
    hasGang: false,
    wantedPoster: 'WANTED: For assault and property damage. Smells of whiskey. Reward: $400-$800',
    captureDialogue: "*hic* You think you can take me? *hic* I'll... I'll fight ya!",
  },

  // ========== WANTED BOUNTIES (L25) ==========
  {
    targetId: 'black-hat-bella',
    name: 'Black Hat Bella',
    alias: 'The Train Robber',
    description: 'A daring outlaw who has robbed three trains this year alone.',
    tier: 'wanted',
    levelRequired: 25,
    goldReward: { min: 2000, max: 5000 },
    xpReward: 500,
    reputationReward: { faction: 'settlerAlliance', amount: 25 },
    trackingDifficulty: 50,
    combatDifficulty: 45,
    escapeChance: 35,
    expiresInHours: 48,
    knownLocations: ['railway-junction', 'hideout-canyon', 'border-crossing'],
    canNegotiate: true,
    canAmbush: true,
    hasGang: true,
    gangSize: 2,
    wantedPoster: 'WANTED: For train robbery and assault on railway personnel. Wears a distinctive black hat. Reward: $2,000-$5,000',
    captureDialogue: "You got lucky this time, hunter. My boys will come for me.",
  },
  {
    targetId: 'silent-sam',
    name: 'Silent Sam',
    alias: 'The Assassin',
    description: 'A hired killer who never speaks. His silence is as deadly as his aim.',
    tier: 'wanted',
    levelRequired: 25,
    goldReward: { min: 3000, max: 4500 },
    xpReward: 600,
    trackingDifficulty: 60,
    combatDifficulty: 55,
    escapeChance: 40,
    expiresInHours: 48,
    knownLocations: ['ghost-town', 'cemetery-ridge', 'abandoned-mine'],
    canNegotiate: false,
    canAmbush: true,
    hasGang: false,
    wantedPoster: 'WANTED: For multiple murders. Never speaks. Extremely dangerous. Reward: $3,000-$4,500',
    captureDialogue: "...",
  },
  {
    targetId: 'mad-martha',
    name: 'Mad Martha',
    alias: 'The Poisoner',
    description: 'A widow who inherited fortunes from her late husbands. All five of them.',
    tier: 'wanted',
    levelRequired: 25,
    goldReward: { min: 2500, max: 4000 },
    xpReward: 550,
    trackingDifficulty: 45,
    combatDifficulty: 30,
    escapeChance: 45,
    expiresInHours: 48,
    knownLocations: ['high-society-district', 'apothecary', 'widow-mansion'],
    canNegotiate: true,
    canAmbush: false,
    hasGang: false,
    wantedPoster: 'WANTED: For suspected poisoning of multiple husbands. Charming and dangerous. Reward: $2,500-$4,000',
    captureDialogue: "Oh my, you caught me! Care for some tea before we go?",
  },

  // ========== NOTORIOUS BOUNTIES (L30) ==========
  {
    targetId: 'iron-claw-mcgraw',
    name: 'Iron Claw McGraw',
    alias: 'The Bank Robber',
    description: 'Leader of the McGraw Gang. Has robbed every major bank west of the Mississippi.',
    tier: 'notorious',
    levelRequired: 30,
    goldReward: { min: 8000, max: 15000 },
    xpReward: 1200,
    reputationReward: { faction: 'settlerAlliance', amount: 50 },
    trackingDifficulty: 70,
    combatDifficulty: 70,
    escapeChance: 40,
    expiresInHours: 72,
    knownLocations: ['mcgraw-hideout', 'silver-creek-bank', 'canyon-fortress'],
    canNegotiate: false,
    canAmbush: true,
    hasGang: true,
    gangSize: 4,
    wantedPoster: 'WANTED DEAD OR ALIVE: Iron Claw McGraw. Armed and extremely dangerous. Reward: $8,000-$15,000',
    captureDialogue: "You think this changes anything? My gang will burn this town to the ground!",
    escapeDialogue: "See you around, hunter. Next time you won't be so lucky.",
  },
  {
    targetId: 'the-preacher',
    name: 'Ezekiel Stone',
    alias: 'The Preacher',
    description: 'A former man of God turned serial killer. Believes he is doing the Lords work.',
    tier: 'notorious',
    levelRequired: 30,
    goldReward: { min: 10000, max: 12000 },
    xpReward: 1100,
    trackingDifficulty: 75,
    combatDifficulty: 60,
    escapeChance: 35,
    expiresInHours: 72,
    knownLocations: ['abandoned-church', 'cemetery-ridge', 'ghost-town'],
    canNegotiate: false,
    canAmbush: true,
    hasGang: false,
    wantedPoster: 'WANTED: The Preacher. Multiple murders. Wears black robes. Extremely dangerous. Reward: $10,000-$12,000',
    captureDialogue: "The Lord's work must be done! You cannot stop divine judgment!",
  },
  {
    targetId: 'red-wolf',
    name: 'Red Wolf',
    alias: 'The Renegade',
    description: 'A renegade warrior fighting a one-man war against all factions.',
    tier: 'notorious',
    levelRequired: 30,
    goldReward: { min: 9000, max: 14000 },
    xpReward: 1300,
    reputationReward: { faction: 'nahiCoalition', amount: -25 },
    trackingDifficulty: 80,
    combatDifficulty: 75,
    escapeChance: 50,
    expiresInHours: 72,
    knownLocations: ['sacred-valley', 'wilderness-camp', 'cliff-hideout'],
    canNegotiate: true,
    canAmbush: false,
    hasGang: true,
    gangSize: 3,
    wantedPoster: 'WANTED: Red Wolf. Attacks on settlements. Considered extremely dangerous. Reward: $9,000-$14,000',
    captureDialogue: "You fight for their gold. I fight for my people. We are not the same.",
  },

  // ========== LEGENDARY BOUNTIES (L40) ==========
  {
    targetId: 'el-diablo',
    name: 'El Diablo',
    alias: 'The Devil of the Border',
    description: 'The most feared outlaw in the territory. Commands an army of bandits.',
    tier: 'legendary',
    levelRequired: 40,
    goldReward: { min: 25000, max: 50000 },
    xpReward: 3000,
    reputationReward: { faction: 'frontera', amount: -50 },
    trackingDifficulty: 90,
    combatDifficulty: 90,
    escapeChance: 50,
    expiresInHours: 168,
    knownLocations: ['diablo-fortress', 'border-crossing', 'cartel-stronghold'],
    canNegotiate: false,
    canAmbush: true,
    hasGang: true,
    gangSize: 6,
    wantedPoster: 'WANTED DEAD OR ALIVE: El Diablo. Murder, robbery, crimes against humanity. Reward: $25,000-$50,000',
    captureDialogue: "You think you've won? I am eternal. The devil never dies.",
    escapeDialogue: "Foolish hunter. You have made a powerful enemy today.",
  },
  {
    targetId: 'the-ghost',
    name: 'Unknown',
    alias: 'The Ghost',
    description: 'No one knows their true identity. Only their victims know their face - and the dead tell no tales.',
    tier: 'legendary',
    levelRequired: 40,
    goldReward: { min: 30000, max: 45000 },
    xpReward: 3500,
    trackingDifficulty: 95,
    combatDifficulty: 85,
    escapeChance: 60,
    expiresInHours: 168,
    knownLocations: ['any-location', 'ghost-town', 'shadows'],
    canNegotiate: false,
    canAmbush: false,
    hasGang: false,
    wantedPoster: 'WANTED: The Ghost. Unknown identity. Over 50 confirmed kills. Reward: $30,000-$45,000',
    captureDialogue: "Impressive. You are the first to see my face and live. For now.",
    escapeDialogue: "*vanishes into the shadows*",
  },
];

/**
 * Get bounty targets by tier
 */
export function getBountyTargetsByTier(tier: BountyTier): BountyTarget[] {
  return BOUNTY_TARGETS.filter(t => t.tier === tier);
}

/**
 * Get bounty target by ID
 */
export function getBountyTargetById(targetId: string): BountyTarget | undefined {
  return BOUNTY_TARGETS.find(t => t.targetId === targetId);
}

/**
 * Get available bounties for a player level
 */
export function getAvailableBounties(playerLevel: number): BountyTarget[] {
  return BOUNTY_TARGETS.filter(t => t.levelRequired <= playerLevel);
}

/**
 * Calculate actual reward within range
 */
export function calculateBountyReward(target: BountyTarget, captureMethod: 'dead' | 'alive'): number {
  const { min, max } = target.goldReward;
  const base = SecureRNG.range(min, max);
  // Alive captures get 20% bonus
  return captureMethod === 'alive' ? Math.floor(base * 1.2) : base;
}
