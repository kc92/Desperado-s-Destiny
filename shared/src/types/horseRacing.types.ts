/**
 * Horse Racing System Types
 * Phase 13, Wave 13.2 - Horse Racing System
 *
 * Comprehensive horse racing with various race types, betting, and prestigious events
 */

import { ObjectId } from 'mongodb';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of horse races
 */
export enum RaceType {
  SPRINT = 'SPRINT',                      // Quarter mile, 15-30 seconds
  MIDDLE_DISTANCE = 'MIDDLE_DISTANCE',    // Half mile, 45-60 seconds
  LONG_DISTANCE = 'LONG_DISTANCE',        // Mile+, 2-3 minutes
  STEEPLECHASE = 'STEEPLECHASE',          // Obstacles, technical
  ENDURANCE = 'ENDURANCE',                // Cross-country, 10+ minutes
  CHARIOT = 'CHARIOT'                     // Wagon racing, team horses
}

/**
 * Track terrain types
 */
export enum RaceTrackTerrainType {
  DIRT = 'DIRT',
  GRASS = 'GRASS',
  SAND = 'SAND',
  MUD = 'MUD',
  ROCK = 'ROCK',
  MIXED = 'MIXED'
}

/**
 * Track conditions
 */
export enum TrackCondition {
  FAST = 'FAST',           // Ideal conditions
  GOOD = 'GOOD',           // Normal
  MUDDY = 'MUDDY',         // After rain
  HEAVY = 'HEAVY',         // Deep mud/sand
  FROZEN = 'FROZEN'        // Winter conditions
}

/**
 * Weather effects on racing
 */
export enum RacingWeatherCondition {
  CLEAR = 'CLEAR',
  OVERCAST = 'OVERCAST',
  LIGHT_RAIN = 'LIGHT_RAIN',
  HEAVY_RAIN = 'HEAVY_RAIN',
  WIND = 'WIND',
  DUST_STORM = 'DUST_STORM',
  SNOW = 'SNOW'
}

/**
 * Race status
 */
export enum RaceStatus {
  UPCOMING = 'UPCOMING',           // Registration open
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  POST_TIME = 'POST_TIME',         // Horses at starting line
  IN_PROGRESS = 'IN_PROGRESS',     // Race running
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  UNDER_REVIEW = 'UNDER_REVIEW'    // Investigating foul play
}

/**
 * Bet types for horse racing
 */
export enum RaceBetType {
  WIN = 'WIN',                    // Horse finishes 1st
  PLACE = 'PLACE',                // Horse finishes 1st or 2nd
  SHOW = 'SHOW',                  // Horse finishes 1st, 2nd, or 3rd
  EXACTA = 'EXACTA',              // Pick 1st and 2nd in order
  TRIFECTA = 'TRIFECTA',          // Pick 1st, 2nd, 3rd in order
  SUPERFECTA = 'SUPERFECTA',      // Pick 1st, 2nd, 3rd, 4th in order
  QUINELLA = 'QUINELLA',          // Pick 1st and 2nd in any order
  DAILY_DOUBLE = 'DAILY_DOUBLE',  // Win two consecutive races
  PICK_THREE = 'PICK_THREE',      // Win three consecutive races
  ACROSS_THE_BOARD = 'ACROSS_THE_BOARD' // Bet on win, place, and show
}

/**
 * Jockey position during race
 */
export enum RacePosition {
  FRONT_RUNNER = 'FRONT_RUNNER',     // Leading the pack
  STALKER = 'STALKER',               // Close behind leader
  MID_PACK = 'MID_PACK',             // Middle of the field
  CLOSER = 'CLOSER',                 // Saving energy for final push
  TRAILING = 'TRAILING'              // Behind the pack
}

/**
 * Race obstacle types
 */
export enum ObstacleType {
  FENCE = 'FENCE',
  WATER_JUMP = 'WATER_JUMP',
  DITCH = 'DITCH',
  WALL = 'WALL',
  COMBINATION = 'COMBINATION'
}

