/**
 * Calendar and Season Types
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Types for the seasonal calendar system that tracks game time,
 * seasons, holidays, and their effects on gameplay
 */

import { WeatherType } from './weather.types';

/**
 * Seasons of the year with distinct gameplay effects
 */
export enum Season {
  SPRING = 'SPRING',   // March-May: Planting, rebirth, muddy roads
  SUMMER = 'SUMMER',   // June-August: Hot, dry, peak activity
  FALL = 'FALL',       // September-November: Harvest, cooling
  WINTER = 'WINTER',   // December-February: Cold, harsh, scarce
}

/**
 * Months of the year
 */
export enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12,
}

/**
 * Moon phases for supernatural events and bonuses
 */
export enum MoonPhase {
  NEW_MOON = 'NEW_MOON',           // 0% illumination - crime bonus
  WAXING_CRESCENT = 'WAXING_CRESCENT',
  FIRST_QUARTER = 'FIRST_QUARTER',
  WAXING_GIBBOUS = 'WAXING_GIBBOUS',
  FULL_MOON = 'FULL_MOON',         // 100% illumination - supernatural events
  WANING_GIBBOUS = 'WANING_GIBBOUS',
  LAST_QUARTER = 'LAST_QUARTER',
  WANING_CRESCENT = 'WANING_CRESCENT',
}

/**
 * Day of the week (game calendar)
 */
export enum GameDayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Item categories affected by seasonal pricing
 */
export type ItemCategory =
  | 'crops'
  | 'livestock'
  | 'furs'
  | 'fish'
  | 'wood'
  | 'ore'
  | 'medicine'
  | 'clothing'
  | 'weapons'
  | 'ammunition'
  | 'food'
  | 'alcohol'
  | 'luxury';

/**
 * Seasonal effects on gameplay
 */
export interface SeasonalEffects {
  season: Season;
  weatherPatterns: WeatherProbability[];

  // Travel
  travelSpeedModifier: number;    // 0.7-1.2 (70%-120% of normal speed)
  travelDangerModifier: number;   // 0.8-1.5 (more danger = higher value)
  roadCondition: RoadCondition;

  // Economy
  cropYieldModifier: number;      // Affects farming/gathering yields
  animalSpawnModifier: number;    // Affects hunting spawns
  fishingModifier: number;        // Affects fishing success
  priceModifiers: Map<ItemCategory, number>;

  // Activities
  huntingBonus: number;           // Bonus to hunting success
  fishingBonus: number;           // Bonus to fishing success
  miningPenalty: number;          // Penalty to mining (winter cold)
  gatheringBonus: number;         // Bonus to herb/resource gathering

  // Atmosphere
  dayLengthHours: number;         // Hours of daylight (affects time of day)
  temperatureRange: [number, number]; // Min/max temp in Fahrenheit
  specialWeatherChance: number;  // Chance of special weather events

  // Gameplay
  energyCostModifier: number;     // General energy cost for actions
  healthDrainRate: number;        // Cold/heat damage rate
  npcActivityModifier: number;    // NPC availability
}

/**
 * Road conditions by season
 */
export type RoadCondition =
  | 'excellent'    // Fast travel
  | 'good'         // Normal
  | 'muddy'        // Slower, spring
  | 'dusty'        // Visibility issues, summer
  | 'icy'          // Dangerous, winter
  | 'flooded'      // Impassable in places
  | 'snowed-in';   // Very slow, winter

/**
 * Weather probability by season
 */
export interface WeatherProbability {
  weather: WeatherType;
  probability: number; // 0-1
}

/**
 * Holiday definition
 */
export interface Holiday {
  id: string;
  name: string;
  month: Month;
  day: number;                    // 1-31
  description: string;
  effects: HolidayEffects;
  activities: string[];           // Special activities available
  isSupernatural: boolean;        // Halloween, etc.
}

/**
 * Effects of a holiday
 */
export interface HolidayEffects {
  shopPriceModifier: number;      // Sales/markups
  npcMoodBonus: number;           // NPCs are happier
  energyRegenBonus: number;       // Extra energy regen
  specialEventsChance: number;    // Chance of special events
  gatheringBonus?: number;        // Easter egg hunts, etc.
  combatModifier?: number;        // Some holidays increase violence
}

/**
 * Scheduled event (not a holiday, but a recurring/one-time event)
 */
export interface ScheduledEvent {
  id: string;
  name: string;
  type: ScheduledEventType;
  startDate: GameDate;
  endDate?: GameDate;             // Optional for one-time events
  recurring: boolean;
  recurrencePattern?: RecurrencePattern;
  description: string;
  effects: Record<string, number>;
}

/**
 * Types of scheduled events
 */
export type ScheduledEventType =
  | 'festival'
  | 'cattle-drive'
  | 'harvest'
  | 'election'
  | 'war'
  | 'drought'
  | 'plague'
  | 'gold-rush'
  | 'tournament';

