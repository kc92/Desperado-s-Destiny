/**
 * Time Service
 *
 * Manages the game's time-of-day system including:
 * - Time period calculation
 * - Building operating hours
 * - Time-based gameplay modifiers
 * - NPC availability (basic, expanded in Phase 3)
 * - Crime time restrictions and modifiers
 */

import {
  TimePeriod,
  TimeState,
  TimeEffects,
  ShopType,
  BuildingCategory,
  BuildingAccessResult,
  CrimeAvailabilityResult,
  CrimeTimeRestriction,
  BuildingTimeProfile,
} from '@desperados/shared';
import type { OperatingHours, LocationType } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Game time configuration
 * 4:1 ratio means 1 real hour = 4 game hours (full day cycle in 6 real hours)
 */
const GAME_TIME_RATIO = 4;
const GAME_START_TIME = new Date('2024-01-01T06:00:00Z'); // Game time epoch

/**
 * Crime time restrictions
 * Define which crimes are only available at certain times
 */
const CRIME_TIME_RESTRICTIONS: CrimeTimeRestriction[] = [
  {
    crimeId: 'bank_heist',
    crimeName: 'Bank Heist',
    allowedPeriods: [TimePeriod.MORNING, TimePeriod.NOON, TimePeriod.AFTERNOON],
    reason: 'Banks are only open during business hours',
  },
  {
    crimeId: 'home_invasion',
    crimeName: 'Home Invasion',
    allowedPeriods: [TimePeriod.NIGHT, TimePeriod.MIDNIGHT],
    reason: 'People are home and asleep at night',
  },
  {
    crimeId: 'pickpocket',
    crimeName: 'Pickpocket Drunk',
    allowedPeriods: [TimePeriod.MORNING, TimePeriod.NOON, TimePeriod.AFTERNOON, TimePeriod.EVENING],
    reason: 'Need crowds and activity to blend in',
  },
  {
    crimeId: 'smuggling_run',
    crimeName: 'Smuggling Run',
    allowedPeriods: [TimePeriod.NIGHT, TimePeriod.MIDNIGHT, TimePeriod.DAWN],
    reason: 'Smuggling requires darkness to avoid detection',
  },
  {
    crimeId: 'cattle_rustling',
    crimeName: 'Cattle Rustling',
    allowedPeriods: [TimePeriod.NIGHT, TimePeriod.MIDNIGHT],
    reason: 'Easier to move livestock under cover of darkness',
  },
];

/**
 * Building type to category mappings
 */
const BUILDING_PROFILES: Record<string, BuildingTimeProfile> = {
  // Government buildings: Morning-Afternoon
  bank: {
    category: 'government',
    defaultOpenHour: 8,
    defaultCloseHour: 17,
    peakPeriods: [TimePeriod.MORNING, TimePeriod.AFTERNOON],
  },
  sheriff_office: {
    category: 'government',
    defaultOpenHour: 6,
    defaultCloseHour: 22,
  },
  telegraph_office: {
    category: 'government',
    defaultOpenHour: 7,
    defaultCloseHour: 19,
  },

  // Business: Morning-Evening
  general_store: {
    category: 'business',
    defaultOpenHour: 7,
    defaultCloseHour: 19,
    peakPeriods: [TimePeriod.MORNING, TimePeriod.AFTERNOON],
  },
  blacksmith: {
    category: 'service',
    defaultOpenHour: 6,
    defaultCloseHour: 18,
  },
  assay_office: {
    category: 'business',
    defaultOpenHour: 8,
    defaultCloseHour: 18,
  },

  // Religious: Dawn-Evening
  church: {
    category: 'religious',
    defaultOpenHour: 5,
    defaultCloseHour: 21,
    peakPeriods: [TimePeriod.DAWN, TimePeriod.MORNING],
  },
  spirit_lodge: {
    category: 'religious',
    defaultOpenHour: 5,
    defaultCloseHour: 22,
  },
  shrine: {
    category: 'religious',
    defaultOpenHour: 0,
    defaultCloseHour: 23, // Always open
  },

  // Entertainment: Evening-Night
  saloon: {
    category: 'entertainment',
    defaultOpenHour: 14,
    defaultCloseHour: 4, // Wraps past midnight
    peakPeriods: [TimePeriod.EVENING, TimePeriod.NIGHT],
  },
  cantina: {
    category: 'entertainment',
    defaultOpenHour: 16,
    defaultCloseHour: 3,
    peakPeriods: [TimePeriod.EVENING, TimePeriod.NIGHT],
  },
  fighting_pit: {
    category: 'entertainment',
    defaultOpenHour: 18,
    defaultCloseHour: 3,
  },

  // Illegal: Night-Midnight
  smugglers_den: {
    category: 'illegal',
    defaultOpenHour: 20,
    defaultCloseHour: 5,
  },
  hideout: {
    category: 'illegal',
    defaultOpenHour: 0,
    defaultCloseHour: 23, // Always open
  },

  // Service: Morning-Evening
  doctors_office: {
    category: 'service',
    defaultOpenHour: 7,
    defaultCloseHour: 20,
  },
  apothecary: {
    category: 'service',
    defaultOpenHour: 8,
    defaultCloseHour: 19,
  },

  // Residential: Always open
  hotel: {
    category: 'residential',
    defaultOpenHour: 0,
    defaultCloseHour: 23,
  },

  // Always open
  train_station: {
    category: 'always_open',
    defaultOpenHour: 0,
    defaultCloseHour: 23,
  },
  railroad_station: {
    category: 'always_open',
    defaultOpenHour: 0,
    defaultCloseHour: 23,
  },
  stables: {
    category: 'always_open',
    defaultOpenHour: 0,
    defaultCloseHour: 23,
  },
};