/**
 * Jockey skills
 */
export enum JockeySkill {
  PACE_JUDGMENT = 'PACE_JUDGMENT',       // Know when to push
  WHIP_MASTERY = 'WHIP_MASTERY',         // Speed boost effectiveness
  POSITIONING = 'POSITIONING',           // Navigate through pack
  RECOVERY = 'RECOVERY',                 // Handle stumbles
  TIMING = 'TIMING',                     // Perfect finish timing
  OBSTACLE_JUMPING = 'OBSTACLE_JUMPING', // For steeplechase
  ENDURANCE_PACING = 'ENDURANCE_PACING'  // Long distance strategy
}

/**
 * Racing incidents
 */
export enum RaceIncident {
  STUMBLE = 'STUMBLE',
  INTERFERENCE = 'INTERFERENCE',
  BREAK_EQUIPMENT = 'BREAK_EQUIPMENT',
  RIDER_FALL = 'RIDER_FALL',
  HORSE_SPOOKED = 'HORSE_SPOOKED',
  BLOCKED = 'BLOCKED',
  BUMPED = 'BUMPED',
  FALSE_START = 'FALSE_START'
}

/**
 * Silk color patterns
 */
export enum SilkPattern {
  SOLID = 'SOLID',
  STRIPED = 'STRIPED',
  CHECKERED = 'CHECKERED',
  QUARTERED = 'QUARTERED',
  DIAGONAL = 'DIAGONAL',
  SPOTTED = 'SPOTTED',
  CROSSED_SASHES = 'CROSSED_SASHES'
}

// ============================================================================
// RACE TRACK DEFINITIONS
// ============================================================================

/**
 * Race track definition
 */
export interface RaceTrack {
  id: string;
  name: string;
  location: string;
  description: string;
  prestige: number; // 1-10 rating

  // Track details
  primaryTerrain: RaceTrackTerrainType;
  trackLength: number; // Total circumference in yards

  // Available races
  availableRaceTypes: RaceType[];

  // Facilities
  facilities: {
    stables: number;
    grandstand: boolean;
    bettingBooth: boolean;
    vetServices: boolean;
    trainingGrounds: boolean;
  };

  // Race schedule
  raceFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextRaceTime?: Date;

  // Records
  speedRecord?: {
    horseId: ObjectId;
    horseName: string;
    time: number;
    date: Date;
    raceType: RaceType;
  };

  // Requirements
  minimumLevel?: number;
  reputationRequired?: number;
  factionRestriction?: string;
}

/**
 * Race obstacle definition
 */
export interface Obstacle {
  id: string;
  type: ObstacleType;
  name: string;
  difficulty: number; // 1-10
  position: number; // Position along track (yards)
  penaltyOnFailure: number; // Time penalty in seconds
  injuryRisk: number; // 0-100 chance of injury
}

// ============================================================================
// RACE ENTRY AND MANAGEMENT
// ============================================================================

/**
 * Racing silk colors
 */
export interface SilkColors {
  pattern: SilkPattern;
  primaryColor: string;
  secondaryColor: string;
  sleeves: string;
  cap: string;
}

/**
 * Race entry
 */
export interface RaceEntry {
  horseId: ObjectId;
  ownerId: ObjectId;

  // Jockey
  jockeyId?: ObjectId; // Player character ID if player riding
  jockeyNPC?: string; // NPC jockey name
  jockeySkillLevel: number;

  // Registration
  postPosition: number; // Starting gate position (1-12)
  weight: number; // Carried weight (affects performance)
  silks: SilkColors;

  // Status
  scratched: boolean;
  scratchReason?: string;

  // Odds
  morningLineOdds: number; // Initial odds
  currentOdds: number; // Live odds based on betting
  favoriteStatus: 'FAVORITE' | 'CONTENDER' | 'LONGSHOT';

  // Statistics
  recentForm: number[]; // Last 5 race positions
  trackRecord?: {
    starts: number;
    wins: number;
    places: number;
    shows: number;
  };
}

