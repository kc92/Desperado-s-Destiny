/**
 * Bounty System Types
 *
 * Shared types for the bounty/wanted system
 */

/**
 * Bounty type classification
 */
export enum BountyType {
  FACTION = 'faction',    // Bounty placed by faction for crimes
  PLAYER = 'player',      // Bounty placed by another player
  STORY = 'story',        // Bounty from quest/story event
}

/**
 * Bounty status
 */
export enum BountyStatus {
  ACTIVE = 'active',           // Bounty is currently active
  COLLECTED = 'collected',     // Bounty has been collected
  EXPIRED = 'expired',         // Bounty has expired
  CANCELLED = 'cancelled',     // Bounty was cancelled
}

/**
 * Who can collect this bounty
 */
export enum BountyCollectibleBy {
  ANYONE = 'anyone',           // Any player can collect
  FACTION = 'faction',         // Only faction members can collect
  ISSUER = 'issuer',           // Only the issuer can collect
}

/**
 * Wanted level ranks based on total bounty
 */
export enum WantedRank {
  UNKNOWN = 'unknown',                 // 0-99 gold
  PETTY_CRIMINAL = 'petty_criminal',   // 100-499 gold
  OUTLAW = 'outlaw',                   // 500-1499 gold
  NOTORIOUS = 'notorious',             // 1500-4999 gold
  MOST_WANTED = 'most_wanted',         // 5000+ gold
}

/**
 * Faction identifier for bounties
 */
export enum BountyFaction {
  SETTLER_ALLIANCE = 'settlerAlliance',
  NAHI_COALITION = 'nahiCoalition',
  FRONTERA = 'frontera',
}

/**
 * Single bounty record
 */
export interface Bounty {
  id: string;
  targetId: string;
  targetName: string;
  bountyType: BountyType;
  issuerId?: string;                   // Player who placed bounty (if player type)
  issuerName?: string;                 // Name of issuer
  issuerFaction?: BountyFaction;       // Faction that placed bounty
  amount: number;                      // Gold reward
  reason: string;                      // "Murder in Red Gulch", "Bank Robbery"
  crimes: string[];                    // List of crimes contributing to bounty
  status: BountyStatus;
  createdAt: Date;
  expiresAt?: Date;                    // Optional expiration
  lastSeenLocation?: string;           // Hint for hunters
  collectibleBy: BountyCollectibleBy;
  collectedBy?: string;                // Character who collected
  collectedAt?: Date;                  // When it was collected
}

/**
 * Character's wanted level across all factions
 */
export interface WantedLevel {
  characterId: string;
  characterName: string;
  settlerAlliance: number;             // 0-10000+ bounty with Settlers
  nahiCoalition: number;               // 0-10000+ bounty with Coalition
  frontera: number;                    // 0-10000+ bounty with Outlaws
  totalBounty: number;                 // Sum of all faction bounties
  wantedRank: WantedRank;
  activeBounties: number;              // Count of active bounties
  lastCrimeDate?: Date;                // When last crime was committed
  lastSeenLocation?: string;           // Last known location
}

/**
 * Bounty board entry (for bounty hunters)
 */
