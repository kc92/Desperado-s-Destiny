/**
 * DamageNumber Component
 * Animated damage number that floats up and fades out
 */

import React, { useEffect } from 'react';

interface DamageNumberProps {
  /** Damage amount to display */
  damage: number;
  /** X position (percentage or pixels) */
  x?: string;
  /** Y position (percentage or pixels) */
  y?: string;
  /** Color of the damage number */
  color?: 'gold' | 'red' | 'green';
  /** Whether this is a critical hit (larger, more dramatic) */
  isCritical?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Damage number that animates upward and fades out
 */
export const DamageNumber: React.FC<DamageNumberProps> = ({
  damage,
  x = '50%',
  y = '50%',
  color = 'gold',
  isCritical = false,
  onComplete,
  className = '',
}) => {
  useEffect(() => {
    // Call completion callback after animation duration (1s)
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  // Determine color classes
  const getColorClasses = (): string => {
    switch (color) {
      case 'gold':
        return 'text-gold-light drop-shadow-[0_2px_8px_rgba(255,215,0,0.8)]';
      case 'red':
        return 'text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)]';
      case 'green':
        return 'text-green-500 drop-shadow-[0_2px_8px_rgba(34,197,94,0.8)]';
      default:
        return 'text-gold-light drop-shadow-[0_2px_8px_rgba(255,215,0,0.8)]';
    }
  };

  // Determine size based on damage and critical status
  const getSize = (): string => {
    if (isCritical || damage >= 50) {
      return 'text-6xl';
    } else if (damage >= 30) {
      return 'text-5xl';
    } else if (damage >= 15) {
      return 'text-4xl';
    }
    return 'text-3xl';
  };

  return (
    <div
      className={`
        absolute pointer-events-none z-50
        ${className}
      `}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`
          font-western font-bold
          animate-damage-float
          ${getColorClasses()}
          ${getSize()}
          ${isCritical ? 'animate-victory-pulse' : ''}
        `}
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          WebkitTextStroke: isCritical ? '2px rgba(0,0,0,0.5)' : '1px rgba(0,0,0,0.3)',
        }}
      >
        {damage}
        {isCritical && (
          <span className="ml-2 text-yellow-300">!</span>
        )}
      </div>
    </div>
  );
};

export default DamageNumber;
