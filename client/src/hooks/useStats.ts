/**
 * useStats Hook
 * Unified character stats with formatting and display helpers
 *
 * Phase 1: Foundation Fix - Consistent stat display across app
 */

import { useMemo, useCallback } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';

export type StatKey = 'cunning' | 'spirit' | 'combat' | 'craft';

export interface StatInfo {
  /** Stat identifier */
  key: StatKey;
  /** Current stat value */
  value: number;
  /** Full display name */
  label: string;
  /** 3-letter abbreviation */
  abbreviation: string;
  /** Emoji icon */
  icon: string;
  /** Card suit symbol */
  suit: string;
  /** Tailwind gradient color classes */
  color: string;
  /** Description of what stat does */
  description: string;
}

const STAT_CONFIG: Record<StatKey, Omit<StatInfo, 'key' | 'value'>> = {
  cunning: {
    label: 'Cunning',
    abbreviation: 'CUN',
    icon: '🎭',
    suit: '♠',
    color: 'from-gray-600 to-gray-400',
    description: 'Stealth, deception, and social manipulation. Affects crime success and social challenges.',
  },
  spirit: {
    label: 'Spirit',
    abbreviation: 'SPI',
    icon: '✨',
    suit: '♥',
    color: 'from-red-700 to-red-400',
    description: 'Willpower, luck, and mystical power. Affects Destiny Deck draws and spiritual abilities.',
  },
  combat: {
    label: 'Combat',
    abbreviation: 'COM',
    icon: '⚔️',
    suit: '♣',
    color: 'from-green-700 to-green-400',
    description: 'Fighting prowess and weapon mastery. Affects damage dealt and combat success rate.',
  },
  craft: {
    label: 'Craft',
    abbreviation: 'CRA',
    icon: '🔧',
    suit: '♦',
    color: 'from-blue-600 to-blue-400',
    description: 'Building, crafting, and technical skills. Affects item quality and crafting success.',
  },
};

const STAT_ORDER: StatKey[] = ['cunning', 'spirit', 'combat', 'craft'];

export interface StatsHookResult {
  /** Get info for a specific stat */
  getStat: (key: StatKey) => StatInfo;
  /** Get all stats as array */
  getAllStats: () => StatInfo[];
  /** Get stat from action's statUsed string */
  getStatForAction: (statUsed: string) => StatInfo | null;
  /** Sum of all stat values */
  total: number;
  /** Check if stats are loaded */
  isLoaded: boolean;
  /** Get stat by suit symbol */
  getStatBySuit: (suit: string) => StatInfo | null;
}

/**
 * Unified hook for character stats
 * Provides consistent formatting and display across app
 *
 * @example
 * ```tsx
 * const { getStat, getAllStats, getStatForAction } = useStats();
 *
 * // Display single stat
 * const combat = getStat('combat');
 * <span>{combat.suit} {combat.label}: {combat.value}</span>
 *
 * // Display all stats
 * {getAllStats().map(stat => (
 *   <StatBadge key={stat.key} stat={stat} />
 * ))}
 *
 * // Get stat for action
 * const relevantStat = getStatForAction(action.statUsed);
 * ```
 */
export const useStats = (): StatsHookResult => {
  const { currentCharacter } = useCharacterStore();
  const stats = currentCharacter?.stats;

  const getStat = useCallback(
    (key: StatKey): StatInfo => ({
      key,
      value: stats?.[key] ?? 0,
      ...STAT_CONFIG[key],
    }),
    [stats]
  );

  const getAllStats = useCallback((): StatInfo[] => {
    return STAT_ORDER.map(getStat);
  }, [getStat]);

  const getStatForAction = useCallback(
    (statUsed: string): StatInfo | null => {
      if (!statUsed) return null;
      const key = statUsed.toLowerCase() as StatKey;
      if (STAT_CONFIG[key]) {
        return getStat(key);
      }
      return null;
    },
    [getStat]
  );

  const getStatBySuit = useCallback(
    (suit: string): StatInfo | null => {
      const entry = Object.entries(STAT_CONFIG).find(
        ([, config]) => config.suit === suit
      );
      if (entry) {
        return getStat(entry[0] as StatKey);
      }
      return null;
    },
    [getStat]
  );

  const total = useMemo(() => {
    return getAllStats().reduce((sum, stat) => sum + stat.value, 0);
  }, [getAllStats]);

  const isLoaded = !!stats;

  return {
    getStat,
    getAllStats,
    getStatForAction,
    total,
    isLoaded,
    getStatBySuit,
  };
};

export default useStats;
