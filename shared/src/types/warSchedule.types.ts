/**
 * War Schedule System Types
 *
 * Phase 2.1: Weekly War Schedule with Hybrid Matching
 *
 * Transforms 24-hour war cycles into weekly schedule with:
 * - Declaration window: Mon-Thu
 * - Resolution window: Fri-Sun
 * - Auto-tournament brackets for unmatched gangs
 * - War leagues/tiers based on gang power
 * - Season tracking with rewards
 */

// =============================================================================
// WAR PHASE STATE MACHINE
// =============================================================================

/**
 * Weekly war phase in the schedule cycle
 * (Named WeeklyWarPhase to avoid conflict with WarPhase in factionWar.types.ts)
 *
 * State Machine:
 * DECLARATION (Mon 00:00 - Thu 23:59 UTC)
 *     ↓ Thu 23:59
 * PREPARATION (Bracket generation)
 *     ↓ Fri 00:00
 * ACTIVE (Fri 00:00 - Sun 23:59 UTC)
 *     ↓ Sun 23:59
 * RESOLUTION (Auto-resolve remaining)
 *     ↓ Immediate
 * COOLDOWN (Per-gang 7 days)
 */
export enum WeeklyWarPhase {
  DECLARATION = 'declaration',    // Mon 00:00 - Thu 23:59 UTC - Gangs can declare wars
  PREPARATION = 'preparation',    // Thu 23:59 - Fri 00:00 UTC - Brief transition, bracket gen
  ACTIVE = 'active',              // Fri 00:00 - Sun 23:59 UTC - Wars are active
  RESOLUTION = 'resolution',      // Sun 23:59 UTC - Auto-resolve remaining wars
  COOLDOWN = 'cooldown',          // Post-war cooldown period (per-gang)
}

// Alias for backward compatibility
export { WeeklyWarPhase as WarSchedulePhaseType };

// =============================================================================
// WAR LEAGUE TIERS
// =============================================================================

/**
 * War league tier based on gang power rating
 */
export enum WarLeagueTier {
  BRONZE = 'bronze',       // Power rating <1000
  SILVER = 'silver',       // Power rating 1000-2499
  GOLD = 'gold',           // Power rating 2500-4999
  PLATINUM = 'platinum',   // Power rating 5000-7999
  DIAMOND = 'diamond',     // Power rating 8000+
}

/**
 * Tier threshold configuration
 */
export interface TierThreshold {
  tier: WarLeagueTier;
  minPowerRating: number;
  maxPowerRating: number;
  minMembers?: number;
  maxMembers?: number;
}

/**
 * Standard tier thresholds
 */
export const TIER_THRESHOLDS: TierThreshold[] = [
  { tier: WarLeagueTier.BRONZE, minPowerRating: 0, maxPowerRating: 999 },
  { tier: WarLeagueTier.SILVER, minPowerRating: 1000, maxPowerRating: 2499 },
  { tier: WarLeagueTier.GOLD, minPowerRating: 2500, maxPowerRating: 4999 },
  { tier: WarLeagueTier.PLATINUM, minPowerRating: 5000, maxPowerRating: 7999 },
  { tier: WarLeagueTier.DIAMOND, minPowerRating: 8000, maxPowerRating: Infinity },
];

// =============================================================================
// WAR SEASON
// =============================================================================

/**
 * Season phase
 */
export enum WarSeasonPhase {
  ACTIVE = 'active',              // Season is ongoing
  CALCULATING = 'calculating',    // Final standings being calculated
  CONCLUDED = 'concluded',        // Season ended, rewards distributed
}

/**
 * Season reward definition
 */
export interface WarSeasonReward {
  tier: WarLeagueTier;
  placement: number;              // 1st, 2nd, 3rd, etc.
  goldReward: number;
  reputationReward: number;
  titleReward?: string;           // Special title for winners
  territoryBonuses?: number;      // Bonus territory influence
}

/**
 * Gang standing in a season tier
 */
export interface SeasonTierStanding {
  gangId: string;
  gangName: string;
  gangTag: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;                 // Win=3, Draw=1, Loss=0
  territoriesGained: number;
  territoriesLost: number;
  totalScore: number;             // Combined war scores
}

/**
 * Tier standings collection
 */
export interface TierStandings {
  tier: WarLeagueTier;
  rankings: SeasonTierStanding[];
}

/**
 * War season summary
 */
