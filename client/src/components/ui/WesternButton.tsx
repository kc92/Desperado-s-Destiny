/**
 * WesternButton Component
 * Button with Western-themed styling
 * Hybrid Western-Modern Design with touch optimization
 */

import React from 'react';
import { useMobile } from '@/hooks/useMobile';

export interface WesternButtonProps {
  /** Button visual style */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  loading?: boolean;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Icon to show before text */
  icon?: React.ReactNode;
  /** Icon to show after text */
  iconAfter?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** ARIA label */
  'aria-label'?: string;
}

const SIZE_STYLES = {
  sm: 'text-sm py-2 px-4',
  md: 'text-base py-3 px-6',
  lg: 'text-lg py-4 px-8',
};

export const WesternButton: React.FC<WesternButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconAfter,
  className = '',
  children,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const { isTouch } = useMobile();

  // Determine variant class
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-danger';
      case 'ghost':
        return 'btn-ghost';
      default:
        return 'btn-primary';
    }
  };

  const variantClass = getVariantClass();
  const sizeClass = SIZE_STYLES[size];

  return (
    <button
      type={type}
      className={`
        ${variantClass}
        ${sizeClass}
        ${fullWidth ? 'w-full' : ''}
        ${isTouch ? 'touch-target touch-active no-select no-zoom' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg
        transition-smooth
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        disabled:pointer-events-none
      `}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={loading}
      style={{
        // Focus ring color handled via Tailwind classes
      }}
    >
      {loading ? (
        <>
          {/* Loading spinner */}
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {iconAfter && <span className="flex-shrink-0">{iconAfter}</span>}
        </>
      )}
    </button>
  );
};

export default WesternButton;