/**
 * Jockey information
 */
export interface JockeyInfo {
  id: ObjectId | string;
  name: string;
  isPlayer: boolean;

  // Skills
  skills: {
    skill: JockeySkill;
    level: number;
  }[];

  // Statistics
  careerStats: {
    races: number;
    wins: number;
    winPercentage: number;
    earnings: number;
  };

  // Preferences
  preferredStrategy: RacePosition;
  specialties: RaceType[];
}

// ============================================================================
// RACE DEFINITION
// ============================================================================

/**
 * Horse race event
 */
export interface HorseRace {
  _id: ObjectId;
  name: string;
  raceType: RaceType;
  prestige: number; // 1-10, affects rewards and reputation

  // Track
  trackId: string;
  distance: number; // In yards
  terrain: RaceTrackTerrainType[];
  obstacles: Obstacle[];

  // Entry requirements
  entryFee: number;
  minHorseLevel: number;
  maxHorseLevel?: number;
  breedRestrictions?: string[]; // Specific breeds only
  maxEntrants: number;
  registeredHorses: RaceEntry[];

  // Timing
  scheduledStart: Date;
  registrationDeadline: Date;
  postTime: Date; // Actual start time
  raceStatus: RaceStatus;

  // Conditions
  weather: RacingWeatherCondition;
  trackCondition: TrackCondition;
  temperature: number; // Affects horses

  // Prize structure
  purse: number;
  prizeDistribution: number[]; // [50%, 25%, 15%, 10%] etc
  bonusPrizes?: {
    trackRecord: number;
    perfectRun: number;
  };

  // Betting
  bettingPool: BettingPool;
  totalWagered: number;
  trackTakePercentage: number; // Usually 15-20%

  // Results (after completion)
  results?: RaceResult[];
  finalTime?: number;
  incidents?: RaceIncidentReport[];

  // Special event
  isSpecialEvent: boolean;
  specialEventId?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Betting pool for race
 */
export interface BettingPool {
  totalPool: number;

  // Pool by bet type
  winPool: Map<ObjectId, number>; // Horse ID -> amount wagered
  placePool: Map<ObjectId, number>;
  showPool: Map<ObjectId, number>;
  exactaPool: number;
  trifectaPool: number;
  quinellaPool: number;

  // Payouts (calculated after race)
  payouts?: Map<RaceBetType, number>;
}

/**
 * Race result
 */
export interface RaceResult {
  position: number;
  horseId: ObjectId;
  ownerId: ObjectId;
  jockeyId?: ObjectId;

  // Performance
  finalTime: number; // In seconds
  margins: number[]; // Lengths behind horse ahead
  topSpeed: number;
  avgSpeed: number;

  // Events during race
  incidents: RaceIncident[];
  positionChanges: number; // How many positions gained/lost

  // Rewards
  prizeMoney: number;
  experienceGained: number;
  reputationGained: number;

  // Special achievements
  trackRecord: boolean;
  perfectRun: boolean; // No incidents
}

/**
 * Race incident report
 */
export interface RaceIncidentReport {
  id: string;
  time: number; // Seconds into race
  type: RaceIncident;
  involvedHorses: ObjectId[];
  description: string;
  timeImpact: number; // Time penalty
  causesDQ: boolean;
  underReview: boolean;
}

// ============================================================================
// BETTING SYSTEM
// ============================================================================

/**
 * Race bet
 */
export interface RaceBet {
  _id: ObjectId;
  characterId: ObjectId;
  raceId: ObjectId;

  // Bet details
  betType: RaceBetType;
  amount: number;

  // Selections
  selections: ObjectId[]; // Horse IDs in order

  // Odds at time of bet
  odds: number;
  potentialPayout: number;

  // Result
  status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
  actualPayout?: number;

  // Timestamps
  placedAt: Date;
  settledAt?: Date;
}

/**
 * Betting slip (multiple bets)
 */
export interface BettingSlip {
  _id: ObjectId;
  characterId: ObjectId;

