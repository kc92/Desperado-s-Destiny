/**
 * Action Effects Types
 *
 * Defines how player actions impact territory control and faction influence
 * Phase 11, Wave 11.1 - Player Action Effects on Territory
 */

import { TerritoryFactionId } from './territoryWar.types';

/**
 * Faction IDs used in action influence mapping
 * These represent the various factions that can be affected by player actions
 */
export enum ActionFactionId {
  LAW_ENFORCEMENT = 'LAW_ENFORCEMENT',
  OUTLAW_FACTION = 'OUTLAW_FACTION',
  RAILROAD_CORP = 'RAILROAD_CORP',
  MILITARY = 'MILITARY',
  CHINESE_TONG = 'CHINESE_TONG',
  SETTLER = 'SETTLER',
  NATIVE = 'NATIVE',
  FRONTERA = 'FRONTERA',
  NAHI_COALITION = 'NAHI_COALITION',
  FRONTERA_CARTEL = 'FRONTERA_CARTEL',
  SETTLER_ALLIANCE = 'SETTLER_ALLIANCE',
}

/**
 * Action category for influence effects
 */
export enum ActionCategory {
  // Combat actions
  COMBAT_NPC_KILL = 'COMBAT_NPC_KILL',
  COMBAT_ENEMY_KILL = 'COMBAT_ENEMY_KILL',
  COMBAT_DUEL_WIN = 'COMBAT_DUEL_WIN',
  COMBAT_DEFEND_TERRITORY = 'COMBAT_DEFEND_TERRITORY',
  COMBAT_RAID_TERRITORY = 'COMBAT_RAID_TERRITORY',
  COMBAT_BOUNTY_CLAIM = 'COMBAT_BOUNTY_CLAIM',
  COMBAT_ESCORT_MISSION = 'COMBAT_ESCORT_MISSION',

  // Economic actions
  ECONOMIC_FACTION_JOB = 'ECONOMIC_FACTION_JOB',
  ECONOMIC_TRADE = 'ECONOMIC_TRADE',
  ECONOMIC_DONATE = 'ECONOMIC_DONATE',
  ECONOMIC_SABOTAGE = 'ECONOMIC_SABOTAGE',
  ECONOMIC_INVEST = 'ECONOMIC_INVEST',
  ECONOMIC_MERCHANT_DEAL = 'ECONOMIC_MERCHANT_DEAL',
  ECONOMIC_PROPERTY_PURCHASE = 'ECONOMIC_PROPERTY_PURCHASE',

  // Criminal actions
  CRIMINAL_ROB_TERRITORY = 'CRIMINAL_ROB_TERRITORY',
  CRIMINAL_SMUGGLE = 'CRIMINAL_SMUGGLE',
  CRIMINAL_ARREST = 'CRIMINAL_ARREST',
  CRIMINAL_BREAKOUT = 'CRIMINAL_BREAKOUT',
  CRIMINAL_PROTECTION_RACKET = 'CRIMINAL_PROTECTION_RACKET',
  CRIMINAL_CONTRABAND = 'CRIMINAL_CONTRABAND',
  CRIMINAL_ASSASSINATION = 'CRIMINAL_ASSASSINATION',

  // Social actions
  SOCIAL_REPUTATION_QUEST = 'SOCIAL_REPUTATION_QUEST',
  SOCIAL_PROPAGANDA = 'SOCIAL_PROPAGANDA',
  SOCIAL_RECRUIT = 'SOCIAL_RECRUIT',
  SOCIAL_BETRAY = 'SOCIAL_BETRAY',
  SOCIAL_DIPLOMACY = 'SOCIAL_DIPLOMACY',
  SOCIAL_NEGOTIATE = 'SOCIAL_NEGOTIATE',
  SOCIAL_MEDIATE = 'SOCIAL_MEDIATE',

  // Gang actions
  GANG_CONTROL_BUILDING = 'GANG_CONTROL_BUILDING',
  GANG_CLAIM_TERRITORY = 'GANG_CLAIM_TERRITORY',
  GANG_WAR_VICTORY = 'GANG_WAR_VICTORY',
  GANG_ALLIANCE = 'GANG_ALLIANCE',
  GANG_RAID = 'GANG_RAID',
  GANG_DEFEND = 'GANG_DEFEND',

