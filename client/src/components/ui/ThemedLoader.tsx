/**
 * ThemedLoader Component
 * Multi-variant Western-themed loading indicators
 *
 * Phase 2: UX Polish - Enhanced loading states
 */

import React from 'react';
import { SheriffStarSpinner } from './SheriffStarSpinner';

// =============================================================================
// TYPES
// =============================================================================

export type LoaderVariant = 'spinner' | 'cards' | 'tumbleweed' | 'wanted';

export interface ThemedLoaderProps {
  /** Loader variant style */
  variant?: LoaderVariant;
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// SIZE MAPPINGS
// =============================================================================

const sizeClasses = {
  sm: {
    container: 'w-8 h-8',
    card: 'w-5 h-7',
    icon: 'text-2xl',
    text: 'text-xs',
  },
  md: {
    container: 'w-12 h-12',
    card: 'w-7 h-10',
    icon: 'text-3xl',
    text: 'text-sm',
  },
  lg: {
    container: 'w-16 h-16',
    card: 'w-9 h-12',
    icon: 'text-4xl',
    text: 'text-base',
  },
};

// =============================================================================
// CARD LOADER SUB-COMPONENT
// =============================================================================

const CardsLoader: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const styles = sizeClasses[size];

  return (
    <div className="flex gap-1" role="presentation">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${styles.card}
            bg-gradient-to-br from-blood-red to-blood-dark
            rounded border-2 border-gold-light
            animate-bounce-cards
            shadow-md
          `}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        >
          {/* Card back pattern */}
          <div className="w-full h-full flex items-center justify-center text-gold-light opacity-60">
            <span className="text-xs">♠</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// TUMBLEWEED LOADER SUB-COMPONENT
// =============================================================================

const TumbleweedLoader: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const styles = sizeClasses[size];

  return (
    <div
      className={`
        ${styles.container}
        rounded-full
        border-4 border-dashed border-leather-tan
        animate-tumble
        opacity-70
      `}
      role="presentation"
      style={{
        background: 'radial-gradient(circle, transparent 40%, rgba(139, 90, 43, 0.2) 100%)',
      }}
    >
      {/* Inner detail */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-1/2 h-1/2 rounded-full border-2 border-dashed border-leather-brown opacity-50" />
      </div>
    </div>
  );
};

// =============================================================================
// WANTED LOADER SUB-COMPONENT
// =============================================================================

const WantedLoader: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const styles = sizeClasses[size];

  return (
    <div
      className={`
        ${styles.container}
        relative
        bg-desert-sand
        border-4 border-wood-dark
        rounded
        animate-pulse-gold
        shadow-lg
      `}
      role="presentation"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(230, 213, 184, 0.9), rgba(200, 185, 161, 0.95))
        `,
      }}
    >
      {/* WANTED text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-western text-blood-red leading-none"
          style={{ fontSize: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px' }}
        >
          WANTED
        </span>
        <span
          className="text-wood-dark mt-0.5"
          style={{ fontSize: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px' }}
        >
          ?
        </span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-wood-grain" />
      <div className="absolute top-0.5 right-0.5 w-1 h-1 border-t border-r border-wood-grain" />
      <div className="absolute bottom-0.5 left-0.5 w-1 h-1 border-b border-l border-wood-grain" />
      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-wood-grain" />
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Western-themed loading indicator with multiple variants
 *
 * @example
 * ```tsx
 * // Sheriff star (default)
 * <ThemedLoader variant="spinner" message="Loading..." />
 *
 * // Bouncing cards
 * <ThemedLoader variant="cards" size="lg" />
 *
 * // Rolling tumbleweed
 * <ThemedLoader variant="tumbleweed" />
 *
 * // Wanted poster
 * <ThemedLoader variant="wanted" message="Searching..." />
 * ```
 */
export const ThemedLoader: React.FC<ThemedLoaderProps> = ({
  variant = 'spinner',
  size = 'md',
  message,
  className = '',
}) => {
  const styles = sizeClasses[size];

  // Render the appropriate loader variant
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <SheriffStarSpinner
            size={size}
            message={message}
            className=""
          />
        );

      case 'cards':
        return <CardsLoader size={size} />;

      case 'tumbleweed':
        return <TumbleweedLoader size={size} />;

      case 'wanted':
        return <WantedLoader size={size} />;

      default:
        return <SheriffStarSpinner size={size} message={message} />;
    }
  };

  // Spinner variant handles its own container
  if (variant === 'spinner') {
    return <div className={className}>{renderLoader()}</div>;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {renderLoader()}

      {/* Loading message */}
      {message && (
        <p className={`font-western text-desert-sand ${styles.text} animate-pulse`}>
          {message}
        </p>
      )}

      {/* Screen reader announcement */}
      <span className="sr-only">
        {message || 'Loading, please wait...'}
      </span>
    </div>
  );
};

ThemedLoader.displayName = 'ThemedLoader';

export default ThemedLoader;