export class TimeService {
  /**
   * Get the current game time (accelerated)
   * Uses 4:1 ratio: 1 real hour = 4 game hours
   */
  static getCurrentGameTime(): Date {
    const now = new Date();
    const realElapsed = now.getTime() - GAME_START_TIME.getTime();
    const gameElapsed = realElapsed * GAME_TIME_RATIO;
    return new Date(GAME_START_TIME.getTime() + gameElapsed);
  }

  /**
   * Get current game hour (0-23)
   */
  static getCurrentHour(): number {
    return this.getCurrentGameTime().getHours();
  }

  /**
   * Convert hour (0-23) to time period
   */
  static getTimePeriod(hour: number): TimePeriod {
    if (hour >= 5 && hour < 7) return TimePeriod.DAWN;
    if (hour >= 7 && hour < 12) return TimePeriod.MORNING;
    if (hour >= 12 && hour < 14) return TimePeriod.NOON;
    if (hour >= 14 && hour < 17) return TimePeriod.AFTERNOON;
    if (hour >= 17 && hour < 21) return TimePeriod.EVENING;
    if (hour >= 21 && hour < 24) return TimePeriod.NIGHT;
    return TimePeriod.MIDNIGHT; // 0-4
  }

  /**
   * Check if current time is daylight
   */
  static isDaylight(hour: number): boolean {
    const period = this.getTimePeriod(hour);
    return [
      TimePeriod.DAWN,
      TimePeriod.MORNING,
      TimePeriod.NOON,
      TimePeriod.AFTERNOON,
      TimePeriod.EVENING,
    ].includes(period);
  }

  /**
   * Get time-based gameplay effect modifiers
   */
  static getTimeEffects(period: TimePeriod): TimeEffects {
    const effects: Record<TimePeriod, TimeEffects> = {
      [TimePeriod.DAWN]: {
        crimeDetectionModifier: 0.7,
        npcActivityLevel: 0.3,
        travelSafetyModifier: 0.8,
        shopAvailability: ['general', 'medicine'],
        buildingCategories: ['religious', 'service', 'always_open'],
      },
      [TimePeriod.MORNING]: {
        crimeDetectionModifier: 1.0,
        npcActivityLevel: 0.8,
        travelSafetyModifier: 1.0,
        shopAvailability: ['general', 'weapons', 'armor', 'medicine', 'specialty'],
        buildingCategories: ['government', 'business', 'service', 'religious', 'always_open'],
      },
      [TimePeriod.NOON]: {
        crimeDetectionModifier: 1.0,
        npcActivityLevel: 0.6, // Siesta effect
        travelSafetyModifier: 1.0,
        shopAvailability: ['general', 'weapons', 'armor', 'medicine', 'specialty'],
        buildingCategories: ['government', 'business', 'service', 'religious', 'entertainment', 'always_open'],
      },
      [TimePeriod.AFTERNOON]: {
        crimeDetectionModifier: 1.0,
        npcActivityLevel: 1.0,
        travelSafetyModifier: 1.0,
        shopAvailability: ['general', 'weapons', 'armor', 'medicine', 'specialty'],
        buildingCategories: ['government', 'business', 'service', 'religious', 'entertainment', 'always_open'],
      },
      [TimePeriod.EVENING]: {
        crimeDetectionModifier: 0.8,
        npcActivityLevel: 1.0,
        travelSafetyModifier: 0.9,
        shopAvailability: ['general', 'specialty', 'black_market'],
        buildingCategories: ['service', 'entertainment', 'residential', 'illegal', 'always_open'],
      },
      [TimePeriod.NIGHT]: {
        crimeDetectionModifier: 0.5,
        npcActivityLevel: 0.5,
        travelSafetyModifier: 0.6,
        shopAvailability: ['black_market'],
        buildingCategories: ['entertainment', 'illegal', 'residential', 'always_open'],
      },
      [TimePeriod.MIDNIGHT]: {
        crimeDetectionModifier: 0.3,
        npcActivityLevel: 0.2,
        travelSafetyModifier: 0.4,
        shopAvailability: ['black_market'],
        buildingCategories: ['illegal', 'residential', 'always_open'],
      },
    };

    return effects[period];
  }

