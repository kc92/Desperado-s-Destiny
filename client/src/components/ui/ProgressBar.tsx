/**
 * ProgressBar Component
 * Accessible progress bar with color variants
 *
 * Phase 1: Foundation - Enhanced with ARIA support
 */

import React from 'react';

export type ProgressBarColor = 'green' | 'yellow' | 'red' | 'blue' | 'amber' | 'purple' | 'gray' | 'gold';

export interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Color variant */
  color?: ProgressBarColor;
  /** Additional CSS classes */
  className?: string;
  /** Show numeric label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label for screen readers */
  label?: string;
  /** Show striped animation */
  striped?: boolean;
  /** Show animated stripes */
  animated?: boolean;
}

const COLOR_CLASSES: Record<ProgressBarColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
  gold: 'bg-gold-medium',
};

const SIZE_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const TRACK_SIZE_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

/**
 * Accessible progress bar component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProgressBar value={75} max={100} />
 *
 * // With label for screen readers
 * <ProgressBar value={health} max={maxHealth} label="Health" color="red" />
 *
 * // With visible label
 * <ProgressBar value={xp} max={xpNeeded} showLabel label="Experience" />
 *
 * // Striped and animated
 * <ProgressBar value={progress} max={100} striped animated color="gold" />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'green',
  className = '',
  showLabel = false,
  size = 'md',
  label,
  striped = false,
  animated = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.green;
  const sizeClass = SIZE_CLASSES[size];
  const trackSizeClass = TRACK_SIZE_CLASSES[size];

  // Generate unique ID for accessibility
  const id = React.useId();
  const labelId = `${id}-label`;

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden label for screen readers if not showing visible label */}
      {label && !showLabel && (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      )}

      {/* Visible label */}
      {showLabel && label && (
        <div className="flex justify-between items-center mb-1">
          <span id={labelId} className="text-xs text-desert-stone">
            {label}
          </span>
          <span className="text-xs text-desert-stone">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress bar track */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? 'Progress' : undefined}
        className={`${trackSizeClass} bg-wood-dark/50 rounded-full overflow-hidden`}
      >
        {/* Progress bar fill */}
        <div
          className={`
            ${sizeClass} ${colorClass}
            transition-all duration-300 ease-out
            ${striped ? 'bg-stripes' : ''}
            ${animated ? 'animate-stripes' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Visible value label (without label name) */}
      {showLabel && !label && (
        <div className="text-xs text-desert-stone mt-1 text-right">
          {value}/{max} ({Math.round(percentage)}%)
        </div>
      )}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