export interface WarSeason {
  _id: string;
  seasonNumber: number;
  name: string;                   // "Season 1: The Frontier Wars"
  phase: WarSeasonPhase;
  startDate: Date;
  endDate: Date;
  weeksTotal: number;             // Typically 12-13 weeks
  currentWeek: number;
  tierStandings: TierStandings[];
  rewards: WarSeasonReward[];
  rewardsDistributed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// WAR WEEK SCHEDULE
// =============================================================================

/**
 * Auto-tournament match status
 */
export enum TournamentMatchStatus {
  PENDING = 'pending',            // Match not yet started
  ACTIVE = 'active',              // Match in progress
  COMPLETED = 'completed',        // Match finished
  BYE = 'bye',                    // No opponent (odd number of gangs)
}

/**
 * Tournament bracket match
 */
export interface TournamentMatch {
  matchId: string;
  round: number;                  // 1 = first round, 2 = semifinals, etc.
  position: number;               // Position in bracket
  gang1Id?: string;
  gang1Name?: string;
  gang2Id?: string;
  gang2Name?: string;
  winnerId?: string;
  warId?: string;                 // Reference to GangWar document
  status: TournamentMatchStatus;
}

/**
 * Auto-tournament bracket for a tier
 */
export interface TournamentBracket {
  tier: WarLeagueTier;
  matches: TournamentMatch[];
  totalRounds: number;
  currentRound: number;
}

/**
 * Gang registered for auto-tournament
 */
export interface AutoTournamentParticipant {
  gangId: string;
  gangName: string;
  gangTag: string;
  tier: WarLeagueTier;
  powerRating: number;
  optedIn: boolean;
  registeredAt: Date;
}

/**
 * Auto-tournament configuration
 */
export interface AutoTournamentConfig {
  enabled: boolean;
  bracketGenerated: boolean;
  participatingGangs: AutoTournamentParticipant[];
  brackets: TournamentBracket[];
}

/**
 * Weekly war schedule
 */
export interface WarWeekSchedule {
  _id: string;
  seasonId: string;
  weekNumber: number;
  phase: WeeklyWarPhase;

  // Time windows
  declarationWindowStart: Date;
  declarationWindowEnd: Date;
  resolutionWindowStart: Date;
  resolutionWindowEnd: Date;

  // War tracking
  declaredWars: string[];         // GangWar IDs declared this week
  activeWars: string[];           // Currently active GangWar IDs
  resolvedWars: string[];         // Resolved this week

  // Auto-tournament
  autoTournament: AutoTournamentConfig;

  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// GANG POWER RATING
// =============================================================================

/**
 * Components that make up a gang's power rating
 */
export interface PowerRatingComponents {
  memberScore: number;            // members * 50
  levelScore: number;             // gangLevel * 100
  avgMemberLevelScore: number;    // avgMemberLevel * 10
  territoryScore: number;         // territories * 200
  wealthScore: number;            // min(bank/100, 500)
  upgradeScore: number;           // upgrades * 25
  winRateBonus: number;           // -100 to +200 based on war history
}

/**
 * Cached gang power rating
 */
export interface GangPowerRating {
  _id: string;
  gangId: string;
  gangName: string;

  // Power components
  memberCount: number;
  averageMemberLevel: number;
  gangLevel: number;
  territoriesControlled: number;
  bankBalance: number;
  upgradeCount: number;

  // Calculated
  components: PowerRatingComponents;
  powerRating: number;            // Total power score
  tier: WarLeagueTier;

  // Historical performance (affects rating)
  seasonWins: number;
  seasonLosses: number;
  winStreak: number;

