/**
 * DamageNumber Component
 * Displays animated floating damage numbers during combat
 * Hybrid Western-Cinematic Style
 */

import React, { useEffect, useState } from 'react';

export interface DamageNumberProps {
  /** Damage amount to display */
  amount: number;
  /** Whether this is a critical hit */
  isCritical?: boolean;
  /** Whether this is a miss */
  isMiss?: boolean;
  /** Whether this is healing */
  isHealing?: boolean;
  /** Position to spawn from (relative to parent) */
  position?: { x: number; y: number };
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Unique ID for the damage instance */
  id?: string;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({
  amount,
  isCritical = false,
  isMiss = false,
  isHealing = false,
  position = { x: 0, y: 0 },
  onComplete,
  id: _id,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Trigger completion callback after animation (critical = 1.5s, normal = 1.2s)
    const duration = isCritical ? 1500 : 1200;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isCritical, onComplete]);

  if (!isVisible) return null;

  // Determine display text
  const displayText = isMiss ? 'MISS!' : isHealing ? `+${amount}` : amount.toString();

  // Determine color and style
  const getColorClass = () => {
    if (isMiss) return 'text-gray-400';
    if (isHealing) return 'text-green-400';
    if (isCritical) return 'text-yellow-400';
    return 'text-red-600';
  };

  const getShadowStyle = () => {
    if (isMiss) return '2px 2px 4px rgba(0, 0, 0, 0.8)';
    if (isHealing) return '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5), 2px 2px 4px rgba(0, 0, 0, 1)';
    if (isCritical) return '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.8), 4px 4px 8px rgba(0, 0, 0, 1)';
    return '0 0 10px rgba(139, 0, 0, 0.8), 0 0 20px rgba(139, 0, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 1)';
  };

  const getFontSize = () => {
    if (isCritical) return '72px';
    if (isMiss) return '48px';
    return '56px';
  };

  return (
    <div
      className={`
        absolute pointer-events-none select-none z-50
        font-bold
        ${isCritical ? 'animate-critical' : 'animate-damage'}
        ${getColorClass()}
      `}
      style={{
        left: position.x,
        top: position.y,
        fontSize: getFontSize(),
        textShadow: getShadowStyle(),
        fontFamily: 'Impact, "Arial Black", sans-serif',
        WebkitTextStroke: isCritical ? '2px rgba(0, 0, 0, 0.8)' : '1px rgba(0, 0, 0, 0.8)',
        letterSpacing: isCritical ? '0.05em' : 'normal',
      }}
      role="status"
      aria-live="polite"
      aria-label={isMiss ? 'Attack missed' : `${isCritical ? 'Critical hit: ' : ''}${isHealing ? 'Healed' : 'Damage'} ${amount}`}
    >
      {displayText}
      {isCritical && (
        <span className="absolute -top-4 -right-8 text-2xl animate-spin" style={{ animationDuration: '0.5s' }}>
          ★
        </span>
      )}
    </div>
  );
};

export default DamageNumber;