  bets: RaceBet[];
  totalAmount: number;
  potentialPayout: number;
  actualPayout: number;

  createdAt: Date;
}

/**
 * Odds calculation
 */
export interface OddsCalculation {
  horseId: ObjectId;

  // Factors
  horseStats: number;
  recentForm: number;
  jockeySkill: number;
  trackConditions: number;
  publicBetting: number;

  // Final odds
  calculatedOdds: number;
  publicOdds: number; // Displayed odds
  impliedProbability: number;
}

// ============================================================================
// RACE SIMULATION
// ============================================================================

/**
 * Race simulation state
 */
export interface RaceSimulation {
  raceId: ObjectId;

  // Horses in race
  horses: RaceHorseState[];

  // Track
  distance: number;
  terrain: RaceTrackTerrainType[];
  obstacles: Obstacle[];
  weather: RacingWeatherCondition;
  trackCondition: TrackCondition;

  // Progress
  currentTime: number;
  completed: boolean;

  // Events
  events: SimulationEvent[];
}

/**
 * Horse state during race
 */
export interface RaceHorseState {
  horseId: ObjectId;
  entryInfo: RaceEntry;

  // Position
  distanceCovered: number;
  currentPosition: number;
  currentLane: number;

  // Stats
  currentSpeed: number;
  currentStamina: number;
  currentMorale: number;

  // Strategy
  strategy: RacePosition;
  energyReserve: number;

  // Events
  incidents: RaceIncident[];
  timeLost: number;

  // Jockey actions
  whipUsed: number; // Times whip used
  lastAction?: {
    action: string;
    time: number;
  };
}

/**
 * Simulation event
 */
export interface SimulationEvent {
  time: number;
  type: 'START' | 'POSITION_CHANGE' | 'INCIDENT' | 'OBSTACLE' | 'FINAL_STRETCH' | 'FINISH';
  description: string;
  involvedHorses: ObjectId[];
  impact?: {
    horseId: ObjectId;
    speedChange?: number;
    staminaChange?: number;
    positionChange?: number;
  }[];
}

/**
 * Race performance calculation
 */
export interface PerformanceCalculation {
  horseId: ObjectId;

  // Base stats
  baseSpeed: number;
  baseStamina: number;
  baseAcceleration: number;

  // Modifiers
  terrainModifier: number;
  weatherModifier: number;
  weightModifier: number;
  jockeyModifier: number;
  equipmentModifier: number;
  moodModifier: number;

  // Final calculated stats
  effectiveSpeed: number;
  effectiveStamina: number;
  estimatedFinishTime: number;
  winProbability: number;
}

// ============================================================================
// PRESTIGIOUS EVENTS
// ============================================================================

/**
 * Special racing event
 */
export interface PrestigiousRacingEvent {
  id: string;
  name: string;
  description: string;
  lore: string;

  // Event details
  eventType: 'DERBY' | 'STAKES' | 'CHAMPIONSHIP' | 'CHALLENGE' | 'INVITATIONAL';
  raceType: RaceType;
  prestige: number; // 8-10 for prestigious events

  // Schedule
  frequency: 'ANNUAL' | 'MONTHLY' | 'SEASONAL' | 'ONE_TIME';
  nextOccurrence: Date;
  duration: number; // Minutes

  // Entry
  entryFee: number;
  qualificationRequired: boolean;
  qualificationCriteria?: {
    minWins?: number;
    minRaceLevel?: number;
    specificTrack?: string;
    previousEventPlacement?: number;
  };

  // Prizes
  purse: number;
  guaranteedPrizes: RacePrize[];
  trophies: Trophy[];

  // Title awards
  winnerTitle: string;
  titleDuration: 'PERMANENT' | 'ANNUAL' | 'UNTIL_BEATEN';

  // Participants
  maxParticipants: number;
  minParticipants: number;
  invitedCharacters?: ObjectId[];

  // Special rules
  specialRules: string[];
  uniqueRewards?: string[];

