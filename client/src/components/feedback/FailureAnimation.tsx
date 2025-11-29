/**
 * FailureAnimation Component
 * Red shake with X for failed actions
 */

import React, { useEffect } from 'react';
import { useAnimationPreferences } from '@/contexts';

interface FailureAnimationProps {
  /** Whether to show the animation */
  show: boolean;
  /** Callback when animation completes */
  onComplete: () => void;
  /** Optional message to display */
  message?: string;
}

/**
 * Failure animation with red shake and X mark
 * Automatically dismisses after animation completes
 */
export const FailureAnimation: React.FC<FailureAnimationProps> = ({
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
      aria-live="assertive"
      aria-label="Failed"
    >
      {/* Red shake background */}
      <div
        className={`
          bg-blood-red/20 rounded-full flex items-center justify-center
          ${shouldAnimate ? 'animate-shake' : ''}
        `}
        style={{
          width: '8rem',
          height: '8rem',
        }}
      >
        {/* X mark */}
        <div
          className={`
            text-blood-crimson font-western font-bold
            ${shouldAnimate ? 'animate-failure-flash' : ''}
          `}
          style={{
            fontSize: '4rem',
            textShadow: '0 4px 8px rgba(220, 20, 60, 0.5)',
          }}
        >
          ✗
        </div>
      </div>

      {/* Optional message */}
      {message && (
        <div
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-20
            text-blood-crimson font-western text-xl text-center
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

export default FailureAnimation;
