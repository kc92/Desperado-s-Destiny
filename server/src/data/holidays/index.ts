/**
 * Holiday Events Data - Central Index
 * Exports all holiday event definitions
 *
 * Note: This is separate from server/src/data/holidays.ts which defines simple calendar holidays
 * This file defines full holiday EVENT SYSTEMS with quests, shops, activities, etc.
 */

import { HolidayEvent } from '@desperados/shared';
import { christmasEvent } from './christmas';
import { halloweenEvent } from './halloween';
import { independenceDayEvent } from './independenceDay';
import {
  newYearEvent,
  valentineEvent,
  easterEvent,
  thanksgivingEvent,
} from './otherHolidays';

/**
 * All holiday events available in the game
 */
export const allHolidayEvents: HolidayEvent[] = [
  newYearEvent,
  valentineEvent,
  easterEvent,
  independenceDayEvent,
  halloweenEvent,
  thanksgivingEvent,
  christmasEvent,
];

/**
 * Holiday events mapped by their ID for quick lookup
 */
export const holidayEventsById = new Map<string, HolidayEvent>(
  allHolidayEvents.map((holiday) => [holiday.id, holiday])
);

/**
 * Holiday events mapped by their type for filtering
 */
export const holidayEventsByType = new Map<string, HolidayEvent>(
  allHolidayEvents.map((holiday) => [holiday.type, holiday])
);

/**
 * Get a holiday event by ID
 */
export function getHolidayEventById(id: string): HolidayEvent | undefined {
  return holidayEventsById.get(id);
}

/**
 * Get a holiday event by type
 */
export function getHolidayEventByType(type: string): HolidayEvent | undefined {
  return holidayEventsByType.get(type);
}

/**
 * Get all active holiday events for a given date
 */
export function getActiveHolidayEvents(date: Date): HolidayEvent[] {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  return allHolidayEvents.filter((holiday) => {
    return isDateInRange(month, day, holiday.startDate, holiday.endDate);
  });
}

/**
 * Check if a date falls within a holiday's date range
 */
function isDateInRange(
  month: number,
  day: number,
  startDate: { month: number; day: number },
  endDate: { month: number; day: number }
): boolean {
  // Handle year-crossing holidays (like New Year's)
  if (startDate.month > endDate.month) {
    // Holiday crosses year boundary
    return (
      (month === startDate.month && day >= startDate.day) ||
      (month > startDate.month) ||
      (month < endDate.month) ||
      (month === endDate.month && day <= endDate.day)
    );
  }

  // Normal case - holiday within same year
  if (month < startDate.month || month > endDate.month) {
    return false;
  }

  if (month === startDate.month && day < startDate.day) {
    return false;
  }

  if (month === endDate.month && day > endDate.day) {
    return false;
  }

  return true;
}

/**
 * Get upcoming holiday events within the next N days
 */
export function getUpcomingHolidayEvents(
  daysAhead: number = 30,
  currentDate: Date = new Date()
): HolidayEvent[] {
  const upcoming: HolidayEvent[] = [];
  const checkDate = new Date(currentDate);

  for (let i = 0; i < daysAhead; i++) {
    checkDate.setDate(checkDate.getDate() + 1);
    const activeOnDate = getActiveHolidayEvents(checkDate);

    for (const holiday of activeOnDate) {
      if (!upcoming.find((h) => h.id === holiday.id)) {
        upcoming.push(holiday);
      }
    }
  }

  return upcoming;
}

/**
 * Get days until a specific holiday event starts
 */
export function getDaysUntilHolidayEvent(
  holiday: HolidayEvent,
  currentDate: Date = new Date()
): number {
  const current = new Date(currentDate);
  const startMonth = holiday.startDate.month;
  const startDay = holiday.startDate.day;

  // Create target date for this year
  let targetDate = new Date(
    current.getFullYear(),
    startMonth - 1,
    startDay
  );

  // If holiday already passed this year, target next year
  if (targetDate < current) {
    targetDate = new Date(
      current.getFullYear() + 1,
      startMonth - 1,
      startDay
    );
  }

  const diffTime = targetDate.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a specific holiday event is currently active
 */
export function isHolidayEventActive(
  holiday: HolidayEvent,
  date: Date = new Date()
): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return isDateInRange(month, day, holiday.startDate, holiday.endDate);
}

/**
 * Get all holiday events sorted by next occurrence
 */
export function getHolidayEventsByNextOccurrence(
  currentDate: Date = new Date()
): HolidayEvent[] {
  return [...allHolidayEvents].sort((a, b) => {
    const daysA = getDaysUntilHolidayEvent(a, currentDate);
    const daysB = getDaysUntilHolidayEvent(b, currentDate);
    return daysA - daysB;
  });
}

// Re-export individual holiday events for direct access
export { christmasEvent } from './christmas';
export { halloweenEvent } from './halloween';
export { independenceDayEvent } from './independenceDay';
export {
  newYearEvent,
  valentineEvent,
  easterEvent,
  thanksgivingEvent,
} from './otherHolidays';
