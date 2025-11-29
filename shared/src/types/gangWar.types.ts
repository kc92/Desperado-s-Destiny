/**
 * Gang War System Types
 *
 * Comprehensive types for organized gang warfare system
 */

/**
 * War type determines objectives and victory conditions
 */
export enum GangWarType {
  TERRITORY = 'territory',    // Fight for specific territory control
  TOTAL = 'total',            // All-out war for dominance
  RAID = 'raid',              // Quick strike for resources only
}

/**
 * War status through its lifecycle
 */
export enum GangWarStatus {
  DECLARED = 'declared',      // War has been declared, not yet active
  PREPARATION = 'preparation', // 24-hour preparation period
  ACTIVE = 'active',          // War is ongoing
  RESOLVED = 'resolved',      // War has ended
  CANCELLED = 'cancelled',    // War was cancelled before starting
}

/**
 * War mission types
 */
export enum WarMissionType {
  // Attack missions
  RAID_BASE = 'raid_base',
  ASSASSINATE_OFFICER = 'assassinate_officer',
  SABOTAGE = 'sabotage',
  TERRITORY_ASSAULT = 'territory_assault',

  // Defense missions
  PATROL = 'patrol',
  GUARD_BASE = 'guard_base',
  ESCORT = 'escort',
  COUNTER_ATTACK = 'counter_attack',

  // Special missions
  CAPTURE_MEMBER = 'capture_member',
  STEAL_PLANS = 'steal_plans',
  BRIBE_DEFECTION = 'bribe_defection',
  BLOCKADE = 'blockade',
}

/**
 * Mission status
 */
export enum WarMissionStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/**
 * Battle outcome
 */
export enum WarBattleOutcome {
  ATTACKER_VICTORY = 'attacker_victory',
  DEFENDER_VICTORY = 'defender_victory',
  DRAW = 'draw',
}

/**
 * War outcome for final resolution
 */
export enum WarOutcome {
  ATTACKER_VICTORY = 'attacker_victory',
  DEFENDER_VICTORY = 'defender_victory',
  ATTACKER_SURRENDER = 'attacker_surrender',
  DEFENDER_SURRENDER = 'defender_surrender',
  DRAW = 'draw',
}

/**
 * War mission definition
 */
export interface WarMission {
  id: string;
  type: WarMissionType;
  assignedTo: string;           // Gang ID that can complete this mission
  targetType: string;            // What is being targeted
  status: WarMissionStatus;
  reward: {
    points: number;
    gold?: number;
  };
  progress?: number;             // 0-100 for tracking mission progress
  assignedCharacters?: string[]; // Character IDs assigned to mission
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
}

/**
 * War battle record
 */
export interface WarBattle {
  id: string;
  zoneId: string;               // Which territory/zone the battle occurred in
  attackers: string[];          // Character IDs on attacking side
  defenders: string[];          // Character IDs on defending side
  outcome: WarBattleOutcome;
  pointsAwarded: {
    attacker: number;
    defender: number;
  };
  casualties: string[];         // Character IDs who were killed
  damageDealt: {
    attacker: number;
    defender: number;
  };
  occurredAt: Date;
}

/**
 * War casualty record
 */
export interface WarCasualty {
  characterId: string;
  characterName: string;
  gangId: string;
  killedBy?: string;            // Character ID who killed them
  occurredAt: Date;
  pointsLost: number;
}

/**
 * War prisoner record
 */
export interface WarPrisoner {
  characterId: string;
  characterName: string;
  capturedBy: string;           // Gang ID
  capturedAt: Date;
  ransomAmount: number;
  released: boolean;
  releasedAt?: Date;
}

/**
 * Alliance record
 */
export interface WarAlliance {
  attackerAllies: string[];     // Gang IDs allied with attacker
  defenderAllies: string[];     // Gang IDs allied with defender
}

/**
 * War chest (funding) record
 */
export interface WarChest {
  attacker: number;
  defender: number;
}

/**
 * Complete gang war document
 */
export interface GangWar {
  _id: string;
  attackerGangId: string;
  attackerGangName: string;
  attackerGangTag: string;
  defenderGangId: string;
  defenderGangName: string;
  defenderGangTag: string;

  warType: GangWarType;
  status: GangWarStatus;

  declaredAt: Date;
  startsAt: Date;               // When preparation ends and war begins
  endsAt?: Date;                // When war ended
  maxDuration: number;          // Maximum war duration in days (3-7)

  targetScore: number;          // Score needed to win
  attackerScore: number;
  defenderScore: number;

