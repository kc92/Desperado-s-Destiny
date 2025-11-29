/**
 * TierBadge Component
 * Display a skill tier with color-coded styling
 */

import React from 'react';

export type TierName = 'NOVICE' | 'APPRENTICE' | 'JOURNEYMAN' | 'EXPERT' | 'MASTER';

interface TierBadgeProps {
  tier: TierName;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const tierStyles: Record<TierName, { bg: string; text: string; border: string; glow?: string }> = {
  NOVICE: {
    bg: 'bg-gray-600',
    text: 'text-gray-100',
    border: 'border-gray-500',
  },
  APPRENTICE: {
    bg: 'bg-green-600',
    text: 'text-green-100',
    border: 'border-green-500',
  },
  JOURNEYMAN: {
    bg: 'bg-blue-600',
    text: 'text-blue-100',
    border: 'border-blue-500',
  },
  EXPERT: {
    bg: 'bg-purple-600',
    text: 'text-purple-100',
    border: 'border-purple-500',
  },
  MASTER: {
    bg: 'bg-gold-dark',
    text: 'text-wood-dark',
    border: 'border-gold-light',
    glow: 'shadow-lg shadow-gold-light/50',
  },
};

const tierLabels: Record<TierName, string> = {
  NOVICE: 'Novice',
  APPRENTICE: 'Apprentice',
  JOURNEYMAN: 'Journeyman',
  EXPERT: 'Expert',
  MASTER: 'Master',
};

const sizeStyles = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

/**
 * Get tier name from skill level
 */
export function getTierFromLevel(level: number): TierName {
  if (level >= 50) return 'MASTER';
  if (level >= 41) return 'EXPERT';
  if (level >= 26) return 'JOURNEYMAN';
  if (level >= 11) return 'APPRENTICE';
  return 'NOVICE';
}

/**
 * Get next tier threshold from current level
 */
export function getNextTierLevel(level: number): number | null {
  if (level >= 50) return null;
  if (level >= 41) return 50;
  if (level >= 26) return 41;
  if (level >= 11) return 26;
  return 11;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  showLabel = true,
  animated = false,
}) => {
  const styles = tierStyles[tier];
  const label = tierLabels[tier];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded font-bold uppercase tracking-wide
        border-2 ${styles.bg} ${styles.text} ${styles.border}
        ${styles.glow || ''}
        ${sizeStyles[size]}
        ${animated ? 'animate-pulse' : ''}
      `}
      title={`${label} Tier`}
    >
      {showLabel ? label : tier.charAt(0)}
    </span>
  );
};

export default TierBadge;
