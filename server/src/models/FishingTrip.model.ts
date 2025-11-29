/**
 * FishingTrip Model
 *
 * Mongoose schema for tracking active fishing sessions and history
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  FishingSession,
  FishFightState,
  CaughtFish,
  FishingSetup,
  SpotType,
  FishingTimeOfDay,
  FishingWeather,
  FightPhase,
  FishSize,
  FishRarity
} from '@desperados/shared';

/**
 * FishingTrip document interface
 */
export interface IFishingTrip extends Document {
  // Character
  characterId: mongoose.Types.ObjectId;

  // Location and setup
  locationId: string;
  spotType: SpotType;
  setup: FishingSetup;

  // Session state
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
  lastBiteCheck: Date;

  // Current state
  isWaiting: boolean;
  hasBite: boolean;
  biteExpiresAt?: Date;

  // Current fish (if fighting)
  currentFish?: {
    speciesId: string;
    weight: number;
    size: FishSize;
    fightState: FishFightState;
  };

  // Environment
  timeOfDay: FishingTimeOfDay;
  weather: FishingWeather;

  // Session stats
  catchCount: number;
  totalValue: number;
  totalExperience: number;

  // Catches history
  catches: CaughtFish[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  toSafeObject(): any;
  endSession(): void;
}

/**
 * FishingTrip static methods interface
 */
export interface IFishingTripModel extends Model<IFishingTrip> {
  findActiveTrip(characterId: string): Promise<IFishingTrip | null>;
  getCharacterFishingStats(characterId: string): Promise<any>;
}

/**
 * Fight state sub-schema
 */
const FightStateSchema = new Schema({
  phase: {
    type: String,
    enum: Object.values(FightPhase),
    required: true
  },
  fishStamina: {
    type: Number,
    required: true,
    min: 0
  },
  lineTension: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  playerStamina: {
    type: Number,
    required: true,
    min: 0
  },
  roundsElapsed: {
    type: Number,
    default: 0
  },
  lastAction: {
    type: String,
    enum: ['REEL', 'LET_RUN', 'WAIT'],
    default: 'WAIT'
  },
  tensionHistory: [{
    type: Number
  }],
  hookStrength: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  }
}, { _id: false });

/**
 * Caught fish sub-schema
 */
