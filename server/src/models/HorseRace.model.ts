/**
 * Horse Race Model
 * Phase 13, Wave 13.2
 *
 * Mongoose model for horse racing events
 */

import { Schema, model, Document } from 'mongoose';
import {
  HorseRace as IHorseRace,
  RaceType,
  RaceStatus,
  WeatherCondition,
  TrackCondition,
  RaceTrackTerrainType,
  ObstacleType,
  RaceIncident,
  SilkPattern
} from '@desperados/shared';

// ============================================================================
// MONGOOSE DOCUMENT INTERFACE
// ============================================================================

// Override BettingPool to use string keys for Mongoose Maps
export interface MongooseBettingPool {
  totalPool: number;
  winPool: Map<string, number>;
  placePool: Map<string, number>;
  showPool: Map<string, number>;
  exactaPool: number;
  trifectaPool: number;
  quinellaPool: number;
  payouts?: Map<string, number>;
}

export interface HorseRaceDocument extends Omit<IHorseRace, '_id' | 'bettingPool'>, Document {
  _id: Schema.Types.ObjectId;
  bettingPool: MongooseBettingPool;

  // Instance methods
  isFull(): boolean;
  canRegister(horseId: string | Schema.Types.ObjectId, ownerId: string | Schema.Types.ObjectId): boolean;
  addToBettingPool(horseId: string | Schema.Types.ObjectId, betType: string, amount: number): void;
  startRace(): void;
  completeRace(results: any): void;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const ObstacleSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(ObstacleType),
    required: true
  },
  name: { type: String, required: true },
  difficulty: { type: Number, required: true, min: 1, max: 10 },
  position: { type: Number, required: true },
  penaltyOnFailure: { type: Number, required: true },
  injuryRisk: { type: Number, required: true, min: 0, max: 100 }
}, { _id: false });

const SilkColorsSchema = new Schema({
  pattern: {
    type: String,
    enum: Object.values(SilkPattern),
    required: true
  },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String, required: true },
  sleeves: { type: String, required: true },
  cap: { type: String, required: true }
}, { _id: false });

