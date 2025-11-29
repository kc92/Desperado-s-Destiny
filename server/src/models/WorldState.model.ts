/**
 * World State Model
 *
 * Tracks global world conditions like weather, time, and market states
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Weather types
 */
export enum WeatherType {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  DUST_STORM = 'DUST_STORM',
  SANDSTORM = 'SANDSTORM',
  HEAT_WAVE = 'HEAT_WAVE',
  COLD_SNAP = 'COLD_SNAP',
  FOG = 'FOG',
  THUNDERSTORM = 'THUNDERSTORM',
  // Supernatural weather
  SUPERNATURAL_MIST = 'SUPERNATURAL_MIST',
  THUNDERBIRD_STORM = 'THUNDERBIRD_STORM',
  REALITY_DISTORTION = 'REALITY_DISTORTION',
}

/**
 * Time of day periods
 */
export enum TimeOfDay {
  DAWN = 'DAWN',       // 5-7
  MORNING = 'MORNING', // 7-12
  NOON = 'NOON',       // 12-14
  AFTERNOON = 'AFTERNOON', // 14-18
  DUSK = 'DUSK',       // 18-20
  EVENING = 'EVENING', // 20-22
  NIGHT = 'NIGHT',     // 22-5
}

/**
 * Weather effects on gameplay
 */
export interface WeatherEffects {
  travelTimeModifier: number;   // 1.0 = normal, 1.5 = 50% slower
  combatModifier: number;       // Affects accuracy/damage
  energyCostModifier: number;   // Energy cost for actions
  visibilityModifier: number;   // Affects detection/stealth
  encounterModifier: number;    // Random encounter chance
  jobSuccessModifier: number;   // Job success rate modifier
  crimeDetectionModifier: number; // Crime detection chance modifier
  shopAvailabilityModifier: number; // 1.0 = all open, 0.5 = half close
  energyRegenModifier: number;  // Energy regeneration rate modifier
}

/**
 * Regional weather state
 */
export interface RegionalWeather {
  region: string;
  currentWeather: WeatherType;
  intensity: number; // 1-10
  startedAt: Date;
  endsAt: Date;
  isSupernatural: boolean;
}

/**
 * Market condition for dynamic economy
 */
export interface MarketCondition {
  itemCategory: string;
  priceModifier: number;
  supplyLevel: 'scarce' | 'low' | 'normal' | 'abundant' | 'surplus';
  demandLevel: 'none' | 'low' | 'normal' | 'high' | 'extreme';
  reason?: string;
}

/**
 * Faction power level
 */
export interface FactionPower {
  faction: string;
  power: number;          // 0-100
  trend: 'rising' | 'stable' | 'falling';
  controlledTerritories: number;
}

/**
 * World State document interface
 */
export interface IWorldState extends Document {
  // Weather (global fallback)
  currentWeather: WeatherType;
  weatherEffects: WeatherEffects;
  nextWeatherChange: Date;
  weatherForecast: { time: Date; weather: WeatherType }[];

  // Regional weather
  regionalWeather: RegionalWeather[];

  // Time
  gameHour: number;          // 0-23
  gameDay: number;           // Day of the month
  gameMonth: number;         // 1-12
  gameYear: number;          // e.g., 1885
  timeOfDay: TimeOfDay;
  lastTimeUpdate: Date;

  // Economy
  marketConditions: MarketCondition[];
  goldCirculation: number;   // Total gold in economy
  inflationRate: number;     // Price modifier

  // Factions
  factionPower: FactionPower[];

  // World flags
  worldFlags: Map<string, boolean>;  // For tracking story/event states

  // News
  currentHeadlines: string[];
  recentGossip: { text: string; location?: string; age: number }[];

  // Danger levels by region
  regionalDanger: Map<string, number>;

  // Timestamps
  updatedAt: Date;
}