  // Historical
  previousWinners: {
    year: number;
    characterId: ObjectId;
    horseId: ObjectId;
    time: number;
  }[];

  // Associated track
  trackId: string;

  // Requirements
  minimumLevel: number;
  reputationRequired?: number;
  factionRestriction?: string;
}

/**
 * Race Prize definition
 */
export interface RacePrize {
  position: number;
  gold: number;
  items?: {
    itemId: string;
    quantity: number;
  }[];
  reputation?: number;
  experience?: number;
}

/**
 * Trophy definition
 */
export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  prestige: number;
  displayInProfile: boolean;
}

// ============================================================================
// RACING CAREER
// ============================================================================

/**
 * Racing statistics
 */
export interface RacingStatistics {
  characterId: ObjectId;

  // Overall
  totalRaces: number;
  wins: number;
  places: number;
  shows: number;
  winPercentage: number;

  // By race type
  statsByRaceType: Map<RaceType, {
    races: number;
    wins: number;
    bestTime: number;
  }>;

  // Earnings
  totalPrizeMoney: number;
  totalBettingWinnings: number;
  netRacingProfit: number;

  // Achievements
  trackRecords: {
    trackId: string;
    raceType: RaceType;
    time: number;
    date: Date;
  }[];

  // Prestigious events
  prestigiousWins: {
    eventId: string;
    eventName: string;
    date: Date;
    horse: ObjectId;
  }[];

  // Titles
  currentTitles: string[];

  // Favorite track
  favoriteTrack?: {
    trackId: string;
    races: number;
    winRate: number;
  };

  // Reputation
  racingReputation: number; // 0-100
  knownFor?: string; // "Sprint Specialist", "Endurance Master", etc

  // Records
  fastestRace: {
    raceId: ObjectId;
    time: number;
    raceType: RaceType;
  };
  biggestWin: {
    raceId: ObjectId;
    amount: number;
  };
  longestWinStreak: number;
  currentWinStreak: number;

  // Betting statistics
  bettingStats: {
    totalBets: number;
    wonBets: number;
    totalWagered: number;
    totalWon: number;
    biggestPayout: number;
  };
}

/**
 * Racing stable (for managing multiple horses)
 */
export interface RacingStable {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;

  // Horses
  horses: ObjectId[];
  activeRacers: ObjectId[];

  // Staff
  trainers: ObjectId[];
  jockeys: ObjectId[];

  // Facilities
  trainingFacility: {
    level: number;
    trainingSpeed: number;
  };

  // Records
  stableReputation: number;
  totalWins: number;
  totalEarnings: number;