const RaceEntrySchema = new Schema({
  horseId: {
    type: Schema.Types.ObjectId,
    ref: 'Horse',
    required: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  jockeyId: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  jockeyNPC: { type: String },
  jockeySkillLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  postPosition: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  weight: { type: Number, required: true },
  silks: { type: SilkColorsSchema, required: true },
  scratched: { type: Boolean, default: false },
  scratchReason: { type: String },
  morningLineOdds: { type: Number, required: true },
  currentOdds: { type: Number, required: true },
  favoriteStatus: {
    type: String,
    enum: ['FAVORITE', 'CONTENDER', 'LONGSHOT'],
    required: true
  },
  recentForm: { type: [Number], default: [] },
  trackRecord: {
    starts: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    places: { type: Number, default: 0 },
    shows: { type: Number, default: 0 }
  }
}, { _id: false });

const BettingPoolSchema = new Schema({
  totalPool: { type: Number, default: 0 },
  winPool: { type: Map, of: Number, default: new Map() },
  placePool: { type: Map, of: Number, default: new Map() },
  showPool: { type: Map, of: Number, default: new Map() },
  exactaPool: { type: Number, default: 0 },
  trifectaPool: { type: Number, default: 0 },
  quinellaPool: { type: Number, default: 0 },
  payouts: { type: Map, of: Number }
}, { _id: false });

const RaceResultSchema = new Schema({
  position: { type: Number, required: true },
  horseId: {
    type: Schema.Types.ObjectId,
    ref: 'Horse',
    required: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  jockeyId: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  finalTime: { type: Number, required: true },
  margins: { type: [Number], default: [] },
  topSpeed: { type: Number, required: true },
  avgSpeed: { type: Number, required: true },
  incidents: {
    type: [String],
    enum: Object.values(RaceIncident),
    default: []
  },
  positionChanges: { type: Number, default: 0 },
  prizeMoney: { type: Number, required: true },
  experienceGained: { type: Number, required: true },
  reputationGained: { type: Number, required: true },
  trackRecord: { type: Boolean, default: false },
  perfectRun: { type: Boolean, default: false }
}, { _id: false });

const RaceIncidentReportSchema = new Schema({
  id: { type: String, required: true },
  time: { type: Number, required: true },
  type: {
    type: String,
    enum: Object.values(RaceIncident),
    required: true
  },
  involvedHorses: [{
    type: Schema.Types.ObjectId,
    ref: 'Horse'
  }],
  description: { type: String, required: true },
  timeImpact: { type: Number, default: 0 },
  causesDQ: { type: Boolean, default: false },
  underReview: { type: Boolean, default: false }
}, { _id: false });

const HorseRaceSchema = new Schema<HorseRaceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    raceType: {
      type: String,
      enum: Object.values(RaceType),
      required: true,
      index: true
    },

    prestige: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },

    // Track information
    trackId: {
      type: String,
      required: true,
      index: true
    },

    distance: {
      type: Number,
      required: true,
      min: 1
    },

    terrain: {
      type: [String],
      enum: Object.values(RaceTrackTerrainType),
      required: true
    },

    obstacles: {
      type: [ObstacleSchema],
      default: []
    },

    // Entry requirements
    entryFee: {
      type: Number,
      required: true,
      min: 0
    },

    minHorseLevel: {
      type: Number,
      default: 1,
      min: 1
    },

    maxHorseLevel: {
      type: Number
    },

    breedRestrictions: {
      type: [String],
      default: []
    },

    maxEntrants: {
      type: Number,
      required: true,
      min: 2,
      max: 12
    },

    registeredHorses: {
      type: [RaceEntrySchema],
      default: []
    },

    // Timing
    scheduledStart: {
      type: Date,
      required: true,
      index: true
    },

    registrationDeadline: {
      type: Date,
      required: true
    },

    postTime: {
      type: Date,
      required: true
    },

    raceStatus: {
      type: String,
      enum: Object.values(RaceStatus),
      default: RaceStatus.UPCOMING,
      index: true
    },

    // Conditions
    weather: {
      type: String,
      enum: Object.values(WeatherCondition),
      required: true
    },

    trackCondition: {
      type: String,
      enum: Object.values(TrackCondition),
      required: true
    },

    temperature: {
      type: Number,
      required: true
    },

    // Prize structure
    purse: {
      type: Number,
      required: true,
      min: 0
    },

    prizeDistribution: {
      type: [Number],
      required: true
    },

    bonusPrizes: {
      trackRecord: { type: Number, default: 0 },
      perfectRun: { type: Number, default: 0 }
    },

    // Betting
    bettingPool: {
      type: BettingPoolSchema,
      default: () => ({
        totalPool: 0,
        winPool: new Map(),
        placePool: new Map(),
        showPool: new Map(),
        exactaPool: 0,
        trifectaPool: 0,
        quinellaPool: 0
      })
    },

    totalWagered: {
      type: Number,
      default: 0
    },

    trackTakePercentage: {
      type: Number,
      default: 0.15,
      min: 0,
      max: 1
    },

    // Results (after completion)
    results: {
      type: [RaceResultSchema],
      default: []
    },

    finalTime: {
      type: Number
    },

    incidents: {
      type: [RaceIncidentReportSchema],
      default: []
    },

    // Special event
    isSpecialEvent: {
      type: Boolean,
      default: false
    },

    specialEventId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// ============================================================================
// INDEXES
// ============================================================================

HorseRaceSchema.index({ trackId: 1, scheduledStart: 1 });
HorseRaceSchema.index({ raceStatus: 1, scheduledStart: 1 });
HorseRaceSchema.index({ isSpecialEvent: 1, specialEventId: 1 });
HorseRaceSchema.index({ 'registeredHorses.ownerId': 1 });
HorseRaceSchema.index({ 'registeredHorses.horseId': 1 });

// ============================================================================
// VIRTUALS
// ============================================================================

HorseRaceSchema.virtual('isFull').get(function (this: HorseRaceDocument) {
  return this.registeredHorses.filter(h => !h.scratched).length >= this.maxEntrants;
});

HorseRaceSchema.virtual('activeEntrants').get(function (this: HorseRaceDocument) {
  return this.registeredHorses.filter(h => !h.scratched).length;
});

HorseRaceSchema.virtual('canRegister').get(function (this: HorseRaceDocument) {
  const now = new Date();
  return (
    this.raceStatus === RaceStatus.UPCOMING &&
    now < this.registrationDeadline &&
    !this.isFull
  );
});

HorseRaceSchema.virtual('timeUntilRace').get(function (this: HorseRaceDocument) {
  const now = new Date();
  return Math.max(0, this.scheduledStart.getTime() - now.getTime());
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Register a horse for the race
 */
HorseRaceSchema.methods.registerHorse = function (
  this: HorseRaceDocument,
  entry: any
) {
  if (!this.canRegister) {
    throw new Error('Registration is closed');
  }

  // Check if horse already registered
  const alreadyRegistered = this.registeredHorses.some(
    e => e.horseId.toString() === entry.horseId.toString()
  );

  if (alreadyRegistered) {
    throw new Error('Horse already registered for this race');
  }

  // Assign post position
  entry.postPosition = this.registeredHorses.length + 1;

  this.registeredHorses.push(entry);
  return entry.postPosition;
};

/**
 * Scratch a horse from the race
 */
HorseRaceSchema.methods.scratchHorse = function (
  this: HorseRaceDocument,
  horseId: Schema.Types.ObjectId,
  reason: string
) {
  const entry = this.registeredHorses.find(
    e => e.horseId.toString() === horseId.toString()
  );

  if (!entry) {
    throw new Error('Horse not registered for this race');
  }

  entry.scratched = true;
  entry.scratchReason = reason;
};

/**
 * Update odds for a horse
 */
HorseRaceSchema.methods.updateOdds = function (
  this: HorseRaceDocument,
  horseId: Schema.Types.ObjectId,
  newOdds: number
) {
  const entry = this.registeredHorses.find(
    e => e.horseId.toString() === horseId.toString()
  );

  if (entry) {
    entry.currentOdds = newOdds;

    // Update favorite status
    if (newOdds < 3.0) {
      entry.favoriteStatus = 'FAVORITE';
    } else if (newOdds < 20.0) {
      entry.favoriteStatus = 'CONTENDER';
    } else {
      entry.favoriteStatus = 'LONGSHOT';
    }
  }
};

/**
 * Add bet to betting pool
 */
HorseRaceSchema.methods.addToBettingPool = function (
  this: HorseRaceDocument,
  horseId: string | Schema.Types.ObjectId,
  betType: string,
  amount: number
) {
  this.totalWagered += amount;
  this.bettingPool.totalPool += amount;

  const horseIdStr = typeof horseId === 'string' ? horseId : horseId.toString();

  if (betType === 'WIN') {
    const current = this.bettingPool.winPool.get(horseIdStr) || 0;
    this.bettingPool.winPool.set(horseIdStr, current + amount);
  } else if (betType === 'PLACE') {
    const current = this.bettingPool.placePool.get(horseIdStr) || 0;
    this.bettingPool.placePool.set(horseIdStr, current + amount);
  } else if (betType === 'SHOW') {
    const current = this.bettingPool.showPool.get(horseIdStr) || 0;
    this.bettingPool.showPool.set(horseIdStr, current + amount);
  } else if (betType === 'EXACTA') {
    this.bettingPool.exactaPool += amount;
  } else if (betType === 'TRIFECTA') {
    this.bettingPool.trifectaPool += amount;
  } else if (betType === 'QUINELLA') {
    this.bettingPool.quinellaPool += amount;
  }
};

/**
 * Start the race
 */
HorseRaceSchema.methods.startRace = function (this: HorseRaceDocument) {
  if (this.raceStatus !== RaceStatus.POST_TIME) {
    throw new Error('Race must be at post time to start');
  }

  const activeHorses = this.registeredHorses.filter(h => !h.scratched);
  if (activeHorses.length < 2) {
    throw new Error('Not enough horses to start race');
  }

  this.raceStatus = RaceStatus.IN_PROGRESS;
  this.postTime = new Date();
};

/**
 * Complete the race with results
 */
HorseRaceSchema.methods.completeRace = function (
  this: HorseRaceDocument,
  results: any[]
) {
  if (this.raceStatus !== RaceStatus.IN_PROGRESS) {
    throw new Error('Race must be in progress to complete');
  }

  this.results = results;
  this.raceStatus = RaceStatus.COMPLETED;
  this.finalTime = results[0]?.finalTime;

  // Update horse racing history
  this.registeredHorses.forEach(entry => {
    const result = results.find(
      r => r.horseId.toString() === entry.horseId.toString()
    );

    if (result) {
      // Update recent form
      entry.recentForm.unshift(result.position);
      if (entry.recentForm.length > 5) {
        entry.recentForm = entry.recentForm.slice(0, 5);
      }

      // Update track record
      if (!entry.trackRecord) {
        entry.trackRecord = { starts: 0, wins: 0, places: 0, shows: 0 };
      }

      entry.trackRecord.starts++;
      if (result.position === 1) entry.trackRecord.wins++;
      if (result.position === 2) entry.trackRecord.places++;
      if (result.position === 3) entry.trackRecord.shows++;
    }
  });
};

/**
 * Add incident to race
 */
HorseRaceSchema.methods.addIncident = function (
  this: HorseRaceDocument,
  incident: any
) {
  this.incidents.push(incident);

  if (incident.causesDQ) {
    this.raceStatus = RaceStatus.UNDER_REVIEW;
  }
};

// ============================================================================
// STATICS
// ============================================================================

/**
 * Get upcoming races for a track
 */
HorseRaceSchema.statics.getUpcomingRaces = function (trackId: string) {
  return this.find({
    trackId,
    raceStatus: RaceStatus.UPCOMING,
    scheduledStart: { $gt: new Date() }
  })
    .sort({ scheduledStart: 1 })
    .limit(10);
};

/**
 * Get races a horse is registered for
 */
HorseRaceSchema.statics.getRacesForHorse = function (
  horseId: Schema.Types.ObjectId
) {
  return this.find({
    'registeredHorses.horseId': horseId,
    raceStatus: { $in: [RaceStatus.UPCOMING, RaceStatus.POST_TIME] }
  });
};

/**
 * Get races a character is involved in
 */
HorseRaceSchema.statics.getRacesForCharacter = function (
  characterId: Schema.Types.ObjectId
) {
  return this.find({
    'registeredHorses.ownerId': characterId,
    raceStatus: { $in: [RaceStatus.UPCOMING, RaceStatus.POST_TIME, RaceStatus.IN_PROGRESS] }
  });
};

/**
 * Get completed races for statistics
 */
HorseRaceSchema.statics.getCompletedRaces = function (
  filter: any = {},
  limit: number = 50
) {
  return this.find({
    raceStatus: RaceStatus.COMPLETED,
    ...filter
  })
    .sort({ scheduledStart: -1 })
    .limit(limit);
};

// ============================================================================
// EXPORT
// ============================================================================

export const HorseRace = model<HorseRaceDocument>('HorseRace', HorseRaceSchema);
