/**
 * Calendar Service
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Manages the global game calendar, time tracking, and date calculations
 */

import { GameCalendarModel, IGameCalendar } from '../models/GameCalendar.model';
import {
  GameCalendar,
  GameDate,
  Month,
  Season,
  TimeConversion,
  Holiday,
  ScheduledEvent,
} from '@desperados/shared';
import { getAllHolidays, getHolidayForDate } from '../data/holidays';
import { getSeasonalEffects } from '../data/seasonalEffects';
import { calculateMoonPhase } from '../data/moonPhases';
import logger from '../utils/logger';

/**
 * Time conversion constants
 */
export const TIME_CONVERSION: TimeConversion = {
  realDaysPerGameWeek: 1, // 1 real day = 1 game week
  realDaysPerGameMonth: 7, // 7 real days = 1 game month (4 weeks)
  realDaysPerGameYear: 84, // 84 real days = 1 game year (12 months)
  gameMonthsPerSeason: 3, // 3 months per season
};

class CalendarService {
  /**
   * Get or create the global game calendar
   */
  async getCalendar(): Promise<IGameCalendar> {
    let calendar = await GameCalendarModel.findOne();

    if (!calendar) {
      calendar = await this.initializeCalendar();
    }

    return calendar as any;
  }

  /**
   * Initialize the game calendar
   */
  async initializeCalendar(): Promise<any> {
    const now = new Date();
    const holidays = getAllHolidays();

    const calendar = new GameCalendarModel({
      currentYear: 1885,
      currentMonth: Month.JUNE,
      currentWeek: 1,
      currentDay: 1,
      currentSeason: Season.SUMMER,
      currentMoonPhase: calculateMoonPhase(1),
      holidays,
      realWorldStartDate: now,
      gameYearZero: new Date('1885-06-01'),
      seasonalEffects: {
        season: Season.SUMMER,
        travelSpeedModifier: 1.1,
        travelDangerModifier: 1.2,
        cropYieldModifier: 1.0,
        animalSpawnModifier: 1.2,
        fishingModifier: 0.9,
        huntingBonus: 5,
        fishingBonus: -5,
        energyCostModifier: 1.15,
        healthDrainRate: 2,
      },
      lastTick: now,
    });

    await calendar.save();
    return calendar;
  }

  /**
   * Get current game date
   */
  async getCurrentDate(): Promise<GameDate> {
    const calendar = await this.getCalendar();

    const holiday = calendar.activeHolidayId
      ? calendar.holidays.find((h) => h.id === calendar.activeHolidayId)
      : undefined;

    return {
      year: calendar.currentYear,
      month: calendar.currentMonth,
      week: calendar.currentWeek,
      day: calendar.currentDay,
      season: calendar.currentSeason,
      holiday,
      moonPhase: calendar.currentMoonPhase,
    };
  }

  /**
   * Advance calendar time
   * Called by the calendar tick job
   */
  async advanceTime(realDaysPassed: number = 1): Promise<void> {
    const calendar = await this.getCalendar();

    // 1 real day = 1 game week = 7 game days
    const gameDaysPassed = realDaysPassed * 7;

    // Advance the calendar
    calendar.advanceTime(gameDaysPassed);

    // Update seasonal effects
    const seasonalEffects = getSeasonalEffects(calendar.currentSeason);
    calendar.seasonalEffects = {
      season: seasonalEffects.season,
      travelSpeedModifier: seasonalEffects.travelSpeedModifier,
      travelDangerModifier: seasonalEffects.travelDangerModifier,
      cropYieldModifier: seasonalEffects.cropYieldModifier,
      animalSpawnModifier: seasonalEffects.animalSpawnModifier,
      fishingModifier: seasonalEffects.fishingModifier,
      huntingBonus: seasonalEffects.huntingBonus,
      fishingBonus: seasonalEffects.fishingBonus,
      energyCostModifier: seasonalEffects.energyCostModifier,
      healthDrainRate: seasonalEffects.healthDrainRate,
    };

    // Check for holidays
    await this.updateActiveHoliday(calendar);

    // Check for scheduled events
    await this.updateActiveEvents(calendar);

    await calendar.save();

    logger.info(
      `[Calendar] Advanced to ${this.formatDate(calendar.getCurrentDate())} (${calendar.currentSeason})`
    );
  }

