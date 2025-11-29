/**
 * RewardDay Component
 * Phase B - Competitor Parity Plan
 *
 * Individual day cell in the reward calendar
 */

import React from 'react';
import { CalendarDay, RewardType } from '@/hooks/useLoginRewards';
import { Tooltip } from '@/components/ui';

interface RewardDayProps {
  day: CalendarDay;
  isCurrentDay: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Get icon for reward type
 */
const getRewardIcon = (type: RewardType): string => {
  switch (type) {
    case 'gold':
      return 'coins';
    case 'item':
      return 'box';
    case 'energy':
      return 'bolt';
    case 'material':
      return 'pickaxe';
    case 'premium':
      return 'star';
    default:
      return 'gift';
  }
};

/**
 * Get color classes for reward type
 */
const getRewardColors = (type: RewardType, claimed: boolean): string => {
  if (claimed) {
    return 'text-green-400 bg-green-900/30 border-green-600/50';
  }

  switch (type) {
    case 'gold':
      return 'text-gold-light bg-gold-dark/20 border-gold-dark/50';
    case 'item':
      return 'text-amber-400 bg-amber-900/20 border-amber-600/50';
    case 'energy':
      return 'text-blue-400 bg-blue-900/20 border-blue-600/50';
    case 'material':
      return 'text-purple-400 bg-purple-900/20 border-purple-600/50';
    case 'premium':
      return 'text-yellow-300 bg-yellow-900/30 border-yellow-500/50';
    default:
      return 'text-desert-sand bg-wood-dark/20 border-wood-grain/50';
  }
};

/**
 * Render reward icon SVG
 */
const RewardIcon: React.FC<{ type: RewardType; className?: string }> = ({ type, className = '' }) => {
  const baseClass = `w-6 h-6 ${className}`;

  switch (type) {
    case 'gold':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#000">$</text>
        </svg>
      );
    case 'item':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case 'energy':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'material':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2l-4 4-4-4H4v2l6 6-6 6v2h2l4-4 4 4h2v-2l-6-6 6-6V2h-2z" />
        </svg>
      );
    case 'premium':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="M12 8V6a2 2 0 10-4 0v2M16 8V6a2 2 0 10-4 0v2" />
        </svg>
      );
  }
};

export const RewardDay: React.FC<RewardDayProps> = ({
  day,
  isCurrentDay,
  onClick,
  disabled = false
}) => {
  const rewardType = day.baseReward.type;
  const colors = getRewardColors(rewardType, day.claimed);

  const tooltipContent = day.claimed
    ? `Claimed: ${day.claimedReward?.description || day.description}`
    : day.description;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <Tooltip content={tooltipContent}>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative w-full aspect-square p-2 rounded-lg border-2 transition-all duration-200
          ${colors}
          ${isCurrentDay ? 'ring-2 ring-gold-light ring-offset-2 ring-offset-wood-dark scale-105' : ''}
          ${!disabled && !day.claimed ? 'hover:scale-105 hover:brightness-110 cursor-pointer' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${day.claimed ? 'opacity-80' : ''}
        `}
        aria-label={`Day ${day.absoluteDay}: ${tooltipContent}`}
      >
        {/* Day number */}
        <div className="absolute top-1 left-2 text-xs font-bold text-current opacity-70">
          {day.absoluteDay}
        </div>

        {/* Week indicator on day 7, 14, 21, 28 */}
        {day.dayOfWeek === 7 && (
          <div className="absolute top-1 right-1 text-[10px] font-bold bg-gold-dark/50 px-1 rounded">
            W{day.week}
          </div>
        )}

        {/* Reward icon */}
        <div className="flex items-center justify-center h-full">
          <RewardIcon type={rewardType} className="w-8 h-8" />
        </div>

        {/* Multiplier indicator */}
        {day.multiplier > 1 && !day.claimed && (
          <div className="absolute bottom-1 right-1 text-[10px] font-bold text-gold-light">
            x{day.multiplier}
          </div>
        )}

        {/* Claimed checkmark overlay */}
        {day.claimed && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/40 rounded-lg">
            <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Current day glow effect */}
        {isCurrentDay && !day.claimed && (
          <div className="absolute inset-0 rounded-lg animate-pulse bg-gold-light/10" />
        )}
      </button>
    </Tooltip>
  );
};

export default RewardDay;
