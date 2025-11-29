/**
 * Faction War Types
 *
 * Large-scale faction conflict events with dynamic objectives
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import { TerritoryFactionId } from './territoryWar.types';

/**
 * War event types by scale
 */
export enum WarEventType {
  SKIRMISH = 'SKIRMISH',
  BATTLE = 'BATTLE',
  CAMPAIGN = 'CAMPAIGN',
  WAR = 'WAR',
}

/**
 * War event phases
 */
export enum WarPhase {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  MOBILIZATION = 'MOBILIZATION',
  ACTIVE_COMBAT = 'ACTIVE_COMBAT',
  RESOLUTION = 'RESOLUTION',
}

/**
 * War event status
 */
export enum WarEventStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * War objective types
 */
export enum WarObjectiveType {
  // Combat objectives
  KILL_NPCS = 'KILL_NPCS',
  WIN_DUELS = 'WIN_DUELS',
  DEFEND_LOCATION = 'DEFEND_LOCATION',
  ESCORT_CONVOY = 'ESCORT_CONVOY',
  ASSASSINATE_COMMANDER = 'ASSASSINATE_COMMANDER',
  ELIMINATE_SQUAD = 'ELIMINATE_SQUAD',
  BREAK_SIEGE = 'BREAK_SIEGE',

  // Strategic objectives
  CAPTURE_POINT = 'CAPTURE_POINT',
  DESTROY_SUPPLIES = 'DESTROY_SUPPLIES',
  CUT_COMMUNICATIONS = 'CUT_COMMUNICATIONS',
  SABOTAGE_EQUIPMENT = 'SABOTAGE_EQUIPMENT',
  PLANT_FLAG = 'PLANT_FLAG',
  SECURE_BRIDGE = 'SECURE_BRIDGE',
  INFILTRATE_BASE = 'INFILTRATE_BASE',

  // Support objectives
  HEAL_ALLIES = 'HEAL_ALLIES',
  DELIVER_SUPPLIES = 'DELIVER_SUPPLIES',
  SCOUT_POSITIONS = 'SCOUT_POSITIONS',
  SPREAD_PROPAGANDA = 'SPREAD_PROPAGANDA',
  RECRUIT_NPCS = 'RECRUIT_NPCS',
  FORTIFY_POSITION = 'FORTIFY_POSITION',
  RALLY_TROOPS = 'RALLY_TROOPS',
}

/**
 * Objective priority
 */
export enum ObjectivePriority {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  BONUS = 'bonus',
}

/**
 * Participant contribution category
 */
export enum ContributionType {
  COMBAT = 'combat',
  STRATEGIC = 'strategic',
  SUPPORT = 'support',
  LEADERSHIP = 'leadership',
}

/**
 * War reward types
 */
export enum WarRewardType {
  GOLD = 'gold',
  XP = 'xp',
  REPUTATION = 'reputation',
  ITEM = 'item',
  TITLE = 'title',
  COSMETIC = 'cosmetic',
  INFLUENCE = 'influence',
}

/**
 * Single war objective
 */
export interface WarObjective {
  id: string;
  type: WarObjectiveType;
  priority: ObjectivePriority;
  name: string;
  description: string;

  // Progress tracking
  target: number;
  current: number;
  completed: boolean;
  completedBy?: TerritoryFactionId;
  completedAt?: Date;

  // Scoring
  pointsPerProgress: number;
  completionBonus: number;

  // Constraints
  timeLimit?: number; // minutes
  locationRequired?: string;
  minLevel?: number;
  requiredSkills?: string[];

  // Status
  startedAt?: Date;
  expiresAt?: Date;
}

/**
 * War participant record
 */
export interface WarParticipant {
  characterId: string;
  characterName: string;
  gangId?: string;
  gangName?: string;

  // Alignment
  side: TerritoryFactionId;
  joinedAt: Date;

