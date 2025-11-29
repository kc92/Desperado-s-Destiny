/**
 * Shooting Contest System Types
 * Phase 13, Wave 13.2 - Western marksmanship competitions for Desperados Destiny
 */

import type { ObjectId } from 'mongoose';

/**
 * CONTEST TYPES
 */
export type ContestType =
  | 'target_shooting'    // Fixed targets at various distances
  | 'quick_draw'         // Speed-based competition
  | 'trick_shooting'     // Spectacular shots with showmanship
  | 'skeet_shooting'     // Clay pigeons/thrown targets
  | 'long_range'         // Extreme distance rifle shots
  | 'dueling';           // Non-lethal exhibition dueling

export const CONTEST_TYPE_NAMES: Record<ContestType, string> = {
  target_shooting: 'Target Shooting',
  quick_draw: 'Quick Draw',
  trick_shooting: 'Trick Shooting',
  skeet_shooting: 'Skeet Shooting',
  long_range: 'Long Range',
  dueling: 'Exhibition Dueling'
};

export const CONTEST_TYPE_DESCRIPTIONS: Record<ContestType, string> = {
  target_shooting: 'Hit fixed targets at various distances with accuracy',
  quick_draw: 'Draw and fire at the signal - fastest accurate shot wins',
  trick_shooting: 'Spectacular shots with coins, bottles, and moving targets',
  skeet_shooting: 'Hit clay pigeons and thrown targets in mid-flight',
  long_range: 'Extreme distance shots with rifles, accounting for wind and elevation',
  dueling: 'Non-lethal duels with wax bullets - first hit wins'
};

/**
 * CONTEST STATUS
 */
export type ContestStatus =
  | 'registration'       // Open for sign-ups
  | 'ready'              // Enough players, waiting to start
  | 'in_progress'        // Contest running
  | 'final_round'        // Last round
  | 'completed'          // Contest finished
  | 'cancelled';         // Contest cancelled

/**
 * ROUND TYPES
 */
export type RoundType =
  | 'qualification'      // Initial round, everyone shoots
  | 'elimination'        // Cut the bottom performers
  | 'semifinals'         // Top performers compete
  | 'finals'             // Championship round
  | 'shootoff';          // Tiebreaker round

/**
 * TARGET TYPES
 */
export type TargetType =
  | 'bullseye'           // Standard circular target
  | 'bottle'             // Glass bottle
  | 'coin'               // Coin in the air
  | 'card'               // Playing card edge
  | 'apple'              // Apple on a post
  | 'clay_pigeon'        // Flying clay disk
  | 'moving_target'      // Target on a rail
  | 'silhouette'         // Human silhouette
  | 'wax_dummy';         // For dueling

export const TARGET_POINT_VALUES: Record<TargetType, number> = {
  bullseye: 100,
  bottle: 75,
  coin: 150,
  card: 200,
  apple: 125,
  clay_pigeon: 100,
  moving_target: 150,
  silhouette: 100,
  wax_dummy: 100
};

/**
 * MOVEMENT PATTERNS
 */
export type MovementPattern =
  | 'stationary'         // No movement
  | 'linear'             // Straight line
  | 'pendulum'           // Swinging motion
  | 'random'             // Unpredictable movement
  | 'arc';               // Arcing trajectory (thrown)

/**
 * HIT ZONES
 */
export interface HitZone {
  name: string;
  pointValue: number;
  difficulty: number;     // Multiplier for hit chance (0.5 = harder, 1.5 = easier)
}

export const BULLSEYE_ZONES: HitZone[] = [
  { name: 'Bullseye', pointValue: 100, difficulty: 0.4 },
  { name: 'Inner Ring', pointValue: 75, difficulty: 0.7 },
  { name: 'Middle Ring', pointValue: 50, difficulty: 1.0 },
  { name: 'Outer Ring', pointValue: 25, difficulty: 1.3 }
];

/**
 * WEAPON CATEGORIES
 */
export type WeaponCategory =
  | 'pistol'             // Revolver, derringer
  | 'rifle'              // Winchester, Sharps
  | 'shotgun';           // Scatter gun (skeet only)

export type AllowedWeapon =
  | 'revolver'           // Standard six-shooter
  | 'derringer'          // Quick draw only
  | 'competition_pistol' // Custom accuracy pistol
  | 'winchester'         // Medium range rifle
  | 'sharps_rifle'       // Long range rifle
  | 'competition_rifle'  // Custom accuracy rifle
  | 'shotgun';           // Skeet shooting

