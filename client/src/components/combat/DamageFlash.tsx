/**
 * DamageFlash Component
 * Screen flash effect when taking damage or scoring critical hits
 * Gritty Cinematic Style
 */

import React, { useEffect, useState } from 'react';

export interface DamageFlashProps {
  /** Type of flash effect */
  type: 'damage' | 'critical' | 'heal' | 'death';
  /** Callback when flash completes */
  onComplete?: () => void;
  /** Unique ID for this flash */
  id?: string;
}

export const DamageFlash: React.FC<DamageFlashProps> = ({
  type,
  onComplete,
  id,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Flash duration (one pulse cycle)
    const duration = type === 'death' ? 800 : 500;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  if (!isVisible) return null;

  // Determine flash color and animation
  const getFlashStyle = () => {
    switch (type) {
      case 'damage':
        return {
          background: 'radial-gradient(circle, rgba(139, 0, 0, 0.4) 0%, rgba(139, 0, 0, 0) 70%)',
          animation: 'bloodFlash 0.5s ease-out',
        };
      case 'critical':
        return {
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0) 70%)',
          animation: 'goldFlash 0.5s ease-out',
        };
      case 'heal':
        return {
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 70%)',
          animation: 'goldFlash 0.5s ease-out',
        };
      case 'death':
        return {
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, rgba(139, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%)',
          animation: 'bloodFlash 0.8s ease-in-out',
        };
      default:
        return {
          background: 'transparent',
          animation: 'none',
        };
    }
  };

  const flashStyle = getFlashStyle();

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        ...flashStyle,
      }}
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default DamageFlash;