  /**
   * Get complete current time state
   */
  static getCurrentTimeState(): TimeState {
    const hour = this.getCurrentHour();
    const period = this.getTimePeriod(hour);

    return {
      currentHour: hour,
      currentPeriod: period,
      isDaylight: this.isDaylight(hour),
      effectModifiers: this.getTimeEffects(period),
    };
  }

  /**
   * Check if a building is currently open
   * @param buildingType - The type of building
   * @param operatingHours - Custom operating hours (overrides defaults)
   * @param currentHour - Optional hour to check (defaults to current)
   */
  static isBuildingOpen(
    buildingType: LocationType,
    operatingHours?: OperatingHours,
    currentHour?: number
  ): BuildingAccessResult {
    const hour = currentHour !== undefined ? currentHour : this.getCurrentHour();
    const period = this.getTimePeriod(hour);

    // Use custom hours if provided, otherwise use building profile
    let openHour: number;
    let closeHour: number;

    if (operatingHours) {
      openHour = operatingHours.open;
      closeHour = operatingHours.close;
    } else {
      const profile = BUILDING_PROFILES[buildingType];
      if (!profile) {
        // No profile means always open
        return {
          isOpen: true,
          currentPeriod: period,
        };
      }
      openHour = profile.defaultOpenHour;
      closeHour = profile.defaultCloseHour;
    }

    // Check if open (handle midnight wraparound)
    let isOpen: boolean;
    if (openHour <= closeHour) {
      // Normal hours (e.g., 8:00 - 17:00)
      isOpen = hour >= openHour && hour < closeHour;
    } else {
      // Wraps past midnight (e.g., 20:00 - 4:00)
      isOpen = hour >= openHour || hour < closeHour;
    }

    if (!isOpen) {
      return {
        isOpen: false,
        reason: `Closed. Opens at ${openHour}:00, closes at ${closeHour}:00`,
        opensAt: openHour,
        closesAt: closeHour,
        currentPeriod: period,
      };
    }

    return {
      isOpen: true,
      opensAt: openHour,
      closesAt: closeHour,
      currentPeriod: period,
    };
  }

  /**
   * Check if a specific crime is available at the current time
   * @param crimeName - Name of the crime to check
   * @param baseWitnessChance - Base witness chance from crime properties
   * @param currentHour - Optional hour to check (defaults to current)
   */
  static checkCrimeAvailability(
    crimeName: string,
    baseWitnessChance: number,
    currentHour?: number
  ): CrimeAvailabilityResult {
    const hour = currentHour !== undefined ? currentHour : this.getCurrentHour();
    const period = this.getTimePeriod(hour);
    const effects = this.getTimeEffects(period);

    // Check if crime has time restrictions
    const restriction = CRIME_TIME_RESTRICTIONS.find(
      r => r.crimeName.toLowerCase() === crimeName.toLowerCase()
    );

    if (restriction && !restriction.allowedPeriods.includes(period)) {
      return {
        isAvailable: false,
        reason: restriction.reason || `${crimeName} is not available during ${period}`,
      };
    }

    // Calculate modified witness chance
    const effectiveWitnessChance = Math.round(baseWitnessChance * effects.crimeDetectionModifier);

    return {
      isAvailable: true,
      effectiveWitnessChance,
      timeModifier: effects.crimeDetectionModifier,
    };
  }

