/**
 * SuccessAnimation Component
 * Green burst with checkmark for successful actions
 */

import React, { useEffect } from 'react';
import { useAnimationPreferences } from '@/contexts';

interface SuccessAnimationProps {
  /** Whether to show the animation */
  show: boolean;
  /** Callback when animation completes */
  onComplete: () => void;
  /** Optional message to display */
  message?: string;
}

/**
 * Success animation with green burst and checkmark
 * Automatically dismisses after animation completes
 */
export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  onComplete,
  message,
}) => {
  const { shouldAnimate, durationMultiplier } = useAnimationPreferences();

  useEffect(() => {
    if (!show) return;

    // Calculate duration based on user preferences
    const duration = shouldAnimate ? 1000 * durationMultiplier : 0;

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, onComplete, shouldAnimate, durationMultiplier]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label="Success"
    >
      {/* Green burst background */}
      <div
        className={`
          bg-green-500/20 rounded-full flex items-center justify-center
          ${shouldAnimate ? 'animate-success-burst' : ''}
        `}
        style={{
          width: '8rem',
          height: '8rem',
        }}
      >
        {/* Checkmark */}
        <div
          className={`
            text-green-500 font-western font-bold
            ${shouldAnimate ? 'animate-success-check' : ''}
          `}
          style={{
            fontSize: '4rem',
            textShadow: '0 4px 8px rgba(34, 197, 94, 0.5)',
          }}
        >
          ✓
        </div>
      </div>

      {/* Optional message */}
      {message && (
        <div
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-20
            text-green-500 font-western text-xl text-center
            ${shouldAnimate ? 'animate-fade-in' : ''}
          `}
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default SuccessAnimation;