/**
 * Recurrence pattern for events
 */
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;               // Every N days/weeks/months/years
  specificDay?: GameDayOfWeek;        // For weekly recurrence
  specificDate?: number;          // For monthly/yearly (day of month)
}

/**
 * Complete game date
 */
export interface GameDate {
  year: number;
  month: Month;
  week: number;                   // 1-4 (week of the month)
  day: number;                    // 1-7 (day of the week, 1=Sunday)
  season: Season;
  holiday?: Holiday;
  moonPhase: MoonPhase;
}

/**
 * Full calendar state
 */
export interface GameCalendar {
  currentYear: number;
  currentMonth: Month;
  currentWeek: number;            // 1-4
  currentDay: number;             // 1-7
  currentSeason: Season;
  currentMoonPhase: MoonPhase;

  // Special dates
  holidays: Holiday[];
  activeHoliday?: Holiday;
  scheduledEvents: ScheduledEvent[];
  activeEvents: ScheduledEvent[];

  // Real-world sync
  realWorldStartDate: Date;       // When the game world started in real time
  gameYearZero: Date;             // The in-game epoch (e.g., Jan 1, 1885)

  // Current effects
  seasonalEffects: SeasonalEffects;

  // Timestamps
  lastTick: Date;                 // Last time calendar advanced
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Monthly theme and content
 */
export interface MonthlyTheme {
  month: Month;
  name: string;
  season: Season;
  description: string;
  themeColor: string;             // Hex color for UI
  weatherEmphasis: string;        // Description of typical weather
  economicFocus: string;          // What's happening economically
  activities: string[];           // Recommended activities
  flavorEvents: string[];         // Random flavor events
  dangerLevel: number;            // 1-10 base danger
}

/**
 * Moon phase effects
 */
export interface MoonPhaseEffects {
  phase: MoonPhase;
  illumination: number;           // 0-1 (0% to 100%)

  // Crime
  crimeDetectionModifier: number; // Easier to hide in darkness
  crimeBonusGold: number;         // Extra loot on new moon

  // Supernatural
  supernaturalEncounterChance: number;
  weirdWestPowerBonus: number;    // Weird west abilities stronger

  // Other
  fishingBonus: number;           // Fish more active on full moon
  npcBehaviorModifier: number;    // NPCs act strange on full moon
  wolfActivityBonus: number;      // Wolves/werewolves more active
}

/**
 * Time conversion constants
 */
export interface TimeConversion {
  realDaysPerGameWeek: number;    // 1 real day = 1 game week
  realDaysPerGameMonth: number;   // 7 real days = 1 game month
  realDaysPerGameYear: number;    // 84 real days = 1 game year
  gameMonthsPerSeason: number;    // 3 months per season
}

/**
 * API Response: Get calendar state
 */
export interface GetCalendarResponse {
  success: boolean;
  data: {
    calendar: GameCalendar;
    currentDate: GameDate;
    timeConversion: TimeConversion;
    upcomingHolidays: Holiday[];
    upcomingEvents: ScheduledEvent[];
  };
}

/**
 * API Response: Get season info
 */
export interface GetSeasonInfoResponse {
  success: boolean;
  data: {
    currentSeason: Season;
    effects: SeasonalEffects;
    daysUntilNextSeason: number;
    monthlyTheme: MonthlyTheme;
  };
}

/**
 * API Response: Get holidays
 */
export interface GetHolidaysResponse {
  success: boolean;
  data: {
    holidays: Holiday[];
    activeHoliday?: Holiday;
    upcoming: Holiday[];
  };
}

/**
 * API Response: Get moon phase
 */
export interface GetMoonPhaseResponse {
  success: boolean;
  data: {
    phase: MoonPhase;
    illumination: number;
    effects: MoonPhaseEffects;
    daysUntilFullMoon: number;
    daysUntilNewMoon: number;
  };
}

/**
 * API Request: Advance time (admin)
 */
export interface AdvanceTimeRequest {
  days?: number;
  weeks?: number;
  months?: number;
  toDate?: GameDate;
}

/**
 * Seasonal content triggers
 */
export interface SeasonalTrigger {
  triggerId: string;
  season: Season;
  month?: Month;
  condition: string;              // Description of when this triggers
  contentType: 'quest' | 'event' | 'dialogue' | 'spawn' | 'weather';
  contentId: string;              // ID of the quest/event/etc.
  priority: number;               // Higher priority triggers first
}

/**
 * Calendar event for frontend display
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: GameDate;
  type: 'holiday' | 'event' | 'personal' | 'seasonal';
  description: string;
  icon?: string;
  color?: string;
}

/**
 * Time calculation result
 */
export interface TimeCalculation {
  gameWeeksPassed: number;
  gameMonthsPassed: number;
  gameYearsPassed: number;
  currentGameDate: GameDate;
}
