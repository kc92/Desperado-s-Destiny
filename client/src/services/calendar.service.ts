/**
 * Calendar Service
 * API client for calendar, season, and time information
 */

import api from './api';
import {
  Season,
  Month,
  MoonPhase,
} from '@shared/types/calendar.types';
import type {
  GameDate,
  GameCalendar,
  Holiday,
  ScheduledEvent,
  SeasonalEffects,
  MonthlyTheme,
  MoonPhaseEffects,
  TimeConversion,
  ItemCategory,
  GetCalendarResponse,
  GetSeasonInfoResponse,
  GetHolidaysResponse,
  GetMoonPhaseResponse,
  CalendarEvent,
} from '@shared/types/calendar.types';

// ===== Additional Types =====

export interface CalendarState {
  calendar: Partial<GameCalendar>;
  currentDate: GameDate;
  timeConversion: TimeConversion;
  upcomingHolidays: Holiday[];
  upcomingEvents: ScheduledEvent[];
}

export interface CurrentDateResponse {
  success: boolean;
  data: {
    currentDate: GameDate;
    formatted: string;
  };
}

export interface ActivityCheckResponse {
  success: boolean;
  data: {
    activity: string;
    isGoodTime: boolean;
    modifier: number;
    reason: string;
  };
}

export interface PriceModifierResponse {
  success: boolean;
  data: {
    category: string;
    modifier: number;
    trend: 'high' | 'low' | 'normal';
  };
}

export interface AdvanceTimeResponse {
  success: boolean;
  data: {
    message: string;
    currentDate: GameDate;
    formatted: string;
  };
}

// ===== Calendar Service =====

