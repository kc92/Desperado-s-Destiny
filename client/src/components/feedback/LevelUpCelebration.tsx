/**
 * LevelUpCelebration Component
 * Golden particles with fanfare for level up events
 */

import React from 'react';
import { useAnimationPreferences } from '@/contexts';

interface LevelUpCelebrationProps {
  /** Whether to show the celebration */
  show: boolean;
  /** New level achieved */
  newLevel: number;
  /** Callback when user dismisses */
  onComplete: () => void;
}

/**
 * Level up celebration with golden particles and fanfare
 * Requires user interaction to dismiss (modal-style)
 */
export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  show,
  newLevel,
  onComplete,
}) => {
  const { shouldAnimate, shouldShowParticles } = useAnimationPreferences();

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      {/* Backdrop */}
      <div
        className={`
          bg-black/70 absolute inset-0
          ${shouldAnimate ? 'animate-fade-in' : ''}
        `}
        onClick={onComplete}
      />

      {/* Celebration content */}
      <div
        className={`
          relative z-10
          ${shouldAnimate ? 'animate-level-up' : ''}
        `}
      >
        <div className="text-center px-6">
          {/* Title */}
          <h2
            id="level-up-title"
            className="block text-gold-light text-3xl font-western mb-4"
            style={{
              textShadow: '0 4px 8px rgba(255, 215, 0, 0.8)',
            }}
          >
            LEVEL UP!
          </h2>

          {/* New level number */}
          <div
            className={`
              text-gold-light font-western
              ${shouldAnimate ? 'animate-bounce' : ''}
            `}
            style={{
              fontSize: '6rem',
              textShadow: '0 8px 16px rgba(255, 215, 0, 0.8)',
              WebkitTextStroke: '3px rgba(184, 134, 11, 0.8)',
            }}
          >
            {newLevel}
          </div>

          {/* Golden particles */}
          {shouldShowParticles && (
            <div className="mt-4 flex justify-center gap-1 relative h-24">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30) * (Math.PI / 180);
                const distance = 80;
                const x = Math.sin(angle) * distance;
                const y = -Math.cos(angle) * distance;

                return (
                  <span
                    key={i}
                    className="absolute text-gold-light animate-particle text-2xl"
                    style={{
                      animationDelay: `${i * 0.08}s`,
                      left: '50%',
                      top: '50%',
                      transform: `translate(${x}px, ${y}px)`,
                      textShadow: '0 2px 4px rgba(255, 215, 0, 0.8)',
                    }}
                  >
                    ★
                  </span>
                );
              })}
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onComplete}
            className={`
              mt-6 px-8 py-3 rounded-lg font-western text-lg
              bg-gold-dark hover:bg-gold-medium text-wood-darker
              border-3 border-gold-light shadow-gold
              transition-all duration-200 hover:scale-105
              focus:outline-none focus:ring-4 focus:ring-gold-light
            `}
            autoFocus
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpCelebration;
