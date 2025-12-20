/**
 * SignBountyList Component
 * List of sign-exclusive bounties available during a zodiac sign's season
 */

import React from 'react';
import type { PeakDayBounty, FrontierSign, ZodiacSignId } from '@/types/zodiac.types';
import { SIGN_COLORS } from '@/constants/zodiac.constants';

interface SignBountyListProps {
  sign: FrontierSign;
  bounties: PeakDayBounty[];
  isPeakDay?: boolean;
  onBountyClick?: (bounty: PeakDayBounty) => void;
  layout?: 'list' | 'grid' | 'compact';
  className?: string;
}

/**
 * Get difficulty color and icon
 */
function getDifficultyStyle(difficulty: PeakDayBounty['difficulty']) {
  switch (difficulty) {
    case 'easy':
      return { color: 'text-green-400 bg-green-500/20 border-green-500/30', icon: '⭐', label: 'Easy' };
    case 'medium':
      return { color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30', icon: '⭐⭐', label: 'Medium' };
    case 'hard':
      return { color: 'text-orange-400 bg-orange-500/20 border-orange-500/30', icon: '⭐⭐⭐', label: 'Hard' };
    case 'legendary':
      return { color: 'text-purple-400 bg-purple-500/20 border-purple-500/30', icon: '👑', label: 'Legendary' };
    default:
      return { color: 'text-gray-400 bg-gray-500/20 border-gray-500/30', icon: '⭐', label: 'Unknown' };
  }
}

/**
 * Individual bounty card
 */
interface BountyItemProps {
  bounty: PeakDayBounty;
  colors: typeof SIGN_COLORS[ZodiacSignId];
  isPeakDay: boolean;
  onClick?: () => void;
}

const BountyItem: React.FC<BountyItemProps> = ({
  bounty,
  colors,
  isPeakDay,
  onClick,
}) => {
  const difficulty = getDifficultyStyle(bounty.difficulty);

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg
        ${colors?.bgClass || 'bg-amber-500/20'}
        border ${colors?.borderClass || 'border-amber-500/30'}
        ${onClick ? 'cursor-pointer hover:scale-102 hover:shadow-lg transition-all' : ''}
        ${isPeakDay ? 'ring-1 ring-gold-light/50' : ''}
      `}
    >
      {/* Wanted poster header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-western text-red-500">WANTED</span>
        <span className={`text-xs px-2 py-0.5 rounded ${difficulty.color}`}>
          {difficulty.icon} {difficulty.label}
        </span>
      </div>

      {/* Bounty name */}
      <h4 className={`font-western text-lg ${colors?.textClass || 'text-gold-light'} mb-1`}>
        {bounty.name}
      </h4>

      {/* Description */}
      <p className="text-sm text-desert-stone mb-3 line-clamp-2">
        {bounty.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Reward */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">💰</span>
          <span className="text-gold-light font-bold">${bounty.reward.toLocaleString()}</span>
        </div>

        {/* Badges */}
        <div className="flex gap-1">
          {bounty.signExclusive && (
            <span className="text-xs bg-purple-500/50 text-purple-200 px-1.5 py-0.5 rounded">
              Sign Exclusive
            </span>
          )}
          {isPeakDay && bounty.difficulty === 'legendary' && (
            <span className="text-xs bg-gold-medium text-wood-dark px-1.5 py-0.5 rounded animate-pulse">
              PEAK BONUS
            </span>
          )}
        </div>
      </div>

      {/* Arrow if clickable */}
      {onClick && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-desert-stone text-lg">
          →
        </div>
      )}
    </div>
  );
};

/**
 * Sign bounty list component
 */
export const SignBountyList: React.FC<SignBountyListProps> = ({
  sign,
  bounties,
  isPeakDay = false,
  onBountyClick,
  layout = 'list',
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id as ZodiacSignId];

  if (bounties.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2 opacity-50">📜</div>
        <p className="text-desert-stone text-sm">
          No special bounties for {sign.name}
        </p>
        {!isPeakDay && (
          <p className="text-desert-stone/70 text-xs mt-1">
            Check the bounty board on peak day for exclusive targets!
          </p>
        )}
      </div>
    );
  }

  const layoutClasses = {
    list: 'flex flex-col gap-3',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-3',
    compact: 'flex flex-col gap-2',
  };

  // Sort bounties by difficulty
  const sortedBounties = [...bounties].sort((a, b) => {
    const diffOrder = { easy: 0, medium: 1, hard: 2, legendary: 3 };
    return diffOrder[b.difficulty] - diffOrder[a.difficulty];
  });

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-western text-desert-sand flex items-center gap-2">
          <span>📜</span>
          <span>Special Bounties</span>
          {isPeakDay && (
            <span className="text-xs bg-gold-medium text-wood-dark px-2 py-0.5 rounded animate-pulse">
              PEAK DAY
            </span>
          )}
        </h4>
        <span className="text-sm text-desert-stone">
          {bounties.length} targets
        </span>
      </div>

      {/* Total rewards */}
      <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-wood-dark/30 rounded-lg">
        <span className="text-desert-stone text-sm">Total Bounties:</span>
        <span className="text-gold-light font-bold">
          💰 ${bounties.reduce((sum, b) => sum + b.reward, 0).toLocaleString()}
        </span>
      </div>

      {/* Bounty list */}
      <div className={layoutClasses[layout]}>
        {sortedBounties.map(bounty => (
          <BountyItem
            key={bounty.id}
            bounty={bounty}
            colors={colors}
            isPeakDay={isPeakDay}
            onClick={onBountyClick ? () => onBountyClick(bounty) : undefined}
          />
        ))}
      </div>

      {/* Peak day bonus info */}
      {isPeakDay && (
        <div className="mt-4 p-3 bg-gold-dark/20 border border-gold-medium/30 rounded-lg text-center">
          <p className="text-sm text-gold-light font-western mb-1">
            Peak Day Bonus Active!
          </p>
          <p className="text-xs text-desert-stone">
            All bounty rewards increased by 50% during the peak day.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Compact bounty preview for cards
 */
interface BountyPreviewProps {
  bounties: PeakDayBounty[];
  maxDisplay?: number;
  className?: string;
}

export const BountyPreview: React.FC<BountyPreviewProps> = ({
  bounties,
  maxDisplay = 3,
  className = '',
}) => {
  const displayBounties = bounties.slice(0, maxDisplay);
  const remaining = bounties.length - maxDisplay;
  const totalReward = bounties.reduce((sum, b) => sum + b.reward, 0);

  if (bounties.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {displayBounties.map(bounty => {
        const difficulty = getDifficultyStyle(bounty.difficulty);
        return (
          <div key={bounty.id} className="flex items-center gap-2 text-xs">
            <span className={difficulty.color.split(' ')[0]}>{difficulty.icon}</span>
            <span className="text-desert-sand truncate">{bounty.name}</span>
            <span className="text-gold-light">${bounty.reward}</span>
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="text-xs text-desert-stone">
          +{remaining} more bounties
        </div>
      )}
      <div className="text-xs text-gold-light pt-1 border-t border-wood-grain/20">
        Total: ${totalReward.toLocaleString()}
      </div>
    </div>
  );
};

export default SignBountyList;
