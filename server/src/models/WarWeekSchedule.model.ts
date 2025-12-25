/**
 * War Week Schedule Model
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Tracks weekly war scheduling state:
 * - Declaration and resolution windows
 * - Declared/active/resolved war tracking
 * - Auto-tournament brackets for unmatched gangs
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  WeeklyWarPhase,
  WarLeagueTier,
  TournamentMatchStatus,
  WAR_SCHEDULE_CONFIG,
} from '@desperados/shared';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Tournament match subdocument interface
 */
export interface ITournamentMatch {
  matchId: string;
  round: number;
  position: number;
  gang1Id?: mongoose.Types.ObjectId;
  gang1Name?: string;
  gang2Id?: mongoose.Types.ObjectId;
  gang2Name?: string;
  winnerId?: mongoose.Types.ObjectId;
  warId?: mongoose.Types.ObjectId;
  status: TournamentMatchStatus;
}

/**
 * Tournament bracket subdocument interface
 */
export interface ITournamentBracket {
  tier: WarLeagueTier;
  matches: ITournamentMatch[];
  totalRounds: number;
  currentRound: number;
}

/**
 * Auto-tournament participant subdocument interface
 */
export interface IAutoTournamentParticipant {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  gangTag: string;
  tier: WarLeagueTier;
  powerRating: number;
  optedIn: boolean;
  registeredAt: Date;
}

/**
 * Auto-tournament config subdocument interface
 */
export interface IAutoTournamentConfig {
  enabled: boolean;
  bracketGenerated: boolean;
  participatingGangs: IAutoTournamentParticipant[];
  brackets: ITournamentBracket[];
  minParticipantsPerTier?: number;
  maxParticipantsPerTier?: number;
  matchingPreference?: 'power_rating' | 'random' | 'swiss';
}

/**
 * War Week Schedule document interface
 */
export interface IWarWeekSchedule extends Document {
  _id: mongoose.Types.ObjectId;
  seasonId: mongoose.Types.ObjectId;
  weekNumber: number;
  phase: WeeklyWarPhase;

  // Time windows
  declarationWindowStart: Date;
  declarationWindowEnd: Date;
  resolutionWindowStart: Date;
  resolutionWindowEnd: Date;

  // War tracking
  declaredWars: mongoose.Types.ObjectId[];
  activeWars: mongoose.Types.ObjectId[];
  resolvedWars: mongoose.Types.ObjectId[];

  // Auto-tournament
  autoTournament: IAutoTournamentConfig;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addTournamentParticipant(
    gangId: mongoose.Types.ObjectId,
    gangName: string,
    gangTag: string,
    tier: WarLeagueTier,
    powerRating: number
  ): Promise<void>;
  removeTournamentParticipant(gangId: mongoose.Types.ObjectId): Promise<void>;
  addDeclaredWar(warId: mongoose.Types.ObjectId): Promise<void>;
  activateWar(warId: mongoose.Types.ObjectId): Promise<void>;
  resolveWar(warId: mongoose.Types.ObjectId): Promise<void>;
  updatePhase(): Promise<WeeklyWarPhase>;
  canDeclareWar(): boolean;
  isResolutionActive(): boolean;
  getUnmatchedGangs(tier?: WarLeagueTier): Promise<IAutoTournamentParticipant[]>;
}

/**
 * War Week Schedule model statics
 */
export interface IWarWeekScheduleModel extends Model<IWarWeekSchedule> {
  findCurrentWeek(): Promise<IWarWeekSchedule | null>;
  findBySeasonAndWeek(seasonId: mongoose.Types.ObjectId, weekNumber: number): Promise<IWarWeekSchedule | null>;
  createWeekSchedule(seasonId: mongoose.Types.ObjectId, weekNumber: number): Promise<IWarWeekSchedule>;
  getCurrentPhase(): Promise<WeeklyWarPhase>;
}

// =============================================================================
// SUBDOCUMENT SCHEMAS
// =============================================================================

/**
 * Tournament match subdocument schema
 */