  /**
   * Update active holiday
   */
  private async updateActiveHoliday(calendar: IGameCalendar): Promise<void> {
    // Get current day of month (approximate)
    const dayOfMonth = (calendar.currentWeek - 1) * 7 + calendar.currentDay;

    const holiday = getHolidayForDate(calendar.currentMonth, dayOfMonth);

    if (holiday) {
      calendar.activeHolidayId = holiday.id;
      logger.info(`[Calendar] Holiday active: ${holiday.name}`);
    } else {
      calendar.activeHolidayId = undefined;
    }
  }

  /**
   * Update active events
   */
  private async updateActiveEvents(calendar: IGameCalendar): Promise<void> {
    const currentDate = calendar.getCurrentDate();
    const activeEvents: string[] = [];

    for (const event of calendar.scheduledEvents) {
      if (this.isEventActive(event, currentDate)) {
        activeEvents.push(event.id);
      }
    }

    calendar.activeEventIds = activeEvents;
  }

  /**
   * Check if an event is currently active
   */
  private isEventActive(event: ScheduledEvent, currentDate: GameDate): boolean {
    const currentTimestamp = this.dateToTimestamp(currentDate);
    const startTimestamp = this.dateToTimestamp(event.startDate);
    const endTimestamp = event.endDate ? this.dateToTimestamp(event.endDate) : Infinity;

    return currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp;
  }

  /**
   * Convert game date to comparable timestamp
   */
  private dateToTimestamp(date: GameDate): number {
    return date.year * 10000 + date.month * 100 + date.week * 10 + date.day;
  }

  /**
   * Get time since game start in real days
   */
  async getTimeSinceStart(): Promise<number> {
    const calendar = await this.getCalendar();
    const now = new Date();
    const startDate = calendar.realWorldStartDate;

    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Calculate what the current game date should be based on real time
   */
  async calculateCurrentGameDate(): Promise<{
    expectedYear: number;
    expectedMonth: number;
    expectedWeek: number;
    expectedDay: number;
  }> {
    const calendar = await this.getCalendar();
    const realDaysPassed = await this.getTimeSinceStart();

    // 1 real day = 1 game week
    const gameWeeksPassed = realDaysPassed;
    const gameMonthsPassed = Math.floor(gameWeeksPassed / 4);
    const gameYearsPassed = Math.floor(gameMonthsPassed / 12);

    const startYear = 1885;
    const startMonth = Month.JUNE;

    const expectedYear = startYear + gameYearsPassed;
    let expectedMonth = startMonth + (gameMonthsPassed % 12);
    if (expectedMonth > 12) {
      expectedMonth -= 12;
    }

    const remainingWeeks = gameWeeksPassed % 4;
    const expectedWeek = remainingWeeks + 1;
    const expectedDay = 1; // Always start at day 1 of the week

    return {
      expectedYear,
      expectedMonth,
      expectedWeek,
      expectedDay,
    };
  }

  /**
   * Sync calendar with expected time (run on startup)
   */
  async syncCalendar(): Promise<void> {
    const calendar = await this.getCalendar();
    const expected = await this.calculateCurrentGameDate();

    // Check if we need to advance
    if (
      calendar.currentYear !== expected.expectedYear ||
      calendar.currentMonth !== expected.expectedMonth ||
      calendar.currentWeek !== expected.expectedWeek
    ) {
      logger.info('[Calendar] Syncing calendar with real time...');

      calendar.currentYear = expected.expectedYear;
      calendar.currentMonth = expected.expectedMonth;
      calendar.currentWeek = expected.expectedWeek;
      calendar.currentDay = expected.expectedDay;

      // Recalculate derived values
      calendar.currentSeason = (calendar as any).getSeasonForMonth(calendar.currentMonth);
      const dayOfYear = (calendar as any).getDayOfYear();
      calendar.currentMoonPhase = (calendar as any).calculateMoonPhase(dayOfYear);

      // Update effects
      const seasonalEffects = getSeasonalEffects(calendar.currentSeason);
      calendar.seasonalEffects = {
        season: seasonalEffects.season,
        travelSpeedModifier: seasonalEffects.travelSpeedModifier,
        travelDangerModifier: seasonalEffects.travelDangerModifier,
        cropYieldModifier: seasonalEffects.cropYieldModifier,
        animalSpawnModifier: seasonalEffects.animalSpawnModifier,
        fishingModifier: seasonalEffects.fishingModifier,
        huntingBonus: seasonalEffects.huntingBonus,
        fishingBonus: seasonalEffects.fishingBonus,
        energyCostModifier: seasonalEffects.energyCostModifier,
        healthDrainRate: seasonalEffects.healthDrainRate,
      };

      await this.updateActiveHoliday(calendar);
      await this.updateActiveEvents(calendar);

      await calendar.save();

      logger.info(`[Calendar] Synced to ${this.formatDate(calendar.getCurrentDate())}`);
    }
  }

  /**
   * Add a scheduled event
   */
  async addScheduledEvent(event: ScheduledEvent): Promise<void> {
    const calendar = await this.getCalendar();

    calendar.scheduledEvents.push(event);
    await calendar.save();

    logger.info(`[Calendar] Added scheduled event: ${event.name}`);
  }

  /**
   * Get upcoming holidays
   */
  async getUpcomingHolidays(count: number = 3): Promise<Holiday[]> {
    const calendar = await this.getCalendar();
    const currentDate = calendar.getCurrentDate();
    const currentDayOfYear = calendar.getDayOfYear();

    const upcoming: Holiday[] = [];

    // Sort holidays by month and day
    const sortedHolidays = [...calendar.holidays].sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });

