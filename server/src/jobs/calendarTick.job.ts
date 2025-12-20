/**
 * Calendar Tick Job
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Daily job that advances the game calendar and triggers seasonal events
 */

import { calendarService } from '../services/calendar.service';
import { seasonService } from '../services/season.service';
import { CalendarEventService } from '../services/calendarEvent.service';
import { GameCalendarModel } from '../models/GameCalendar.model';
import { getRandomFlavorEvent } from '../data/monthlyThemes';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';

export class CalendarTickJob {
  /**
   * Run the calendar tick
   * Should be called once per real day (advances game time by 1 week)
   */
  async run(): Promise<void> {
    const lockKey = 'job:calendar-tick';

    try {
      await withLock(lockKey, async () => {
        logger.info('[CalendarTick] Running calendar tick job');

        // Sync calendar with real time
        await calendarService.syncCalendar();

      // Get current state
      const calendar = await GameCalendarModel.findOne();
      if (!calendar) {
        logger.error('[CalendarTick] Calendar not initialized!');
        return;
      }

      const currentDate = calendar.getCurrentDate();

      logger.info(
        `[CalendarTick] Current date: ${currentDate.month}/${currentDate.week}/${currentDate.day}/${currentDate.year}`
      );
      logger.info(`[CalendarTick] Season: ${currentDate.season}`);
      logger.info(`[CalendarTick] Moon Phase: ${currentDate.moonPhase}`);

      // Check for active holiday
      if (calendar.activeHolidayId) {
        const holiday = calendar.getActiveHoliday();
        if (holiday) {
          logger.info(`[CalendarTick] Active Holiday: ${holiday.name}`);
          await this.triggerHolidayEvent(holiday.id, holiday.name);
        }
      }

      // Generate flavor events
      await this.generateFlavorEvents(calendar.currentMonth);

      // Check for season change
      await this.checkSeasonChange(currentDate.season);

        // Check for moon phase events
        await this.checkMoonPhaseEvents(currentDate.moonPhase);

        logger.info('[CalendarTick] Calendar tick completed successfully');
      }, {
        ttl: 1800, // 30 minute lock TTL
        retries: 0 // Don't retry - skip if locked
      });
    } catch (error) {
      if ((error as Error).message?.includes('lock')) {
        logger.debug('[CalendarTick] Calendar tick already running on another instance, skipping');
        return;
      }
      logger.error('[CalendarTick] Error during calendar tick', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Generate random flavor events for the current month
   */
  private async generateFlavorEvents(month: number): Promise<void> {
    // 30% chance of a flavor event each day
    if (SecureRNG.chance(0.3)) {
      const flavorEvent = getRandomFlavorEvent(month);
      logger.debug(`[CalendarTick] Flavor Event: ${flavorEvent}`);

      // Get current day for event storage
      const calendar = await GameCalendarModel.findOne();
      const day = calendar?.currentDay ?? 1;

      // Store in world events and broadcast to online players
      await CalendarEventService.handleFlavorEvent(flavorEvent, month, day);
    }
  }

  /**
   * Check if season changed and trigger effects
   */
  private async checkSeasonChange(currentSeason: string): Promise<void> {
    // Get previous season from a day ago
    // For now, we'll just log current season
    // In the future, we can track season changes and trigger special events

    const seasonalEffects = await seasonService.getCurrentSeasonalEffects();
    logger.debug(
      `[CalendarTick] Seasonal effects - Travel: ${seasonalEffects.travelSpeedModifier}x, Energy: ${seasonalEffects.energyCostModifier}x`
    );
  }

  /**
   * Check moon phase and trigger events
   */
  private async checkMoonPhaseEvents(moonPhase: string): Promise<void> {
    const moonEffects = await seasonService.getCurrentMoonPhaseEffects();

    logger.debug(
      `[CalendarTick] Moon Phase effects - Illumination: ${Math.round(moonEffects.illumination * 100)}%, Supernatural: ${moonEffects.supernaturalEncounterChance * 100}%`
    );

    // Full moon - high chance of supernatural events
    if (moonPhase === 'FULL_MOON') {
      logger.info('[CalendarTick] FULL MOON - Supernatural activity peaks!');
      await CalendarEventService.handleFullMoon();
    }

    // New moon - best time for crime
    if (moonPhase === 'NEW_MOON') {
      logger.info('[CalendarTick] NEW MOON - Perfect cover for criminals!');
      await CalendarEventService.handleNewMoon();
    }
  }

  /**
   * Trigger holiday-specific events
   */
  private async triggerHolidayEvent(holidayId: string, holidayName: string): Promise<void> {
    logger.info(`[CalendarTick] Triggering holiday events for ${holidayName}`);

    // Different holidays trigger different events
    switch (holidayId) {
      case 'halloween':
        logger.info('[CalendarTick] Halloween: Supernatural encounters increased!');
        await CalendarEventService.handleHalloween();
        break;

      case 'independence-day':
        logger.info('[CalendarTick] Independence Day: Fireworks and celebrations!');
        await CalendarEventService.handleIndependenceDay();
        break;

      case 'christmas':
        logger.info('[CalendarTick] Christmas: Peace on earth, goodwill to all!');
        await CalendarEventService.handleChristmas();
        break;

      case 'dia-de-muertos':
        logger.info('[CalendarTick] Día de los Muertos: The veil is thin!');
        await CalendarEventService.handleDiaDeMuertos();
        break;

      default:
        logger.info(`[CalendarTick] General holiday celebration for ${holidayName}`);
        break;
    }
  }

  /**
   * Force advance time (admin command)
   */
  async forceAdvance(days: number): Promise<void> {
    logger.info(`[CalendarTick] Force advancing ${days} days`);
    await calendarService.forceAdvanceTime(days);
  }

  /**
   * Get calendar status
   */
  async getStatus(): Promise<{
    currentDate: string;
    season: string;
    moonPhase: string;
    activeHoliday?: string;
    nextHoliday?: string;
    daysUntilNextSeason: number;
  }> {
    const calendar = await GameCalendarModel.findOne();
    if (!calendar) {
      throw new Error('Calendar not initialized');
    }

    const currentDate = calendar.getCurrentDate();
    const upcomingHolidays = await calendarService.getUpcomingHolidays(1);
    const daysUntilNextSeason = await calendarService.getDaysUntilNextSeason();

    return {
      currentDate: await calendarService.formatDate(currentDate),
      season: currentDate.season,
      moonPhase: currentDate.moonPhase,
      activeHoliday: (currentDate as any).holiday?.name,
      nextHoliday: upcomingHolidays[0]?.name,
      daysUntilNextSeason,
    };
  }
}

export const calendarTickJob = new CalendarTickJob();

// NOTE: Scheduling is handled by Bull queues in queues.ts
// Use calendarTickJob.run() for direct execution

/**
 * Initialize calendar on server start
 */
export async function initializeCalendar(): Promise<void> {
  logger.info('[CalendarTick] Initializing calendar system...');

  try {
    // Ensure calendar exists
    await calendarService.getCalendar();

    // Sync with real time
    await calendarService.syncCalendar();

    logger.info('[CalendarTick] Calendar system initialized');
  } catch (error) {
    logger.error('[CalendarTick] Error initializing calendar', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export default {
  calendarTickJob,
  initializeCalendar,
};
