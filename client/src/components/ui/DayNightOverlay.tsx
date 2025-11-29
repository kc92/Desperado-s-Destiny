/**
 * DayNightOverlay Component
 * Visual overlay that tints the screen based on time of day
 */

import React, { useMemo } from 'react';
import { useGameTime } from '@/hooks/useGameTime';

export interface DayNightOverlayProps {
  enabled?: boolean;
}

/**
 * Time-based color definitions
 * Each period has a gradient overlay with very subtle opacity
 */
const TIME_OVERLAYS: Record<string, { gradient: string; opacity: number }> = {
  // Midnight (0-1) - Darkest blue
  Midnight: {
    gradient: 'linear-gradient(to bottom, rgba(10, 25, 47, 0.15), rgba(15, 35, 60, 0.12))',
    opacity: 1,
  },
  // Night (22-5, 1-5) - Dark blue
  Night: {
    gradient: 'linear-gradient(to bottom, rgba(15, 35, 60, 0.12), rgba(25, 45, 75, 0.1))',
    opacity: 1,
  },
  // Dawn (5-7) - Warm orange-pink
  Dawn: {
    gradient: 'linear-gradient(to bottom, rgba(255, 140, 100, 0.08), rgba(255, 180, 150, 0.05))',
    opacity: 1,
  },
  // Morning (7-12) - Clear/bright
  Morning: {
    gradient: 'linear-gradient(to bottom, rgba(255, 250, 240, 0.02), rgba(255, 250, 240, 0.01))',
    opacity: 1,
  },
  // Noon (12-14) - Clear/bright (no tint)
  Noon: {
    gradient: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0))',
    opacity: 0,
  },
  // Afternoon (14-18) - Slight warm tint
  Afternoon: {
    gradient: 'linear-gradient(to bottom, rgba(255, 240, 220, 0.03), rgba(255, 235, 210, 0.02))',
    opacity: 1,
  },
  // Dusk (18-20) - Orange-purple
  Dusk: {
    gradient: 'linear-gradient(to bottom, rgba(255, 130, 80, 0.08), rgba(160, 100, 180, 0.06))',
    opacity: 1,
  },
  // Evening (20-22) - Blue tint starts
  Evening: {
    gradient: 'linear-gradient(to bottom, rgba(80, 100, 150, 0.08), rgba(60, 80, 130, 0.1))',
    opacity: 1,
  },
};

/**
 * Visual overlay component that changes based on time of day
 * Uses CSS gradients and transitions for smooth effects
 */
export const DayNightOverlay: React.FC<DayNightOverlayProps> = ({ enabled = true }) => {
  const gameTime = useGameTime();

  // Get overlay style for current period
  const overlayStyle = useMemo(() => {
    if (!enabled) {
      return { background: 'transparent', opacity: 0 };
    }

    const overlay = TIME_OVERLAYS[gameTime.period] || TIME_OVERLAYS.Noon;

    return {
      background: overlay.gradient,
      opacity: overlay.opacity,
    };
  }, [enabled, gameTime.period]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 pointer-events-none z-50
        transition-all duration-[3000ms] ease-in-out
      "
      style={overlayStyle}
      aria-hidden="true"
    />
  );
};

export default DayNightOverlay;
