/**
 * Shooting Contest Model
 * Represents shooting competitions with various event types
 */

import mongoose, { Schema, Document } from 'mongoose';
import type {
  ContestType,
  ContestStatus,
  RoundType,
  ScoringSystem,
  AllowedWeapon,
  WeatherConditions
} from '@desperados/shared';

/**
 * HIT ZONE SCHEMA
 */
const HitZoneSchema = new Schema({
  name: { type: String, required: true },
  pointValue: { type: Number, required: true },
  difficulty: { type: Number, required: true }
}, { _id: false });

/**
 * TARGET SCHEMA
 */
const TargetSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  distance: { type: Number, required: true },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  movement: {
    type: String,
    enum: ['stationary', 'linear', 'pendulum', 'random', 'arc']
  },
  pointValue: { type: Number, required: true },
  hitZones: [HitZoneSchema],
  description: { type: String, required: true }
}, { _id: false });

/**
 * SHOOTING SHOT RESULT SCHEMA
 */
const ShootingShotResultSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  targetId: { type: String, required: true },
  hit: { type: Boolean, required: true },
  zone: { type: String },
  points: { type: Number, required: true },
  time: { type: Number, required: true }, // milliseconds
  distance: { type: Number, required: true },
  skillRoll: { type: Number, required: true },
  accuracyBonus: { type: Number, required: true },
  weatherPenalty: { type: Number, required: true },
  fatigueModifier: { type: Number, required: true }
}, { _id: false });

/**
 * ROUND SCORE SCHEMA
 */
const RoundScoreSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  playerName: { type: String, required: true },
  shots: [ShootingShotResultSchema],
  totalPoints: { type: Number, required: true, default: 0 },
  accuracy: { type: Number, required: true, default: 0 },
  averageTime: { type: Number, required: true, default: 0 },
  bonusMultiplier: { type: Number, required: true, default: 1 },
  finalScore: { type: Number, required: true, default: 0 },
  rank: { type: Number, required: true },
  eliminated: { type: Boolean, required: true, default: false }
}, { _id: false });

/**
 * CONTEST ROUND SCHEMA
 */
const ContestRoundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  roundType: {
    type: String,
    enum: ['qualification', 'elimination', 'semifinals', 'finals', 'shootoff'],
    required: true
  },
  targets: [TargetSchema],
  shotsPerPlayer: { type: Number, required: true },
  timeLimit: { type: Number, required: true },
  scores: {
    type: Map,
    of: RoundScoreSchema
  },
  eliminations: { type: Number },
  completedAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    required: true,
    default: 'pending'
  }
}, { _id: false });

/**
 * CONTEST PARTICIPANT SCHEMA
 */
const ContestParticipantSchema = new Schema({
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  characterName: { type: String, required: true },
  marksmanshipSkill: { type: Number, required: true },
  weapon: {
    type: String,
    enum: [
      'revolver',
      'derringer',
      'competition_pistol',
      'winchester',
      'sharps_rifle',
      'competition_rifle',
      'shotgun'
    ],
    required: true
  },
  joinedAt: { type: Date, required: true, default: Date.now },
  eliminated: { type: Boolean, required: true, default: false },
  eliminatedInRound: { type: Number },
  finalPlacement: { type: Number },
  totalScore: { type: Number, required: true, default: 0 }
}, { _id: false });

/**
 * CONTEST PRIZE SCHEMA
 */
const ContestPrizeSchema = new Schema({
  placement: { type: Number, required: true },
  gold: { type: Number, required: true },
  title: { type: String },
  item: { type: String },
  reputation: { type: Number }
}, { _id: false });

/**
 * WEATHER CONDITIONS SCHEMA
 */
const WeatherConditionsSchema = new Schema({
  windSpeed: { type: Number, required: true },
  windDirection: { type: Number, required: true },
  temperature: { type: Number, required: true },
  precipitation: {
    type: String,
    enum: ['clear', 'light_rain', 'heavy_rain', 'dust_storm'],
    required: true
  },
  visibility: { type: Number, required: true }
}, { _id: false });

/**
 * SHOOTING CONTEST INTERFACE
 */
export interface IShootingContest extends Document {
  name: string;
  description: string;
  contestType: ContestType;

  // Instance methods
  canStart(): boolean;
  canRegister(characterId: string): boolean;
  getActivePlayers(): Array<any>;
  getCurrentRound(): any;
  isComplete(): boolean;

  // Event details
  location: string;
  scheduledStart: Date;
  duration: number;

