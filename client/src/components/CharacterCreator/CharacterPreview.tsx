/**
 * CharacterPreview Component
 * Visual preview of character during creation
 */

import React from 'react';
import { Faction } from '@desperados/shared';

interface CharacterPreviewProps {
  faction: Faction | null;
  name?: string;
}

// Faction color mapping
const factionColors: Record<Faction, { bg: string; gradient: string; text: string }> = {
  [Faction.SETTLER_ALLIANCE]: {
    bg: 'bg-blue-900',
    gradient: 'from-blue-600 to-blue-900',
    text: 'text-blue-300',
  },
  [Faction.NAHI_COALITION]: {
    bg: 'bg-green-900',
    gradient: 'from-green-600 to-green-900',
    text: 'text-green-300',
  },
  [Faction.FRONTERA]: {
    bg: 'bg-red-900',
    gradient: 'from-red-600 to-red-900',
    text: 'text-red-300',
  },
};

/**
 * Character preview with placeholder silhouette
 */
export const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  faction,
  name,
}) => {
  const colors = faction ? factionColors[faction] : null;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        className={`relative w-full h-80 rounded-lg overflow-hidden border-4 ${
          colors ? `border-${colors.bg.split('-')[1]}-600` : 'border-wood-medium'
        } bg-gradient-to-b ${
          colors ? colors.gradient : 'from-wood-medium to-wood-dark'
        } shadow-2xl`}
      >
        {/* Character Silhouette */}
        <div className="absolute inset-0 flex items-end justify-center pb-8">
          <svg
            className={`w-48 h-48 ${colors ? colors.text : 'text-desert-stone'} opacity-60`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        {/* Faction Badge */}
        {faction && (
          <div className="absolute top-4 right-4">
            <div className={`px-3 py-1 rounded-full ${colors?.bg} border-2 border-${colors?.bg.split('-')[1]}-600`}>
              <span className={`text-xs font-semibold ${colors?.text}`}>
                {faction.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Character Name */}
        {name && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3">
            <h3 className="text-center text-xl font-western text-desert-sand">
              {name}
            </h3>
          </div>
        )}

        {/* Placeholder Text */}
        {!faction && !name && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-desert-stone text-center px-4">
              Select your faction to preview your character
            </p>
          </div>
        )}
      </div>

      {/* Preview Label */}
      <div className="mt-3 text-center">
        <span className="text-sm text-desert-stone italic">Character Preview</span>
      </div>
    </div>
  );
};

export default CharacterPreview;
