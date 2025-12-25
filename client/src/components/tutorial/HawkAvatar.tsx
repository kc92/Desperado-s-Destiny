/**
 * HawkAvatar Component
 *
 * Phase 16: Displays Hawk mentor's portrait with expression-based variations
 * Supports multiple sizes and glow effect for active dialogue states
 */

import React, { useMemo } from 'react';
import type { HawkExpression } from '@/services/tutorial.service';

// ============================================================================
// HAWK CHARACTER PROFILE
// ============================================================================

export const HAWK_PROFILE = {
  name: 'Hawk',
  title: 'Veteran Gunslinger',
  description: 'A weathered former lawman turned mentor',
  age: 52,
  personality: 'Gruff but caring, speaks in western idioms',
} as const;

// ============================================================================
// PORTRAIT PATHS
// ============================================================================

const EXPRESSION_PORTRAITS: Record<HawkExpression, string> = {
  neutral: '/assets/portraits/hawk/neutral.png',
  teaching: '/assets/portraits/hawk/teaching.png',
  warning: '/assets/portraits/hawk/warning.png',
  pleased: '/assets/portraits/hawk/pleased.png',
  thinking: '/assets/portraits/hawk/thinking.png',
  concerned: '/assets/portraits/hawk/concerned.png',
  amused: '/assets/portraits/hawk/amused.png',
  proud: '/assets/portraits/hawk/proud.png',
  farewell: '/assets/portraits/hawk/farewell.png',
  combat_ready: '/assets/portraits/hawk/combat_ready.png',
};

const FALLBACK_PORTRAIT = '/assets/portraits/hawk/neutral.png';

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

type AvatarSize = 'small' | 'medium' | 'large';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  small: 'w-10 h-10',
  medium: 'w-16 h-16 sm:w-20 sm:h-20',
  large: 'w-24 h-24 sm:w-32 sm:h-32',
};

const BORDER_CLASSES: Record<AvatarSize, string> = {
  small: 'border-2',
  medium: 'border-3',
  large: 'border-4',
};

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface HawkAvatarProps {
  /** Current expression to display */
  expression?: HawkExpression;
  /** Avatar size variant */
  size?: AvatarSize;
  /** Whether dialogue is currently active (shows glow) */
  isActive?: boolean;
  /** Whether to show speaking animation */
  isSpeaking?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for avatar interaction */
  onClick?: () => void;
  /** Whether avatar is clickable */
  clickable?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get portrait path for a given expression
 */
export const getHawkPortrait = (expression: HawkExpression): string => {
  return EXPRESSION_PORTRAITS[expression] || FALLBACK_PORTRAIT;
};

/**
 * Get expression display name
 */
export const getExpressionDisplayName = (expression: HawkExpression): string => {
  const names: Record<HawkExpression, string> = {
    neutral: 'Neutral',
    teaching: 'Teaching',
    warning: 'Warning',
    pleased: 'Pleased',
    thinking: 'Thinking',
    concerned: 'Concerned',
    amused: 'Amused',
    proud: 'Proud',
    farewell: 'Farewell',
    combat_ready: 'Combat Ready',
  };
  return names[expression] || 'Neutral';
};

// ============================================================================
// COMPONENT
// ============================================================================

export const HawkAvatar: React.FC<HawkAvatarProps> = ({
  expression = 'neutral',
  size = 'medium',
  isActive = false,
  isSpeaking = false,
  className = '',
  onClick,
  clickable = false,
}) => {
  // Memoize portrait path
  const portraitSrc = useMemo(() => getHawkPortrait(expression), [expression]);

  // Build class strings
  const containerClasses = useMemo(() => {
    const base = [
      SIZE_CLASSES[size],
      BORDER_CLASSES[size],
      'rounded-full',
      'border-gold-dark',
      'bg-wood-dark',
      'overflow-hidden',
      'shadow-lg',
      'transition-all',
      'duration-300',
    ];

    // Active glow effect
    if (isActive) {
      base.push('ring-4', 'ring-gold-light/50', 'shadow-gold-light/30', 'shadow-2xl');
    }

    // Speaking pulse animation
    if (isSpeaking) {
      base.push('animate-pulse');
    }

    // Clickable states
    if (clickable || onClick) {
      base.push('cursor-pointer', 'hover:border-gold-light', 'hover:scale-105');
    }

    return base.join(' ');
  }, [size, isActive, isSpeaking, clickable, onClick]);

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== FALLBACK_PORTRAIT) {
      target.src = FALLBACK_PORTRAIT;
    }
  };

  // Render component
  const avatarContent = (
    <div
      className={`${containerClasses} ${className}`}
      role={clickable || onClick ? 'button' : 'img'}
      aria-label={`${HAWK_PROFILE.name} - ${getExpressionDisplayName(expression)}`}
      tabIndex={clickable || onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((clickable || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <img
        src={portraitSrc}
        alt={`${HAWK_PROFILE.name} - ${getExpressionDisplayName(expression)}`}
        className="w-full h-full object-cover"
        onError={handleImageError}
        draggable={false}
      />
    </div>
  );

  return avatarContent;
};

// ============================================================================
// MINI AVATAR (for compact displays)
// ============================================================================

export interface HawkMiniAvatarProps {
  /** Current expression */
  expression?: HawkExpression;
  /** Show indicator dot */
  showIndicator?: boolean;
  /** Indicator color */
  indicatorColor?: 'gold' | 'green' | 'red';
  /** Click handler */
  onClick?: () => void;
}

export const HawkMiniAvatar: React.FC<HawkMiniAvatarProps> = ({
  expression = 'neutral',
  showIndicator = false,
  indicatorColor = 'gold',
  onClick,
}) => {
  const indicatorColors = {
    gold: 'bg-gold-light',
    green: 'bg-green-400',
    red: 'bg-red-400',
  };

  return (
    <div className="relative inline-block">
      <HawkAvatar
        expression={expression}
        size="small"
        clickable={!!onClick}
        onClick={onClick}
      />
      {showIndicator && (
        <span
          className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${indicatorColors[indicatorColor]} border-2 border-wood-dark animate-pulse`}
        />
      )}
    </div>
  );
};

// Display names for React DevTools
HawkAvatar.displayName = 'HawkAvatar';
HawkMiniAvatar.displayName = 'HawkMiniAvatar';

export default HawkAvatar;
