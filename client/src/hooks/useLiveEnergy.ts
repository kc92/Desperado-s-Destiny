/**
 * useLiveEnergy Hook
 * Provides real-time interpolated energy display that updates automatically
 *
 * PERFORMANCE FIX: Replaces the setInterval re-render hack in PlayerSidebar
 * with a proper React pattern that only triggers re-renders when energy changes
 *
 * BUGFIX: Now subscribes to useEnergyStore for optimistic updates (e.g., when
 * crimes deduct energy before server confirmation)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEnergy } from './useEnergy';
import { useEnergyStore } from '@/store/useEnergyStore';

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

  // Subscribe to the Zustand store for optimistic updates
  const storeEnergy = useEnergyStore((state) => state.energy);

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
  // BUGFIX: Also considers optimistic updates from the Zustand store
  const computeInterpolatedEnergy = useCallback(() => {
    if (!energyStatus) {
      // Fall back to store energy if available (handles edge cases)
      if (storeEnergy) {
        return {
          displayEnergy: Math.floor(storeEnergy.currentEnergy),
          maxEnergy: storeEnergy.maxEnergy,
          energyPercent: storeEnergy.maxEnergy > 0
            ? Math.round((storeEnergy.currentEnergy / storeEnergy.maxEnergy) * 100)
            : 0,
          timeToFull: 0,
          isRegenerating: storeEnergy.currentEnergy < storeEnergy.maxEnergy
        };
      }
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

    // BUGFIX: Check if the Zustand store has an optimistic update pending
    // If so, use the store's value instead of the server's interpolated value
    if (storeEnergy?.isOptimistic) {
      const optimisticEnergy = Math.floor(storeEnergy.currentEnergy);
      const optimisticMax = storeEnergy.maxEnergy;

      // Calculate time to full based on optimistic energy
      const missing = optimisticMax - optimisticEnergy;
      const regenPerSecond = (energyStatus.regenRate + energyStatus.totalBonusRegen) / 60;
      const timeToFull = regenPerSecond > 0 ? Math.ceil(missing / regenPerSecond) : 0;

      return {
        displayEnergy: optimisticEnergy,
        maxEnergy: optimisticMax,
        energyPercent: optimisticMax > 0 ? Math.round((optimisticEnergy / optimisticMax) * 100) : 0,
        timeToFull,
        isRegenerating: optimisticEnergy < optimisticMax
      };
    }

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
    // Prevent negative elapsed time (clock skew or stale timestamp)
    const elapsedMs = Math.max(0, Date.now() - lastUpdateTime);
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
  }, [energyStatus, storeEnergy]);

  // Update live state when base energy changes from server OR when store has optimistic update
  useEffect(() => {
    lastSyncRef.current = Date.now();
    setLiveState(computeInterpolatedEnergy());
  }, [energyStatus, storeEnergy, computeInterpolatedEnergy]);

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
