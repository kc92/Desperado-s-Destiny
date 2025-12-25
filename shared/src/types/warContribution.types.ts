/**
 * War Contribution Tracking Types
 *
 * Phase 2.4: Track individual contributions by type, calculate MVPs,
 * maintain career stats with detailed per-war stats, efficiency metrics,
 * and historical tracking.
 */

/**
 * Contribution categories for grouping related contribution types
 * Named WarContributionCategory to avoid conflict with factionWar.types.ts
 */
export enum WarContributionCategory {
  COMBAT = 'combat',
  RAIDS = 'raids',
  TERRITORY = 'territory',
  RESOURCES = 'resources',
  SUPPORT = 'support',
  LEADERSHIP = 'leadership',
}

/**
 * Specific contribution types and their triggers
 * Named WarContributionType to avoid conflict with factionWar.types.ts
 */
export enum WarContributionType {
  // Combat contributions
  DECK_GAME_WIN = 'deck_game_win',
  DECK_GAME_LOSS = 'deck_game_loss',
  CHAMPION_DUEL_WIN = 'champion_duel_win',
  LEADER_SHOWDOWN_WIN = 'leader_showdown_win',
  DAMAGE_DEALT = 'damage_dealt',

  // Raid contributions
  RAID_PARTICIPATED = 'raid_participated',
  RAID_LED = 'raid_led',
  RAID_DEFENDED = 'raid_defended',
  PROPERTY_DAMAGED = 'property_damaged',

  // Territory contributions
  ZONE_CAPTURE = 'zone_capture',
  ZONE_DEFENSE = 'zone_defense',
  INFLUENCE_GAINED = 'influence_gained',

  // Resource contributions
  GOLD_CONTRIBUTED = 'gold_contributed',
  SUPPLIES_DELIVERED = 'supplies_delivered',

  // Support contributions
  BUFF_PROVIDED = 'buff_provided',
  RALLY_ATTENDANCE = 'rally_attendance',

  // Leadership contributions
  WAR_DECLARATION = 'war_declaration',
  STRATEGY_CALL = 'strategy_call',
}

/**
 * Individual contribution record (immutable log entry)
 */
export interface IContributionRecord {
  contributionId: string;
  warId: string;
  gangId: string;
  characterId: string;
  characterName: string;
  type: WarContributionType;
  category: WarContributionCategory;
  points: number;
  rawValue?: number;  // e.g., gold amount, damage dealt
  timestamp: Date;
  context?: Record<string, unknown>;  // e.g., { raidId, zoneId }
}

/**
 * Aggregated stats for a character in a specific war
 */
export interface IWarContributionStats {
  warId: string;
  gangId: string;
  characterId: string;
  characterName: string;

  // Per-category totals
  combatPoints: number;
  raidPoints: number;
  territoryPoints: number;
  resourcePoints: number;
  supportPoints: number;
  leadershipPoints: number;

  // Aggregate totals
  totalPoints: number;
  rank: number;

  // Efficiency metrics
  actionsCount: number;
  winsCount: number;
  lossesCount: number;
  winRate: number;
  pointsPerAction: number;

  // Category diversity (for bonus calculation)
  activeCategories: WarContributionCategory[];
  diversityBonus: number;
}

/**
 * Lifetime career stats for a character (one per character)
 */
export interface ICharacterWarCareer {
  characterId: string;
  characterName: string;

  // Lifetime stats
  totalWars: number;
  totalPoints: number;
  totalMVPs: number;
  top3Finishes: number;
  top10Finishes: number;

  // Category breakdowns
  lifetimeCombatPoints: number;
  lifetimeRaidPoints: number;
  lifetimeTerritoryPoints: number;
  lifetimeResourcePoints: number;
  lifetimeSupportPoints: number;
  lifetimeLeadershipPoints: number;

  // Records
  bestSingleWarPoints: number;
  bestSingleWarId?: string;
  longestMVPStreak: number;
  currentMVPStreak: number;

