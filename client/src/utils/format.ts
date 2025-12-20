/**
 * Formatting Utilities
 * Helper functions for formatting numbers, currency, dates, etc.
 */

import { CURRENCY_CONSTANTS } from '@desperados/shared';

// =============================================================================
// CURRENCY FORMATTERS
// =============================================================================

/**
 * Format dollar amount with proper separators
 * Dollars are the primary currency for all transactions
 * @param amount - Dollar amount to format
 * @returns Formatted string like "$1,234"
 */
export function formatDollars(amount: number): string {
  return `${CURRENCY_CONSTANTS.SYMBOLS.DOLLARS}${amount.toLocaleString()}`;
}

/**
 * Format gold resource amount
 * Gold is a valuable mined resource (~$100 base value)
 * @param amount - Gold amount to format
 * @param verbose - If true, returns "X Gold" instead of "Xg"
 * @returns Formatted string like "50g" or "50 Gold"
 */
export function formatGoldResource(amount: number, verbose = false): string {
  if (verbose) {
    return `${amount.toLocaleString()} ${CURRENCY_CONSTANTS.NAMES.GOLD}`;
  }
  return `${amount.toLocaleString()}${CURRENCY_CONSTANTS.SYMBOLS.GOLD}`;
}

/**
 * Format silver resource amount
 * Silver is a common mined resource (~$10 base value)
 * @param amount - Silver amount to format
 * @param verbose - If true, returns "X Silver" instead of "Xs"
 * @returns Formatted string like "100s" or "100 Silver"
 */
export function formatSilver(amount: number, verbose = false): string {
  if (verbose) {
    return `${amount.toLocaleString()} ${CURRENCY_CONSTANTS.NAMES.SILVER}`;
  }
  return `${amount.toLocaleString()}${CURRENCY_CONSTANTS.SYMBOLS.SILVER}`;
}

/**
 * Format any currency/resource type
 * @param amount - Amount to format
 * @param type - Currency type ('dollars', 'gold', 'silver')
 * @param verbose - If true, use verbose format for resources
 * @returns Formatted string
 */
export function formatCurrency(
  amount: number,
  type: 'dollars' | 'gold' | 'silver',
  verbose = false
): string {
  switch (type) {
    case 'dollars':
      return formatDollars(amount);
    case 'gold':
      return formatGoldResource(amount, verbose);
    case 'silver':
      return formatSilver(amount, verbose);
    default:
      return amount.toLocaleString();
  }
}

/**
 * Format exchange rate display
 * @param rate - Exchange rate (dollars per resource unit)
 * @param type - Resource type ('gold' or 'silver')
 * @returns Formatted string like "1g = $105.50"
 */
export function formatExchangeRate(
  rate: number,
  type: 'gold' | 'silver'
): string {
  const symbol = type === 'gold' ? CURRENCY_CONSTANTS.SYMBOLS.GOLD : CURRENCY_CONSTANTS.SYMBOLS.SILVER;
  return `1${symbol} = $${rate.toFixed(2)}`;
}

/**
 * Format price change percentage with color indicator
 * @param changePercent - Percentage change (-100 to +100)
 * @returns Object with formatted string and color class
 */
export function formatPriceChange(changePercent: number): {
  text: string;
  colorClass: string;
} {
  const sign = changePercent >= 0 ? '+' : '';
  return {
    text: `${sign}${changePercent.toFixed(1)}%`,
    colorClass: changePercent >= 0 ? 'text-green-500' : 'text-red-500',
  };
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param num - Number to format
 * @returns Formatted string like "1.2K" or "3.4M"
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format number with locale-based thousand separators (commas)
 * Best for XP, experience points, and precise numerical displays
 * @param num - Number to format
 * @returns Formatted string like "1,234" or "100,000"
 */
export function formatWithCommas(num: number): string {
  return num.toLocaleString();
}

/**
 * Format XP/experience points - uses commas for readability
 * Provides cleaner display for skill and character progression
 * @param current - Current XP amount
 * @param max - Maximum XP to next level (optional)
 * @returns Formatted string like "1,234" or "1,234 / 10,000"
 */
export function formatXP(current: number, max?: number): string {
  const formattedCurrent = current.toLocaleString();
  if (max !== undefined) {
    return `${formattedCurrent} / ${max.toLocaleString()}`;
  }
  return formattedCurrent;
}

/**
 * Format percentage
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places
 * @returns Formatted string like "45.5%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format time duration
 * @param seconds - Duration in seconds
 * @returns Formatted string like "1h 23m" or "45s"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Format relative time (e.g., "3 minutes ago")
 * @param date - Date to format
 * @returns Formatted string like "3 minutes ago"
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

/**
 * Format distance to now (alias for formatTimeAgo)
 * @param date - Date to format
 * @returns Formatted string like "3 minutes ago"
 */
export function formatDistanceToNow(date: Date): string {
  return formatTimeAgo(date);
}
