/**
 * GravestoneCard Component
 * Displays a single gravestone with character info and claim status
 */

import React from 'react';
import { Gravestone, InheritanceTier, DeathType } from '@desperados/shared';
import { Tooltip } from '@/components/ui';

interface GravestoneCardProps {
  /** Gravestone data */
  gravestone: Gravestone;
  /** Whether this gravestone can be claimed by current character */
  canClaim?: boolean;
  /** Called when player clicks to visit/claim */
  onVisit?: (gravestone: Gravestone) => void;
  /** Whether to show compact view */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get death type icon
 */
const getDeathTypeIcon = (type: DeathType): string => {
  // DeathType enum values are lowercase strings
  const icons: Record<DeathType, string> = {
    [DeathType.COMBAT]: '⚔️',
    [DeathType.DUEL]: '🤠',
    [DeathType.PVP]: '👤',
    [DeathType.EXECUTION]: '⚖️',
    [DeathType.ENVIRONMENTAL]: '🌵',
  };
  return icons[type] || '💀';
};

/**
 * Get inheritance tier color
 */
const getTierColor = (tier: InheritanceTier | undefined): string => {
  if (!tier) return 'text-gray-400';

  const colors: Record<InheritanceTier, string> = {
    [InheritanceTier.MEAGER]: 'text-gray-400',
    [InheritanceTier.MODEST]: 'text-gray-300',
    [InheritanceTier.FAIR]: 'text-green-400',
    [InheritanceTier.GOOD]: 'text-blue-400',
    [InheritanceTier.GREAT]: 'text-purple-400',
    [InheritanceTier.EXCELLENT]: 'text-yellow-400',
    [InheritanceTier.LEGENDARY]: 'text-orange-400',
    [InheritanceTier.MYTHIC]: 'text-red-400',
    [InheritanceTier.BLESSED]: 'text-gold-light',
  };
  return colors[tier];
};

/**
 * Format time since death
 */
const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export const GravestoneCard: React.FC<GravestoneCardProps> = ({
  gravestone,
  canClaim = false,
  onVisit,
  compact = false,
  className = '',
}) => {
  const handleClick = () => {
    if (onVisit) {
      onVisit(gravestone);
    }
  };

  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-3 p-3
          bg-gray-900/60 hover:bg-gray-900/80
          border border-gray-700/50 rounded-lg
          cursor-pointer transition-all duration-200
          ${className}
        `}
        onClick={handleClick}
      >
        <span className="text-2xl">{getDeathTypeIcon(gravestone.causeOfDeath)}</span>
        <div className="flex-1 min-w-0">
          <div className="font-western text-gold-light truncate">
            {gravestone.characterName}
          </div>
          <div className="text-xs text-desert-sand/50">
            Lv.{gravestone.level} - {formatTimeSince(gravestone.diedAt)}
          </div>
        </div>
        {!gravestone.claimed && canClaim && (
          <span className="text-xs text-gold-light bg-gold-dark/30 px-2 py-1 rounded">
            Claim
          </span>
        )}
        {gravestone.claimed && (
          <span className={`text-xs ${getTierColor(gravestone.inheritanceTier)}`}>
            {gravestone.inheritanceTier || 'Claimed'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-b from-gray-800/80 to-gray-900/90
        border-2 ${canClaim && !gravestone.claimed ? 'border-gold-dark' : 'border-gray-700/50'}
        rounded-lg shadow-lg
        ${onVisit ? 'cursor-pointer hover:border-gold-light transition-all duration-300' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Header with cross */}
      <div className="p-4 border-b border-gray-700/30 text-center bg-gray-800/50">
        <div className="text-2xl mb-1">✟</div>
        <div className="font-western text-lg text-gold-light">
          {gravestone.characterName}
        </div>
        <div className="text-sm text-desert-sand/70">
          Level {gravestone.level} {gravestone.causeOfDeath && getDeathTypeIcon(gravestone.causeOfDeath)}
        </div>
      </div>

      {/* Epitaph */}
      <div className="p-4">
        <p className="text-sm italic text-gray-400 text-center leading-relaxed">
          "{gravestone.epitaph}"
        </p>
      </div>

      {/* Details */}
      <div className="px-4 pb-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-desert-sand/50">Location</span>
          <span className="text-desert-sand">{gravestone.deathLocation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-desert-sand/50">Died</span>
          <span className="text-desert-sand">{formatTimeSince(gravestone.diedAt)}</span>
        </div>
        {gravestone.killerName && (
          <div className="flex justify-between">
            <span className="text-desert-sand/50">Killed By</span>
            <span className="text-red-400">{gravestone.killerName}</span>
          </div>
        )}
      </div>

      {/* Inheritance section */}
      <div className="p-4 border-t border-gray-700/30 bg-gray-800/30">
        {!gravestone.claimed ? (
          <>
            <div className="text-xs text-desert-sand/50 mb-2">Inheritance Available:</div>
            <div className="flex justify-between text-sm">
              <Tooltip content="Gold available to inherit">
                <span className="text-gold-light">
                  💰 ${gravestone.goldPool.toLocaleString()}
                </span>
              </Tooltip>
              <Tooltip content="Heirloom items available">
                <span className="text-purple-400">
                  📦 {gravestone.heirloomItemIds.length} items
                </span>
              </Tooltip>
              <Tooltip content="Skills to remember">
                <span className="text-blue-400">
                  📚 {Object.keys(gravestone.skillMemory).length} skills
                </span>
              </Tooltip>
            </div>
            {canClaim && (
              <button
                className="w-full mt-3 py-2 bg-gold-dark hover:bg-gold-medium text-wood-dark font-bold rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Visit & Claim Inheritance
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-xs text-desert-sand/50 mb-1">Inheritance Claimed</div>
            <div className={`font-western text-lg ${getTierColor(gravestone.inheritanceTier)}`}>
              {gravestone.inheritanceTier?.toUpperCase() || 'CLAIMED'}
            </div>
            {gravestone.claimedAt && (
              <div className="text-xs text-desert-sand/50 mt-1">
                {formatTimeSince(gravestone.claimedAt)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prestige badge if applicable */}
      {gravestone.prestigeBonus > 0 && (
        <div className="absolute top-2 right-2">
          <Tooltip content={`Prestige Bonus: +${gravestone.prestigeBonus}% to inheritance`}>
            <span className="text-gold-light text-lg">⭐</span>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default GravestoneCard;
