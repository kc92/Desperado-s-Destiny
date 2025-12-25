/**
 * NavTile Component
 * Reusable navigation tile for game navigation grids
 *
 * Phase 2: UX Polish - Navigation hierarchy
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// =============================================================================
// TYPES
// =============================================================================

export type NavTileSize = 'sm' | 'md' | 'lg';
export type NavTileVariant = 'default' | 'featured' | 'locked';
export type BadgeVariant = 'default' | 'danger' | 'success' | 'new';

export interface NavTileProps {
  /** Navigation destination (React Router path) */
  to: string;
  /** Icon to display (emoji or React node) */
  icon: React.ReactNode;
  /** Main title text */
  title: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Badge content (number or text) */
  badge?: string | number;
  /** Badge color variant */
  badgeVariant?: BadgeVariant;
  /** Tile size */
  size?: NavTileSize;
  /** Visual variant */
  variant?: NavTileVariant;
  /** Whether tile is disabled */
  disabled?: boolean;
  /** Reason for disabled state (shown as tooltip) */
  disabledReason?: string;
  /** Whether to show "NEW" indicator dot */
  isNew?: boolean;
  /** Custom gradient colors (overrides variant) */
  gradientColors?: string;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
  /** Tutorial target identifier */
  'data-tutorial-target'?: string;
  /** Click handler (called in addition to navigation) */
  onClick?: () => void;
}

// =============================================================================
// STYLE MAPPINGS
// =============================================================================

const sizeStyles: Record<NavTileSize, {
  container: string;
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
}> = {
  sm: {
    container: 'p-3',
    icon: 'text-2xl mb-1',
    title: 'text-sm',
    subtitle: 'text-xs',
    badge: 'text-xs px-1.5 py-0.5',
  },
  md: {
    container: 'p-4',
    icon: 'text-3xl mb-2',
    title: 'text-base',
    subtitle: 'text-xs',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    container: 'p-6',
    icon: 'text-4xl mb-3',
    title: 'text-lg',
    subtitle: 'text-sm',
    badge: 'text-sm px-2 py-1',
  },
};

const variantStyles: Record<NavTileVariant, {
  border: string;
  bg: string;
  hover: string;
  shadow: string;
}> = {
  default: {
    border: 'border-wood-grain/50',
    bg: 'bg-gradient-to-b from-wood-dark to-wood-medium',
    hover: 'hover:border-gold-light hover:shadow-lg hover:shadow-gold-dark/20',
    shadow: '',
  },
  featured: {
    border: 'border-gold-light/50',
    bg: 'bg-gradient-to-b from-gold-dark/20 to-wood-medium',
    hover: 'hover:border-gold-light hover:shadow-xl hover:shadow-gold-dark/30',
    shadow: 'ring-1 ring-gold-light/20',
  },
  locked: {
    border: 'border-gray-600',
    bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
    hover: '',
    shadow: '',
  },
};

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-gold-dark text-wood-dark',
  danger: 'bg-blood-red text-white',
  success: 'bg-green-600 text-white',
  new: 'bg-purple-600 text-white animate-pulse',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Navigation tile for game navigation grids
 *
 * @example
 * ```tsx
 * // Basic tile
 * <NavTile
 *   to="/game/combat"
 *   icon="⚔️"
 *   title="Combat"
 *   subtitle="Fight & duel"
 * />
 *
 * // Featured tile with badge
 * <NavTile
 *   to="/game/quests"
 *   icon="📖"
 *   title="Quests"
 *   subtitle="Active missions"
 *   badge={3}
 *   badgeVariant="danger"
 *   variant="featured"
 *   size="lg"
 * />
 *
 * // Disabled tile
 * <NavTile
 *   to="/game/heist"
 *   icon="🏦"
 *   title="Bank Heist"
 *   disabled
 *   disabledReason="Requires level 30"
 * />
 * ```
 */
export const NavTile: React.FC<NavTileProps> = ({
  to,
  icon,
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  size = 'md',
  variant = 'default',
  disabled = false,
  disabledReason,
  isNew = false,
  gradientColors,
  className = '',
  'data-testid': testId,
  'data-tutorial-target': tutorialTarget,
  onClick,
}) => {
  const navigate = useNavigate();

  // Determine actual variant (disabled overrides)
  const appliedVariant = disabled ? 'locked' : variant;
  const styles = sizeStyles[size];
  const variantStyle = variantStyles[appliedVariant];

  // Handle click
  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
    navigate(to);
  }, [disabled, onClick, navigate, to]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        handleClick();
      }
    },
    [disabled, handleClick]
  );

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        group relative overflow-hidden rounded-lg border transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-wood-dark
        ${styles.container}
        ${variantStyle.border}
        ${gradientColors || variantStyle.bg}
        ${!disabled ? variantStyle.hover : ''}
        ${variantStyle.shadow}
        ${disabled ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : 'cursor-pointer'}
        ${className}
      `}
      data-testid={testId}
      data-tutorial-target={tutorialTarget}
      aria-disabled={disabled}
      title={disabled ? disabledReason : undefined}
    >
      {/* Badge */}
      {badge !== undefined && (
        <span
          className={`
            absolute top-2 right-2
            rounded-full font-bold
            ${styles.badge}
            ${badgeStyles[badgeVariant]}
          `}
        >
          {badge}
        </span>
      )}

      {/* New indicator dot */}
      {isNew && badge === undefined && (
        <span
          className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"
          aria-label="New"
        />
      )}

      {/* Content */}
      <div className="text-center relative z-10">
        {/* Icon */}
        <div
          className={`
            ${styles.icon}
            ${!disabled ? 'group-hover:scale-110' : ''}
            transition-transform duration-200
          `}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Title */}
        <h3
          className={`
            font-western text-desert-sand
            ${styles.title}
            ${!disabled ? 'group-hover:text-gold-light' : ''}
            transition-colors duration-200
          `}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className={`text-desert-stone mt-1 ${styles.subtitle}`}>
            {disabled && disabledReason ? disabledReason : subtitle}
          </p>
        )}
      </div>

      {/* Lock overlay for disabled state */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <span className="text-2xl opacity-80" aria-hidden="true">
            🔒
          </span>
        </div>
      )}

      {/* Featured glow effect */}
      {appliedVariant === 'featured' && !disabled && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-gold-light/10 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Screen reader text for badge */}
      {badge !== undefined && (
        <span className="sr-only">
          {typeof badge === 'number' ? `${badge} items` : badge}
        </span>
      )}
    </button>
  );
};

NavTile.displayName = 'NavTile';

export default NavTile;