  // Colors
  stableColors: SilkColors;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Register for race request
 */
export interface RegisterForRaceRequest {
  raceId: ObjectId;
  horseId: ObjectId;
  jockeyId?: ObjectId; // If player wants to ride
  silks?: SilkColors;
}

/**
 * Register for race response
 */
export interface RegisterForRaceResponse {
  success: boolean;
  postPosition: number;
  entryFee: number;
  morningLineOdds: number;
  message: string;
}

/**
 * Place race bet request
 */
export interface PlaceRaceBetRequest {
  raceId: ObjectId;
  betType: RaceBetType;
  amount: number;
  selections: ObjectId[]; // Horse IDs
}

/**
 * Place race bet response
 */
export interface PlaceRaceBetResponse {
  bet: RaceBet;
  potentialPayout: number;
  odds: number;
  message: string;
}

/**
 * View race card request
 */
export interface ViewRaceCardRequest {
  raceId?: ObjectId;
  trackId?: string;
  date?: Date;
}

/**
 * View race card response
 */
export interface ViewRaceCardResponse {
  races: HorseRace[];
  track: RaceTrack;
  nextRace?: HorseRace;
}

/**
 * Get racing statistics request
 */
export interface GetRacingStatsRequest {
  characterId: ObjectId;
  horseId?: ObjectId;
}

/**
 * Get racing statistics response
 */
export interface GetRacingStatsResponse {
  characterStats: RacingStatistics;
  horseStats?: {
    horseId: ObjectId;
    races: number;
    wins: number;
    avgFinishPosition: number;
    totalEarnings: number;
  };
  recentRaces: RaceResult[];
  upcomingRaces: HorseRace[];
}

/**
 * Watch race request
 */
export interface WatchRaceRequest {
  raceId: ObjectId;
  spectate: boolean;
}

/**
 * Watch race response (streamed)
 */
export interface WatchRaceResponse {
  raceId: ObjectId;
  currentTime: number;
  positions: {
    position: number;
    horseId: ObjectId;
    horseName: string;
    distanceCovered: number;
  }[];
  recentEvent?: SimulationEvent;
  completed: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Racing system constants
 */
export const RACING_CONSTANTS = {
  // Race distances (in yards)
  DISTANCES: {
    SPRINT: 440, // Quarter mile
    MIDDLE: 880, // Half mile
    LONG: 1760, // Mile
    ENDURANCE: 5280 // 3+ miles
  },

  // Time estimates (seconds)
  BASE_TIMES: {
    SPRINT: 22,
    MIDDLE: 52,
    LONG: 120,
    ENDURANCE: 600
  },

  // Betting
  MIN_BET: 10,
  MAX_BET: 10000,
  TRACK_TAKE: 0.15, // 15%

  // Odds
  MIN_ODDS: 1.1, // 1:10
  MAX_ODDS: 100.0, // 100:1
  FAVORITE_THRESHOLD: 3.0,
  LONGSHOT_THRESHOLD: 20.0,

  // Payouts
  PLACE_PAYOUT_PERCENTAGE: 0.4, // 40% of win payout
  SHOW_PAYOUT_PERCENTAGE: 0.25, // 25% of win payout

  // Entry limits
  MIN_HORSES_PER_RACE: 3,
  MAX_HORSES_PER_RACE: 12,

  // Registration
  REGISTRATION_HOURS_BEFORE: 24,
  SCRATCH_HOURS_BEFORE: 2,

  // Performance modifiers
  TERRAIN_PENALTIES: {
    DIRT: 0,
    GRASS: -5,
    SAND: -10,
    MUD: -15,
    ROCK: -20
  },

  WEATHER_PENALTIES: {
    CLEAR: 0,
    OVERCAST: -2,
    LIGHT_RAIN: -5,
    HEAVY_RAIN: -12,
    WIND: -8,
    DUST_STORM: -15,
    SNOW: -10
  },

  TRACK_CONDITION_MODIFIERS: {
    FAST: 1.0,
    GOOD: 0.95,
    MUDDY: 0.85,
    HEAVY: 0.75,
    FROZEN: 0.8
  },

  // Weight penalties
  WEIGHT_PENALTY_PER_POUND: 0.02, // 2% per 50 lbs over base

  // Jockey bonuses
  JOCKEY_SKILL_BONUS: 0.05, // 5% per skill level
  MAX_JOCKEY_BONUS: 0.25, // Max 25%

  // Incidents
  STUMBLE_PENALTY: 2, // 2 seconds
  FALL_PENALTY: 10, // 10 seconds
  INTERFERENCE_PENALTY: 3,

  // Experience and reputation
  RACE_XP_BASE: 50,
  RACE_XP_WIN: 100,
  RACE_REP_WIN: 10,
  RACE_REP_PLACE: 5,
  RACE_REP_SHOW: 3,

  // Prestigious events
  PRESTIGIOUS_XP_MULTIPLIER: 3,
  PRESTIGIOUS_REP_MULTIPLIER: 5,

  // Career milestones
  MILESTONES: {
    FIRST_WIN: 1,
    FIVE_WINS: 5,
    TEN_WINS: 10,
    FIFTY_WINS: 50,
    HUNDRED_WINS: 100,
    TRACK_RECORD: 'record',
    PRESTIGIOUS_WIN: 'prestigious'
  }
};