export const calendarService = {
  // ===== Public Routes =====

  /**
   * Get current calendar state
   */
  async getCalendar(): Promise<CalendarState> {
    const response = await api.get<GetCalendarResponse>('/calendar');
    return response.data.data;
  },

  /**
   * Get just the current date
   */
  async getCurrentDate(): Promise<{ currentDate: GameDate; formatted: string }> {
    const response = await api.get<CurrentDateResponse>('/calendar/current-date');
    return response.data.data;
  },

  /**
   * Get current season information
   */
  async getSeasonInfo(): Promise<{
    currentSeason: Season;
    effects: SeasonalEffects;
    daysUntilNextSeason: number;
    monthlyTheme: MonthlyTheme;
  }> {
    const response = await api.get<GetSeasonInfoResponse>('/calendar/season');
    return response.data.data;
  },

  /**
   * Get current moon phase information
   */
  async getMoonPhaseInfo(): Promise<{
    phase: MoonPhase;
    illumination: number;
    effects: MoonPhaseEffects;
    daysUntilFullMoon: number;
    daysUntilNewMoon: number;
  }> {
    const response = await api.get<GetMoonPhaseResponse>('/calendar/moon-phase');
    return response.data.data;
  },

  /**
   * Get all holidays
   */
  async getHolidays(): Promise<{
    holidays: Holiday[];
    activeHoliday?: Holiday;
    upcoming: Holiday[];
  }> {
    const response = await api.get<GetHolidaysResponse>('/calendar/holidays');
    return response.data.data;
  },

  /**
   * Check if it's a good time for an activity
   */
  async checkActivityTime(activity: 'hunting' | 'fishing' | 'crime' | 'trading'): Promise<{
    activity: string;
    isGoodTime: boolean;
    modifier: number;
    reason: string;
  }> {
    const response = await api.get<ActivityCheckResponse>(`/calendar/activity-check/${activity}`);
    return response.data.data;
  },

  /**
   * Get seasonal price modifier for an item category
   */
  async getPriceModifier(category: ItemCategory): Promise<{
    category: string;
    modifier: number;
    trend: 'high' | 'low' | 'normal';
  }> {
    const response = await api.get<PriceModifierResponse>(`/calendar/price-modifier/${category}`);
    return response.data.data;
  },

  // ===== Admin Routes =====

  /**
   * Admin: Force advance time
   * @requires Admin authentication
   */
  async advanceTime(days: number): Promise<AdvanceTimeResponse> {
    const response = await api.post<AdvanceTimeResponse>('/calendar/admin/advance', { days });
    return response.data;
  },

  /**
   * Admin: Sync calendar with real time
   * @requires Admin authentication
   */
  async syncCalendar(): Promise<AdvanceTimeResponse> {
    const response = await api.post<AdvanceTimeResponse>('/calendar/admin/sync');
    return response.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get formatted date string
   */
  formatDate(date: GameDate): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const monthName = monthNames[date.month - 1] || 'Unknown';
    const dayName = dayNames[date.day - 1] || 'Unknown';

    return `${dayName}, ${monthName} Week ${date.week}, ${date.year}`;
  },

  /**
   * Get season name
   */
  getSeasonName(season: Season): string {
    return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
  },

  /**
   * Get month name
   */
  getMonthName(month: Month): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1] || 'Unknown';
  },

  /**
   * Get moon phase description
   */
  getMoonPhaseDescription(phase: MoonPhase): string {
    const descriptions: Record<MoonPhase, string> = {
      [MoonPhase.NEW_MOON]: 'No moon visible - ideal for stealth',
      [MoonPhase.WAXING_CRESCENT]: 'Crescent moon rising',
      [MoonPhase.FIRST_QUARTER]: 'Half moon in the sky',
      [MoonPhase.WAXING_GIBBOUS]: 'Moon nearly full',
      [MoonPhase.FULL_MOON]: 'Full moon - supernatural activity high',
      [MoonPhase.WANING_GIBBOUS]: 'Moon beginning to wane',
      [MoonPhase.LAST_QUARTER]: 'Half moon setting',
      [MoonPhase.WANING_CRESCENT]: 'Crescent moon fading',
    };
    return descriptions[phase] || 'Unknown moon phase';
  },

  /**
   * Check if it's a holiday
   */
  isHoliday(calendar: Partial<GameCalendar>): boolean {
    return !!calendar.activeHoliday;
  },

  /**
   * Check if there are active events
   */
  hasActiveEvents(calendar: Partial<GameCalendar>): boolean {
    return (calendar.activeEvents?.length || 0) > 0;
  },

  /**
   * Get days until next season
   */
  getDaysUntilNextSeason(currentMonth: Month): number {
    // Each season is 3 months, calculate days until next season starts
    const seasonStartMonths = [Month.MARCH, Month.JUNE, Month.SEPTEMBER, Month.DECEMBER];
    const nextSeasonMonth = seasonStartMonths.find(m => m > currentMonth) || Month.MARCH;
    const monthsUntilNextSeason = nextSeasonMonth > currentMonth
      ? nextSeasonMonth - currentMonth
      : (12 - currentMonth) + nextSeasonMonth;

    // Approximation: 7 real days = 1 game month = ~30 game days
    return monthsUntilNextSeason * 30;
  },

  /**
   * Convert calendar events to display format
   */
  convertToCalendarEvents(holidays: Holiday[], events: ScheduledEvent[]): CalendarEvent[] {
    const calendarEvents: CalendarEvent[] = [];

    // Add holidays
    holidays.forEach(holiday => {
      calendarEvents.push({
        id: holiday.id,
        title: holiday.name,
        date: {
          year: new Date().getFullYear(),
          month: holiday.month,
          week: Math.ceil(holiday.day / 7),
          day: holiday.day % 7 || 7,
          season: this.getSeasonForMonth(holiday.month),
          moonPhase: MoonPhase.NEW_MOON, // Placeholder
        },
        type: 'holiday',
        description: holiday.description,
        color: holiday.isSupernatural ? '#8b00ff' : '#4a90e2',
      });
    });

    // Add scheduled events
    events.forEach(event => {
      calendarEvents.push({
        id: event.id,
        title: event.name,
        date: event.startDate,
        type: 'event',
        description: event.description,
        color: '#e2a44a',
      });
    });

    return calendarEvents;
  },

  /**
   * Get season for a given month
   */
  getSeasonForMonth(month: Month): Season {
    if (month >= Month.MARCH && month <= Month.MAY) return Season.SPRING;
    if (month >= Month.JUNE && month <= Month.AUGUST) return Season.SUMMER;
    if (month >= Month.SEPTEMBER && month <= Month.NOVEMBER) return Season.FALL;
    return Season.WINTER;
  },

  /**
   * Calculate price with seasonal modifier
   */
  calculateSeasonalPrice(basePrice: number, modifier: number): number {
    return Math.floor(basePrice * modifier);
  },

  /**
   * Get price trend indicator
   */
  getPriceTrend(modifier: number): 'rising' | 'falling' | 'stable' {
    if (modifier > 1.1) return 'rising';
    if (modifier < 0.9) return 'falling';
    return 'stable';
  },

  /**
   * Check if moon phase is good for crime
   */
  isMoonGoodForCrime(phase: MoonPhase): boolean {
    return [MoonPhase.NEW_MOON, MoonPhase.WANING_CRESCENT].includes(phase);
  },

  /**
   * Check if moon phase triggers supernatural events
   */
  isMoonSupernatural(phase: MoonPhase): boolean {
    return [MoonPhase.FULL_MOON].includes(phase);
  },

  /**
   * Get recommended activities for current season
   */
  getRecommendedActivities(season: Season): string[] {
    const activities: Record<Season, string[]> = {
      [Season.SPRING]: ['Farming', 'Fishing', 'Gathering herbs', 'Exploring'],
      [Season.SUMMER]: ['Mining', 'Hunting', 'Trading', 'Combat'],
      [Season.FALL]: ['Harvesting', 'Hunting', 'Crafting', 'Stockpiling'],
      [Season.WINTER]: ['Indoor activities', 'Crafting', 'Planning', 'Social activities'],
    };
    return activities[season] || [];
  },

  /**
   * Get weather emphasis for season
   */
  getWeatherEmphasis(season: Season): string {
    const emphasis: Record<Season, string> = {
      [Season.SPRING]: 'Mild with frequent rain, muddy roads',
      [Season.SUMMER]: 'Hot and dry, dust storms common',
      [Season.FALL]: 'Cooling temperatures, occasional storms',
      [Season.WINTER]: 'Cold with snow and ice, dangerous travel',
    };
    return emphasis[season] || 'Variable weather';
  },
};

export default calendarService;
