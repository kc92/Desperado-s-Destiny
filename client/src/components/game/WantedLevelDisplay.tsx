/**
 * WantedLevelDisplay Component
 * Small persistent UI element showing wanted level and bounty
 * Displays in top-right corner with expandable wanted poster
 */

import React from 'react';

interface WantedLevelDisplayProps {
  /** Current wanted level (0-5) */
  wantedLevel: number;
  /** Current bounty amount in gold */
  bountyAmount: number;
  /** Callback when clicked to expand poster */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Wanted level descriptions for tooltip
const WANTED_LEVEL_DESCRIPTIONS: Record<number, string> = {
  0: "Clean - No wanted status",
  1: "Minor Offender - Petty crimes",
  2: "Known Criminal - Multiple offenses",
  3: "Dangerous Outlaw - Can be arrested by players!",
  4: "Notorious Bandit - High priority target",
  5: "Most Wanted - Shoot on sight",
};

/**
 * Get color class based on wanted level
 */
const getWantedColor = (level: number): string => {
  if (level === 0) return 'text-gray-400';
  if (level <= 2) return 'text-yellow-500';
  return 'text-blood-red';
};

/**
 * Displays wanted level with stars and bounty amount
 */
export const WantedLevelDisplay: React.FC<WantedLevelDisplayProps> = ({
  wantedLevel,
  bountyAmount,
  onClick,
  className = '',
}) => {
  // Don't display if wanted level is 0
  if (wantedLevel === 0) {
    return null;
  }

  const color = getWantedColor(wantedLevel);
  const shouldPulse = wantedLevel >= 3;

  return (
    <div
      className={`
        parchment p-3 rounded-lg border-3 border-blood-red
        shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300
        ${shouldPulse ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={onClick}
      title={WANTED_LEVEL_DESCRIPTIONS[wantedLevel] || 'Wanted criminal'}
    >
      {/* Wanted Header */}
      <div className="text-xs font-western text-blood-red uppercase tracking-wide mb-2 text-center">
        Wanted
      </div>

      {/* Stars Display */}
      <div className="flex gap-1 justify-center mb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`text-2xl transition-all duration-300 ${
              index < wantedLevel ? color : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Wanted Level Text */}
      <div className="text-center mb-2">
        <span className="text-sm font-bold text-wood-dark">
          Level {wantedLevel}/5
        </span>
      </div>

      {/* Bounty Amount */}
      <div className="text-center p-2 bg-gold-dark/20 rounded border border-gold-dark">
        <div className="text-xs text-wood-grain uppercase tracking-wide">Bounty</div>
        <div className="text-lg font-bold text-gold-dark">
          {bountyAmount}g
        </div>
      </div>

      {/* Warning for high wanted levels */}
      {wantedLevel >= 3 && (
        <div className="mt-2 text-center">
          <div className="text-xs font-bold text-blood-red uppercase">
            Can Be Arrested!
          </div>
        </div>
      )}

      {/* Click to expand hint */}
      <div className="text-center mt-2 text-xs text-wood-grain">
        Click for details
      </div>
    </div>
  );
};

export default WantedLevelDisplay;