  contestedZones: string[];     // Territory IDs being fought over

  warChest: WarChest;

  missions: WarMission[];
  battles: WarBattle[];
  casualties: WarCasualty[];
  prisoners: WarPrisoner[];

  allies: WarAlliance;

  outcome?: WarOutcome;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * War declaration request
 */
export interface DeclareGangWarRequest {
  defenderGangId: string;
  warType: GangWarType;
  initialFunding: number;       // 500-5000 gold
  contestedZones?: string[];    // Required for territory wars
  maxDuration?: number;         // 3-7 days, default 5
}

/**
 * Accept war mission request
 */
export interface AcceptWarMissionRequest {
  missionId: string;
  characterIds?: string[];      // Characters assigned to mission
}

/**
 * Complete war mission request
 */
export interface CompleteWarMissionRequest {
  missionId: string;
  success: boolean;
  notes?: string;
}

/**
 * Record battle request
 */
export interface RecordWarBattleRequest {
  zoneId: string;
  attackers: string[];
  defenders: string[];
  outcome: WarBattleOutcome;
  casualties?: string[];
  damageDealt?: {
    attacker: number;
    defender: number;
  };
}

/**
 * Raid enemy base request
 */
export interface RaidBaseRequest {
  attackers: string[];          // Minimum 3 characters required
}

/**
 * Surrender war request
 */
export interface SurrenderWarRequest {
  confirmed: boolean;
}

/**
 * War score breakdown
 */
export interface WarScoreBreakdown {
  kills: { count: number; points: number };
  zoneBattles: { won: number; points: number };
  missionsCompleted: { count: number; points: number };
  territoriesCaptured: { count: number; points: number };
  territoriesDefended: { count: number; points: number };
  suppliesCaptured: { count: number; points: number };
  total: number;
}

/**
 * War statistics
 */
export interface WarStatistics {
  attackerStats: {
    score: number;
    scoreBreakdown: WarScoreBreakdown;
    totalMembers: number;
    activeMembersInWar: number;
    casualties: number;
    prisoners: number;
    missionsCompleted: number;
  };
  defenderStats: {
    score: number;
    scoreBreakdown: WarScoreBreakdown;
    totalMembers: number;
    activeMembersInWar: number;
    casualties: number;
    prisoners: number;
    missionsCompleted: number;
  };
  duration: number;             // Duration in hours
  battlesCount: number;
  totalDamageDealt: number;
}

/**
 * War spoils (rewards for victory)
 */
export interface WarSpoils {
  gold: number;                 // 50% of enemy war chest
  territories?: string[];       // Territories captured (territory wars)
  prisoners: string[];          // Prisoners released/ransomed
  reputation: number;           // +100 for win, -50 for loss
  territoryIncome?: number;     // Bonus income from captured territories
}

/**
 * War declaration cost calculation
 */
export const WAR_COSTS = {
  MIN_FUNDING: 500,
  MAX_FUNDING: 5000,
  BASE_COST: 1000,
  PER_MEMBER_COST: 100,
} as const;

/**
 * War requirements
 */
export const WAR_REQUIREMENTS = {
  MIN_GANG_MEMBERS: 5,
  PREPARATION_HOURS: 24,
  MIN_DURATION_DAYS: 3,
  MAX_DURATION_DAYS: 7,
  DEFAULT_DURATION_DAYS: 5,
  MAX_FLEE_ROUNDS: 3,
  BASE_RAID_MEMBERS: 3,
} as const;

/**
 * War scoring
 */
export const WAR_SCORING = {
  KILL_ENEMY_MEMBER: 10,
  WIN_ZONE_BATTLE: 50,
  COMPLETE_MISSION_MIN: 25,
  COMPLETE_MISSION_MAX: 100,
  CAPTURE_TERRITORY: 100,
  DEFEND_TERRITORY: 75,
  CAPTURE_SUPPLIES: 30,
  LOSE_MEMBER: -5,
  LOSE_ZONE_BATTLE: -25,
  FAIL_MISSION: -15,
  LOSE_TERRITORY: -50,
} as const;

/**
 * Victory conditions
 */
export const VICTORY_CONDITIONS = {
  SCORE_TARGETS: [500, 1000, 2000],
  DEFAULT_TARGET_SCORE: 1000,
} as const;

/**
 * War cooldown after defeat
 */
export const WAR_COOLDOWN_DAYS = 7;

/**
 * War chest split on victory
 */
export const WAR_SPOILS_PERCENTAGE = 0.5; // Winner gets 50% of loser's war chest
