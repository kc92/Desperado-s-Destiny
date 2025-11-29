/**
 * Game Calendar Model
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Singleton model that tracks the global game time and calendar state
 */

import mongoose, { Document, Schema } from 'mongoose';
import {
  Season,
  Month,
  MoonPhase,
  Holiday,
  ScheduledEvent,
  SeasonalEffects,
} from '@desperados/shared';

/**
 * Game Calendar document interface
 */
export interface IGameCalendar extends Document {
  // Current date/time
  currentYear: number;
  currentMonth: Month;
  currentWeek: number; // 1-4
  currentDay: number; // 1-7 (day of week, 1=Sunday)
  currentSeason: Season;
  currentMoonPhase: MoonPhase;

  // Special dates
  holidays: Holiday[];
  activeHolidayId?: string;
  scheduledEvents: ScheduledEvent[];
  activeEventIds: string[];

  // Real-world sync
  realWorldStartDate: Date;
  gameYearZero: Date;

  // Current effects (denormalized for performance)
  seasonalEffects: {
    season: Season;
    travelSpeedModifier: number;
    travelDangerModifier: number;
    cropYieldModifier: number;
    animalSpawnModifier: number;
    fishingModifier: number;
    huntingBonus: number;
    fishingBonus: number;
    energyCostModifier: number;
    healthDrainRate: number;
  };

  // Timestamps
  lastTick: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  advanceTime(days: number): void;
  getCurrentDate(): {
    year: number;
    month: Month;
    week: number;
    day: number;
    season: Season;
    moonPhase: MoonPhase;
  };
  getDayOfYear(): number;
  isHoliday(): boolean;
  getActiveHoliday(): Holiday | null;
}

const GameCalendarSchema = new Schema<IGameCalendar>(
  {
    // Current date/time
    currentYear: {
      type: Number,
      required: true,
      default: 1885,
      min: 1880,
      max: 1900,
    },
    currentMonth: {
      type: Number,
      required: true,
      default: Month.JUNE,
      min: 1,
      max: 12,
    },
    currentWeek: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 4,
    },
    currentDay: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 7,
    },
    currentSeason: {
      type: String,
      enum: Object.values(Season),
      required: true,
      default: Season.SUMMER,
    },
    currentMoonPhase: {
      type: String,
      enum: Object.values(MoonPhase),
      required: true,
      default: MoonPhase.FULL_MOON,
    },

    // Special dates
    holidays: {
      type: [
        {
          id: String,
          name: String,
          month: Number,
          day: Number,
          description: String,
          effects: {
            shopPriceModifier: Number,
            npcMoodBonus: Number,
            energyRegenBonus: Number,
            specialEventsChance: Number,
            gatheringBonus: Number,
            combatModifier: Number,
          },
          activities: [String],
          isSupernatural: Boolean,
        },
      ],
      default: [],
    },
    activeHolidayId: {
      type: String,
      default: undefined,
    },
    scheduledEvents: {
      type: [
        {
          id: String,
          name: String,
          type: String,
          startDate: {
            year: Number,
            month: Number,
            week: Number,
            day: Number,
            season: String,
            moonPhase: String,
          },
          endDate: {
            year: Number,
            month: Number,
            week: Number,
            day: Number,
            season: String,
            moonPhase: String,
          },
          recurring: Boolean,
          recurrencePattern: {
            frequency: String,
            interval: Number,
            specificDay: Number,
            specificDate: Number,
          },
          description: String,
          effects: {
            type: Map,
            of: Number,
          },
        },
      ],
      default: [],
    },
    activeEventIds: {
      type: [String],
      default: [],
    },

    // Real-world sync
    realWorldStartDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    gameYearZero: {
      type: Date,
      required: true,
      default: () => new Date('1885-06-01'),
    },

    // Current effects (denormalized)
    seasonalEffects: {
      season: {
        type: String,
        enum: Object.values(Season),
        default: Season.SUMMER,
      },
      travelSpeedModifier: { type: Number, default: 1.0 },
      travelDangerModifier: { type: Number, default: 1.0 },
      cropYieldModifier: { type: Number, default: 1.0 },
      animalSpawnModifier: { type: Number, default: 1.0 },
      fishingModifier: { type: Number, default: 1.0 },
      huntingBonus: { type: Number, default: 0 },
      fishingBonus: { type: Number, default: 0 },
      energyCostModifier: { type: Number, default: 1.0 },
      healthDrainRate: { type: Number, default: 0 },
    },

    // Timestamps
    lastTick: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
