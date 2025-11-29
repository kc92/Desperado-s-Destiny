/**
 * SignNPCList Component
 * List of sign-exclusive NPCs available during a zodiac sign's season
 */

import React from 'react';
import type { PeakDayNPC, FrontierSign, ZodiacSignId } from '@/types/zodiac.types';
import { SIGN_COLORS } from '@/constants/zodiac.constants';
import { Card } from '@/components/ui';

interface SignNPCListProps {
  sign: FrontierSign;
  npcs: PeakDayNPC[];
  isPeakDay?: boolean;
  onNPCClick?: (npc: PeakDayNPC) => void;
  showLocations?: boolean;
  layout?: 'list' | 'grid' | 'compact';
  className?: string;
}

/**
 * Individual NPC card
 */
interface NPCItemProps {
  npc: PeakDayNPC;
  colors: typeof SIGN_COLORS[ZodiacSignId];
  isPeakDay: boolean;
  showLocation: boolean;
  onClick?: () => void;
}

const NPCItem: React.FC<NPCItemProps> = ({
  npc,
  colors,
  isPeakDay,
  showLocation,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-lg
        ${colors?.bgClass || 'bg-amber-500/20'}
        border ${colors?.borderClass || 'border-amber-500/30'}
        ${onClick ? 'cursor-pointer hover:scale-102 hover:shadow-lg transition-all' : ''}
        ${isPeakDay ? 'ring-1 ring-gold-light/50' : ''}
      `}
    >
      {/* NPC Icon */}
      <div
        className="text-3xl"
        style={{
          textShadow: isPeakDay ? `0 0 10px ${colors?.glow || 'rgba(255,215,0,0.5)'}` : 'none',
        }}
      >
        {npc.iconEmoji}
      </div>

      {/* NPC Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-western ${colors?.textClass || 'text-gold-light'} truncate`}>
            {npc.name}
          </span>
          {npc.signExclusive && (
            <span className="text-xs bg-purple-500/50 text-purple-200 px-1.5 py-0.5 rounded">
              Exclusive
            </span>
          )}
        </div>
        <div className="text-sm text-desert-stone truncate">{npc.title}</div>
        {showLocation && (
          <div className="text-xs text-desert-sand/70 mt-1">
            Location: {npc.location}
          </div>
        )}
      </div>

      {/* Arrow if clickable */}
      {onClick && (
        <span className="text-desert-stone text-lg">→</span>
      )}
    </div>
  );
};

/**
 * Sign NPC list component
 */
export const SignNPCList: React.FC<SignNPCListProps> = ({
  sign,
  npcs,
  isPeakDay = false,
  onNPCClick,
  showLocations = true,
  layout = 'list',
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id as ZodiacSignId];

  if (npcs.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2 opacity-50">👤</div>
        <p className="text-desert-stone text-sm">
          No special NPCs available for {sign.name}
        </p>
        {!isPeakDay && (
          <p className="text-desert-stone/70 text-xs mt-1">
            Check back on the peak day for exclusive encounters!
          </p>
        )}
      </div>
    );
  }

  const layoutClasses = {
    list: 'flex flex-col gap-2',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-3',
    compact: 'flex flex-wrap gap-2',
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-western text-desert-sand flex items-center gap-2">
          <span>👤</span>
          <span>Special NPCs</span>
          {isPeakDay && (
            <span className="text-xs bg-gold-medium text-wood-dark px-2 py-0.5 rounded animate-pulse">
              PEAK DAY
            </span>
          )}
        </h4>
        <span className="text-sm text-desert-stone">
          {npcs.length} available
        </span>
      </div>

      {/* NPC list */}
      <div className={layoutClasses[layout]}>
        {npcs.map(npc => (
          <NPCItem
            key={npc.id}
            npc={npc}
            colors={colors}
            isPeakDay={isPeakDay}
            showLocation={showLocations}
            onClick={onNPCClick ? () => onNPCClick(npc) : undefined}
          />
        ))}
      </div>

      {/* Peak day bonus info */}
      {isPeakDay && (
        <div className="mt-3 p-2 bg-gold-dark/20 border border-gold-medium/30 rounded-lg text-center">
          <p className="text-xs text-gold-light">
            Peak day NPCs offer special dialogue and unique rewards!
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Compact NPC preview for cards
 */
interface NPCPreviewProps {
  npcs: PeakDayNPC[];
  maxDisplay?: number;
  className?: string;
}

export const NPCPreview: React.FC<NPCPreviewProps> = ({
  npcs,
  maxDisplay = 3,
  className = '',
}) => {
  const displayNPCs = npcs.slice(0, maxDisplay);
  const remaining = npcs.length - maxDisplay;

  if (npcs.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayNPCs.map(npc => (
        <span
          key={npc.id}
          className="text-xl"
          title={npc.name}
        >
          {npc.iconEmoji}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-xs text-desert-stone">+{remaining}</span>
      )}
    </div>
  );
};

export default SignNPCList;