  // Contributions
  objectivesCompleted: string[];
  killCount: number;
  duelWins: number;
  supportActions: number;
  totalScore: number;

  // Performance by category
  contributionBreakdown: {
    [ContributionType.COMBAT]: number;
    [ContributionType.STRATEGIC]: number;
    [ContributionType.SUPPORT]: number;
    [ContributionType.LEADERSHIP]: number;
  };

  // Rewards earned
  rewardsEarned: WarReward[];
  mvpCandidate: boolean;
}

/**
 * War reward definition
 */
export interface WarReward {
  type: WarRewardType;
  amount?: number;
  itemId?: string;
  itemName?: string;
  title?: string;
  cosmeticId?: string;
  description: string;
}

/**
 * Faction War Event
 */
export interface FactionWarEvent {
  _id: string;
  eventType: WarEventType;
  name: string;
  description: string;
  lore: string;

  // Factions
  attackingFaction: TerritoryFactionId;
  defendingFaction: TerritoryFactionId;
  alliedFactions: Map<TerritoryFactionId, 'attacker' | 'defender'>;

  // Territory
  targetTerritory: string;
  adjacentTerritories: string[];

  // Timing
  announcedAt: Date;
  startsAt: Date;
  endsAt: Date;
  currentPhase: WarPhase;

  // Objectives
  primaryObjectives: WarObjective[];
  secondaryObjectives: WarObjective[];
  bonusObjectives: WarObjective[];

  // Scores
  attackerScore: number;
  defenderScore: number;
  objectivesCompleted: Map<string, TerritoryFactionId>;

  // Participants
  attackerParticipants: WarParticipant[];
  defenderParticipants: WarParticipant[];
  totalParticipants: number;

  // Rewards
  victoryRewards: WarReward[];
  participationRewards: WarReward[];
  mvpRewards: WarReward[];

  // Results
  status: WarEventStatus;
  winner?: TerritoryFactionId;
  influenceChange?: number;
  casualties: {
    attacker: number;
    defender: number;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * War event template
 */
export interface WarEventTemplate {
  id: string;
  eventType: WarEventType;
  name: string;
  description: string;
  lore: string;

  // Timing configuration
  durationHours: number;
  announcementHours: number;
  mobilizationHours: number;

  // Requirements
  minParticipants: number;
  maxParticipants: number;
  minLevel: number;

  // Territory
  territoryTypes: string[];

  // Objectives configuration
  primaryObjectiveCount: number;
  secondaryObjectiveCount: number;
  bonusObjectiveCount: number;

  // Rewards multipliers
  victoryGoldMultiplier: number;
  victoryXpMultiplier: number;
  participationGoldBase: number;
  participationXpBase: number;
  mvpBonusMultiplier: number;

  // Influence effects
  victoryInfluenceGain: number;
  defeatInfluenceLoss: number;

  // Frequency
  cooldownHours: number;
  spawnChance: number;
}

/**
 * War objective template
 */
export interface WarObjectiveTemplate {
  id: string;
  type: WarObjectiveType;
  priority: ObjectivePriority;
  name: string;
  description: string;

  // Default values
  defaultTarget: number;
  defaultPoints: number;
  defaultBonus: number;

  // Constraints
  timeLimit?: number;
  minLevel?: number;
  requiredSkills?: string[];

  // Scaling
  scaleWithParticipants: boolean;
  scaleWithEventType: boolean;
}

/**
 * War participation eligibility
 */
export interface WarEligibility {
  eligible: boolean;
  reason?: string;
  minimumLevel?: number;
  requiredFaction?: TerritoryFactionId;
  signupDeadline?: Date;
}

/**
 * War leaderboard entry
 */
export interface WarLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  gangName?: string;
  side: TerritoryFactionId;
  score: number;
  killCount: number;
  objectivesCompleted: number;
  mvp: boolean;
}

/**
 * Faction War statistics
 */
export interface FactionWarStatistics {
  eventId: string;
  eventName: string;
  eventType: WarEventType;