// Weather effects definitions
export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffects> = {
  [WeatherType.CLEAR]: {
    travelTimeModifier: 1.0,
    combatModifier: 1.0,
    energyCostModifier: 1.0,
    visibilityModifier: 1.0,
    encounterModifier: 1.0,
    jobSuccessModifier: 1.0,
    crimeDetectionModifier: 1.0,
    shopAvailabilityModifier: 1.0,
    energyRegenModifier: 1.0,
  },
  [WeatherType.CLOUDY]: {
    travelTimeModifier: 1.0,
    combatModifier: 1.0,
    energyCostModifier: 1.0,
    visibilityModifier: 0.9,
    encounterModifier: 1.0,
    jobSuccessModifier: 1.0,
    crimeDetectionModifier: 0.95,
    shopAvailabilityModifier: 1.0,
    energyRegenModifier: 1.0,
  },
  [WeatherType.RAIN]: {
    travelTimeModifier: 1.3,
    combatModifier: 0.9,
    energyCostModifier: 1.2,
    visibilityModifier: 0.7,
    encounterModifier: 0.8,
    jobSuccessModifier: 0.85,
    crimeDetectionModifier: 0.75,
    shopAvailabilityModifier: 0.9,
    energyRegenModifier: 1.0,
  },
  [WeatherType.DUST_STORM]: {
    travelTimeModifier: 1.5,
    combatModifier: 0.7,
    energyCostModifier: 1.5,
    visibilityModifier: 0.3,
    encounterModifier: 1.3,
    jobSuccessModifier: 0.6,
    crimeDetectionModifier: 0.5,
    shopAvailabilityModifier: 0.7,
    energyRegenModifier: 0.9,
  },
  [WeatherType.SANDSTORM]: {
    travelTimeModifier: 1.7,
    combatModifier: 0.6,
    energyCostModifier: 1.6,
    visibilityModifier: 0.2,
    encounterModifier: 1.4,
    jobSuccessModifier: 0.5,
    crimeDetectionModifier: 0.4,
    shopAvailabilityModifier: 0.5,
    energyRegenModifier: 0.8,
  },
  [WeatherType.HEAT_WAVE]: {
    travelTimeModifier: 1.2,
    combatModifier: 0.9,
    energyCostModifier: 1.4,
    visibilityModifier: 1.0,
    encounterModifier: 0.9,
    jobSuccessModifier: 0.8,
    crimeDetectionModifier: 1.0,
    shopAvailabilityModifier: 0.8,
    energyRegenModifier: 0.7,
  },
  [WeatherType.COLD_SNAP]: {
    travelTimeModifier: 1.3,
    combatModifier: 0.85,
    energyCostModifier: 1.3,
    visibilityModifier: 0.9,
    encounterModifier: 0.8,
    jobSuccessModifier: 0.85,
    crimeDetectionModifier: 1.1,
    shopAvailabilityModifier: 0.9,
    energyRegenModifier: 0.8,
  },
  [WeatherType.FOG]: {
    travelTimeModifier: 1.2,
    combatModifier: 0.8,
    energyCostModifier: 1.1,
    visibilityModifier: 0.4,
    encounterModifier: 1.2,
    jobSuccessModifier: 0.9,
    crimeDetectionModifier: 0.6,
    shopAvailabilityModifier: 0.95,
    energyRegenModifier: 1.0,
  },
  [WeatherType.THUNDERSTORM]: {
    travelTimeModifier: 1.6,
    combatModifier: 0.6,
    energyCostModifier: 1.3,
    visibilityModifier: 0.5,
    encounterModifier: 0.6,
    jobSuccessModifier: 0.7,
    crimeDetectionModifier: 0.7,
    shopAvailabilityModifier: 0.7,
    energyRegenModifier: 1.0,
  },
  // Supernatural weather
  [WeatherType.SUPERNATURAL_MIST]: {
    travelTimeModifier: 1.4,
    combatModifier: 0.8,
    energyCostModifier: 1.2,
    visibilityModifier: 0.3,
    encounterModifier: 2.0,
    jobSuccessModifier: 0.7,
    crimeDetectionModifier: 0.5,
    shopAvailabilityModifier: 0.8,
    energyRegenModifier: 0.9,
  },
  [WeatherType.THUNDERBIRD_STORM]: {
    travelTimeModifier: 1.5,
    combatModifier: 1.2,
    energyCostModifier: 1.1,
    visibilityModifier: 0.6,
    encounterModifier: 0.7,
    jobSuccessModifier: 1.1,
    crimeDetectionModifier: 0.8,
    shopAvailabilityModifier: 0.9,
    energyRegenModifier: 1.2,
  },
  [WeatherType.REALITY_DISTORTION]: {
    travelTimeModifier: 2.0,
    combatModifier: 0.5,
    energyCostModifier: 1.8,
    visibilityModifier: 0.2,
    encounterModifier: 3.0,
    jobSuccessModifier: 0.3,
    crimeDetectionModifier: 0.3,
    shopAvailabilityModifier: 0.5,
    energyRegenModifier: 0.6,
  },
};