  // Special actions
  SPECIAL_TRAIN_HEIST = 'SPECIAL_TRAIN_HEIST',
  SPECIAL_BANK_ROBBERY = 'SPECIAL_BANK_ROBBERY',
  SPECIAL_ARTIFACT_RECOVERY = 'SPECIAL_ARTIFACT_RECOVERY',
  SPECIAL_RITUAL_COMPLETION = 'SPECIAL_RITUAL_COMPLETION',
  SPECIAL_LEGENDARY_HUNT = 'SPECIAL_LEGENDARY_HUNT',
}

/**
 * Influence effect modifiers
 */
export interface InfluenceModifiers {
  /** +1% per level above 10 */
  characterLevelBonus: number;
  /** +1% per 100 reputation */
  reputationBonus: number;
  /** +10-30% if gang aligned with faction */
  gangBonus: number;
  /** +50-100% during special events */
  eventBonus: number;
  /** Territory volatility multiplier */
  territoryMultiplier: number;
  /** Skill level bonus */
  skillBonus: number;
}

/**
 * Secondary influence effect
 */
export interface SecondaryInfluenceEffect {
  factionId: ActionFactionId;
  influence: number;
  reason: string;
}

/**
 * Action influence effect definition
 */
export interface ActionInfluenceEffect {
  /** Action category */
  actionCategory: ActionCategory;
  /** Base influence amount (before modifiers) */
  baseInfluence: number;
  /** Minimum influence value */
  minInfluence: number;
  /** Maximum influence value */
  maxInfluence: number;

  /** Primary faction affected */
  primaryFaction: ActionFactionId | null;
  /** Whether this helps (+) or hurts (-) the faction */
  primaryDirection: 'positive' | 'negative';

  /** Secondary effects (spillover) */
  secondaryEffects: Array<{
    factionId: ActionFactionId;
    influenceMultiplier: number; // Percentage of primary effect
    direction: 'positive' | 'negative';
  }>;

  /** Description of the effect */
  description: string;

  /** Diminishing returns configuration */
  diminishingReturns?: {
    dailyLimit: number;
    diminishingAfter: number;
    diminishingRate: number; // Percentage reduction per action
  };

  /** Territory-specific multipliers */
  territoryMultipliers?: {
    [territoryId: string]: number;
  };
}

/**
 * Player contribution milestone
 */
export enum ContributionMilestone {
  ALLY = 'ALLY',           // 100 influence
  CHAMPION = 'CHAMPION',   // 500 influence
  HERO = 'HERO',           // 1000 influence
  LEGEND = 'LEGEND',       // 2500 influence
  MYTHIC = 'MYTHIC',       // 5000 influence
}

/**
 * Milestone reward
 */
export interface MilestoneReward {
  milestone: ContributionMilestone;
  factionId: TerritoryFactionId;
  rewards: {
    title: string;
    cosmetics: string[];
    abilities: string[];
    quests: string[];
    goldBonus?: number;
    xpBonus?: number;
  };
}

/**
 * Territory volatility configuration
 */
export interface TerritoryVolatility {
  territoryId: string;
  territoryName: string;
  volatilityMultiplier: number;
  specialRules?: string[];
}

/**
 * Faction spillover rule
 */
export interface FactionSpilloverRule {
  primaryFaction: ActionFactionId;
  antagonists: Array<{
    factionId: ActionFactionId;
    spilloverRate: number; // 0.25 = 25% of primary gain becomes loss for this faction
  }>;
  allies: Array<{
    factionId: ActionFactionId;
    spilloverRate: number; // 0.15 = 15% of primary gain becomes gain for this faction
  }>;
}

/**
 * Player influence contribution record
 */
export interface PlayerInfluenceContribution {
  characterId: string;
  characterName: string;
  factionId: TerritoryFactionId;
  totalInfluenceContributed: number;
  currentMilestone: ContributionMilestone | null;
  milestonesAchieved: ContributionMilestone[];

