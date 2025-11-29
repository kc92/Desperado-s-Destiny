/**
 * SignBonusDisplay Component
 * Shows active bonuses from current zodiac sign
 */

import React from 'react';
import type { SignBonus, BonusType } from '@/types/zodiac.types';
import { Card } from '@/components/ui';

interface SignBonusDisplayProps {
  bonuses: SignBonus[];
  signName?: string;
  isPeakDay?: boolean;
  showInactive?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Get icon for bonus type
 */
function getBonusIcon(type: BonusType): string {
  switch (type) {
    case 'gold_multiplier':
      return '💰';
    case 'xp_multiplier':
      return '⭐';
    case 'energy_regen':
      return '⚡';
    case 'skill_boost':
      return '📚';
    case 'crime_success':
      return '🎭';
    case 'combat_power':
      return '⚔️';
    case 'reputation_gain':
      return '🏅';
    case 'crafting_bonus':
      return '🔨';
    case 'luck_increase':
      return '🍀';
    case 'travel_speed':
      return '🐎';
    case 'stealth_bonus':
      return '👤';
    case 'special':
      return '✨';
    default:
      return '📊';
  }
}

/**
 * Get color for bonus type
 */
function getBonusColor(type: BonusType): string {
  switch (type) {
    case 'gold_multiplier':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'xp_multiplier':
      return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    case 'energy_regen':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'skill_boost':
      return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
    case 'crime_success':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'combat_power':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'reputation_gain':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'crafting_bonus':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'luck_increase':
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'travel_speed':
      return 'text-teal-400 bg-teal-500/20 border-teal-500/30';
    case 'stealth_bonus':
      return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    case 'special':
      return 'text-gold-light bg-gold-dark/20 border-gold-medium/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
}

/**
 * Individual bonus item
 */
interface BonusItemProps {
  bonus: SignBonus;
  size: 'sm' | 'md' | 'lg';
}

const BonusItem: React.FC<BonusItemProps> = ({ bonus, size }) => {
  const colorClass = getBonusColor(bonus.type);
  const icon = getBonusIcon(bonus.type);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div
      className={`
        flex items-center gap-2 rounded-lg border
        transition-all duration-300
        ${colorClass}
        ${sizeClasses[size]}
        ${bonus.isActive ? 'opacity-100' : 'opacity-50'}
        ${bonus.isPeakBonus ? 'ring-1 ring-gold-light animate-pulse' : ''}
      `}
    >
      {/* Icon */}
      <span className={iconSizes[size]}>{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-western truncate">{bonus.name}</div>
        {size !== 'sm' && (
          <div className="text-xs opacity-70 truncate">{bonus.description}</div>
        )}
      </div>

      {/* Value */}
      <div className="font-bold">
        +{bonus.value}%
      </div>

      {/* Peak badge */}
      {bonus.isPeakBonus && (
        <span className="text-xs bg-gold-medium text-wood-dark px-1.5 py-0.5 rounded font-bold">
          PEAK
        </span>
      )}
    </div>
  );
};

/**
 * Sign bonus display component
 */
export const SignBonusDisplay: React.FC<SignBonusDisplayProps> = ({
  bonuses,
  signName,
  isPeakDay = false,
  showInactive = false,
  layout = 'vertical',
  size = 'md',
  className = '',
}) => {
  // Filter bonuses
  const displayBonuses = showInactive
    ? bonuses
    : bonuses.filter(b => b.isActive);

  if (displayBonuses.length === 0) {
    return null;
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2',
  };

  return (
    <div className={className}>
      {/* Header */}
      {signName && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-western text-desert-sand">
            {signName} Bonuses
          </h4>
          {isPeakDay && (
            <span className="text-xs bg-gold-medium text-wood-dark px-2 py-1 rounded-full font-bold animate-pulse">
              PEAK DAY ACTIVE
            </span>
          )}
        </div>
      )}

      {/* Bonuses list */}
      <div className={layoutClasses[layout]}>
        {displayBonuses.map(bonus => (
          <BonusItem key={bonus.id} bonus={bonus} size={size} />
        ))}
      </div>

      {/* Peak day info */}
      {isPeakDay && (
        <div className="mt-3 p-2 bg-gold-dark/20 border border-gold-medium/30 rounded-lg text-center">
          <p className="text-xs text-gold-light">
            Peak day bonuses are active! All {signName} bonuses are enhanced.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Compact bonus badge for HUD display
 */
interface BonusBadgeProps {
  bonus: SignBonus;
  className?: string;
}

export const BonusBadge: React.FC<BonusBadgeProps> = ({ bonus, className = '' }) => {
  const icon = getBonusIcon(bonus.type);
  const colorClass = getBonusColor(bonus.type);

  return (
    <div
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
        ${colorClass}
        ${bonus.isPeakBonus ? 'animate-pulse' : ''}
        ${className}
      `}
      title={bonus.description}
    >
      <span>{icon}</span>
      <span>+{bonus.value}%</span>
    </div>
  );
};

/**
 * Bonus summary for dashboard
 */
interface BonusSummaryProps {
  bonuses: SignBonus[];
  maxDisplay?: number;
  className?: string;
}

export const BonusSummary: React.FC<BonusSummaryProps> = ({
  bonuses,
  maxDisplay = 3,
  className = '',
}) => {
  const activeBonuses = bonuses.filter(b => b.isActive);
  const displayBonuses = activeBonuses.slice(0, maxDisplay);
  const remaining = activeBonuses.length - maxDisplay;

  if (activeBonuses.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayBonuses.map(bonus => (
        <BonusBadge key={bonus.id} bonus={bonus} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-desert-stone">+{remaining} more</span>
      )}
    </div>
  );
};

export default SignBonusDisplay;
