/**
 * WesternLoadingScreen Component
 * Full-screen loading overlay with Western theme
 * Hybrid Western-Modern Design
 */

import React from 'react';
import { SheriffStarSpinner } from './SheriffStarSpinner';

export interface WesternLoadingScreenProps {
  /** Loading message to display */
  message?: string;
  /** Optional progress percentage (0-100) */
  progress?: number;
  /** Whether to show the loading screen */
  isVisible?: boolean;
  /** Additional class names */
  className?: string;
}

export const WesternLoadingScreen: React.FC<WesternLoadingScreenProps> = ({
  message = 'Loading...',
  progress,
  isVisible = true,
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex flex-col items-center justify-center
        bg-gradient-to-br from-black via-gray-900 to-black
        animate-fade-in
        ${className}
      `}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Background texture overlay */}
      <div
        className="absolute inset-0 opacity-10 texture-dust"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            rgba(193, 154, 107, 0.05) 50px,
            rgba(193, 154, 107, 0.05) 100px
          )`,
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        {/* Sheriff Star Spinner */}
        <SheriffStarSpinner size="xl" message={message} />

        {/* Progress bar (if progress prop provided) */}
        {progress !== undefined && (
          <div className="w-64 sm:w-80">
            {/* Progress bar container */}
            <div
              className="h-3 rounded-full overflow-hidden glass-western"
              style={{
                border: '2px solid var(--color-bronze)',
              }}
            >
              {/* Progress fill */}
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background: 'linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-light) 100%)',
                  boxShadow: '0 0 10px var(--color-gold)',
                  animation: 'progressPulse 2s ease-in-out infinite',
                }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Progress percentage */}
            <p
              className="text-center mt-2 font-western text-sm"
              style={{ color: 'var(--color-gold)' }}
            >
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Animated dots for indefinite loading */}
        {progress === undefined && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'var(--color-gold)',
                  animation: `fadeIn 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Decorative Western flourish */}
      <div
        className="absolute bottom-8 text-center font-western text-xs opacity-30"
        style={{ color: 'var(--color-gold)' }}
      >
        ★ ━━━━━━━━━━━━ ★ ━━━━━━━━━━━━ ★
      </div>
    </div>
  );
};

export default WesternLoadingScreen;