  // Participation
  totalParticipants: number;
  attackerCount: number;
  defenderCount: number;

  // Scores
  attackerScore: number;
  defenderScore: number;

  // Objectives
  totalObjectives: number;
  completedObjectives: number;
  attackerObjectives: number;
  defenderObjectives: number;

  // Combat
  totalKills: number;
  totalDuels: number;

  // Top performers
  topAttacker?: WarLeaderboardEntry;
  topDefender?: WarLeaderboardEntry;
  overallMVP?: WarLeaderboardEntry;
}

/**
 * War event summary (for history)
 */
export interface WarEventSummary {
  eventId: string;
  eventName: string;
  eventType: WarEventType;
  attackingFaction: TerritoryFactionId;
  defendingFaction: TerritoryFactionId;
  targetTerritory: string;
  winner?: TerritoryFactionId;
  startedAt: Date;
  endedAt: Date;
  totalParticipants: number;
  influenceChange: number;
}

/**
 * War event notification
 */
export interface WarEventNotification {
  eventId: string;
  notificationType: 'announcement' | 'starting' | 'phase_change' | 'objective_complete' | 'ending' | 'completed';
  message: string;
  timestamp: Date;
  targetFactions?: TerritoryFactionId[];
}

/**
 * War contribution result
 */
export interface WarContributionResult {
  objectiveId: string;
  objectiveName: string;
  contributionType: ContributionType;
  pointsEarned: number;
  progress: number;
  objectiveCompleted: boolean;
  message: string;
}

/**
 * Configuration constants
 */
export const WAR_EVENT_CONFIG = {
  SKIRMISH: {
    MIN_PARTICIPANTS: 5,
    MAX_PARTICIPANTS: 20,
    DURATION_HOURS_MIN: 2,
    DURATION_HOURS_MAX: 6,
    INFLUENCE_STAKE: 0.075, // 5-10%
    FREQUENCY: 'daily',
  },
  BATTLE: {
    MIN_PARTICIPANTS: 20,
    MAX_PARTICIPANTS: 50,
    DURATION_HOURS_MIN: 12,
    DURATION_HOURS_MAX: 24,
    INFLUENCE_STAKE: 0.15, // 10-20%
    FREQUENCY: '2-3 per week',
  },
  CAMPAIGN: {
    MIN_PARTICIPANTS: 50,
    MAX_PARTICIPANTS: 200,
    DURATION_HOURS_MIN: 72,
    DURATION_HOURS_MAX: 168,
    INFLUENCE_STAKE: 0.3, // 20-40%
    FREQUENCY: '1-2 per month',
  },
  WAR: {
    MIN_PARTICIPANTS: 100,
    MAX_PARTICIPANTS: 1000,
    DURATION_HOURS_MIN: 168,
    DURATION_HOURS_MAX: 336,
    INFLUENCE_STAKE: 0.5, // 30-60%
    FREQUENCY: 'quarterly',
  },
} as const;

export const WAR_PHASE_DURATIONS = {
  ANNOUNCEMENT_HOURS: 24,
  MOBILIZATION_HOURS: 2,
} as const;

export const FACTION_WAR_SCORING = {
  OBJECTIVE_PRIMARY_MULTIPLIER: 3,
  OBJECTIVE_SECONDARY_MULTIPLIER: 2,
  OBJECTIVE_BONUS_MULTIPLIER: 1.5,
  KILL_POINTS: 10,
  DUEL_WIN_POINTS: 25,
  SUPPORT_ACTION_POINTS: 5,
  MVP_TOP_PERCENTAGE: 0.05, // Top 5%
} as const;

export const WAR_REWARDS = {
  BASE_GOLD_VICTORY: 500,
  BASE_XP_VICTORY: 1000,
  BASE_GOLD_PARTICIPATION: 100,
  BASE_XP_PARTICIPATION: 250,
  MVP_MULTIPLIER: 3,
} as const;