  // Titles earned
  titles: string[];
}

/**
 * Leaderboard entry for war rankings
 */
export interface IWarLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  gangId: string;
  gangName: string;
  totalPoints: number;
  topCategory: WarContributionCategory;
  topCategoryPoints: number;
  isCurrentMVP: boolean;
}

/**
 * MVP calculation result at war end
 */
export interface IWarMVPResult {
  mvpCharacterId: string;
  mvpCharacterName: string;
  mvpScore: number;
  top3: IWarLeaderboardEntry[];
  top10: IWarLeaderboardEntry[];
  categoryMVPs: Record<WarContributionCategory, {
    characterId: string;
    characterName: string;
    points: number;
  }>;
}

/**
 * DTO for contribution updates (sent via Socket.IO)
 */
export interface IContributionUpdateDTO {
  warId: string;
  gangId: string;
  characterId: string;
  characterName: string;
  type: WarContributionType;
  points: number;
  newTotal: number;
  newRank: number;
}

/**
 * DTO for leaderboard updates (sent via Socket.IO)
 */
export interface ILeaderboardUpdateDTO {
  warId: string;
  top10: IWarLeaderboardEntry[];
  timestamp: Date;
}

/**
 * DTO for MVP change events (sent via Socket.IO)
 */
export interface IMVPChangeDTO {
  warId: string;
  previousMVP?: {
    characterId: string;
    characterName: string;
    points: number;
  };
  newMVP: {
    characterId: string;
    characterName: string;
    points: number;
  };
  timestamp: Date;
}

/**
 * Socket.IO event names for war contribution updates
 */
export enum WarContributionSocketEvent {
  CONTRIBUTION_RECORDED = 'war:contribution',
  LEADERBOARD_UPDATE = 'war:leaderboard_update',
  MVP_CHANGE = 'war:mvp_change',
  RANK_CHANGE = 'war:rank_change',
}

/**
 * Mapping from WarContributionType to WarContributionCategory
 */
export const WAR_CONTRIBUTION_TYPE_TO_CATEGORY: Record<WarContributionType, WarContributionCategory> = {
  [WarContributionType.DECK_GAME_WIN]: WarContributionCategory.COMBAT,
  [WarContributionType.DECK_GAME_LOSS]: WarContributionCategory.COMBAT,
  [WarContributionType.CHAMPION_DUEL_WIN]: WarContributionCategory.COMBAT,
  [WarContributionType.LEADER_SHOWDOWN_WIN]: WarContributionCategory.COMBAT,
  [WarContributionType.DAMAGE_DEALT]: WarContributionCategory.COMBAT,

  [WarContributionType.RAID_PARTICIPATED]: WarContributionCategory.RAIDS,
  [WarContributionType.RAID_LED]: WarContributionCategory.RAIDS,
  [WarContributionType.RAID_DEFENDED]: WarContributionCategory.RAIDS,
  [WarContributionType.PROPERTY_DAMAGED]: WarContributionCategory.RAIDS,

  [WarContributionType.ZONE_CAPTURE]: WarContributionCategory.TERRITORY,
  [WarContributionType.ZONE_DEFENSE]: WarContributionCategory.TERRITORY,
  [WarContributionType.INFLUENCE_GAINED]: WarContributionCategory.TERRITORY,

  [WarContributionType.GOLD_CONTRIBUTED]: WarContributionCategory.RESOURCES,
  [WarContributionType.SUPPLIES_DELIVERED]: WarContributionCategory.RESOURCES,

  [WarContributionType.BUFF_PROVIDED]: WarContributionCategory.SUPPORT,
  [WarContributionType.RALLY_ATTENDANCE]: WarContributionCategory.SUPPORT,

  [WarContributionType.WAR_DECLARATION]: WarContributionCategory.LEADERSHIP,
  [WarContributionType.STRATEGY_CALL]: WarContributionCategory.LEADERSHIP,
};