  // Entry requirements
  entryFee: number;
  minLevel: number;
  maxParticipants: number;
  minParticipants: number;
  allowedWeapons: AllowedWeapon[];

  // Participants
  registeredShooters: Array<{
    characterId: mongoose.Types.ObjectId;
    characterName: string;
    marksmanshipSkill: number;
    weapon: AllowedWeapon;
    joinedAt: Date;
    eliminated: boolean;
    eliminatedInRound?: number;
    finalPlacement?: number;
    totalScore: number;
  }>;

  // Rounds
  rounds: Array<any>;
  currentRound: number;

  // Scoring
  scoringSystem: ScoringSystem;

  // Prizes
  prizePool: number;
  prizes: Array<{
    placement: number;
    gold: number;
    title?: string;
    item?: string;
    reputation?: number;
  }>;

  // Winner
  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;

  // Status
  status: ContestStatus;

  // Weather
  weather?: WeatherConditions;

  // Timestamps
  registrationEndsAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SHOOTING CONTEST SCHEMA
 */
const ShootingContestSchema = new Schema<IShootingContest>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    contestType: {
      type: String,
      enum: [
        'target_shooting',
        'quick_draw',
        'trick_shooting',
        'skeet_shooting',
        'long_range',
        'dueling'
      ],
      required: true
    },

    // Event details
    location: { type: String, required: true },
    scheduledStart: { type: Date, required: true },
    duration: { type: Number, required: true },

    // Entry requirements
    entryFee: { type: Number, required: true, min: 0 },
    minLevel: { type: Number, required: true, min: 1 },
    maxParticipants: { type: Number, required: true, min: 2 },
    minParticipants: { type: Number, required: true, min: 2 },
    allowedWeapons: [{
      type: String,
      enum: [
        'revolver',
        'derringer',
        'competition_pistol',
        'winchester',
        'sharps_rifle',
        'competition_rifle',
        'shotgun'
      ]
    }],

    // Participants
    registeredShooters: [ContestParticipantSchema],

    // Rounds
    rounds: [ContestRoundSchema],
    currentRound: { type: Number, required: true, default: 0 },

    // Scoring
    scoringSystem: {
      type: String,
      enum: ['total_points', 'average_accuracy', 'time_based', 'elimination'],
      required: true
    },

    // Prizes
    prizePool: { type: Number, required: true, min: 0 },
    prizes: [ContestPrizeSchema],

    // Winner
    winnerId: { type: Schema.Types.ObjectId, ref: 'Character' },
    winnerName: { type: String },

    // Status
    status: {
      type: String,
      enum: ['registration', 'ready', 'in_progress', 'final_round', 'completed', 'cancelled'],
      required: true,
      default: 'registration'
    },

    // Weather
    weather: WeatherConditionsSchema,

    // Timestamps
    registrationEndsAt: { type: Date, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES
 */
ShootingContestSchema.index({ status: 1, scheduledStart: 1 });
ShootingContestSchema.index({ contestType: 1, status: 1 });
ShootingContestSchema.index({ location: 1, scheduledStart: 1 });
ShootingContestSchema.index({ 'registeredShooters.characterId': 1 });
ShootingContestSchema.index({ winnerId: 1 });

/**
 * METHODS
 */

/**
 * Check if contest can start
 */
ShootingContestSchema.methods.canStart = function(): boolean {
  return (
    this.status === 'ready' &&
    this.registeredShooters.length >= this.minParticipants &&
    new Date() >= this.scheduledStart
  );
};

/**
 * Check if character can register
 */
ShootingContestSchema.methods.canRegister = function(characterId: string): boolean {
  if (this.status !== 'registration') return false;
  if (this.registeredShooters.length >= this.maxParticipants) return false;
  if (new Date() >= this.registrationEndsAt) return false;

  const alreadyRegistered = this.registeredShooters.some(
    p => p.characterId.toString() === characterId
  );
  return !alreadyRegistered;
};

/**
 * Get active participants (not eliminated)
 */
ShootingContestSchema.methods.getActivePlayers = function() {
  return this.registeredShooters.filter(p => !p.eliminated);
};

/**
 * Get current round
 */
ShootingContestSchema.methods.getCurrentRound = function() {
  return this.rounds[this.currentRound];
};

/**
 * Check if contest is complete
 */
ShootingContestSchema.methods.isComplete = function(): boolean {
  return this.status === 'completed' || this.status === 'cancelled';
};

/**
 * EXPORT MODEL
 */
export const ShootingContest = mongoose.model<IShootingContest>(
  'ShootingContest',
  ShootingContestSchema
);
