/**
 * useCurrency Hook
 * Unified currency display and formatting
 *
 * Phase 1: Foundation Fix - Consistent currency display
 */

import { useMemo, useCallback } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';

export interface CurrencyState {
  /** Current dollar amount */
  dollars: number;
  /** Formatted with $ and commas */
  formatted: string;
  /** Compact format (1.2K, 3.5M) */
  formattedCompact: string;
  /** Check if can afford a cost */
  canAfford: (cost: number) => boolean;
  /** Format any amount */
  format: (amount: number, compact?: boolean) => string;
  /** Format with + or - prefix for changes */
  formatChange: (amount: number) => string;
  /** Whether balance is zero */
  isEmpty: boolean;
  /** Whether balance is "rich" (>100K) */
  isRich: boolean;
}

/**
 * Format a currency amount
 */
const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (compact) {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (absAmount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (absAmount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
  }
  return `$${amount.toLocaleString()}`;
};

/**
 * Format a currency change with + or - prefix
 */
const formatCurrencyChange = (amount: number): string => {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount)}`;
};

/**
 * Unified hook for currency state
 * Provides consistent formatting across app
 *
 * @example
 * ```tsx
 * const { dollars, formatted, canAfford, formatChange } = useCurrency();
 *
 * // Display balance
 * <span>{formatted}</span>  // "$1,234"
 *
 * // Check affordability
 * if (!canAfford(itemPrice)) {
 *   showError("Not enough gold!");
 * }
 *
 * // Show change
 * <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
 *   {formatChange(change)}  // "+$500" or "-$200"
 * </span>
 * ```
 */
export const useCurrency = (): CurrencyState => {
  const { currentCharacter } = useCharacterStore();

  // Note: 'gold' field stores dollars in the data model
  const dollars = currentCharacter?.gold ?? 0;

  const formatted = useMemo(() => formatCurrency(dollars), [dollars]);

  const formattedCompact = useMemo(
    () => formatCurrency(dollars, true),
    [dollars]
  );

  const canAfford = useCallback(
    (cost: number): boolean => {
      return dollars >= cost;
    },
    [dollars]
  );

  const format = useCallback(
    (amount: number, compact: boolean = false): string => {
      return formatCurrency(amount, compact);
    },
    []
  );

  const formatChange = useCallback((amount: number): string => {
    return formatCurrencyChange(amount);
  }, []);

  return {
    dollars,
    formatted,
    formattedCompact,
    canAfford,
    format,
    formatChange,
    isEmpty: dollars === 0,
    isRich: dollars >= 100_000,
  };
};

export default useCurrency;
