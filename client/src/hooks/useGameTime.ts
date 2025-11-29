/**
 * useGameTime Hook
 * Provides access to current game time with computed values
 */

import { useEffect, useState, useCallback } from 'react';
import { useWorldStore } from '@/store/useWorldStore';

export interface GameTimeState {
  hour: number;           // 0-23
  period: string;         // "Dawn", "Morning", etc.
  isDay: boolean;         // 6-18
  isNight: boolean;       // 18-6
  timeString: string;     // "2:00 PM"
  nextPeriodIn: number;   // minutes until next period
  icon: string;           // Emoji icon for time period
}

/**
 * Time period definitions matching server TimeOfDay enum
 */
const TIME_PERIODS = {
  DAWN: { name: 'Dawn', start: 5, end: 7, icon: '🌅' },
  MORNING: { name: 'Morning', start: 7, end: 12, icon: '☀️' },
  NOON: { name: 'Noon', start: 12, end: 14, icon: '☀️' },
  AFTERNOON: { name: 'Afternoon', start: 14, end: 18, icon: '☀️' },
  DUSK: { name: 'Dusk', start: 18, end: 20, icon: '🌅' },
  EVENING: { name: 'Evening', start: 20, end: 22, icon: '🌙' },
  NIGHT: { name: 'Night', start: 22, end: 5, icon: '🌙' },
  MIDNIGHT: { name: 'Midnight', start: 0, end: 1, icon: '🌑' },
};

/**
 * Calculate time period from hour
 */
function getTimePeriod(hour: number): { name: string; icon: string; nextPeriodHour: number } {
  // Midnight special case
  if (hour >= 0 && hour < 1) {
    return { name: TIME_PERIODS.MIDNIGHT.name, icon: TIME_PERIODS.MIDNIGHT.icon, nextPeriodHour: 1 };
  }

  // Dawn
  if (hour >= 5 && hour < 7) {
    return { name: TIME_PERIODS.DAWN.name, icon: TIME_PERIODS.DAWN.icon, nextPeriodHour: 7 };
  }

  // Morning
  if (hour >= 7 && hour < 12) {
    return { name: TIME_PERIODS.MORNING.name, icon: TIME_PERIODS.MORNING.icon, nextPeriodHour: 12 };
  }

  // Noon
  if (hour >= 12 && hour < 14) {
    return { name: TIME_PERIODS.NOON.name, icon: TIME_PERIODS.NOON.icon, nextPeriodHour: 14 };
  }

  // Afternoon
  if (hour >= 14 && hour < 18) {
    return { name: TIME_PERIODS.AFTERNOON.name, icon: TIME_PERIODS.AFTERNOON.icon, nextPeriodHour: 18 };
  }

  // Dusk
  if (hour >= 18 && hour < 20) {
    return { name: TIME_PERIODS.DUSK.name, icon: TIME_PERIODS.DUSK.icon, nextPeriodHour: 20 };
  }

  // Evening
  if (hour >= 20 && hour < 22) {
    return { name: TIME_PERIODS.EVENING.name, icon: TIME_PERIODS.EVENING.icon, nextPeriodHour: 22 };
  }

  // Night (22-24 and 1-5)
  if (hour >= 22 || hour < 5) {
    return { name: TIME_PERIODS.NIGHT.name, icon: TIME_PERIODS.NIGHT.icon, nextPeriodHour: hour >= 22 ? 5 : 5 };
  }

  // Default (shouldn't reach here)
  return { name: 'Unknown', icon: '❓', nextPeriodHour: (hour + 1) % 24 };
}

/**
 * Format hour to 12-hour time string
 */
function formatTimeString(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

/**
 * Calculate minutes until next period
 */
function getMinutesUntilNextPeriod(currentHour: number, nextPeriodHour: number): number {
  let hoursUntil = nextPeriodHour - currentHour;
  if (hoursUntil <= 0) {
    hoursUntil += 24;
  }
  return hoursUntil * 60; // Convert to minutes (simplified - assumes each in-game hour = 1 real minute)
}

/**
 * Hook to access current game time
 */
export function useGameTime(): GameTimeState {
  const { worldState, fetchWorldState } = useWorldStore();
  const [gameTime, setGameTime] = useState<GameTimeState>({
    hour: 12,
    period: 'Noon',
    isDay: true,
    isNight: false,
    timeString: '12:00 PM',
    nextPeriodIn: 120,
    icon: '☀️',
  });

  // Fetch world state on mount and periodically
  useEffect(() => {
    // Initial fetch
    fetchWorldState();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchWorldState();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchWorldState]);

  // Update game time state when world state changes
  const updateGameTime = useCallback(() => {
    if (worldState) {
      const hour = worldState.gameHour;
      const periodInfo = getTimePeriod(hour);
      const isDay = hour >= 6 && hour < 18;

      setGameTime({
        hour,
        period: periodInfo.name,
        isDay,
        isNight: !isDay,
        timeString: formatTimeString(hour),
        nextPeriodIn: getMinutesUntilNextPeriod(hour, periodInfo.nextPeriodHour),
        icon: periodInfo.icon,
      });
    }
  }, [worldState]);

  useEffect(() => {
    updateGameTime();
  }, [updateGameTime]);

  return gameTime;
}

export default useGameTime;