GameCalendarSchema.index({ currentYear: 1, currentMonth: 1 });
GameCalendarSchema.index({ activeHolidayId: 1 });
GameCalendarSchema.index({ lastTick: 1 });

/**
 * Advance time by a number of game days
 */
GameCalendarSchema.methods.advanceTime = function (days: number): void {
  // Each game week is 7 days
  // Each game month is 4 weeks (28 days)
  // So advancing by days means:

  let totalDays = (this.currentWeek - 1) * 7 + this.currentDay + days;

  // Calculate new week and day
  this.currentWeek = Math.floor(totalDays / 7) + 1;
  this.currentDay = (totalDays % 7) || 7;

  // Handle month overflow
  while (this.currentWeek > 4) {
    this.currentWeek -= 4;
    this.currentMonth += 1;

    // Handle year overflow
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear += 1;
    }
  }

  // Update season based on month
  this.currentSeason = this.getSeasonForMonth(this.currentMonth);

  // Update moon phase
  const dayOfYear = this.getDayOfYear();
  this.currentMoonPhase = this.calculateMoonPhase(dayOfYear);

  this.lastTick = new Date();
};

/**
 * Get current date as object
 */
GameCalendarSchema.methods.getCurrentDate = function () {
  return {
    year: this.currentYear,
    month: this.currentMonth,
    week: this.currentWeek,
    day: this.currentDay,
    season: this.currentSeason,
    moonPhase: this.currentMoonPhase,
  };
};

/**
 * Get day of year (approximate)
 */
GameCalendarSchema.methods.getDayOfYear = function (): number {
  // 28 days per month (4 weeks * 7 days)
  const daysFromMonths = (this.currentMonth - 1) * 28;
  const daysFromWeeks = (this.currentWeek - 1) * 7;
  const currentDay = this.currentDay;

  return daysFromMonths + daysFromWeeks + currentDay;
};

/**
 * Get season for a given month
 */
GameCalendarSchema.methods.getSeasonForMonth = function (month: Month): Season {
  if (month >= 3 && month <= 5) return Season.SPRING;
  if (month >= 6 && month <= 8) return Season.SUMMER;
  if (month >= 9 && month <= 11) return Season.FALL;
  return Season.WINTER;
};

/**
 * Calculate moon phase based on day of year
 */
GameCalendarSchema.methods.calculateMoonPhase = function (dayOfYear: number): MoonPhase {
  const LUNAR_CYCLE_DAYS = 28;
  const DAYS_PER_PHASE = LUNAR_CYCLE_DAYS / 8;

  const cyclePosition = dayOfYear % LUNAR_CYCLE_DAYS;
  const phaseIndex = Math.floor(cyclePosition / DAYS_PER_PHASE);

  const phases = [
    MoonPhase.NEW_MOON,
    MoonPhase.WAXING_CRESCENT,
    MoonPhase.FIRST_QUARTER,
    MoonPhase.WAXING_GIBBOUS,
    MoonPhase.FULL_MOON,
    MoonPhase.WANING_GIBBOUS,
    MoonPhase.LAST_QUARTER,
    MoonPhase.WANING_CRESCENT,
  ];

  return phases[Math.min(phaseIndex, 7)];
};

/**
 * Check if today is a holiday
 */
GameCalendarSchema.methods.isHoliday = function (): boolean {
  return this.activeHolidayId !== undefined && this.activeHolidayId !== null;
};

/**
 * Get active holiday
 */
GameCalendarSchema.methods.getActiveHoliday = function (): Holiday | null {
  if (!this.activeHolidayId) return null;

  const holiday = this.holidays.find((h: Holiday) => h.id === this.activeHolidayId);
  return holiday || null;
};

export const GameCalendarModel = mongoose.model<IGameCalendar>(
  'GameCalendar',
  GameCalendarSchema
);
export default GameCalendarModel;
