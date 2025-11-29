/**
 * EnergyBar Component
 * Visual energy/action points display with regeneration info
 */

import React, { useMemo } from 'react';

interface EnergyBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-2 text-xs',
  md: 'h-3 text-sm',
  lg: 'h-4 text-base',
};

/**
 * Energy bar with western-themed styling
 * Memoized to prevent unnecessary re-renders when parent state changes
 */
export const EnergyBar: React.FC<EnergyBarProps> = React.memo(({
  current,
  max,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  // Memoize percentage calculation
  const percentage = useMemo(
    () => Math.min((current / max) * 100, 100),
    [current, max]
  );

  // Memoize regeneration time calculation (assuming 5 hours for full regen)
  const regenText = useMemo(() => {
    const hoursToFull = ((max - current) / max) * 5;
    const hours = Math.floor(hoursToFull);
    const minutes = Math.round((hoursToFull - hours) * 60);

    return current >= max
      ? 'Full energy'
      : `Regenerates fully in ${hours}h ${minutes}m`;
  }, [current, max]);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`font-semibold text-desert-sand ${sizeStyles[size].split(' ')[1]}`}>
            Energy
          </span>
          <span className={`text-gold-medium ${sizeStyles[size].split(' ')[1]}`} aria-hidden="true">
            {Math.floor(current)} / {max}
          </span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={Math.floor(current)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Energy: ${Math.floor(current)} of ${max}. ${regenText}`}
        className={`relative w-full ${sizeStyles[size].split(' ')[0]} bg-wood-dark rounded-full overflow-hidden border-2 border-wood-medium shadow-inner`}
        title={regenText}
      >
        <div
          className="h-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>

      {showLabel && size !== 'sm' && (
        <div className="mt-1">
          <span className="text-xs text-desert-stone italic" aria-live="polite" aria-atomic="true">
            {regenText}
          </span>
        </div>
      )}
    </div>
  );
});

// Display name for React DevTools
EnergyBar.displayName = 'EnergyBar';

export default EnergyBar;
