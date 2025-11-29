/**
 * HPBar Component
 * Reusable HP bar with color coding and damage flash animation
 */

import React, { useEffect, useState } from 'react';

interface HPBarProps {
  /** Current HP */
  current: number;
  /** Maximum HP */
  max: number;
  /** Label to display (optional) */
  label?: string;
  /** Color override (optional) */
  color?: 'red' | 'green' | 'gold';
  /** Show damage flash animation when HP changes */
  showDamage?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * HP bar component with smooth transitions and damage animations
 */
export const HPBar: React.FC<HPBarProps> = ({
  current,
  max,
  label = 'HP',
  color,
  showDamage = true,
  className = '',
}) => {
  const [prevHP, setPrevHP] = useState(current);
  const [isDamaged, setIsDamaged] = useState(false);

  // Calculate percentage
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  // Determine color based on percentage if not overridden
  const getBarColor = (): string => {
    if (color === 'red') return 'bg-red-600';
    if (color === 'green') return 'bg-green-600';
    if (color === 'gold') return 'bg-gold-light';

    // Auto color based on percentage
    if (percentage > 66) return 'bg-green-600';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const getBarGlow = (): string => {
    if (color === 'red') return 'shadow-red-500/50';
    if (color === 'green') return 'shadow-green-500/50';
    if (color === 'gold') return 'shadow-gold-light/50';

    if (percentage > 66) return 'shadow-green-500/50';
    if (percentage > 33) return 'shadow-yellow-500/50';
    return 'shadow-red-500/50';
  };

  // Detect damage and trigger flash animation
  useEffect(() => {
    if (showDamage && current < prevHP) {
      setIsDamaged(true);

      const timer = setTimeout(() => {
        setIsDamaged(false);
      }, 500);

      return () => clearTimeout(timer);
    }
    setPrevHP(current);
  }, [current, prevHP, showDamage]);

  return (
    <div className={`w-full ${className}`}>
      {/* HP Text */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-western text-desert-dust">
          {label}
        </span>
        <span className="text-sm font-bold font-western text-desert-dust" aria-hidden="true">
          {Math.round(current)} / {max}
        </span>
      </div>

      {/* HP Bar Container */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(current)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${Math.round(current)} of ${max} hit points`}
        className={`
          relative w-full h-6 rounded-lg border-2 border-wood-dark bg-wood-darker
          shadow-wood overflow-hidden
          ${isDamaged ? 'animate-hp-shake' : ''}
        `}
      >
        {/* Wood grain background */}
        <div className="absolute inset-0 bg-gradient-to-b from-wood-dark/20 to-transparent" />

        {/* HP Fill Bar */}
        <div
          className={`
            absolute inset-y-0 left-0 transition-all duration-500 ease-out
            ${getBarColor()} ${getBarGlow()}
            shadow-lg
          `}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />

          {/* Flash effect on damage */}
          {isDamaged && (
            <div className="absolute inset-0 bg-white animate-damage-flash" />
          )}
        </div>

        {/* Percentage text overlay */}
        {percentage > 15 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HPBar;
