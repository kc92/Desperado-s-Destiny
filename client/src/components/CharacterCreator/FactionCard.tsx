/**
 * FactionCard Component
 * Enhanced selectable faction card for character creation with full lore and gameplay info
 */

import React, { useState } from 'react';
import { Faction, FACTIONS } from '@desperados/shared';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';

interface FactionCardProps {
  faction: Faction;
  isSelected: boolean;
  onSelect: (faction: Faction) => void;
}

// Faction color mapping for styling
const factionColors: Record<Faction, { bg: string; border: string; text: string; gradient: string; accent: string }> = {
  [Faction.SETTLER_ALLIANCE]: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-500',
    text: 'text-blue-300',
    gradient: 'from-blue-600 to-blue-800',
    accent: 'text-blue-400',
  },
  [Faction.NAHI_COALITION]: {
    bg: 'bg-green-900/30',
    border: 'border-green-500',
    text: 'text-green-300',
    gradient: 'from-green-600 to-green-800',
    accent: 'text-green-400',
  },
  [Faction.FRONTERA]: {
    bg: 'bg-red-900/30',
    border: 'border-red-500',
    text: 'text-red-300',
    gradient: 'from-red-600 to-red-800',
    accent: 'text-red-400',
  },
};

// Faction icons (simple SVG representations)
const factionIcons: Record<Faction, React.ReactNode> = {
  [Faction.SETTLER_ALLIANCE]: (
    <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L4 7v10c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5z" />
    </svg>
  ),
  [Faction.NAHI_COALITION]: (
    <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 6l-6 8h12z" />
    </svg>
  ),
  [Faction.FRONTERA]: (
    <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

// Stat abbreviation mapping
const statAbbreviations: Record<string, string> = {
  cunning: 'CUN',
  spirit: 'SPI',
  combat: 'COM',
  craft: 'CRA',
};

/**
 * Enhanced faction selection card with rich information for new players
 */
export const FactionCard: React.FC<FactionCardProps> = ({
  faction,
  isSelected,
  onSelect,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const factionData = FACTIONS[faction];
  const colors = factionColors[faction];

  // Type assertion for extended faction data
  const extendedData = factionData as typeof factionData & {
    extendedLore?: string;
    playstyle?: string;
    recommendedForNewPlayers?: boolean;
    startingStats?: { cunning: number; spirit: number; combat: number; craft: number };
    strengths?: string[];
    weaknesses?: string[];
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(faction)}
      data-testid={`faction-card-${faction}`}
      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gold-medium rounded-lg transition-all duration-300"
      aria-label={`Select ${factionData.name} faction`}
      aria-pressed={isSelected}
    >
      <Card
        variant="wood"
        data-testid={`faction-${faction}`}
        className={`transition-all duration-300 border-2 ${
          isSelected
            ? `${colors.border} shadow-xl scale-105 ring-4 ring-gold-medium/50`
            : `border-wood-medium hover:${colors.border} hover:scale-102`
        }`}
      >
        <div className="space-y-3">
          {/* Recommended Badge */}
          {extendedData.recommendedForNewPlayers && (
            <div className="flex justify-center -mt-1 mb-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-medium/20 border border-gold-medium rounded-full text-xs font-semibold text-gold-light">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recommended for New Players
              </span>
            </div>
          )}

          {/* Faction Icon and Name */}
          <div className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
            <div className="flex items-center gap-3">
              <div className={colors.text}>{factionIcons[faction]}</div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-xl font-western ${colors.text} truncate`}>
                  {factionData.name}
                </h3>
                <p className="text-xs text-desert-stone italic truncate">
                  "{factionData.philosophy}"
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-desert-sand leading-relaxed">
            {factionData.description}
          </p>

          {/* Playstyle Section */}
          {extendedData.playstyle && (
            <div className={`${colors.bg} p-2 rounded border ${colors.border}/50`}>
              <div className="text-xs text-desert-stone mb-1 font-semibold">Playstyle</div>
              <p className="text-xs text-desert-sand leading-relaxed">
                {extendedData.playstyle}
              </p>
            </div>
          )}

          {/* Starting Stats Preview */}
          {extendedData.startingStats && (
            <div className="space-y-1">
              <div className="text-xs text-desert-stone font-semibold">Starting Stats</div>
              <div className="grid grid-cols-4 gap-1 text-center">
                {Object.entries(extendedData.startingStats).map(([stat, value]) => {
                  const isBonus = stat.toLowerCase() === factionData.culturalBonus.toLowerCase();
                  return (
                    <Tooltip
                      key={stat}
                      content={`${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}${isBonus ? ' (+5 Cultural Bonus)' : ''}`}
                      position="top"
                    >
                      <div className={`p-1.5 rounded ${isBonus ? colors.bg + ' border ' + colors.border : 'bg-wood-dark/30'}`}>
                        <div className={`text-sm font-bold ${isBonus ? colors.text : 'text-desert-sand'}`}>
                          {value}
                        </div>
                        <div className={`text-[10px] ${isBonus ? colors.accent : 'text-desert-stone'}`}>
                          {statAbbreviations[stat]}
                        </div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses (Collapsible) */}
          {(extendedData.strengths || extendedData.weaknesses) && (
            <div className="space-y-2">
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowDetails(!showDetails);
                  }
                }}
                className="w-full flex items-center justify-between text-xs text-desert-stone hover:text-desert-sand transition-colors cursor-pointer"
                aria-expanded={showDetails}
              >
                <span className="font-semibold">Strengths & Weaknesses</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showDetails && (
                <div className="grid grid-cols-2 gap-2 text-xs animate-fadeIn">
                  {extendedData.strengths && (
                    <div className="space-y-1">
                      <div className="text-green-400 font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Strengths
                      </div>
                      <ul className="space-y-0.5">
                        {extendedData.strengths.map((s, i) => (
                          <li key={i} className="text-desert-sand pl-2 border-l border-green-500/50">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {extendedData.weaknesses && (
                    <div className="space-y-1">
                      <div className="text-red-400 font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        Weaknesses
                      </div>
                      <ul className="space-y-0.5">
                        {extendedData.weaknesses.map((w, i) => (
                          <li key={i} className="text-desert-sand pl-2 border-l border-red-500/50">
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Starting Details Grid */}
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
            <div className="flex items-center justify-center gap-2 text-gold-medium pt-1">
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