// Time of day effects
export const TIME_EFFECTS: Record<TimeOfDay, { dangerModifier: number; shopOpen: boolean; npcAvailability: number }> = {
  [TimeOfDay.DAWN]: { dangerModifier: 0.8, shopOpen: false, npcAvailability: 0.3 },
  [TimeOfDay.MORNING]: { dangerModifier: 0.6, shopOpen: true, npcAvailability: 0.8 },
  [TimeOfDay.NOON]: { dangerModifier: 0.5, shopOpen: true, npcAvailability: 1.0 },
  [TimeOfDay.AFTERNOON]: { dangerModifier: 0.6, shopOpen: true, npcAvailability: 0.9 },
  [TimeOfDay.DUSK]: { dangerModifier: 0.8, shopOpen: true, npcAvailability: 0.7 },
  [TimeOfDay.EVENING]: { dangerModifier: 1.0, shopOpen: false, npcAvailability: 0.5 },
  [TimeOfDay.NIGHT]: { dangerModifier: 1.5, shopOpen: false, npcAvailability: 0.2 },
};

const WorldStateSchema = new Schema<IWorldState>(
  {
    // Weather (global fallback)
    currentWeather: {
      type: String,
      enum: Object.values(WeatherType),
      default: WeatherType.CLEAR,
    },
    weatherEffects: {
      travelTimeModifier: { type: Number, default: 1.0 },
      combatModifier: { type: Number, default: 1.0 },
      energyCostModifier: { type: Number, default: 1.0 },
      visibilityModifier: { type: Number, default: 1.0 },
      encounterModifier: { type: Number, default: 1.0 },
      jobSuccessModifier: { type: Number, default: 1.0 },
      crimeDetectionModifier: { type: Number, default: 1.0 },
      shopAvailabilityModifier: { type: Number, default: 1.0 },
      energyRegenModifier: { type: Number, default: 1.0 },
    },
    nextWeatherChange: { type: Date, default: Date.now },
    weatherForecast: [{
      time: { type: Date },
      weather: { type: String, enum: Object.values(WeatherType) },
    }],

    // Regional weather
    regionalWeather: [{
      region: { type: String, required: true },
      currentWeather: {
        type: String,
        enum: Object.values(WeatherType),
        required: true
      },
      intensity: { type: Number, default: 5, min: 1, max: 10 },
      startedAt: { type: Date, default: Date.now },
      endsAt: { type: Date, default: Date.now },
      isSupernatural: { type: Boolean, default: false },
    }],

    // Time
    gameHour: { type: Number, default: 12, min: 0, max: 23 },
    gameDay: { type: Number, default: 1, min: 1, max: 31 },
    gameMonth: { type: Number, default: 6, min: 1, max: 12 },
    gameYear: { type: Number, default: 1885 },
    timeOfDay: {
      type: String,
      enum: Object.values(TimeOfDay),
      default: TimeOfDay.NOON,
    },
    lastTimeUpdate: { type: Date, default: Date.now },

    // Economy
    marketConditions: [{
      itemCategory: { type: String, required: true },
      priceModifier: { type: Number, default: 1.0 },
      supplyLevel: {
        type: String,
        enum: ['scarce', 'low', 'normal', 'abundant', 'surplus'],
        default: 'normal',
      },
      demandLevel: {
        type: String,
        enum: ['none', 'low', 'normal', 'high', 'extreme'],
        default: 'normal',
      },
      reason: { type: String },
    }],
    goldCirculation: { type: Number, default: 1000000 },
    inflationRate: { type: Number, default: 1.0 },

    // Factions
    factionPower: [{
      faction: { type: String, required: true },
      power: { type: Number, default: 33, min: 0, max: 100 },
      trend: {
        type: String,
        enum: ['rising', 'stable', 'falling'],
        default: 'stable',
      },
      controlledTerritories: { type: Number, default: 0 },
    }],

    // World flags
    worldFlags: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },

    // News
    currentHeadlines: [{ type: String }],
    recentGossip: [{
      text: { type: String, required: true },
      location: { type: String },
      age: { type: Number, default: 0 },
    }],

    // Danger levels
    regionalDanger: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to get time of day from hour
WorldStateSchema.methods.calculateTimeOfDay = function (hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return TimeOfDay.DAWN;
  if (hour >= 7 && hour < 12) return TimeOfDay.MORNING;
  if (hour >= 12 && hour < 14) return TimeOfDay.NOON;
  if (hour >= 14 && hour < 18) return TimeOfDay.AFTERNOON;
  if (hour >= 18 && hour < 20) return TimeOfDay.DUSK;
  if (hour >= 20 && hour < 22) return TimeOfDay.EVENING;
  return TimeOfDay.NIGHT;
};

export const WorldState = mongoose.model<IWorldState>('WorldState', WorldStateSchema);
export default WorldState;