  // Cache management
  calculatedAt: Date;
  validUntil: Date;               // Recalculate after this time
}

// =============================================================================
// SCHEDULE CONFIGURATION
// =============================================================================

/**
 * War schedule configuration
 */
export interface WarScheduleConfig {
  declarationDays: number[];      // [1,2,3,4] = Mon-Thu (day of week, 0=Sun)
  resolutionDays: number[];       // [5,6,0] = Fri-Sun
  declarationStartHour: number;   // UTC hour (0-23)
  resolutionStartHour: number;    // UTC hour (0-23)
  cooldownDays: number;           // Days before gang can declare again
  maxWarsPerWeek: number;         // Max wars a gang can participate in
}

/**
 * Default schedule configuration
 */
export const WAR_SCHEDULE_CONFIG: WarScheduleConfig = {
  declarationDays: [1, 2, 3, 4],  // Monday through Thursday
  resolutionDays: [5, 6, 0],      // Friday, Saturday, Sunday
  declarationStartHour: 0,        // 00:00 UTC
  resolutionStartHour: 0,         // 00:00 UTC
  cooldownDays: 7,
  maxWarsPerWeek: 2,
};

// =============================================================================
// POWER RATING CALCULATION CONSTANTS
// =============================================================================

/**
 * Power rating calculation weights
 */
export const POWER_RATING_WEIGHTS = {
  MEMBER_WEIGHT: 50,              // Points per member
  GANG_LEVEL_WEIGHT: 100,         // Points per gang level
  AVG_MEMBER_LEVEL_WEIGHT: 10,    // Points per average member level
  TERRITORY_WEIGHT: 200,          // Points per territory
  WEALTH_DIVISOR: 100,            // Divide bank by this
  WEALTH_CAP: 500,                // Max wealth score
  UPGRADE_WEIGHT: 25,             // Points per upgrade level
  WIN_RATE_MIN_BONUS: -100,       // Minimum win rate bonus
  WIN_RATE_MAX_BONUS: 200,        // Maximum win rate bonus
} as const;

/**
 * Win rate bonus calculation thresholds
 */
export const WIN_RATE_BONUS_THRESHOLDS = {
  EXCEPTIONAL: { rate: 0.8, bonus: 200 },   // 80%+ win rate
  GOOD: { rate: 0.6, bonus: 100 },          // 60-79% win rate
  AVERAGE: { rate: 0.4, bonus: 0 },         // 40-59% win rate
  POOR: { rate: 0.2, bonus: -50 },          // 20-39% win rate
  TERRIBLE: { rate: 0, bonus: -100 },       // <20% win rate
} as const;

// =============================================================================
// SEASON CONFIGURATION
// =============================================================================

/**
 * Season configuration
 */
export const SEASON_CONFIG = {
  DEFAULT_WEEKS: 12,              // 3 months
  MIN_WEEKS: 8,
  MAX_WEEKS: 16,
  WIN_POINTS: 3,
  DRAW_POINTS: 1,
  LOSS_POINTS: 0,
} as const;

/**
 * Default season rewards by tier and placement
 */
export const DEFAULT_SEASON_REWARDS: WarSeasonReward[] = [
  // Diamond tier
  { tier: WarLeagueTier.DIAMOND, placement: 1, goldReward: 50000, reputationReward: 1000, titleReward: 'Diamond Champion' },
  { tier: WarLeagueTier.DIAMOND, placement: 2, goldReward: 30000, reputationReward: 750 },
  { tier: WarLeagueTier.DIAMOND, placement: 3, goldReward: 20000, reputationReward: 500 },

  // Platinum tier
  { tier: WarLeagueTier.PLATINUM, placement: 1, goldReward: 30000, reputationReward: 800, titleReward: 'Platinum Champion' },
  { tier: WarLeagueTier.PLATINUM, placement: 2, goldReward: 18000, reputationReward: 600 },
  { tier: WarLeagueTier.PLATINUM, placement: 3, goldReward: 12000, reputationReward: 400 },

  // Gold tier
  { tier: WarLeagueTier.GOLD, placement: 1, goldReward: 20000, reputationReward: 600, titleReward: 'Gold Champion' },
  { tier: WarLeagueTier.GOLD, placement: 2, goldReward: 12000, reputationReward: 450 },
  { tier: WarLeagueTier.GOLD, placement: 3, goldReward: 8000, reputationReward: 300 },

  // Silver tier
  { tier: WarLeagueTier.SILVER, placement: 1, goldReward: 10000, reputationReward: 400, titleReward: 'Silver Champion' },
  { tier: WarLeagueTier.SILVER, placement: 2, goldReward: 6000, reputationReward: 300 },
  { tier: WarLeagueTier.SILVER, placement: 3, goldReward: 4000, reputationReward: 200 },

  // Bronze tier
  { tier: WarLeagueTier.BRONZE, placement: 1, goldReward: 5000, reputationReward: 200, titleReward: 'Bronze Champion' },
  { tier: WarLeagueTier.BRONZE, placement: 2, goldReward: 3000, reputationReward: 150 },
  { tier: WarLeagueTier.BRONZE, placement: 3, goldReward: 2000, reputationReward: 100 },
];

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Get current war phase response
 */
export interface GetWarPhaseResponse {
  currentPhase: WeeklyWarPhase;
  currentWeek: number;
  seasonNumber: number;
  declarationWindowStart: Date;
  declarationWindowEnd: Date;
  resolutionWindowStart: Date;
  resolutionWindowEnd: Date;
  canDeclareWar: boolean;
  isResolutionActive: boolean;
  nextPhaseAt: Date;
  timeUntilNextPhase: number;     // Milliseconds
}

/**
 * Opt in/out of auto-tournament request
 */
export interface AutoTournamentOptRequest {
  optIn: boolean;
}

/**
 * Get eligible opponents response
 */
export interface EligibleOpponentResponse {
  gangId: string;
  gangName: string;
  gangTag: string;
  tier: WarLeagueTier;
  powerRating: number;
  memberCount: number;
  seasonRecord: {
    wins: number;
    losses: number;
  };
  lastWarDate?: Date;
}

/**
 * Get season leaderboard request
 */
export interface SeasonLeaderboardRequest {
  tier?: WarLeagueTier;
  limit?: number;
  offset?: number;
}

/**
 * Get tournament bracket response
 */
export interface TournamentBracketResponse {
  weekNumber: number;
  brackets: TournamentBracket[];
  myMatches: TournamentMatch[];   // Matches involving requesting gang
}

// =============================================================================
// AUTO-TOURNAMENT CONFIGURATION
// =============================================================================

/**
 * Auto-tournament configuration constants
 */
export const AUTO_TOURNAMENT = {
  DEFAULT_FUNDING: 500,           // Default war funding for tournament matches
  CAPTURE_POINTS: 100,            // Starting capture points for tournament wars
  MIN_PARTICIPANTS_PER_TIER: 2,   // Minimum participants needed per tier
  MAX_PARTICIPANTS_PER_TIER: 64,  // Maximum participants per tier
} as const;
