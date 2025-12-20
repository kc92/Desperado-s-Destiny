/**
 * Time Service
 * API client for time-of-day system operations
 */

import api from './api';
import { TimePeriod } from '@shared/types/time.types';
import type {
  TimeState,
  TimeEffects,
  BuildingCategory,
  ShopType,
  GetTimeStateResponse,
  BuildingAccessResult,
  CrimeAvailabilityResult,
} from '@shared/types/time.types';

// ===== Additional Types =====

export interface TimeEffectsResponse {
  success: boolean;
  data: {
    period: TimePeriod;
    effects: TimeEffects;
    description: string;
  };
}

export interface BuildingStatusResponse {
  success: boolean;
  data: BuildingAccessResult;
}

export interface CrimeCheckResponse {
  success: boolean;
  data: CrimeAvailabilityResult;
}

export interface LocationDescriptionRequest {
  locationId: string;
  basDescription: string;
}

export interface LocationDescriptionResponse {
  success: boolean;
  data: {
    locationId: string;
    period: TimePeriod;
    description: string;
    atmosphere: string;
  };
}

// ===== Time Service =====

export const timeService = {
  // ===== Public Routes =====

  /**
   * Get current game time state
   */
  async getCurrentTime(): Promise<{
    timeState: TimeState;
    gameTimeRatio: number;
  }> {
    const response = await api.get<GetTimeStateResponse>('/time');
    return response.data.data;
  },

  /**
   * Get time effects for a specific period
   */
  async getTimeEffects(period: TimePeriod): Promise<{
    period: TimePeriod;
    effects: TimeEffects;
    description: string;
  }> {
    const response = await api.get<TimeEffectsResponse>(`/time/effects/${period}`);
    return response.data.data;
  },

  /**
   * Check if a building type is currently open
   */
  async getBuildingStatus(buildingType: BuildingCategory): Promise<BuildingAccessResult> {
    const response = await api.get<BuildingStatusResponse>(`/time/building/${buildingType}/status`);
    return response.data.data;
  },

  /**
   * Check crime availability at current time
   */
  async checkCrimeAvailability(crimeId?: string): Promise<CrimeAvailabilityResult> {
    const response = await api.post<CrimeCheckResponse>('/time/crime/check', { crimeId });
    return response.data.data;
  },

  /**
   * Get time-based location description
   */
  async getLocationDescription(locationId: string, baseDescription: string): Promise<{
    locationId: string;
    period: TimePeriod;
    description: string;
    atmosphere: string;
  }> {
    const response = await api.post<LocationDescriptionResponse>('/time/location/description', {
      locationId,
      baseDescription,
    });
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get formatted time string
   */
  formatTime(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  },

  /**
   * Get time period from hour
   */
  getTimePeriod(hour: number): TimePeriod {
    if (hour >= 5 && hour < 7) return TimePeriod.DAWN;
    if (hour >= 7 && hour < 12) return TimePeriod.MORNING;
    if (hour >= 12 && hour < 14) return TimePeriod.NOON;
    if (hour >= 14 && hour < 17) return TimePeriod.AFTERNOON;
    if (hour >= 17 && hour < 21) return TimePeriod.EVENING;
    if (hour >= 21 && hour < 24) return TimePeriod.NIGHT;
    return TimePeriod.MIDNIGHT; // 0-5
  },

  /**
   * Check if it's currently daytime
   */
  isDaytime(hour: number): boolean {
    return hour >= 5 && hour < 21;
  },

  /**
   * Check if it's currently nighttime
   */
  isNighttime(hour: number): boolean {
    return !this.isDaytime(hour);
  },

  /**
   * Get time period description
   */
  getTimePeriodDescription(period: TimePeriod): string {
    const descriptions: Record<TimePeriod, string> = {
      [TimePeriod.DAWN]: 'Early morning light breaks across the horizon',
      [TimePeriod.MORNING]: 'Morning business hours, streets coming alive',
      [TimePeriod.NOON]: 'High sun, peak activity throughout town',
      [TimePeriod.AFTERNOON]: 'Full business hours, bustling activity',
      [TimePeriod.EVENING]: 'Dusk approaches, saloons begin to fill',
      [TimePeriod.NIGHT]: 'Darkness falls, fewer witnesses about',
      [TimePeriod.MIDNIGHT]: 'Dead of night, most buildings closed',
    };
    return descriptions[period] || 'Unknown time period';
  },

  /**
   * Check if building category is open during period
   */
  isBuildingOpen(category: BuildingCategory, period: TimePeriod): boolean {
    const schedules: Record<BuildingCategory, TimePeriod[]> = {
      government: [TimePeriod.MORNING, TimePeriod.NOON, TimePeriod.AFTERNOON],
      business: [TimePeriod.MORNING, TimePeriod.NOON, TimePeriod.AFTERNOON, TimePeriod.EVENING],
      service: [TimePeriod.DAWN, TimePeriod.MORNING, TimePeriod.NOON, TimePeriod.AFTERNOON, TimePeriod.EVENING],
      entertainment: [TimePeriod.AFTERNOON, TimePeriod.EVENING, TimePeriod.NIGHT],
      religious: [TimePeriod.DAWN, TimePeriod.MORNING, TimePeriod.EVENING],
      illegal: [TimePeriod.NIGHT, TimePeriod.MIDNIGHT],
      residential: [TimePeriod.EVENING, TimePeriod.NIGHT, TimePeriod.MIDNIGHT],
      always_open: [
        TimePeriod.DAWN,
        TimePeriod.MORNING,
        TimePeriod.NOON,
        TimePeriod.AFTERNOON,
        TimePeriod.EVENING,
        TimePeriod.NIGHT,
        TimePeriod.MIDNIGHT,
      ],
    };

    return schedules[category]?.includes(period) || false;
  },

  /**
   * Get shop availability during period
   */
  getAvailableShops(period: TimePeriod): ShopType[] {
    const schedules: Record<TimePeriod, ShopType[]> = {
      [TimePeriod.DAWN]: ['general'],
      [TimePeriod.MORNING]: ['general', 'weapons', 'armor', 'medicine', 'specialty'],
      [TimePeriod.NOON]: ['general', 'weapons', 'armor', 'medicine', 'specialty'],
      [TimePeriod.AFTERNOON]: ['general', 'weapons', 'armor', 'medicine', 'specialty'],
      [TimePeriod.EVENING]: ['general', 'specialty'],
      [TimePeriod.NIGHT]: ['black_market'],
      [TimePeriod.MIDNIGHT]: ['black_market'],
    };

    return schedules[period] || [];
  },

  /**
   * Check if shop type is open during period
   */
  isShopOpen(shopType: ShopType, period: TimePeriod): boolean {
    return this.getAvailableShops(period).includes(shopType);
  },

  /**
   * Get crime detection modifier for current time
   */
  getCrimeDetectionModifier(period: TimePeriod): number {
    const modifiers: Record<TimePeriod, number> = {
      [TimePeriod.DAWN]: 0.7,
      [TimePeriod.MORNING]: 1.2,
      [TimePeriod.NOON]: 1.5,
      [TimePeriod.AFTERNOON]: 1.3,
      [TimePeriod.EVENING]: 1.0,
      [TimePeriod.NIGHT]: 0.6,
      [TimePeriod.MIDNIGHT]: 0.4,
    };
    return modifiers[period] || 1.0;
  },

  /**
   * Get NPC activity level for current time
   */
  getNPCActivityLevel(period: TimePeriod): number {
    const levels: Record<TimePeriod, number> = {
      [TimePeriod.DAWN]: 0.3,
      [TimePeriod.MORNING]: 0.8,
      [TimePeriod.NOON]: 1.0,
      [TimePeriod.AFTERNOON]: 0.9,
      [TimePeriod.EVENING]: 0.7,
      [TimePeriod.NIGHT]: 0.4,
      [TimePeriod.MIDNIGHT]: 0.1,
    };
    return levels[period] || 0.5;
  },

  /**
   * Get travel safety modifier for current time
   */
  getTravelSafetyModifier(period: TimePeriod): number {
    const modifiers: Record<TimePeriod, number> = {
      [TimePeriod.DAWN]: 0.8,
      [TimePeriod.MORNING]: 1.0,
      [TimePeriod.NOON]: 1.0,
      [TimePeriod.AFTERNOON]: 1.0,
      [TimePeriod.EVENING]: 0.8,
      [TimePeriod.NIGHT]: 0.6,
      [TimePeriod.MIDNIGHT]: 0.4,
    };
    return modifiers[period] || 1.0;
  },

  /**
   * Get best time periods for specific activities
   */
  getBestTimeForActivity(activity: 'crime' | 'trading' | 'socializing' | 'exploring'): TimePeriod[] {
    const bestTimes: Record<string, TimePeriod[]> = {
      crime: [TimePeriod.NIGHT, TimePeriod.MIDNIGHT, TimePeriod.DAWN],
      trading: [TimePeriod.MORNING, TimePeriod.NOON, TimePeriod.AFTERNOON],
      socializing: [TimePeriod.EVENING, TimePeriod.NIGHT],
      exploring: [TimePeriod.MORNING, TimePeriod.AFTERNOON],
    };

    return bestTimes[activity] || [];
  },

  /**
   * Check if current time is good for activity
   */
  isGoodTimeFor(currentPeriod: TimePeriod, activity: 'crime' | 'trading' | 'socializing' | 'exploring'): boolean {
    const bestTimes = this.getBestTimeForActivity(activity);
    return bestTimes.includes(currentPeriod);
  },

  /**
   * Get hours until specific time period
   */
  getHoursUntil(currentHour: number, targetPeriod: TimePeriod): number {
    const periodHours: Record<TimePeriod, number> = {
      [TimePeriod.DAWN]: 5,
      [TimePeriod.MORNING]: 7,
      [TimePeriod.NOON]: 12,
      [TimePeriod.AFTERNOON]: 14,
      [TimePeriod.EVENING]: 17,
      [TimePeriod.NIGHT]: 21,
      [TimePeriod.MIDNIGHT]: 0,
    };

    const targetHour = periodHours[targetPeriod];
    let hoursUntil = targetHour - currentHour;

    if (hoursUntil < 0) {
      hoursUntil += 24;
    }

    return hoursUntil;
  },

  /**
   * Get atmospheric lighting description
   */
  getLightingDescription(period: TimePeriod): string {
    const lighting: Record<TimePeriod, string> = {
      [TimePeriod.DAWN]: 'Soft golden light breaks through the darkness',
      [TimePeriod.MORNING]: 'Bright morning sunlight illuminates the streets',
      [TimePeriod.NOON]: 'Harsh overhead sun casts short shadows',
      [TimePeriod.AFTERNOON]: 'Warm afternoon light bathes the town',
      [TimePeriod.EVENING]: 'Orange sunset glow fades into twilight',
      [TimePeriod.NIGHT]: 'Moonlight and lamplight provide dim illumination',
      [TimePeriod.MIDNIGHT]: 'Near-total darkness shrouds the streets',
    };
    return lighting[period] || 'Unknown lighting';
  },

  /**
   * Get ambient activity description
   */
  getAmbientActivity(period: TimePeriod): string {
    const activity: Record<TimePeriod, string> = {
      [TimePeriod.DAWN]: 'Early risers begin their day, roosters crow',
      [TimePeriod.MORNING]: 'Merchants open shops, streets fill with townsfolk',
      [TimePeriod.NOON]: 'Peak activity, bustling commerce and conversation',
      [TimePeriod.AFTERNOON]: 'Steady business, horses trot past',
      [TimePeriod.EVENING]: 'Work day ends, people gather in saloons',
      [TimePeriod.NIGHT]: 'Most folks head home, saloons stay lively',
      [TimePeriod.MIDNIGHT]: 'Silent streets, only guards and troublemakers about',
    };
    return activity[period] || 'Unknown activity';
  },
};

export default timeService;
