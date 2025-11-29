/**
 * StarFragment Component
 * Individual star display for constellation viewer (lit/unlit states)
 */

import React from 'react';
import type { ConstellationStar } from '@/types/zodiac.types';

interface StarFragmentProps {
  star: ConstellationStar;
  color?: string;
  glowColor?: string;
  showTooltip?: boolean;
  onClick?: (star: ConstellationStar) => void;
  className?: string;
}

/**
 * Get star size in pixels based on size type
 */
function getStarSize(size: ConstellationStar['size']): number {
  switch (size) {
    case 'small':
      return 8;
    case 'medium':
      return 12;
    case 'large':
      return 16;
    case 'major':
      return 24;
    default:
      return 12;
  }
}

/**
 * Individual star in a constellation
 */
export const StarFragment: React.FC<StarFragmentProps> = ({
  star,
  color = '#FFD700',
  glowColor = 'rgba(255, 215, 0, 0.6)',
  showTooltip = true,
  onClick,
  className = '',
}) => {
  const size = getStarSize(star.size);
  const isEarned = star.isEarned;

  const handleClick = () => {
    if (onClick) {
      onClick(star);
    }
  };

  return (
    <div
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        transition-all duration-500 ease-out
        ${onClick ? 'cursor-pointer hover:scale-125' : ''}
        ${className}
      `}
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        zIndex: star.size === 'major' ? 20 : 10,
      }}
      onClick={handleClick}
      title={showTooltip ? star.name : undefined}
    >
      {/* Star core */}
      <div
        className={`
          rounded-full
          transition-all duration-500
          ${isEarned ? 'animate-twinkle' : 'opacity-30'}
        `}
        style={{
          width: size,
          height: size,
          backgroundColor: isEarned ? color : '#4A5568',
          boxShadow: isEarned
            ? `
              0 0 ${size / 2}px ${glowColor},
              0 0 ${size}px ${glowColor},
              0 0 ${size * 1.5}px ${glowColor},
              inset 0 0 ${size / 4}px rgba(255,255,255,0.5)
            `
            : 'none',
        }}
      />

      {/* Star points (for major stars) */}
      {star.size === 'major' && isEarned && (
        <>
          {/* Horizontal ray */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{
              width: size * 2.5,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            }}
          />
          {/* Vertical ray */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{
              width: 2,
              height: size * 2.5,
              background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
            }}
          />
          {/* Diagonal rays */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 animate-pulse"
            style={{
              width: size * 1.8,
              height: 1.5,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 animate-pulse"
            style={{
              width: size * 1.8,
              height: 1.5,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            }}
          />
        </>
      )}

      {/* Earned indicator ring */}
      {isEarned && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            border: `1px solid ${glowColor}`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Unearned lock icon for major stars */}
      {!isEarned && star.size === 'major' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
          ?
        </div>
      )}
    </div>
  );
};

/**
 * Connection line between two stars
 */
interface StarConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isComplete: boolean;
  color?: string;
  className?: string;
}

export const StarConnectionLine: React.FC<StarConnectionLineProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  isComplete,
  color = '#FFD700',
  className = '',
}) => {
  // Calculate line properties
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className={`
        absolute origin-left
        transition-all duration-700 ease-out
        ${className}
      `}
      style={{
        left: `${fromX}%`,
        top: `${fromY}%`,
        width: `${length}%`,
        height: 2,
        transform: `rotate(${angle}deg)`,
        background: isComplete
          ? `linear-gradient(90deg, ${color}80, ${color}, ${color}80)`
          : 'linear-gradient(90deg, #4A5568, #4A5568)',
        boxShadow: isComplete ? `0 0 8px ${color}60` : 'none',
        opacity: isComplete ? 1 : 0.3,
      }}
    />
  );
};

export default StarFragment;
