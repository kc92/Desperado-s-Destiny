/**
 * EnergyDisplay Component
 *
 * Enhanced energy display with real-time regeneration updates,
 * color coding, and premium indicators
 */

import React, { useState, useEffect, useMemo } from 'react';
// import { ENERGY } from '@desperados/shared';

interface EnergyDisplayProps {
  current: number;
  max: number;
  regenRate: number;
  isPremium?: boolean;
  lastUpdate?: Date;
  className?: string;
}

/**
 * Calculate time until next energy point
 * @internal Unused but kept for potential future use
 */
// @ts-ignore Unused
function _getTimeUntilNextPoint(regenRate: number): number {
  // regenRate is per hour, calculate ms until next point
  const msPerPoint = (60 * 60 * 1000) / regenRate;
  return msPerPoint;
}

/**
 * Calculate time until full energy
 */
function getTimeUntilFull(current: number, max: number, regenRate: number): number {
  if (current >= max) return 0;

  const energyNeeded = max - current;
  const hoursNeeded = energyNeeded / regenRate;
  return hoursNeeded * 60 * 60 * 1000;
}

/**
 * Format time remaining
 */
function formatTime(ms: number): string {
  if (ms <= 0) return 'Full';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return minutes < 5 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  return `${seconds}s`;
}

/**
 * Enhanced energy display with real-time updates
 * Memoized to prevent unnecessary re-renders
 */
export const EnergyDisplay: React.FC<EnergyDisplayProps> = React.memo(({
  current: initialCurrent,
  max,
  regenRate,
  isPremium = false,
  lastUpdate: _lastUpdate,
  className = '',
}) => {
  const [current, setCurrent] = useState(initialCurrent);
  const [lastTick, setLastTick] = useState(Date.now());

  // Update energy every second with regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {
        if (prev >= max) return max;

        const now = Date.now();
        const elapsedMs = now - lastTick;
        const regenPerMs = regenRate / (60 * 60 * 1000);
        const newEnergy = Math.min(prev + regenPerMs * elapsedMs, max);

        setLastTick(now);
        return newEnergy;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [max, regenRate, lastTick]);

  // Update when props change
  useEffect(() => {
    setCurrent(initialCurrent);
    setLastTick(Date.now());
  }, [initialCurrent]);

  // Memoize percentage calculation
  const percentage = useMemo(
    () => Math.min((current / max) * 100, 100),
    [current, max]
  );

  // Memoize display values
  const displayCurrent = useMemo(() => Math.floor(current), [current]);

  // Memoize time until full calculation
  const timeUntilFull = useMemo(
    () => getTimeUntilFull(current, max, regenRate),
    [current, max, regenRate]
  );

  // Memoize color coding based on percentage
  const { barColor, textColor } = useMemo(() => {
    let bar = 'from-gold-dark to-gold-light'; // High (>66%)
    let text = 'text-gold-medium';

    if (percentage <= 0) {
      bar = 'from-red-800 to-red-600'; // Empty
      text = 'text-red-500';
    } else if (percentage < 33) {
      bar = 'from-orange-600 to-orange-400'; // Low
      text = 'text-orange-500';
    } else if (percentage < 66) {
      bar = 'from-yellow-600 to-yellow-400'; // Medium
      text = 'text-yellow-500';
    }

    return { barColor: bar, textColor: text };
  }, [percentage]);

  return (
    <div className={`w-full ${className}`} role="status" aria-label="Energy status">
      {/* Header with current/max and premium indicator */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-desert-sand text-lg">Energy</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-xl ${textColor}`}>
            {displayCurrent} / {max}
          </span>
          {isPremium && (
            <span
              className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-purple-400 text-white text-xs font-bold rounded-full"
              title="Premium player"
            >
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Energy bar */}
      <div
        className="relative w-full h-6 bg-wood-dark rounded-lg overflow-hidden border-2 border-wood-medium shadow-lg"
        title={`${displayCurrent} / ${max} energy`}
      >
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />

        {/* Pulse effect when regenerating */}
        {current < max && (
          <div
            className={`absolute inset-0 bg-gradient-to-r ${barColor} opacity-30 animate-pulse`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Regeneration info */}
      <div className="mt-2 flex justify-between items-center text-xs">
        <span className="text-desert-stone italic">
          Regenerates at {Math.round(regenRate)}/hour
        </span>
        <span className={`font-semibold ${current >= max ? 'text-green-500' : 'text-desert-sand'}`}>
          {current >= max ? 'Full Energy' : `Full in ${formatTime(timeUntilFull)}`}
        </span>
      </div>

      {/* Tooltip information */}
      <div className="sr-only">
        Energy: {displayCurrent} out of {max}.
        {current < max && ` Regenerating at ${Math.round(regenRate)} per hour. Full in ${formatTime(timeUntilFull)}.`}
        {isPremium && ' Premium player.'}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if critical props change
  return (
    prevProps.current === nextProps.current &&
    prevProps.max === nextProps.max &&
    prevProps.regenRate === nextProps.regenRate &&
    prevProps.isPremium === nextProps.isPremium
  );
});

// Display name for React DevTools
EnergyDisplay.displayName = 'EnergyDisplay';

export default EnergyDisplay;