export const WEAPON_BONUSES: Record<AllowedWeapon, { accuracy: number; speed: number }> = {
  revolver: { accuracy: 0, speed: 0 },
  derringer: { accuracy: -10, speed: 25 },
  competition_pistol: { accuracy: 15, speed: -5 },
  winchester: { accuracy: 5, speed: 0 },
  sharps_rifle: { accuracy: 20, speed: -10 },
  competition_rifle: { accuracy: 25, speed: -10 },
  shotgun: { accuracy: -5, speed: 5 }
};

/**
 * SCORING SYSTEMS
 */
export type ScoringSystem =
  | 'total_points'       // Sum of all points
  | 'average_accuracy'   // Average hit percentage
  | 'time_based'         // Fastest time wins
  | 'elimination';       // Last shooter standing

/**
 * WEATHER CONDITIONS
 */
export interface WeatherConditions {
  windSpeed: number;      // mph (0-30)
  windDirection: number;  // degrees (0-359)
  temperature: number;    // Fahrenheit
  precipitation: 'clear' | 'light_rain' | 'heavy_rain' | 'dust_storm';
  visibility: number;     // percentage (0-100)
}

/**
 * TARGET DEFINITION
 */
export interface Target {
  id: string;
  type: TargetType;
  distance: number;       // feet
  size: 'small' | 'medium' | 'large';
  movement?: MovementPattern;
  pointValue: number;
  hitZones: HitZone[];
  description: string;
}

/**
 * SHOOTING SHOT RESULT
 */
export interface ShootingShotResult {
  playerId: string;
  targetId: string;
  hit: boolean;
  zone?: string;          // Which hit zone
  points: number;
  time: number;           // milliseconds
  distance: number;       // feet
  skillRoll: number;      // Skill check result
  accuracyBonus: number;  // From weapon/skill
  weatherPenalty: number; // From conditions
  fatigueModifier: number; // From consecutive shots
}

/**
 * ROUND SCORE
 */
export interface RoundScore {
  playerId: string;
  playerName: string;
  shots: ShootingShotResult[];
  totalPoints: number;
  accuracy: number;       // Percentage
  averageTime: number;    // milliseconds
  bonusMultiplier: number; // From perfect shots, speed, etc.
  finalScore: number;
  rank: number;
  eliminated: boolean;
}

/**
 * CONTEST ROUND
 */
export interface ContestRound {
  roundNumber: number;
  roundType: RoundType;
  targets: Target[];
  shotsPerPlayer: number;
  timeLimit: number;      // seconds per shot
  scores: Map<string, RoundScore>;
  eliminations?: number;  // How many to cut per round
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * CONTEST PARTICIPANT
 */
export interface ContestParticipant {
  characterId: ObjectId;
  characterName: string;
  marksmanshipSkill: number;
  weapon: AllowedWeapon;
  joinedAt: Date;
  eliminated: boolean;
  eliminatedInRound?: number;
  finalPlacement?: number;
  totalScore: number;
}

/**
 * CONTEST PRIZE
 */
export interface ContestPrize {
  placement: number;
  gold: number;
  title?: string;
  item?: string;
  reputation?: number;
}

/**
 * SHOOTING CONTEST
 */
export interface ShootingContest {
  _id: string;
  name: string;
  description: string;
  contestType: ContestType;

  // Event details
  location: string;
  scheduledStart: Date;
  duration: number;        // minutes

  // Entry requirements
  entryFee: number;
  minLevel: number;
  maxParticipants: number;
  minParticipants: number;
  allowedWeapons: AllowedWeapon[];

  // Participants
  registeredShooters: ContestParticipant[];

  // Rounds
  rounds: ContestRound[];
  currentRound: number;

  // Scoring
  scoringSystem: ScoringSystem;

  // Prizes
  prizePool: number;
  prizes: ContestPrize[];

  // Winner
  winnerId?: ObjectId;
  winnerName?: string;

  // Status
  status: ContestStatus;

  // Weather (for outdoor events)
  weather?: WeatherConditions;

  // Timestamps
  registrationEndsAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SHOOTING RECORD (Personal Best)
 */
export interface ShootingRecord {
  _id: string;
  characterId: ObjectId;
  characterName: string;

  // Records by contest type
  records: {
    contestType: ContestType;
    bestScore: number;
    bestAccuracy: number;
    fastestTime: number;
    contestId: string;
    achievedAt: Date;
  }[];

  // Overall statistics
  contestsEntered: number;
  contestsWon: number;
  totalPrizeMoney: number;

  // Titles earned
  titles: {
    title: string;
    contestType: ContestType;
    earnedAt: Date;
    contestId: string;
  }[];

  // Consecutive wins (for streaks)
  currentWinStreak: number;
  bestWinStreak: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * CONTEST TEMPLATE (for recurring events)
 */
export interface ContestTemplate {
  id: string;
  name: string;
  description: string;
  contestType: ContestType;
  location: string;

