/**
 * EntertainerCard Component
 * Displays a wandering entertainer with their performance type and status
 */

import React from 'react';
import { Card } from '@/components/ui';
import type { WanderingEntertainer, PerformanceType, Performance } from '@/hooks/useEntertainers';

interface EntertainerCardProps {
  entertainer: WanderingEntertainer;
  isPerforming?: boolean;
  currentVenue?: string;
  onClick?: () => void;
  compact?: boolean;
}

const performanceTypeIcons: Record<PerformanceType, string> = {
  piano: '🎹',
  magic: '🎩',
  singing: '🎤',
  storytelling: '📖',
  dancing: '💃',
  harmonica: '🎵',
  wild_west_show: '🤠',
  fortune_telling: '🔮',
  gospel: '⛪',
  comedy: '😂',
};

const performanceTypeLabels: Record<PerformanceType, string> = {
  piano: 'Pianist',
  magic: 'Magician',
  singing: 'Singer',
  storytelling: 'Storyteller',
  dancing: 'Dancer',
  harmonica: 'Harmonica Player',
  wild_west_show: 'Wild West Show',
  fortune_telling: 'Fortune Teller',
  gospel: 'Gospel Singer',
  comedy: 'Comedian',
};

const moodColors: Record<string, string> = {
  happy: 'text-yellow-400',
  excited: 'text-orange-400',
  neutral: 'text-gray-400',
  sad: 'text-blue-400',
  content: 'text-green-400',
  suspicious: 'text-purple-400',
};

export const EntertainerCard: React.FC<EntertainerCardProps> = ({
  entertainer,
  isPerforming = false,
  currentVenue,
  onClick,
  compact = false,
}) => {
  const icon = performanceTypeIcons[entertainer.performanceType] || '🎭';
  const typeLabel = performanceTypeLabels[entertainer.performanceType] || 'Entertainer';
  const moodColor = moodColors[entertainer.baseMood] || moodColors.neutral;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-lg bg-wood-dark/50 border border-wood-grain/30
          transition-all cursor-pointer hover:border-gold-light/50 hover:bg-wood-dark`}
      >
        <div className="text-3xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-western text-gold-light truncate">{entertainer.name}</p>
          <p className="text-xs text-desert-stone truncate">{entertainer.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-desert-stone">{typeLabel}</span>
          {isPerforming ? (
            <span className="text-xs text-green-400 animate-pulse">Performing</span>
          ) : (
            <span className="text-xs text-desert-stone">Available</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      variant="wood"
      hover={!!onClick}
      onClick={onClick}
      className="relative"
    >
      {/* Performing Badge */}
      {isPerforming && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs bg-green-600/80 text-white rounded-full animate-pulse">
            Now Performing
          </span>
        </div>
      )}

      {/* Entertainer Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-western text-xl text-gold-light">{entertainer.name}</h3>
          <p className="text-desert-stone">{entertainer.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-wood-dark/50 text-desert-sand rounded">
              {typeLabel}
            </span>
            <span className={`text-xs ${moodColor}`}>
              {entertainer.baseMood}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-desert-sand mb-4 line-clamp-2">{entertainer.description}</p>

      {/* Current Venue */}
      {currentVenue && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-wood-dark/50 rounded">
          <span className="text-lg">🎪</span>
          <div>
            <p className="text-xs text-desert-stone">Performing at</p>
            <p className="text-sm text-desert-sand">{currentVenue}</p>
          </div>
        </div>
      )}

      {/* Performances */}
      <div className="space-y-1 mb-3">
        <p className="text-xs text-desert-stone">Performances:</p>
        <div className="flex flex-wrap gap-1">
          {entertainer.performances.slice(0, 2).map((perf: Performance, index: number) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded"
            >
              {perf.name}
            </span>
          ))}
          {entertainer.performances.length > 2 && (
            <span className="text-xs px-2 py-0.5 text-desert-stone">
              +{entertainer.performances.length - 2} more
            </span>
          )}
        </div>
      </div>

      {/* Special Abilities */}
      {entertainer.specialAbilities && entertainer.specialAbilities.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-desert-stone">Special Abilities:</p>
          <div className="flex flex-wrap gap-1">
            {entertainer.specialAbilities.slice(0, 2).map((ability: string, index: number) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-gold-dark/20 text-gold-light rounded"
              >
                {ability}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-wood-grain/30">
        <div className="flex justify-between items-center">
          <span className="text-sm text-desert-stone">
            Trust: {entertainer.trustLevel}%
          </span>
          {onClick && (
            <span className="text-sm text-gold-light">View Details &rarr;</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EntertainerCard;