export interface BountyBoardEntry {
  id: string;
  targetId: string;
  targetName: string;
  targetLevel: number;
  amount: number;
  reason: string;
  issuerFaction?: BountyFaction;
  wantedRank: WantedRank;
  lastSeenLocation?: string;
  crimes: string[];
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Bounty hunter encounter data
 */
export interface BountyHunterEncounter {
  targetId: string;
  targetName: string;
  totalBounty: number;
  wantedRank: WantedRank;
  hunterLevel: number;                 // Level of bounty hunter based on rank
  canPayOff: boolean;                  // Can target pay to escape?
  payOffAmount: number;                // Amount to pay bounty hunter
}

/**
 * Crime bounty amounts by type
 */
export const CRIME_BOUNTY_AMOUNTS: Record<string, { min: number; max: number; faction: BountyFaction[] }> = {
  PICKPOCKET: {
    min: 10,
    max: 50,
    faction: [BountyFaction.SETTLER_ALLIANCE],
  },
  ASSAULT: {
    min: 50,
    max: 150,
    faction: [BountyFaction.SETTLER_ALLIANCE, BountyFaction.NAHI_COALITION],
  },
  ROBBERY: {
    min: 100,
    max: 300,
    faction: [BountyFaction.SETTLER_ALLIANCE],
  },
  BANK_HEIST: {
    min: 500,
    max: 1000,
    faction: [BountyFaction.SETTLER_ALLIANCE],
  },
  MURDER: {
    min: 500,
    max: 2000,
    faction: [BountyFaction.SETTLER_ALLIANCE, BountyFaction.NAHI_COALITION],
  },
  HORSE_THEFT: {
    min: 75,
    max: 200,
    faction: [BountyFaction.SETTLER_ALLIANCE, BountyFaction.NAHI_COALITION],
  },
  CATTLE_RUSTLING: {
    min: 150,
    max: 400,
    faction: [BountyFaction.SETTLER_ALLIANCE],
  },
  TRAIN_ROBBERY: {
    min: 400,
    max: 800,
    faction: [BountyFaction.SETTLER_ALLIANCE],
  },
  SABOTAGE: {
    min: 200,
    max: 500,
    faction: [BountyFaction.SETTLER_ALLIANCE, BountyFaction.NAHI_COALITION],
  },
};

/**
 * Wanted rank thresholds (total bounty across all factions)
 */
export const WANTED_RANK_THRESHOLDS: Record<WantedRank, { min: number; max: number; description: string }> = {
  [WantedRank.UNKNOWN]: {
    min: 0,
    max: 99,
    description: 'No one knows your name',
  },
  [WantedRank.PETTY_CRIMINAL]: {
    min: 100,
    max: 499,
    description: 'Known for minor offenses',
  },
  [WantedRank.OUTLAW]: {
    min: 500,
    max: 1499,
    description: 'Wanted posters in every town',
  },
  [WantedRank.NOTORIOUS]: {
    min: 1500,
    max: 4999,
    description: 'Bounty hunters actively seeking you',
  },
  [WantedRank.MOST_WANTED]: {
    min: 5000,
    max: Number.MAX_SAFE_INTEGER,
    description: 'Territory-wide manhunt in effect',
  },
};

/**
 * Bounty hunter spawn chances based on wanted rank
 */
export const BOUNTY_HUNTER_SPAWN_RATES: Record<WantedRank, number> = {
  [WantedRank.UNKNOWN]: 0,           // 0% chance
  [WantedRank.PETTY_CRIMINAL]: 0,    // 0% chance
  [WantedRank.OUTLAW]: 0.05,         // 5% chance per action
  [WantedRank.NOTORIOUS]: 0.15,      // 15% chance per action
  [WantedRank.MOST_WANTED]: 0.30,    // 30% chance per action
};

/**
 * Bounty hunter difficulty scaling
 */
export const BOUNTY_HUNTER_SCALING: Record<WantedRank, { level: number; count: number }> = {
  [WantedRank.UNKNOWN]: { level: 1, count: 0 },
  [WantedRank.PETTY_CRIMINAL]: { level: 1, count: 0 },
  [WantedRank.OUTLAW]: { level: 5, count: 1 },           // 1 level 5 hunter
  [WantedRank.NOTORIOUS]: { level: 10, count: 2 },       // 2 level 10 hunters
  [WantedRank.MOST_WANTED]: { level: 15, count: 3 },     // 3 level 15 hunters
};

/**
 * API request/response types
 */

export interface PlaceBountyRequest {
  targetId: string;
  amount: number;
  reason?: string;
}

export interface PlaceBountyResponse {
  success: boolean;
  bounty?: Bounty;
  message: string;
}

export interface CollectBountyRequest {
  bountyId: string;
  targetId: string;
}

export interface CollectBountyResponse {
  success: boolean;
  goldEarned?: number;
  message: string;
}

export interface GetWantedLevelResponse {
  success: boolean;
  wantedLevel?: WantedLevel;
}

export interface GetBountyBoardResponse {
  success: boolean;
  bounties: BountyBoardEntry[];
  location?: string;
}

export interface GetBountiesResponse {
  success: boolean;
  bounties: Bounty[];
}
