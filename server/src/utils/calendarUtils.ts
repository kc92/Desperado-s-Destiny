/**
 * Calendar Utility Functions
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Helper functions for working with the calendar system
 */

import {
  GameDate,
  Season,
  Month,
  MoonPhase,
  Holiday,
  ItemCategory,
} from '@desperados/shared';
import { getSeasonForMonth } from '../data/seasonalEffects';
import { calculateMoonPhase } from '../data/moonPhases';
import { getMonthlyTheme } from '../data/monthlyThemes';

/**
 * Create a game date
 */
export function createGameDate(
  year: number,
  month: Month,
  week: number,
  day: number
): GameDate {
  const season = getSeasonForMonth(month);
  const dayOfYear = (month - 1) * 28 + (week - 1) * 7 + day;
  const moonPhase = calculateMoonPhase(dayOfYear);

  return {
    year,
    month,
    week,
    day,
    season,
    moonPhase,
  };
}

/**
 * Format game date for display
 */
export function formatGameDate(date: GameDate): string {
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

  const dayOfMonth = (date.week - 1) * 7 + date.day;
  const monthName = monthNames[date.month];

  return `${monthName} ${dayOfMonth}, ${date.year}`;
}

/**
 * Get season name
 */
export function getSeasonName(season: Season): string {
  const names: Record<Season, string> = {
    [Season.SPRING]: 'Spring',
    [Season.SUMMER]: 'Summer',
    [Season.FALL]: 'Fall',
    [Season.WINTER]: 'Winter',
  };
  return names[season];
}

/**
 * Get month name
 */
export function getMonthName(month: Month): string {
  const names = [
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
  return names[month];
}

/**
 * Get moon phase emoji
 */
export function getMoonPhaseEmoji(phase: MoonPhase): string {
  const emojis: Record<MoonPhase, string> = {
    [MoonPhase.NEW_MOON]: '🌑',
    [MoonPhase.WAXING_CRESCENT]: '🌒',
    [MoonPhase.FIRST_QUARTER]: '🌓',
    [MoonPhase.WAXING_GIBBOUS]: '🌔',
    [MoonPhase.FULL_MOON]: '🌕',
    [MoonPhase.WANING_GIBBOUS]: '🌖',
    [MoonPhase.LAST_QUARTER]: '🌗',
    [MoonPhase.WANING_CRESCENT]: '🌘',
  };
  return emojis[phase];
}

/**
 * Get season emoji
 */
export function getSeasonEmoji(season: Season): string {
  const emojis: Record<Season, string> = {
    [Season.SPRING]: '🌸',
    [Season.SUMMER]: '☀️',
    [Season.FALL]: '🍂',
    [Season.WINTER]: '❄️',
  };
  return emojis[season];
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: GameDate, date2: GameDate): number {
  const days1 = dateToTotalDays(date1);
  const days2 = dateToTotalDays(date2);
  return Math.abs(days2 - days1);
}

/**
 * Convert date to total days since epoch
 */
export function dateToTotalDays(date: GameDate): number {
  const daysPerYear = 12 * 28; // 12 months * 28 days
  const yearDays = (date.year - 1885) * daysPerYear;
  const monthDays = (date.month - 1) * 28;
  const weekDays = (date.week - 1) * 7;
  return yearDays + monthDays + weekDays + date.day;
}

/**
 * Compare two dates
 */
export function compareDates(date1: GameDate, date2: GameDate): number {
  const days1 = dateToTotalDays(date1);
  const days2 = dateToTotalDays(date2);
  return days1 - days2;
}

/**
 * Check if date is in the past
 */
export function isInPast(date: GameDate, currentDate: GameDate): boolean {
  return compareDates(date, currentDate) < 0;
}

/**
 * Check if date is in the future
 */
export function isInFuture(date: GameDate, currentDate: GameDate): boolean {
  return compareDates(date, currentDate) > 0;
}

/**
 * Get day of week name
 */
export function getDayOfWeekName(day: number): string {
  const names = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[day] || 'Unknown';
}

/**
 * Get complete date string with day of week
 */
export function getFullDateString(date: GameDate): string {
  const dayOfWeek = getDayOfWeekName(date.day);
  const formatted = formatGameDate(date);
  const season = getSeasonName(date.season);
  const moonPhase = getMoonPhaseEmoji(date.moonPhase);

  return `${dayOfWeek}, ${formatted} (${season}) ${moonPhase}`;
}

/**
 * Get season color for UI
 */
export function getSeasonColor(season: Season): string {
  const colors: Record<Season, string> = {
    [Season.SPRING]: '#90EE90',
    [Season.SUMMER]: '#FFD700',
    [Season.FALL]: '#FF8C00',
    [Season.WINTER]: '#87CEEB',
  };
  return colors[season];
}

/**
 * Generate a calendar summary
 */
export function generateCalendarSummary(
  date: GameDate,
  holiday?: Holiday
): {
  dateString: string;
  season: string;
  seasonEmoji: string;
  moonPhase: string;
  moonEmoji: string;
  holiday?: string;
  monthTheme: string;
} {
  const theme = getMonthlyTheme(date.month);

  return {
    dateString: formatGameDate(date),
    season: getSeasonName(date.season),
    seasonEmoji: getSeasonEmoji(date.season),
    moonPhase: date.moonPhase.replace(/_/g, ' '),
    moonEmoji: getMoonPhaseEmoji(date.moonPhase),
    holiday: holiday?.name,
    monthTheme: theme.description,
  };
}

/**
 * Get item category display name
 */
export function getItemCategoryName(category: ItemCategory): string {
  const names: Record<ItemCategory, string> = {
    crops: 'Crops',
    livestock: 'Livestock',
    furs: 'Furs & Pelts',
    fish: 'Fish',
    wood: 'Wood',
    ore: 'Ore & Minerals',
    medicine: 'Medicine',
    clothing: 'Clothing',
    weapons: 'Weapons',
    ammunition: 'Ammunition',
    food: 'Food',
    alcohol: 'Alcohol',
    luxury: 'Luxury Goods',
  };
  return names[category];
}

/**
 * Get price trend description
 */
export function getPriceTrendDescription(modifier: number): string {
  if (modifier >= 1.3) return 'Very High';
  if (modifier >= 1.15) return 'High';
  if (modifier >= 1.05) return 'Slightly High';
  if (modifier >= 0.95) return 'Normal';
  if (modifier >= 0.85) return 'Slightly Low';
  if (modifier >= 0.7) return 'Low';
  return 'Very Low';
}

/**
 * Get price trend emoji
 */
export function getPriceTrendEmoji(modifier: number): string {
  if (modifier >= 1.15) return '📈';
  if (modifier >= 1.05) return '↗️';
  if (modifier >= 0.95) return '➡️';
  if (modifier >= 0.85) return '↘️';
  return '📉';
}
