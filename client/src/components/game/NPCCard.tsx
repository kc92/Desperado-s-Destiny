/**
 * NPCCard Component
 * Displays a single NPC with stats, loot preview, and challenge button
 */

import React from 'react';
import { NPC, NPCType } from '@desperados/shared';
import { Button } from '@/components/ui';

interface NPCCardProps {
  /** NPC data to display */
  npc: NPC;
  /** Whether the player can challenge this NPC */
  canChallenge: boolean;
  /** Callback when Challenge button is clicked */
  onChallenge: (npcId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// NPC type to color mapping
const NPC_TYPE_COLORS: Record<NPCType, { badge: string; border: string }> = {
  [NPCType.OUTLAW]: { badge: 'bg-blood-red text-white', border: 'border-blood-red' },
  [NPCType.WILDLIFE]: { badge: 'bg-green-700 text-white', border: 'border-green-700' },
  [NPCType.LAWMAN]: { badge: 'bg-blue-700 text-white', border: 'border-blue-700' },
  [NPCType.BOSS]: { badge: 'bg-gold-dark text-wood-dark', border: 'border-gold-dark' },
};

// NPC type emojis
const NPC_TYPE_EMOJI: Record<NPCType, string> = {
  [NPCType.OUTLAW]: '🤠',
  [NPCType.WILDLIFE]: '🐺',
  [NPCType.LAWMAN]: '⭐',
  [NPCType.BOSS]: '💀',
};

// Rarity colors
const RARITY_COLORS = {
  common: 'text-gray-400',
  uncommon: 'text-green-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-gold-light',
};

/**
 * NPC card with western parchment styling
 * Memoized to prevent unnecessary re-renders in NPC lists
 */
export const NPCCard: React.FC<NPCCardProps> = React.memo(({
  npc,
  canChallenge,
  onChallenge,
  className = '',
}) => {
  // Generate difficulty skulls
  const renderDifficulty = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < npc.difficulty ? 'text-blood-red' : 'text-gray-400'}`}
      >
        💀
      </span>
    ));
  };

  // Get the highest rarity item chance
  const getTopRarity = (): string => {
    const rarities = npc.lootTable.itemRarities as unknown as Record<string, number>;
    if (rarities?.legendary > 0) return 'legendary';
    if (rarities?.epic > 0) return 'epic';
    if (rarities?.rare > 0) return 'rare';
    if (rarities?.uncommon > 0) return 'uncommon';
    return 'common';
  };

  const typeColor = NPC_TYPE_COLORS[npc.type];
  const typeEmoji = NPC_TYPE_EMOJI[npc.type];
  const topRarity = getTopRarity();

  return (
    <div
      className={`
        relative bg-gradient-to-br from-desert-sand to-desert-dust
        border-4 rounded-lg shadow-wood overflow-hidden
        transition-all duration-300 hover:scale-105 hover:shadow-2xl
        ${npc.isBoss ? 'border-gold-dark ring-4 ring-gold-light/30' : typeColor.border}
        ${className}
      `}
    >
      {/* Boss glow effect */}
      {npc.isBoss && (
        <div className="absolute inset-0 bg-gradient-radial from-gold-light/10 to-transparent pointer-events-none animate-pulse-gold" />
      )}

      {/* Leather texture border */}
      <div className="absolute inset-0 border-2 border-leather-saddle/20 rounded-lg pointer-events-none" />

      {/* Content */}
      <div className="relative p-4 space-y-3">
        {/* Header: Name and Type Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className={`font-western text-xl text-wood-dark ${npc.isBoss ? 'text-gold-dark' : ''}`}>
              {npc.name}
            </h3>
            <p className="text-xs text-wood-medium font-serif">
              {npc.location}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${typeColor.badge}`}
            >
              {npc.type}
            </span>
            <div className="text-2xl">{typeEmoji}</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-wood-dark/10 rounded px-2 py-1">
            <span className="text-wood-medium font-serif">Level:</span>
            <span className="ml-1 font-bold text-wood-dark">{npc.level}</span>
          </div>
          <div className="bg-wood-dark/10 rounded px-2 py-1">
            <span className="text-wood-medium font-serif">HP:</span>
            <span className="ml-1 font-bold text-blood-red">{npc.maxHP}</span>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between bg-wood-dark/5 rounded px-2 py-1">
          <span className="text-xs text-wood-medium font-serif">Difficulty:</span>
          <div className="flex gap-1">
            {renderDifficulty()}
          </div>
        </div>

        {/* Loot Preview */}
        <div className="bg-gradient-to-br from-gold-pale/30 to-transparent border-2 border-gold-dark/20 rounded p-2 space-y-1">
          <div className="text-xs font-western text-gold-dark mb-1">Loot:</div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            {/* Gold */}
            <div className="flex items-center gap-1">
              <span className="text-gold-medium">💰</span>
              <span className="text-wood-dark font-serif">
                {npc.lootTable.goldMin}-{npc.lootTable.goldMax}
              </span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1">
              <span className="text-blue-600">⭐</span>
              <span className="text-wood-dark font-serif">
                {npc.lootTable.xpMin}-{npc.lootTable.xpMax} XP
              </span>
            </div>
          </div>

          {/* Item Chance */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-wood-medium font-serif">Item Drop:</span>
            <div className="flex items-center gap-1">
              <span className="text-wood-dark font-bold">{npc.lootTable.itemChance}%</span>
              <span className={`font-serif ${(RARITY_COLORS as Record<string, string>)[topRarity]}`}>
                ({topRarity})
              </span>
            </div>
          </div>
        </div>

        {/* Description (if available) */}
        {npc.description && (
          <p className="text-xs text-wood-medium font-serif italic border-t border-wood-dark/10 pt-2">
            "{npc.description}"
          </p>
        )}

        {/* Challenge Button */}
        <Button
          onClick={() => onChallenge(npc._id || '')}
          disabled={!canChallenge}
          variant={npc.isBoss ? 'primary' : 'secondary'}
          className={`w-full font-western ${npc.isBoss ? 'bg-gold-dark hover:bg-gold-medium' : ''}`}
        >
          {npc.isBoss ? '⚔️ Challenge Boss' : 'Challenge'}
        </Button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render if relevant props change
  return (
    prevProps.npc._id === nextProps.npc._id &&
    prevProps.npc.level === nextProps.npc.level &&
    prevProps.npc.maxHP === nextProps.npc.maxHP &&
    prevProps.canChallenge === nextProps.canChallenge &&
    prevProps.className === nextProps.className
  );
});

// Display name for React DevTools
NPCCard.displayName = 'NPCCard';

export default NPCCard;
