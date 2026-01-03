/**
 * CharacterCard Component
 * Display character information with faction styling
 */

import React, { useCallback, useMemo } from 'react';
import type { SafeCharacter } from '@desperados/shared';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { EnergyBar } from './EnergyBar';

interface CharacterCardProps {
  character: SafeCharacter;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

// Faction names - simplified until shared constants are properly exported
const factionNames: Record<string, string> = {
  SETTLER_ALLIANCE: 'Settler Alliance',
  NAHI_COALITION: 'Nahi Coalition',
  FRONTERA: 'Frontera',
};

// Faction color mapping for styling
const factionColors: Record<string, { bg: string; border: string; text: string }> = {
  SETTLER_ALLIANCE: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-600',
    text: 'text-blue-400',
  },
  NAHI_COALITION: {
    bg: 'bg-green-900/20',
    border: 'border-green-600',
    text: 'text-green-400',
  },
  FRONTERA: {
    bg: 'bg-red-900/20',
    border: 'border-red-600',
    text: 'text-red-400',
  },
};

/**
 * Character card with faction-themed styling
 * Memoized to prevent unnecessary re-renders
 */
export const CharacterCard: React.FC<CharacterCardProps> = React.memo(({
  character,
  onSelect,
  onDelete,
  showActions = true,
}) => {
  // Memoize faction name and colors
  const factionName = useMemo(
    () => factionNames[character.faction] || character.faction,
    [character.faction]
  );

  const colors = useMemo(
    () => factionColors[character.faction] || factionColors.SETTLER_ALLIANCE,
    [character.faction]
  );

  // Total Level from character (new system)
  const totalLevel = useMemo(
    () => (character as any).totalLevel || 30,
    [(character as any).totalLevel]
  );

  // Combat Level from character (new system)
  const combatLevel = useMemo(
    () => (character as any).combatLevel || 1,
    [(character as any).combatLevel]
  );

  // Memoize event handlers with useCallback
  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(character._id);
    }
  }, [onSelect, character._id]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(character._id);
    }
  }, [onDelete, character._id]);

  return (
    <Card
      variant="wood"
      className={`transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${colors.border}`}
      data-testid="character-card"
    >
      <div className="space-y-4" data-testid="character-info">
        {/* Character Avatar Placeholder */}
        <div
          className={`w-full h-40 rounded-lg ${colors.bg} border-2 ${colors.border} flex items-center justify-center relative overflow-hidden`}
        >
          {/* Simple silhouette placeholder */}
          <div className="text-center">
            <div className={`text-6xl ${colors.text} opacity-50`}>
              <svg
                className="w-24 h-24 mx-auto"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {/* Faction badge */}
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
            <span className={`text-xs font-semibold ${colors.text}`}>
              {factionName}
            </span>
          </div>
        </div>

        {/* Character Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-western text-desert-sand text-center character-name" data-testid="character-name">
            {character.name}
          </h3>

          <div className="flex justify-between items-center text-sm text-desert-stone">
            <span className="flex gap-2">
              <span title="Total Level">TL {totalLevel}</span>
              <span title="Combat Level" className="text-red-400">CL {combatLevel}</span>
            </span>
            <span className={colors.text}>{factionName}</span>
          </div>

          {/* Energy Bar */}
          <EnergyBar
            current={character.energy}
            max={character.maxEnergy}
            size="sm"
            showLabel={true}
          />

          {/* Total Level Progress Info */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-desert-stone">
              <span>Total Level</span>
              <span className="text-cyan-400 font-bold">
                {totalLevel}
              </span>
            </div>
            <div className="text-xs text-desert-stone/70 text-center">
              {totalLevel >= 1000 ? 'Prestige Ready!' :
               totalLevel >= 500 ? 'Trailblazer' :
               totalLevel >= 250 ? 'Frontier Hand' :
               totalLevel >= 100 ? 'Tenderfoot' :
               'Greenhorn'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            {onSelect && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleSelect}
                data-testid="character-play-button"
              >
                Play
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="md"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if character data or handlers change
  return (
    prevProps.character._id === nextProps.character._id &&
    prevProps.character.name === nextProps.character.name &&
    (prevProps.character as any).totalLevel === (nextProps.character as any).totalLevel &&
    (prevProps.character as any).combatLevel === (nextProps.character as any).combatLevel &&
    prevProps.character.faction === nextProps.character.faction &&
    prevProps.character.energy === nextProps.character.energy &&
    prevProps.character.maxEnergy === nextProps.character.maxEnergy &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onDelete === nextProps.onDelete
  );
});

// Display name for React DevTools
CharacterCard.displayName = 'CharacterCard';

export default CharacterCard;