  /**
   * Get crime detection modifier for current time
   */
  static getCrimeDetectionModifier(currentHour?: number): number {
    const hour = currentHour !== undefined ? currentHour : this.getCurrentHour();
    const period = this.getTimePeriod(hour);
    const effects = this.getTimeEffects(period);
    return effects.crimeDetectionModifier;
  }

  /**
   * Check if NPC is available (basic version)
   * Phase 3 will expand this with full schedules
   *
   * @param npcSchedule - Optional NPC schedule data
   * @param currentHour - Optional hour to check (defaults to current)
   */
  static isNpcAvailable(
    npcSchedule?: Array<{ hour: number; buildingId: string }>,
    currentHour?: number
  ): boolean {
    const hour = currentHour !== undefined ? currentHour : this.getCurrentHour();
    const period = this.getTimePeriod(hour);
    const effects = this.getTimeEffects(period);

    // If NPC has a specific schedule, check it
    if (npcSchedule && npcSchedule.length > 0) {
      return npcSchedule.some(entry => entry.hour === hour);
    }

    // Otherwise, use general activity level as probability
    // NPCs are generally available during high activity times
    return effects.npcActivityLevel > 0.5;
  }

  /**
   * Get time-appropriate location description
   * Returns different atmospheric text based on time of day
   *
   * @param baseDescription - Base location description
   * @param locationType - Type of location
   * @param currentHour - Optional hour to check (defaults to current)
   */
  static getLocationDescription(
    baseDescription: string,
    locationType: LocationType,
    currentHour?: number
  ): string {
    const hour = currentHour !== undefined ? currentHour : this.getCurrentHour();
    const period = this.getTimePeriod(hour);

    // Time-based atmospheric additions
    const atmosphericAdditions: Record<TimePeriod, string> = {
      [TimePeriod.DAWN]: 'The first light of dawn creeps over the horizon, casting long shadows across the dusty streets.',
      [TimePeriod.MORNING]: 'The morning sun beats down as the town comes to life with activity.',
      [TimePeriod.NOON]: 'The midday sun blazes overhead, driving most folks to seek shade.',
      [TimePeriod.AFTERNOON]: 'The afternoon heat is starting to break as shadows lengthen.',
      [TimePeriod.EVENING]: 'The evening air cools as oil lamps flicker to life in windows.',
      [TimePeriod.NIGHT]: 'Darkness has fallen, with only scattered lamplight piercing the gloom.',
      [TimePeriod.MIDNIGHT]: 'The dead of night. Only the desperate or dangerous are abroad at this hour.',
    };

    // Location-specific variations
    let atmosphericText = atmosphericAdditions[period];

    if (locationType === 'saloon' && [TimePeriod.EVENING, TimePeriod.NIGHT].includes(period)) {
      atmosphericText = 'The saloon is alive with music, laughter, and the clink of whiskey glasses.';
    } else if (locationType === 'bank' && period === TimePeriod.MIDNIGHT) {
      atmosphericText = 'The bank sits dark and silent, its vault tempting in the moonlight.';
    } else if (locationType === 'church' && period === TimePeriod.DAWN) {
      atmosphericText = 'The church bells ring softly in the morning air, calling the faithful to prayer.';
    }

    return `${baseDescription} ${atmosphericText}`;
  }

  /**
   * Get building category for a location type
   */
  static getBuildingCategory(buildingType: LocationType): BuildingCategory {
    const profile = BUILDING_PROFILES[buildingType];
    return profile?.category || 'always_open';
  }

  /**
   * Get default operating hours for a building type
   */
  static getDefaultOperatingHours(buildingType: LocationType): OperatingHours | null {
    const profile = BUILDING_PROFILES[buildingType];
    if (!profile) return null;

    return {
      open: profile.defaultOpenHour,
      close: profile.defaultCloseHour,
    };
  }

  /**
   * Get game time configuration
   */
  static getGameTimeConfig() {
    return {
      ratio: GAME_TIME_RATIO,
      startTime: GAME_START_TIME,
      currentGameTime: this.getCurrentGameTime(),
      currentHour: this.getCurrentHour(),
    };
  }

  /**
   * Log time state (for debugging)
   */
  static logTimeState(): void {
    const state = this.getCurrentTimeState();
    logger.info('Current Time State:', {
      hour: state.currentHour,
      period: state.currentPeriod,
      isDaylight: state.isDaylight,
      crimeDetection: state.effectModifiers.crimeDetectionModifier,
      npcActivity: state.effectModifiers.npcActivityLevel,
      travelSafety: state.effectModifiers.travelSafetyModifier,
    });
  }
}