  // Schedule
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual';
  dayOfWeek?: number;     // For weekly (0-6)
  dayOfMonth?: number;    // For monthly (1-31)
  hour: number;           // Hour of day (0-23)

  // Requirements
  entryFee: number;
  minLevel: number;
  maxParticipants: number;
  minParticipants: number;
  allowedWeapons: AllowedWeapon[];

  // Contest structure
  rounds: {
    roundType: RoundType;
    targetCount: number;
    shotsPerPlayer: number;
    timeLimit: number;
    eliminations?: number;
  }[];

  // Scoring
  scoringSystem: ScoringSystem;

  // Prizes
  basePrizePool: number;
  prizes: ContestPrize[];

  // Prestige
  prestigious: boolean;
  invitationOnly: boolean;
  minWins?: number;       // Required wins to enter
}

/**
 * LEADERBOARD ENTRY
 */
export interface ShootingLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  contestType?: ContestType;
  score: number;
  wins: number;
  accuracy: number;
  titles: number;
}

/**
 * CONTEST REGISTRATION REQUEST
 */
export interface ContestRegistrationRequest {
  characterId: string;
  contestId: string;
  weapon: AllowedWeapon;
}

/**
 * SHOOT ACTION REQUEST
 */
export interface ShootActionRequest {
  characterId: string;
  contestId: string;
  roundNumber: number;
  targetId: string;
}

/**
 * CONTEST RESULT
 */
export interface ContestResult {
  contestId: string;
  contestName: string;
  contestType: ContestType;
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  totalParticipants: number;
  prizeAwarded: number;
  titleAwarded?: string;
  completedAt: Date;
}

/**
 * PRESTIGIOUS EVENTS
 */
export const PRESTIGIOUS_EVENTS = [
  'Red Gulch Shootout',
  'Frontier Marksmanship Championship',
  'Quick Draw Showdown',
  'Annie Oakley Memorial',
  'Fort Ashford Rifle Competition',
  'Whiskey Bend Trick Shot Exhibition'
] as const;

export type PrestigiousEvent = typeof PRESTIGIOUS_EVENTS[number];

/**
 * SHOOTING LOCATIONS
 */
export const SHOOTING_LOCATIONS = [
  'Red Gulch Shooting Range',
  'Fort Ashford Military Range',
  'Whiskey Bend Exhibition Grounds',
  'The Frontera Underground Arena',
  'Silver Creek Outdoor Range',
  'Desperado Valley Competition Grounds'
] as const;

export type ShootingLocation = typeof SHOOTING_LOCATIONS[number];

/**
 * ACCURACY CALCULATION FACTORS
 */
export interface AccuracyFactors {
  baseSkill: number;           // Character marksmanship skill (0-100)
  weaponBonus: number;         // Weapon accuracy modifier
  distancePenalty: number;     // Distance to target penalty
  weatherPenalty: number;      // Weather condition penalty
  fatiguePenalty: number;      // Consecutive shots penalty
  sizeModifier: number;        // Target size modifier
  movementPenalty: number;     // Target movement penalty
  totalModifier: number;       // Sum of all modifiers
  finalChance: number;         // Final hit chance (0-100)
}

/**
 * TIME BONUSES
 */
export const TIME_BONUS_THRESHOLDS = {
  fast: { maxTime: 2000, bonus: 0.25 },      // Under 2 seconds: +25%
  average: { maxTime: 4000, bonus: 0.10 },   // Under 4 seconds: +10%
  slow: { maxTime: 6000, bonus: 0 }          // Over 6 seconds: no bonus
};

export const PERFECT_ACCURACY_BONUS = 0.5;   // +50% for 100% accuracy
export const CONSECUTIVE_HIT_MULTIPLIER = 0.1; // +10% per consecutive hit

/**
 * DISTANCE PENALTIES
 */
export const DISTANCE_PENALTY_TABLE = {
  pistol: {
    close: { max: 50, penalty: 0 },
    medium: { max: 100, penalty: -15 },
    long: { max: 200, penalty: -40 },
    extreme: { max: 500, penalty: -80 }
  },
  rifle: {
    close: { max: 100, penalty: 0 },
    medium: { max: 300, penalty: -10 },
    long: { max: 800, penalty: -25 },
    extreme: { max: 1500, penalty: -50 }
  },
  shotgun: {
    close: { max: 30, penalty: 0 },
    medium: { max: 60, penalty: -20 },
    long: { max: 100, penalty: -60 },
    extreme: { max: 150, penalty: -95 }
  }
};

/**
 * FATIGUE SYSTEM
 */
export const FATIGUE_PENALTY_PER_SHOT = 2;   // -2% per consecutive shot
export const MAX_FATIGUE_PENALTY = 20;       // Max -20% from fatigue
