/**
 * XPGain Component
 * Small XP popup near action location
 */

import React, { useEffect, useState } from 'react';
import { useAnimationPreferences } from '@/contexts';

interface XPGainProps {
  /** Amount of XP gained */
  amount: number;
  /** Position where animation should appear */
  position?: { x: number; y: number };
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Unique identifier for the animation (used by container) */
  id?: string;
}

/**
 * XP gain popup that animates upward and fades out
 * Compact design suitable for frequent XP gains
 */
export const XPGain: React.FC<XPGainProps> = ({
  amount,
  position,
  onComplete,
}) => {
  const { shouldAnimate, durationMultiplier } = useAnimationPreferences();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Calculate duration based on user preferences
    const duration = shouldAnimate ? 1200 * durationMultiplier : 0;

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, shouldAnimate, durationMultiplier]);

  if (!isVisible) return null;

  // Default to center-top if no position provided
  const defaultPosition = {
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: 100,
  };
  const pos = position || defaultPosition;

  return (
    <div
      className={`
        fixed z-50 pointer-events-none
        ${shouldAnimate ? 'animate-xp-popup' : ''}
      `}
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, 0)',
      }}
      role="status"
      aria-live="polite"
      aria-label={`Gained ${amount} experience points`}
    >
      <div
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-faction-settler/90 border-2 border-faction-settler
          backdrop-blur-sm
        "
        style={{
          boxShadow: '0 4px 12px rgba(70, 130, 180, 0.5)',
        }}
      >
        {/* XP Icon */}
        <span
          className="text-2xl"
          role="img"
          aria-label="Experience"
        >
          ⭐
        </span>

        {/* XP Amount */}
        <span
          className="font-western font-bold text-lg text-white"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          +{amount} XP
        </span>
      </div>
    </div>
  );
};

/**
 * XPGainContainer Component
 * Manages multiple XP gain animations at once
 */
interface XPGainItem extends XPGainProps {
  id: string;
}

interface XPGainContainerProps {
  /** Array of active XP gain animations */
  animations: XPGainItem[];
  /** Callback when an animation completes */
  onAnimationComplete: (id: string) => void;
}

export const XPGainContainer: React.FC<XPGainContainerProps> = ({
  animations,
  onAnimationComplete,
}) => {
  if (animations.length === 0) return null;

  return (
    <>
      {animations.map((animation, index) => (
        <XPGain
          key={animation.id}
          amount={animation.amount}
          position={animation.position ? {
            // Stack multiple XP gains vertically
            x: animation.position.x,
            y: animation.position.y + (index * 60),
          } : undefined}
          onComplete={() => onAnimationComplete(animation.id)}
          id={animation.id}
        />
      ))}
    </>
  );
};

export default XPGain;
