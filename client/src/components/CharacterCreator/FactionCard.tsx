/**
 * FactionCard Component
 * Selectable faction card for character creation
 */

import React from 'react';
import { Faction, FACTIONS } from '@desperados/shared';
import { Card } from '../ui/Card';

interface FactionCardProps {
  faction: Faction;
  isSelected: boolean;
  onSelect: (faction: Faction) => void;
}

// Faction color mapping for styling
const factionColors: Record<Faction, { bg: string; border: string; text: string; gradient: string }> = {
  [Faction.SETTLER_ALLIANCE]: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-500',
    text: 'text-blue-300',
    gradient: 'from-blue-600 to-blue-800',
  },
  [Faction.NAHI_COALITION]: {
    bg: 'bg-green-900/30',
    border: 'border-green-500',
    text: 'text-green-300',
    gradient: 'from-green-600 to-green-800',
  },
  [Faction.FRONTERA]: {
    bg: 'bg-red-900/30',
    border: 'border-red-500',
    text: 'text-red-300',
    gradient: 'from-red-600 to-red-800',
  },
};

// Faction icons (simple SVG representations)
const factionIcons: Record<Faction, React.ReactNode> = {
  [Faction.SETTLER_ALLIANCE]: (
    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L4 7v10c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5z" />
    </svg>
  ),
  [Faction.NAHI_COALITION]: (
    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 6l-6 8h12z" />
    </svg>
  ),
  [Faction.FRONTERA]: (
    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

/**
 * Faction selection card with rich information
 */
export const FactionCard: React.FC<FactionCardProps> = ({
  faction,
  isSelected,
  onSelect,
}) => {
  const factionData = FACTIONS[faction];
  const colors = factionColors[faction];

  return (
    <button
      type="button"
      onClick={() => onSelect(faction)}
      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gold-medium rounded-lg transition-all duration-300"
    >
      <Card
        variant="wood"
        className={`transition-all duration-300 border-2 ${
          isSelected
            ? `${colors.border} shadow-xl scale-105 ring-4 ring-gold-medium/50`
            : `border-wood-medium hover:${colors.border} hover:scale-102`
        }`}
      >
        <div className="space-y-4">
          {/* Faction Icon and Name */}
          <div className={`${colors.bg} rounded-lg p-4 border-2 ${colors.border}`}>
            <div className="flex items-center gap-4">
              <div className={colors.text}>{factionIcons[faction]}</div>
              <div className="flex-1">
                <h3 className={`text-2xl font-western ${colors.text}`}>
                  {factionData.name}
                </h3>
                <p className="text-sm text-desert-stone italic">
                  {factionData.philosophy}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-desert-sand leading-relaxed">
              {factionData.description}
            </p>
          </div>

          {/* Starting Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`${colors.bg} p-2 rounded border ${colors.border}`}>
              <div className="text-desert-stone text-xs">Starting Location</div>
              <div className={`font-semibold ${colors.text}`}>
                {factionData.startingLocation}
              </div>
            </div>
            <div className={`${colors.bg} p-2 rounded border ${colors.border}`}>
              <div className="text-desert-stone text-xs">Cultural Bonus</div>
              <div className={`font-semibold ${colors.text}`}>
                +5 {factionData.culturalBonus}
              </div>
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="flex items-center justify-center gap-2 text-gold-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="font-semibold">Selected</span>
            </div>
          )}
        </div>
      </Card>
    </button>
  );
};

export default FactionCard;
