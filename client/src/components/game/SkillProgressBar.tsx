/**
 * SkillProgressBar Component
 * Reusable progress bar for skill XP and training time
 */

import React from 'react';
import { formatWithCommas } from '@/utils/format';

interface SkillProgressBarProps {
  current: number;
  max: number;
  label: string;
  color?: 'gold' | 'blue' | 'red' | 'purple';
  showPercentage?: boolean;
  animated?: boolean;
}

const colorStyles = {
  gold: {
    bg: 'bg-gold-dark/20',
    fill: 'bg-gradient-to-r from-gold-medium to-gold-light',
    text: 'text-gold-light',
  },
  blue: {
    bg: 'bg-blue-900/20',
    fill: 'bg-gradient-to-r from-blue-600 to-blue-400',
    text: 'text-blue-300',
  },
  red: {
    bg: 'bg-blood-dark/20',
    fill: 'bg-gradient-to-r from-blood-red to-blood-crimson',
    text: 'text-blood-crimson',
  },
  purple: {
    bg: 'bg-purple-900/20',
    fill: 'bg-gradient-to-r from-purple-600 to-purple-400',
    text: 'text-purple-300',
  },
};

/**
 * Western-styled progress bar with smooth animations
 */
export const SkillProgressBar: React.FC<SkillProgressBarProps> = ({
  current,
  max,
  label,
  color = 'gold',
  showPercentage = true,
  animated = true,
}) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const styles = colorStyles[color];

  // Determine if near completion (last 10%)
  const isNearCompletion = percentage >= 90;

  return (
    <div className="w-full">
      {/* Label and values */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-desert-sand">{label}</span>
        <span className={`text-sm font-bold ${styles.text}`}>
          {formatWithCommas(current)} / {formatWithCommas(max)}
          {showPercentage && ` (${Math.round(percentage)}%)`}
        </span>
      </div>

      {/* Progress bar container */}
      <div
        className={`relative w-full h-6 rounded-lg border-2 border-wood-dark overflow-hidden ${styles.bg}`}
      >
        {/* Progress fill */}
        <div
          className={`h-full ${styles.fill} ${animated ? 'transition-all duration-500 ease-out' : ''} ${
            isNearCompletion && animated ? 'animate-pulse-gold' : ''
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        {/* Inner border for depth */}
        <div className="absolute inset-0 border border-black/20 rounded-lg pointer-events-none" />
      </div>
    </div>
  );
};

export default SkillProgressBar;
