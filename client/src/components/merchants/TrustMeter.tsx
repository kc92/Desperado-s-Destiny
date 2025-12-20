/**
 * TrustMeter Component
 * Displays trust level with a merchant as a visual gauge
 */

import React from 'react';
import type { TrustUnlock } from '@/hooks/useMerchants';

interface TrustMeterProps {
  currentLevel: number;
  maxLevel?: number;
  currentStatus: string;
  nextUnlock?: TrustUnlock;
  unlockedBenefits: TrustUnlock[];
  showDetails?: boolean;
}

const trustLevelColors: Record<number, string> = {
  0: 'bg-gray-500',
  1: 'bg-yellow-700',
  2: 'bg-yellow-500',
  3: 'bg-green-600',
  4: 'bg-blue-500',
  5: 'bg-purple-500',
};

// Trust level names for display (exported for use in other components)
export const TRUST_LEVEL_NAMES: Record<number, string> = {
  0: 'Stranger',
  1: 'Acquaintance',
  2: 'Friend',
  3: 'Good Friend',
  4: 'Trusted Friend',
  5: 'Closest Friend',
};

export const TrustMeter: React.FC<TrustMeterProps> = ({
  currentLevel,
  maxLevel = 5,
  currentStatus,
  nextUnlock,
  unlockedBenefits,
  showDetails = true,
}) => {
  const percentage = (currentLevel / maxLevel) * 100;
  const levelColor = trustLevelColors[Math.min(currentLevel, 5)] || trustLevelColors[0];

  return (
    <div className="space-y-3">
      {/* Trust Level Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {currentLevel >= 4 ? '💛' : currentLevel >= 2 ? '🤝' : '👤'}
          </span>
          <div>
            <p className="text-sm text-desert-stone">Trust Level</p>
            <p className="font-western text-gold-light">{currentStatus}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-western text-gold-light">{currentLevel}</p>
          <p className="text-xs text-desert-stone">/ {maxLevel}</p>
        </div>
      </div>

      {/* Trust Progress Bar */}
      <div className="relative h-4 bg-wood-dark rounded-full overflow-hidden border border-wood-grain/30">
        <div
          className={`absolute inset-y-0 left-0 ${levelColor} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        {/* Level Markers */}
        <div className="absolute inset-0 flex justify-between px-0.5">
          {Array.from({ length: maxLevel }, (_, i) => (
            <div
              key={i}
              className={`w-0.5 h-full ${
                i < currentLevel ? 'bg-white/30' : 'bg-wood-grain/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust Level Indicators */}
      <div className="flex justify-between text-xs">
        {Array.from({ length: maxLevel + 1 }, (_, i) => (
          <span
            key={i}
            className={`${
              i <= currentLevel ? 'text-gold-light' : 'text-desert-stone'
            }`}
          >
            {i}
          </span>
        ))}
      </div>

      {showDetails && (
        <>
          {/* Next Unlock */}
          {nextUnlock && (
            <div className="mt-4 p-3 bg-wood-dark/50 rounded-lg border border-gold-dark/30">
              <p className="text-sm text-desert-stone mb-1">Next at Trust {nextUnlock.level}:</p>
              <p className="text-gold-light font-semibold">{nextUnlock.benefit}</p>
              <p className="text-xs text-desert-stone mt-1">{nextUnlock.description}</p>
            </div>
          )}

          {/* Unlocked Benefits */}
          {unlockedBenefits.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-desert-stone mb-2">Unlocked Benefits:</p>
              <div className="space-y-2">
                {unlockedBenefits.map((unlock, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-green-900/20 rounded border border-green-700/30"
                  >
                    <span className="text-green-400 mt-0.5">&#10003;</span>
                    <div>
                      <p className="text-sm text-green-400">{unlock.benefit}</p>
                      <p className="text-xs text-desert-stone">{unlock.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrustMeter;