const TournamentMatchSchema = new Schema<ITournamentMatch>(
  {
    matchId: { type: String, required: true },
    round: { type: Number, required: true, min: 1 },
    position: { type: Number, required: true, min: 0 },
    gang1Id: { type: Schema.Types.ObjectId, ref: 'Gang' },
    gang1Name: { type: String },
    gang2Id: { type: Schema.Types.ObjectId, ref: 'Gang' },
    gang2Name: { type: String },
    winnerId: { type: Schema.Types.ObjectId, ref: 'Gang' },
    warId: { type: Schema.Types.ObjectId, ref: 'GangWar' },
    status: {
      type: String,
      enum: Object.values(TournamentMatchStatus),
      required: true,
      default: TournamentMatchStatus.PENDING,
    },
  },
  { _id: false }
);

/**
 * Tournament bracket subdocument schema
 */
const TournamentBracketSchema = new Schema<ITournamentBracket>(
  {
    tier: {
      type: String,
      enum: Object.values(WarLeagueTier),
      required: true,
    },
    matches: [TournamentMatchSchema],
    totalRounds: { type: Number, required: true, min: 1, default: 1 },
    currentRound: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

/**
 * Auto-tournament participant subdocument schema
 */
const AutoTournamentParticipantSchema = new Schema<IAutoTournamentParticipant>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
    },
    gangName: { type: String, required: true },
    gangTag: { type: String, required: true },
    tier: {
      type: String,
      enum: Object.values(WarLeagueTier),
      required: true,
    },
    powerRating: { type: Number, required: true, min: 0 },
    optedIn: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Auto-tournament config subdocument schema
 */
const AutoTournamentConfigSchema = new Schema<IAutoTournamentConfig>(
  {
    enabled: { type: Boolean, default: true },
    bracketGenerated: { type: Boolean, default: false },
    participatingGangs: [AutoTournamentParticipantSchema],
    brackets: [TournamentBracketSchema],
    minParticipantsPerTier: { type: Number, default: 2 },
    maxParticipantsPerTier: { type: Number, default: 64 },
    matchingPreference: {
      type: String,
      enum: ['power_rating', 'random', 'swiss'],
      default: 'power_rating'
    },
  },
  { _id: false }
);

// =============================================================================
// MAIN SCHEMA
// =============================================================================

/**
 * War Week Schedule schema
 */
const WarWeekScheduleSchema = new Schema<IWarWeekSchedule, IWarWeekScheduleModel>(
  {
    seasonId: {
      type: Schema.Types.ObjectId,
      ref: 'WarSeason',
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    phase: {
      type: String,
      enum: Object.values(WeeklyWarPhase),
      required: true,
      default: WeeklyWarPhase.DECLARATION,
    },

    // Time windows
    declarationWindowStart: {
      type: Date,
      required: true,
    },
    declarationWindowEnd: {
      type: Date,
      required: true,
    },
    resolutionWindowStart: {
      type: Date,
      required: true,
    },
    resolutionWindowEnd: {
      type: Date,
      required: true,
    },

    // War tracking
    declaredWars: [{
      type: Schema.Types.ObjectId,
      ref: 'GangWar',
    }],
    activeWars: [{
      type: Schema.Types.ObjectId,
      ref: 'GangWar',
    }],
    resolvedWars: [{
      type: Schema.Types.ObjectId,
      ref: 'GangWar',
    }],

    // Auto-tournament
    autoTournament: {
      type: AutoTournamentConfigSchema,
      default: () => ({
        enabled: true,
        bracketGenerated: false,
        participatingGangs: [],
        brackets: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);

// =============================================================================
// INDEXES
// =============================================================================

WarWeekScheduleSchema.index({ seasonId: 1, weekNumber: 1 }, { unique: true });
WarWeekScheduleSchema.index({ phase: 1 });
WarWeekScheduleSchema.index({ declarationWindowStart: 1, declarationWindowEnd: 1 });
WarWeekScheduleSchema.index({ resolutionWindowStart: 1, resolutionWindowEnd: 1 });
WarWeekScheduleSchema.index({ 'autoTournament.participatingGangs.gangId': 1 });

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate week windows based on a given Monday start
 */
function calculateWeekWindows(mondayStart: Date): {
  declarationWindowStart: Date;
  declarationWindowEnd: Date;
  resolutionWindowStart: Date;
  resolutionWindowEnd: Date;
} {
  // Declaration: Monday 00:00 UTC - Thursday 23:59 UTC
  const declarationWindowStart = new Date(mondayStart);
  declarationWindowStart.setUTCHours(0, 0, 0, 0);

  const declarationWindowEnd = new Date(mondayStart);
  declarationWindowEnd.setUTCDate(declarationWindowEnd.getUTCDate() + 3); // Thursday
  declarationWindowEnd.setUTCHours(23, 59, 59, 999);

  // Resolution: Friday 00:00 UTC - Sunday 23:59 UTC
  const resolutionWindowStart = new Date(mondayStart);
  resolutionWindowStart.setUTCDate(resolutionWindowStart.getUTCDate() + 4); // Friday
  resolutionWindowStart.setUTCHours(0, 0, 0, 0);

  const resolutionWindowEnd = new Date(mondayStart);
  resolutionWindowEnd.setUTCDate(resolutionWindowEnd.getUTCDate() + 6); // Sunday
  resolutionWindowEnd.setUTCHours(23, 59, 59, 999);

  return {
    declarationWindowStart,
    declarationWindowEnd,
    resolutionWindowStart,
    resolutionWindowEnd,
  };
}

/**
 * Get the Monday of the current week
 */
function getCurrentWeekMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysFromMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/**
 * Determine current phase based on time
 */
function determineCurrentPhase(schedule: IWarWeekSchedule): WeeklyWarPhase {
  const now = new Date();

  if (now < schedule.declarationWindowStart) {
    return WeeklyWarPhase.COOLDOWN;
  }

  if (now >= schedule.declarationWindowStart && now <= schedule.declarationWindowEnd) {
    return WeeklyWarPhase.DECLARATION;
  }

  if (now > schedule.declarationWindowEnd && now < schedule.resolutionWindowStart) {
    return WeeklyWarPhase.PREPARATION;
  }

  if (now >= schedule.resolutionWindowStart && now <= schedule.resolutionWindowEnd) {
    return WeeklyWarPhase.ACTIVE;
  }

  return WeeklyWarPhase.RESOLUTION;
}

// =============================================================================
// STATIC METHODS
// =============================================================================

/**
 * Find the current week's schedule
 */
WarWeekScheduleSchema.statics.findCurrentWeek = async function (): Promise<IWarWeekSchedule | null> {
  const now = new Date();

  return this.findOne({
    declarationWindowStart: { $lte: now },
    resolutionWindowEnd: { $gte: now },
  }).populate('seasonId');
};

/**
 * Find schedule by season and week number
 */
WarWeekScheduleSchema.statics.findBySeasonAndWeek = async function (
  seasonId: mongoose.Types.ObjectId,
  weekNumber: number
): Promise<IWarWeekSchedule | null> {
  return this.findOne({ seasonId, weekNumber });
};

/**
 * Create a new week schedule
 */
WarWeekScheduleSchema.statics.createWeekSchedule = async function (
  seasonId: mongoose.Types.ObjectId,
  weekNumber: number
): Promise<IWarWeekSchedule> {
  // Calculate the Monday for this week
  // Assumes weekNumber 1 starts at season start
  const WarSeason = mongoose.model('WarSeason');
  const season = await WarSeason.findById(seasonId);
  if (!season) {
    throw new Error('Season not found');
  }

  const seasonStart = new Date(season.startDate);
  const weekMonday = new Date(seasonStart);
  weekMonday.setUTCDate(weekMonday.getUTCDate() + (weekNumber - 1) * 7);

  // Adjust to Monday if season didn't start on Monday
  const dayOfWeek = weekMonday.getUTCDay();
  if (dayOfWeek !== 1) {
    const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    weekMonday.setUTCDate(weekMonday.getUTCDate() + daysToMonday);
  }

  const windows = calculateWeekWindows(weekMonday);

  const schedule = new this({
    seasonId,
    weekNumber,
    phase: WeeklyWarPhase.DECLARATION,
    ...windows,
  });

  return schedule.save();
};

/**
 * Get the current war phase
 */
WarWeekScheduleSchema.statics.getCurrentPhase = async function (): Promise<WeeklyWarPhase> {
  const schedule = await this.findCurrentWeek();
  if (!schedule) {
    return WeeklyWarPhase.COOLDOWN;
  }
  return determineCurrentPhase(schedule);
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

/**
 * Add a gang to auto-tournament opt-in list
 */
WarWeekScheduleSchema.methods.addTournamentParticipant = async function (
  gangId: mongoose.Types.ObjectId,
  gangName: string,
  gangTag: string,
  tier: WarLeagueTier,
  powerRating: number
): Promise<void> {
  // Check if already registered
  const existing = this.autoTournament.participatingGangs.find(
    (p: IAutoTournamentParticipant) => p.gangId.toString() === gangId.toString()
  );

  if (existing) {
    existing.optedIn = true;
    existing.tier = tier;
    existing.powerRating = powerRating;
  } else {
    this.autoTournament.participatingGangs.push({
      gangId,
      gangName,
      gangTag,
      tier,
      powerRating,
      optedIn: true,
      registeredAt: new Date(),
    });
  }

  await this.save();
};

/**
 * Remove a gang from auto-tournament
 */
WarWeekScheduleSchema.methods.removeTournamentParticipant = async function (
  gangId: mongoose.Types.ObjectId
): Promise<void> {
  const participant = this.autoTournament.participatingGangs.find(
    (p: IAutoTournamentParticipant) => p.gangId.toString() === gangId.toString()
  );

  if (participant) {
    participant.optedIn = false;
  }

  await this.save();
};

/**
 * Add a declared war to tracking
 */
WarWeekScheduleSchema.methods.addDeclaredWar = async function (
  warId: mongoose.Types.ObjectId
): Promise<void> {
  if (!this.declaredWars.includes(warId)) {
    this.declaredWars.push(warId);
    await this.save();
  }
};

/**
 * Move a war to active status
 */
WarWeekScheduleSchema.methods.activateWar = async function (
  warId: mongoose.Types.ObjectId
): Promise<void> {
  // Remove from declared if present
  this.declaredWars = this.declaredWars.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== warId.toString()
  );

  if (!this.activeWars.includes(warId)) {
    this.activeWars.push(warId);
  }

  await this.save();
};

/**
 * Move a war to resolved status
 */
WarWeekScheduleSchema.methods.resolveWar = async function (
  warId: mongoose.Types.ObjectId
): Promise<void> {
  // Remove from active if present
  this.activeWars = this.activeWars.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== warId.toString()
  );

  if (!this.resolvedWars.includes(warId)) {
    this.resolvedWars.push(warId);
  }

  await this.save();
};

/**
 * Update the current phase
 */
WarWeekScheduleSchema.methods.updatePhase = async function (): Promise<WeeklyWarPhase> {
  const schedule = this as IWarWeekSchedule;
  const newPhase = determineCurrentPhase(schedule);
  if (schedule.phase !== newPhase) {
    schedule.phase = newPhase;
    await schedule.save();
  }
  return newPhase;
};

/**
 * Check if declaration is allowed
 */
WarWeekScheduleSchema.methods.canDeclareWar = function (): boolean {
  const now = new Date();
  return (
    now >= this.declarationWindowStart &&
    now <= this.declarationWindowEnd
  );
};

/**
 * Check if resolution is active
 */
WarWeekScheduleSchema.methods.isResolutionActive = function (): boolean {
  const now = new Date();
  return (
    now >= this.resolutionWindowStart &&
    now <= this.resolutionWindowEnd
  );
};

/**
 * Get unmatched gangs for auto-tournament (gangs that opted in but have no wars)
 */
WarWeekScheduleSchema.methods.getUnmatchedGangs = async function (
  tier?: WarLeagueTier
): Promise<IAutoTournamentParticipant[]> {
  const GangWar = mongoose.model('GangWar');

  // Get all gangs with wars this week
  const warsThisWeek = await GangWar.find({
    _id: { $in: [...this.declaredWars, ...this.activeWars] },
  }).select('attackerGangId defenderGangId');

  const gangsWithWars = new Set<string>();
  warsThisWeek.forEach((war: any) => {
    gangsWithWars.add(war.attackerGangId.toString());
    gangsWithWars.add(war.defenderGangId.toString());
  });

  // Filter opted-in gangs that don't have wars
  let unmatched = this.autoTournament.participatingGangs.filter(
    (p: IAutoTournamentParticipant) =>
      p.optedIn && !gangsWithWars.has(p.gangId.toString())
  );

  // Filter by tier if specified
  if (tier) {
    unmatched = unmatched.filter(
      (p: IAutoTournamentParticipant) => p.tier === tier
    );
  }

  return unmatched;
};

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const WarWeekSchedule = mongoose.model<IWarWeekSchedule, IWarWeekScheduleModel>(
  'WarWeekSchedule',
  WarWeekScheduleSchema
);

export default WarWeekSchedule;
