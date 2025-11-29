/**
 * GameClock Component
 * Displays current game time with Western-themed styling
 */

import React from 'react';
import { useGameTime } from '@/hooks/useGameTime';

export interface GameClockProps {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

/**
 * Clock component showing current game time
 * Features sun/moon icon, time display, and tooltip with period info
 */
export const GameClock: React.FC<GameClockProps> = ({
  className = '',
  showIcon = true,
  compact = false,
}) => {
  const gameTime = useGameTime();

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2
        bg-wood-medium/80 border-2 border-wood-light
        rounded-lg shadow-wood
        ${className}
      `}
      title={`${gameTime.period} - ${gameTime.isDay ? 'Daylight' : 'Nighttime'}`}
    >
      {/* Icon */}
      {showIcon && (
        <div className="text-2xl leading-none" aria-hidden="true">
          {gameTime.icon}
        </div>
      )}

      {/* Time Display */}
      <div className="flex flex-col">
        <div className="text-desert-sand font-serif text-sm font-bold leading-tight">
          {gameTime.timeString}
        </div>
        {!compact && (
          <div className="text-desert-stone text-xs leading-tight">
            {gameTime.period}
          </div>
        )}
      </div>

      {/* Accessibility */}
      <span className="sr-only">
        Current game time: {gameTime.timeString}, {gameTime.period}
      </span>
    </div>
  );
};

export default GameClock;