  contributionsByType: Map<ActionCategory, number>;
  contributionsByTerritory: Map<string, number>;

  dailyContributions: Array<{
    date: Date;
    amount: number;
    actionCount: number;
  }>;

  lastContribution: Date;
  firstContribution: Date;
}

/**
 * Influence change result
 */
export interface InfluenceChangeResult {
  success: boolean;

  characterId: string;
  actionCategory: ActionCategory;

  primaryFaction: TerritoryFactionId;
  primaryInfluenceChange: number;

  secondaryChanges: Array<{
    factionId: TerritoryFactionId;
    influenceChange: number;
    reason: string;
  }>;

  modifiersApplied: {
    base: number;
    characterLevel: number;
    reputation: number;
    gang: number;
    event: number;
    territory: number;
    skill: number;
    total: number;
  };

  newTotalContribution: number;
  milestoneReached?: ContributionMilestone;
  milestoneRewards?: MilestoneReward;

  territoryId?: string;
  territoryInfluenceChanged: boolean;

  leaderboardRankChange?: number;
}

/**
 * Leaderboard entry
 */
export interface InfluenceLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  characterLevel: number;
  factionId: TerritoryFactionId;
  totalInfluence: number;
  weeklyInfluence: number;
  monthlyInfluence: number;
  currentMilestone: ContributionMilestone | null;
  gangId?: string;
  gangName?: string;
}

/**
 * Faction leaderboard
 */
export interface FactionLeaderboard {
  factionId: TerritoryFactionId;
  factionName: string;
  topContributors: InfluenceLeaderboardEntry[];
  totalFactionInfluence: number;
  territoriesControlled: number;
  weeklyGrowth: number;
}

/**
 * Territory flip event
 */
export interface TerritoryFlipEvent {
  territoryId: string;
  territoryName: string;
  previousFaction: TerritoryFactionId | null;
  newFaction: TerritoryFactionId;
  flipTime: Date;
  triggeringAction?: {
    characterId: string;
    characterName: string;
    actionCategory: ActionCategory;
  };
  finalInfluenceScores: Map<TerritoryFactionId, number>;
}

/**
 * Action effectiveness stats
 */
export interface ActionEffectivenessStats {
  actionCategory: ActionCategory;
  timesPerformed: number;
  averageInfluenceGained: number;
  bestSingleGain: number;
  territoriesAffected: number;
  milestoneProgress: number;
}

/**
 * Constants for milestone thresholds
 */
export const MILESTONE_THRESHOLDS: Record<ContributionMilestone, number> = {
  [ContributionMilestone.ALLY]: 100,
  [ContributionMilestone.CHAMPION]: 500,
  [ContributionMilestone.HERO]: 1000,
  [ContributionMilestone.LEGEND]: 2500,
  [ContributionMilestone.MYTHIC]: 5000,
};

/**
 * Constants for spillover rates
 */
export const DEFAULT_SPILLOVER_RATES = {
  ANTAGONIST: 0.35,      // 35% of gain becomes enemy loss
  ALLY: 0.15,            // 15% of gain becomes ally gain
  NEUTRAL_DECAY: 0.10,   // 10% of gain causes neutral faction decay
};

/**
 * Territory volatility levels
 */
export enum TerritoryVolatilityLevel {
  STABLE = 'STABLE',       // 1.0x (Fort Ashford)
  NORMAL = 'NORMAL',       // 1.0x (Most territories)
  VOLATILE = 'VOLATILE',   // 1.25x (Red Gulch)
  CHAOTIC = 'CHAOTIC',     // 1.5x (The Frontera)
  CRITICAL = 'CRITICAL',   // 2.0x (Special events)
}

/**
 * Daily contribution limits
 */
export const DAILY_CONTRIBUTION_LIMITS = {
  STANDARD_ACTION: 20,
  GANG_ACTION: 10,
  SPECIAL_ACTION: 5,
  DIMINISHING_START: 5,  // After 5 actions, diminishing returns kick in
  DIMINISHING_RATE: 0.90, // Each action after 5 is 90% as effective
};