    // Find next holidays
    for (const holiday of sortedHolidays) {
      // Approximate day of year for holiday
      const holidayDayOfYear = (holiday.month - 1) * 28 + holiday.day;

      if (holidayDayOfYear >= currentDayOfYear) {
        upcoming.push(holiday);
        if (upcoming.length >= count) break;
      }
    }

    // If we don't have enough, wrap to next year
    if (upcoming.length < count) {
      for (const holiday of sortedHolidays) {
        if (upcoming.length >= count) break;
        if (!upcoming.find((h) => h.id === holiday.id)) {
          upcoming.push(holiday);
        }
      }
    }

    return upcoming.slice(0, count);
  }

  /**
   * Format a game date as a string
   */
  formatDate(date: GameDate): string {
    const monthNames = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const dayOfMonth = (date.week - 1) * 7 + date.day;
    const dayName = dayNames[date.day] || 'Unknown';

    return `${dayName}, ${monthNames[date.month]} ${dayOfMonth}, ${date.year}`;
  }

  /**
   * Get days until next season change
   */
  async getDaysUntilNextSeason(): Promise<number> {
    const calendar = await this.getCalendar();

    // Seasons change every 3 months
    const currentMonth = calendar.currentMonth;
    let nextSeasonMonth: number;

    if (currentMonth >= 1 && currentMonth <= 2) nextSeasonMonth = 3;
    else if (currentMonth >= 3 && currentMonth <= 5) nextSeasonMonth = 6;
    else if (currentMonth >= 6 && currentMonth <= 8) nextSeasonMonth = 9;
    else if (currentMonth >= 9 && currentMonth <= 11) nextSeasonMonth = 12;
    else nextSeasonMonth = 3; // December -> March

    const monthsUntilChange = (nextSeasonMonth - currentMonth + 12) % 12;
    const weeksUntilChange = monthsUntilChange * 4 - (calendar.currentWeek - 1);
    const daysUntilChange = weeksUntilChange * 7 - (calendar.currentDay - 1);

    return Math.max(0, daysUntilChange);
  }

  /**
   * Admin: Force advance time
   */
  async forceAdvanceTime(days: number): Promise<void> {
    const calendar = await this.getCalendar();
    calendar.advanceTime(days);
    await calendar.save();

    logger.info(`[Calendar] Force advanced ${days} days`);
  }
}

export const calendarService = new CalendarService();
export default calendarService;
