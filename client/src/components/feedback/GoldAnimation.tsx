/**
 * GoldAnimation Component
 * Floating +/- gold text for gold gain/loss
 */

import React, { useEffect, useState } from 'react';
import { useAnimationPreferences } from '@/contexts';

interface GoldAnimationProps {
  /** Amount of gold gained or lost (negative for loss) */
  amount: number;
  /** Position where animation should appear */
  position: { x: number; y: number };
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Unique identifier for the animation (used by container) */
  id?: string;
}

/**
 * Floating gold amount that animates upward and fades out
 * Shows +/- based on gain or loss
 */
export const GoldAnimation: React.FC<GoldAnimationProps> = ({
  amount,
  position,
  onComplete,
}) => {
  const { shouldAnimate, durationMultiplier } = useAnimationPreferences();
  const [isVisible, setIsVisible] = useState(true);
  const isGain = amount > 0;

  useEffect(() => {
    // Calculate duration based on user preferences
    const duration = shouldAnimate ? 1500 * durationMultiplier : 0;

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, shouldAnimate, durationMultiplier]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed z-50 pointer-events-none
        font-western font-bold text-xl
        ${isGain ? 'text-gold-light' : 'text-blood-crimson'}
        ${shouldAnimate ? 'animate-float-up' : ''}
      `}
      style={{
        left: position.x,
        top: position.y,
        textShadow: isGain
          ? '0 2px 8px rgba(255, 215, 0, 0.8), 0 0 4px rgba(255, 215, 0, 1)'
          : '0 2px 8px rgba(220, 20, 60, 0.8), 0 0 4px rgba(220, 20, 60, 1)',
        WebkitTextStroke: '1px rgba(0, 0, 0, 0.5)',
      }}
      role="status"
      aria-live="polite"
      aria-label={`${isGain ? 'Gained' : 'Lost'} ${Math.abs(amount)} gold`}
    >
      {isGain ? '+' : ''}{amount} 💰
    </div>
  );
};

/**
 * GoldAnimationContainer Component
 * Manages multiple gold animations at once
 */
interface GoldAnimationItem extends GoldAnimationProps {
  id: string;
}

interface GoldAnimationContainerProps {
  /** Array of active gold animations */
  animations: GoldAnimationItem[];
  /** Callback when an animation completes */
  onAnimationComplete: (id: string) => void;
}

export const GoldAnimationContainer: React.FC<GoldAnimationContainerProps> = ({
  animations,
  onAnimationComplete,
}) => {
  if (animations.length === 0) return null;

  return (
    <>
      {animations.map((animation) => (
        <GoldAnimation
          key={animation.id}
          amount={animation.amount}
          position={animation.position}
          onComplete={() => onAnimationComplete(animation.id)}
          id={animation.id}
        />
      ))}
    </>
  );
};

export default GoldAnimation;
