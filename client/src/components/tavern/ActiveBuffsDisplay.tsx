/**
 * ActiveBuffsDisplay Component
 * Shows active tavern buffs with countdown timers
 *
 * Part of the Tavern Rest & Social System
 */

import React, { useEffect } from 'react';
import { Beer, Bath, Bed, Users, Sparkles, MapPin } from 'lucide-react';
import { useTavern, ActiveBuff } from '@/hooks/useTavern';
import { useCharacterStore } from '@/store/useCharacterStore';

/**
 * Get icon for buff type
 */
const getBuffIcon = (effectId: string): React.ReactNode => {
  switch (effectId) {
    case 'tavern_drink':
      return <Beer className="w-4 h-4" />;
    case 'tavern_socialize':
      return <Users className="w-4 h-4" />;
    case 'tavern_cards':
      return <span className="text-sm">🃏</span>;
    case 'tavern_bath':
      return <Bath className="w-4 h-4" />;
    case 'tavern_rest':
      return <Bed className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

/**
 * Single buff item display
 */
interface BuffItemProps {
  buff: ActiveBuff;
  formatDuration: (ms: number) => string;
}

const BuffItem: React.FC<BuffItemProps> = ({ buff, formatDuration }) => {
  // Calculate percentage remaining for progress bar
  const progress = Math.max(0, Math.min(100, (buff.remainingMs / (2 * 60 * 60 * 1000)) * 100));

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-green-900/20 border border-green-500/20"
      title={`${buff.name}: +${buff.magnitude}% energy regen for ${formatDuration(buff.remainingMs)}`}
    >
      {/* Icon */}
      <div className="text-green-400">
        {getBuffIcon(buff.effectId)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-400 font-medium truncate">
            +{buff.magnitude}%
          </span>
          <span className="text-green-300/70 ml-1">
            {formatDuration(buff.remainingMs)}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="h-0.5 bg-green-900/50 rounded-full mt-0.5 overflow-hidden">
          <div
            className="h-full bg-green-500/50 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * ActiveBuffsDisplay Props
 */
export interface ActiveBuffsDisplayProps {
  /** Compact mode for sidebar */
  compact?: boolean;
  /** Show even when no buffs */
  showEmpty?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * ActiveBuffsDisplay Component
 */
export const ActiveBuffsDisplay: React.FC<ActiveBuffsDisplayProps> = ({
  compact = false,
  showEmpty = false,
  className = ''
}) => {
  const {
    buffs,
    totalRegenBonus,
    inTavernBonusActive,
    fetchBuffs,
    formatDuration
  } = useTavern();

  const { currentCharacter } = useCharacterStore();

  // Fetch buffs on mount and periodically
  useEffect(() => {
    if (currentCharacter) {
      fetchBuffs();
    }
  }, [currentCharacter?._id, fetchBuffs]);

  // Don't render if no buffs and not showing empty state
  if (buffs.length === 0 && !showEmpty) {
    return null;
  }

  // Compact display for sidebar
  if (compact) {
    if (buffs.length === 0) return null;

    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Sparkles className="w-4 h-4 text-green-400" />
        <span className="text-sm text-green-400 font-medium">
          +{totalRegenBonus}%
        </span>
        {inTavernBonusActive && (
          <span title="In tavern bonus active">
            <MapPin className="w-3 h-3 text-gold-light" />
          </span>
        )}
      </div>
    );
  }

  // Full display
  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-desert-sand">Energy Buffs</span>
        </div>
        {totalRegenBonus > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400 font-medium">+{totalRegenBonus}%</span>
            {inTavernBonusActive && (
              <span className="flex items-center gap-1 text-gold-light text-xs">
                <MapPin className="w-3 h-3" />
                <span>in tavern</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Buffs List */}
      {buffs.length > 0 ? (
        <div className="space-y-1.5">
          {buffs.map(buff => (
            <BuffItem
              key={buff.effectId}
              buff={buff}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      ) : showEmpty ? (
        <div className="text-sm text-desert-stone text-center py-2">
          No active buffs. Visit a tavern to boost your energy regen!
        </div>
      ) : null}
    </div>
  );
};

export default ActiveBuffsDisplay;
