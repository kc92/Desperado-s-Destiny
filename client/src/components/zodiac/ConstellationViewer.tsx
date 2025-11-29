/**
 * ConstellationViewer Component
 * Interactive constellation display with connected stars
 */

import React, { useMemo } from 'react';
import type { Constellation, FrontierSign, ZodiacSignId } from '@/types/zodiac.types';
import { SIGN_COLORS, CONSTELLATION_PATTERNS } from '@/constants/zodiac.constants';
import { StarFragment, StarConnectionLine } from './StarFragment';

interface ConstellationViewerProps {
  sign: FrontierSign;
  constellation?: Constellation | null;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showProgress?: boolean;
  interactive?: boolean;
  onStarClick?: (starId: string) => void;
  className?: string;
}

/**
 * Generate default constellation if none provided
 */
function generateDefaultConstellation(signId: ZodiacSignId): Constellation {
  const pattern = CONSTELLATION_PATTERNS[signId];

  return {
    signId,
    stars: pattern.stars.map((star, index) => ({
      id: `${signId}-star-${index}`,
      name: `Star ${index + 1}`,
      x: star.x,
      y: star.y,
      size: star.size,
      isEarned: false,
    })),
    connections: pattern.connections.map(([from, to]) => ({
      from: `${signId}-star-${from}`,
      to: `${signId}-star-${to}`,
    })),
    totalStars: pattern.stars.length,
    earnedStars: 0,
    isComplete: false,
  };
}

/**
 * Constellation viewer component
 */
export const ConstellationViewer: React.FC<ConstellationViewerProps> = ({
  sign,
  constellation: providedConstellation,
  size = 'md',
  showProgress = true,
  interactive = false,
  onStarClick,
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id as ZodiacSignId];

  // Use provided constellation or generate default
  const constellation = useMemo(() => {
    return providedConstellation || generateDefaultConstellation(sign.id);
  }, [providedConstellation, sign.id]);

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (constellation.totalStars === 0) return 0;
    return Math.round((constellation.earnedStars / constellation.totalStars) * 100);
  }, [constellation]);

  // Size classes
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    full: 'w-full aspect-square max-w-md',
  };

  // Get star positions for connection lines
  const starPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; isEarned: boolean }> = {};
    constellation.stars.forEach(star => {
      positions[star.id] = { x: star.x, y: star.y, isEarned: star.isEarned };
    });
    return positions;
  }, [constellation.stars]);

  return (
    <div className={`relative ${className}`}>
      {/* Constellation container */}
      <div
        className={`
          relative ${sizeClasses[size]}
          bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900
          rounded-xl overflow-hidden
          border-2 ${colors?.borderClass || 'border-amber-500/50'}
          ${constellation.isComplete ? 'ring-2 ring-gold-light shadow-lg shadow-gold-dark/50' : ''}
        `}
      >
        {/* Starfield background */}
        <div className="absolute inset-0">
          {/* Random background stars */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Nebula glow effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${colors?.glow || 'rgba(255,215,0,0.3)'} 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 60%, ${colors?.glow || 'rgba(255,215,0,0.2)'} 0%, transparent 40%)`,
          }}
        />

        {/* Connection lines */}
        <div className="absolute inset-0">
          {constellation.connections.map((connection, index) => {
            const from = starPositions[connection.from];
            const to = starPositions[connection.to];
            if (!from || !to) return null;

            const isComplete = from.isEarned && to.isEarned;

            return (
              <StarConnectionLine
                key={index}
                fromX={from.x}
                fromY={from.y}
                toX={to.x}
                toY={to.y}
                isComplete={isComplete}
                color={colors?.glow?.replace('0.6', '1') || '#FFD700'}
              />
            );
          })}
        </div>

        {/* Stars */}
        <div className="absolute inset-0">
          {constellation.stars.map(star => (
            <StarFragment
              key={star.id}
              star={star}
              color={colors?.glow?.replace('0.6', '1') || '#FFD700'}
              glowColor={colors?.glow || 'rgba(255, 215, 0, 0.6)'}
              onClick={interactive && onStarClick ? () => onStarClick(star.id) : undefined}
            />
          ))}
        </div>

        {/* Sign icon overlay (faded) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-6xl opacity-10"
            style={{
              textShadow: constellation.isComplete
                ? `0 0 30px ${colors?.glow || 'rgba(255,215,0,0.5)'}`
                : 'none',
            }}
          >
            {sign.iconEmoji}
          </span>
        </div>

        {/* Complete overlay */}
        {constellation.isComplete && (
          <div className="absolute inset-0 bg-gradient-to-t from-gold-dark/30 to-transparent animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-desert-sand">
            <span>Stars Collected</span>
            <span className={colors?.textClass || 'text-amber-400'}>
              {constellation.earnedStars}/{constellation.totalStars}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors?.gradient || 'from-amber-500 to-orange-600'} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {constellation.isComplete && (
            <div className="text-center text-sm text-gold-light font-western animate-pulse">
              Constellation Complete!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Mini constellation preview (for use in lists/cards)
 */
interface ConstellationMiniProps {
  sign: FrontierSign;
  earnedStars?: number;
  totalStars?: number;
  isComplete?: boolean;
  className?: string;
}

export const ConstellationMini: React.FC<ConstellationMiniProps> = ({
  sign,
  earnedStars = 0,
  totalStars = 7,
  isComplete = false,
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id as ZodiacSignId];

  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <div
        className={`
          w-full h-full rounded-lg
          bg-gradient-to-br from-gray-900 to-slate-800
          border ${colors?.borderClass || 'border-amber-500/30'}
          flex items-center justify-center
          ${isComplete ? 'ring-1 ring-gold-light' : ''}
        `}
      >
        {/* Mini star dots */}
        <div className="absolute inset-2">
          {Array.from({ length: totalStars }).map((_, i) => {
            const angle = (i / totalStars) * 2 * Math.PI - Math.PI / 2;
            const radius = 35;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);

            return (
              <div
                key={i}
                className={`
                  absolute w-1.5 h-1.5 rounded-full
                  transform -translate-x-1/2 -translate-y-1/2
                  ${i < earnedStars ? 'animate-twinkle' : 'opacity-30'}
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: i < earnedStars
                    ? colors?.glow?.replace('0.6', '1') || '#FFD700'
                    : '#4A5568',
                  boxShadow: i < earnedStars
                    ? `0 0 4px ${colors?.glow || 'rgba(255,215,0,0.6)'}`
                    : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Center icon */}
        <span className="text-lg opacity-60">{sign.iconEmoji}</span>
      </div>

      {/* Progress indicator */}
      {!isComplete && earnedStars > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-desert-stone">
          {earnedStars}/{totalStars}
        </div>
      )}

      {/* Complete checkmark */}
      {isComplete && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
          ✓
        </div>
      )}
    </div>
  );
};

export default ConstellationViewer;