const CaughtFishSchema = new Schema({
  speciesId: {
    type: String,
    required: true
  },
  speciesName: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    enum: Object.values(FishSize),
    required: true
  },
  quality: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  goldValue: {
    type: Number,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  drops: [{
    itemId: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  isNewRecord: {
    type: Boolean,
    default: false
  },
  isFirstCatch: {
    type: Boolean,
    default: false
  },
  caughtAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    required: true
  }
}, { _id: false });

/**
 * Setup sub-schema
 */
const SetupSchema = new Schema({
  rodId: {
    type: String,
    required: true
  },
  reelId: {
    type: String,
    required: true
  },
  lineId: {
    type: String,
    required: true
  },
  baitId: {
    type: String
  },
  lureId: {
    type: String
  }
}, { _id: false });

/**
 * FishingTrip schema definition
 */
const FishingTripSchema = new Schema<IFishingTrip>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    locationId: {
      type: String,
      required: true,
      index: true
    },

    spotType: {
      type: String,
      enum: Object.values(SpotType),
      required: true
    },

    setup: {
      type: SetupSchema,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    endedAt: {
      type: Date
    },

    lastBiteCheck: {
      type: Date,
      default: Date.now
    },

    isWaiting: {
      type: Boolean,
      default: true
    },

    hasBite: {
      type: Boolean,
      default: false
    },

    biteExpiresAt: {
      type: Date
    },

    currentFish: {
      speciesId: { type: String },
      weight: { type: Number },
      size: {
        type: String,
        enum: Object.values(FishSize)
      },
      fightState: FightStateSchema
    },

    timeOfDay: {
      type: String,
      enum: Object.values(FishingTimeOfDay),
      required: true
    },

    weather: {
      type: String,
      enum: Object.values(FishingWeather),
      required: true
    },

    catchCount: {
      type: Number,
      default: 0
    },

    totalValue: {
      type: Number,
      default: 0
    },

    totalExperience: {
      type: Number,
      default: 0
    },

    catches: {
      type: [CaughtFishSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
FishingTripSchema.index({ characterId: 1, isActive: 1 });
FishingTripSchema.index({ locationId: 1, isActive: 1 });
FishingTripSchema.index({ startedAt: -1 });

/**
 * Instance method: Return safe trip object
 */
FishingTripSchema.methods.toSafeObject = function(this: IFishingTrip) {
  return {
    id: this._id.toString(),
    characterId: this.characterId.toString(),
    locationId: this.locationId,
    spotType: this.spotType,
    setup: this.setup,
    isActive: this.isActive,
    startedAt: this.startedAt,
    endedAt: this.endedAt,
    lastBiteCheck: this.lastBiteCheck,
    isWaiting: this.isWaiting,
    hasBite: this.hasBite,
    biteExpiresAt: this.biteExpiresAt,
    currentFish: this.currentFish,
    timeOfDay: this.timeOfDay,
    weather: this.weather,
    catchCount: this.catchCount,
    totalValue: this.totalValue,
    totalExperience: this.totalExperience,
    catches: this.catches
  };
};

/**
 * Instance method: End fishing session
 */
FishingTripSchema.methods.endSession = function(this: IFishingTrip): void {
  this.isActive = false;
  this.endedAt = new Date();
  this.isWaiting = false;
  this.hasBite = false;
  this.currentFish = undefined;
};

/**
 * Static method: Find active fishing trip for character
 */
FishingTripSchema.statics.findActiveTrip = async function(
  characterId: string
): Promise<IFishingTrip | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    isActive: true
  });
};

/**
 * Static method: Get character's fishing statistics
 */
FishingTripSchema.statics.getCharacterFishingStats = async function(
  characterId: string
): Promise<any> {
  const trips = await this.find({
    characterId: new mongoose.Types.ObjectId(characterId)
  });

  let totalCatches = 0;
  let totalValue = 0;
  let totalExperience = 0;
  let biggestFish: CaughtFish | null = null;
  const speciesCaught = new Set<string>();
  const locationsVisited = new Set<string>();
  const legendaryCatches: CaughtFish[] = [];

  let commonCaught = 0;
  let qualityCaught = 0;
  let rareCaught = 0;
  let legendaryCaught = 0;

  for (const trip of trips) {
    totalCatches += trip.catchCount;
    totalValue += trip.totalValue;
    totalExperience += trip.totalExperience;
    locationsVisited.add(trip.locationId);

    for (const caught of trip.catches) {
      speciesCaught.add(caught.speciesId);

      // Track biggest
      if (!biggestFish || caught.weight > biggestFish.weight) {
        biggestFish = caught;
      }

      // Track by rarity (would need to look up fish data)
      // For now, assume legendary if value > 500
      if (caught.goldValue >= 500) {
        legendaryCaught++;
        legendaryCatches.push(caught);
      } else if (caught.goldValue >= 100) {
        rareCaught++;
      } else if (caught.goldValue >= 30) {
        qualityCaught++;
      } else {
        commonCaught++;
      }
    }
  }

  return {
    totalCatches,
    totalValue,
    totalExperience,
    biggestFish,
    commonCaught,
    qualityCaught,
    rareCaught,
    legendaryCaught,
    speciesCaught: Array.from(speciesCaught),
    legendaryCatches: legendaryCatches.slice(0, 10), // Last 10
    locationsVisited: Array.from(locationsVisited)
  };
};

/**
 * FishingTrip model
 */
export const FishingTrip = mongoose.model<IFishingTrip, IFishingTripModel>(
  'FishingTrip',
  FishingTripSchema
);
