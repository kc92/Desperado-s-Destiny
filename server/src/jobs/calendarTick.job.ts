/**
 * Calendar Tick Job
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Daily job that advances the game calendar and triggers seasonal events
 */

import { calendarService } from '../services/calendar.service';
import { seasonService } from '../services/season.service';
import { GameCalendarModel } from '../models/GameCalendar.model';
import { getRandomFlavorEvent } from '../data/monthlyThemes';

export class CalendarTickJob {
  /**
   * Run the calendar tick
   * Should be called once per real day (advances game time by 1 week)
   */
  async run(): Promise<void> {
    console.log('[CalendarTick] Running calendar tick job');

    try {
      // Sync calendar with real time
      await calendarService.syncCalendar();

      // Get current state
      const calendar = await GameCalendarModel.findOne();
      if (!calendar) {
        console.error('[CalendarTick] Calendar not initialized!');
        return;
      }

      const currentDate = calendar.getCurrentDate();

      console.log(
        `[CalendarTick] Current date: ${currentDate.month}/${currentDate.week}/${currentDate.day}/${currentDate.year}`
      );
      console.log(`[CalendarTick] Season: ${currentDate.season}`);
      console.log(`[CalendarTick] Moon Phase: ${currentDate.moonPhase}`);

      // Check for active holiday
      if (calendar.activeHolidayId) {
        const holiday = calendar.getActiveHoliday();
        if (holiday) {
          console.log(`[CalendarTick] Active Holiday: ${holiday.name}`);
          await this.triggerHolidayEvent(holiday.id, holiday.name);
        }
      }

      // Generate flavor events
      await this.generateFlavorEvents(calendar.currentMonth);

      // Check for season change
      await this.checkSeasonChange(currentDate.season);

      // Check for moon phase events
      await this.checkMoonPhaseEvents(currentDate.moonPhase);

      console.log('[CalendarTick] Calendar tick completed successfully');
    } catch (error) {
      console.error('[CalendarTick] Error during calendar tick:', error);
      throw error;
    }
  }

  /**
   * Generate random flavor events for the current month
   */
  private async generateFlavorEvents(month: number): Promise<void> {
    // 30% chance of a flavor event each day
    if (Math.random() < 0.3) {
      const flavorEvent = getRandomFlavorEvent(month);
      console.log(`[CalendarTick] Flavor Event: ${flavorEvent}`);

      // TODO: Store this in world events or broadcast to online players
      // For now, just log it
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
    console.log(
      `[CalendarTick] Seasonal effects - Travel: ${seasonalEffects.travelSpeedModifier}x, Energy: ${seasonalEffects.energyCostModifier}x`
    );
  }

  /**
   * Check moon phase and trigger events
   */
  private async checkMoonPhaseEvents(moonPhase: string): Promise<void> {
    const moonEffects = await seasonService.getCurrentMoonPhaseEffects();

    console.log(
      `[CalendarTick] Moon Phase effects - Illumination: ${Math.round(moonEffects.illumination * 100)}%, Supernatural: ${moonEffects.supernaturalEncounterChance * 100}%`
    );

    // Full moon - high chance of supernatural events
    if (moonPhase === 'FULL_MOON') {
      console.log('[CalendarTick] FULL MOON - Supernatural activity peaks!');
      // TODO: Spawn werewolves, ghost sightings, etc.
    }

    // New moon - best time for crime
    if (moonPhase === 'NEW_MOON') {
      console.log('[CalendarTick] NEW MOON - Perfect cover for criminals!');
      // TODO: Increase bandit activity, make crimes easier
    }
  }

  /**
   * Trigger holiday-specific events
   */
  private async triggerHolidayEvent(holidayId: string, holidayName: string): Promise<void> {
    console.log(`[CalendarTick] Triggering holiday events for ${holidayName}`);

    // Different holidays trigger different events
    switch (holidayId) {
      case 'halloween':
        console.log('[CalendarTick] Halloween: Supernatural encounters increased!');
        // TODO: Spawn ghosts, increase weird west encounters
        break;

      case 'independence-day':
        console.log('[CalendarTick] Independence Day: Fireworks and celebrations!');
        // TODO: Town celebrations, shooting contests, patriotic quests
        break;

      case 'christmas':
        console.log('[CalendarTick] Christmas: Peace on earth, goodwill to all!');
        // TODO: Gang truces, charity events, gift exchanges
        break;

      case 'dia-de-muertos':
        console.log('[CalendarTick] Día de los Muertos: The veil is thin!');
        // TODO: Spirit communication, altar building, special Coalition events
        break;

      default:
        console.log(`[CalendarTick] General holiday celebration for ${holidayName}`);
        break;
    }
  }

  /**
   * Force advance time (admin command)
   */
  async forceAdvance(days: number): Promise<void> {
    console.log(`[CalendarTick] Force advancing ${days} days`);
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

/**
 * Schedule the calendar tick to run daily
 */
export function scheduleCalendarTick(): void {
  // Run at midnight every day
  const scheduleTime = new Date();
  scheduleTime.setHours(0, 0, 0, 0);

  const now = new Date();
  let delay = scheduleTime.getTime() - now.getTime();

  // If we've passed today's scheduled time, schedule for tomorrow
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000;
  }

  setTimeout(() => {
    calendarTickJob.run();

    // Schedule to run every 24 hours
    setInterval(() => {
      calendarTickJob.run();
    }, 24 * 60 * 60 * 1000);
  }, delay);

  console.log(
    `[CalendarTick] Scheduled to run daily at midnight (next run in ${Math.round(delay / 1000 / 60)} minutes)`
  );
}

/**
 * Initialize calendar on server start
 */
export async function initializeCalendar(): Promise<void> {
  console.log('[CalendarTick] Initializing calendar system...');

  try {
    // Ensure calendar exists
    await calendarService.getCalendar();

    // Sync with real time
    await calendarService.syncCalendar();

    console.log('[CalendarTick] Calendar system initialized');
  } catch (error) {
    console.error('[CalendarTick] Error initializing calendar:', error);
    throw error;
  }
}

export default {
  calendarTickJob,
  scheduleCalendarTick,
  initializeCalendar,
};
