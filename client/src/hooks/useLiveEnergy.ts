/**
 * useLiveEnergy Hook
 * Provides real-time interpolated energy display that updates automatically
 *
 * PERFORMANCE FIX: Replaces the setInterval re-render hack in PlayerSidebar
 * with a proper React pattern that only triggers re-renders when energy changes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEnergy } from './useEnergy';

interface LiveEnergyState {
  displayEnergy: number;
  maxEnergy: number;
  energyPercent: number;
  timeToFull: number; // seconds
  isRegenerating: boolean;
}

interface UseLiveEnergyOptions {
  /** Update interval in milliseconds (default: 1000ms) */
  updateInterval?: number;
  /** Whether to enable live updates (default: true) */
  enabled?: boolean;
}

/**
 * Hook that provides live-updating energy values with client-side interpolation.
 * Automatically triggers re-renders at the specified interval to show smooth
 * energy regeneration without the need for manual setInterval hacks.
 *
 * @param options Configuration options
 * @returns LiveEnergyState with interpolated values
 */
export function useLiveEnergy(options: UseLiveEnergyOptions = {}): LiveEnergyState {
  const { updateInterval = 1000, enabled = true } = options;

  const {
    energyStatus,
    currentEnergy: baseEnergy,
    maxEnergy,
    timeToFull: baseTimeToFull,
    fetchStatus
  } = useEnergy();

  // Track the last server sync time
  const lastSyncRef = useRef<number>(Date.now());

  // State for the live-updating display values
  const [liveState, setLiveState] = useState<LiveEnergyState>({
    displayEnergy: baseEnergy,
    maxEnergy,
    energyPercent: maxEnergy > 0 ? Math.round((baseEnergy / maxEnergy) * 100) : 0,
    timeToFull: baseTimeToFull,
    isRegenerating: baseEnergy < maxEnergy
  });

  // Compute interpolated energy based on time elapsed
  const computeInterpolatedEnergy = useCallback(() => {
    if (!energyStatus) {
      return {
        displayEnergy: 0,
        maxEnergy: 150,
        energyPercent: 0,
        timeToFull: 0,
        isRegenerating: false
      };
    }

    const storedEnergy = energyStatus.current;
    const max = energyStatus.max;

    // If at or above max, no interpolation needed
    if (storedEnergy >= max) {
      return {
        displayEnergy: max,
        maxEnergy: max,
        energyPercent: 100,
        timeToFull: 0,
        isRegenerating: false
      };
    }

    // Calculate energy gained since last server update
    const lastUpdateTime = new Date(energyStatus.lastUpdate).getTime();
    const elapsedMs = Date.now() - lastUpdateTime;
    const regenPerMs = (energyStatus.regenRate + energyStatus.totalBonusRegen) / 60000;
    const regenGained = elapsedMs * regenPerMs;

    // Calculate interpolated energy, capped at max
    const interpolatedEnergy = Math.min(storedEnergy + regenGained, max);
    const displayEnergy = Math.floor(interpolatedEnergy);

    // Calculate time to full
    const missing = max - displayEnergy;
    const regenPerSecond = (energyStatus.regenRate + energyStatus.totalBonusRegen) / 60;
    const timeToFull = regenPerSecond > 0 ? Math.ceil(missing / regenPerSecond) : 0;

    return {
      displayEnergy,
      maxEnergy: max,
      energyPercent: max > 0 ? Math.round((displayEnergy / max) * 100) : 0,
      timeToFull,
      isRegenerating: displayEnergy < max
    };
  }, [energyStatus]);

  // Update live state when base energy changes from server
  useEffect(() => {
    lastSyncRef.current = Date.now();
    setLiveState(computeInterpolatedEnergy());
  }, [energyStatus, computeInterpolatedEnergy]);

  // Set up interval for live updates (only when regenerating)
  useEffect(() => {
    if (!enabled || !liveState.isRegenerating) {
      return;
    }

    const intervalId = setInterval(() => {
      setLiveState(computeInterpolatedEnergy());
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [enabled, updateInterval, liveState.isRegenerating, computeInterpolatedEnergy]);

  // Initial fetch on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return liveState;
}

export default useLiveEnergy;
