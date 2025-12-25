/**
 * Button Component
 * Unified western-styled button with multiple variants and sizes
 *
 * Phase 17: UI Polish - Component Consolidation
 * Merges Button + WesternButton into single component
 */

import React, { forwardRef } from 'react';
import { useMobile } from '@/hooks/useMobile';
import type { ButtonVariant, ButtonSize } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Whether button is in loading state */
  isLoading?: boolean;
  /** Custom loading text (defaults to "Loading...") */
  loadingText?: string;
  /** Icon to show before text */
  icon?: React.ReactNode;
  /** Icon to show after text */
  iconAfter?: React.ReactNode;
  /** Test ID for testing */
  'data-testid'?: string;
}

// =============================================================================
// STYLE MAPPINGS
// =============================================================================

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm py-2 px-4',
  md: 'text-base py-3 px-6',
  lg: 'text-lg py-4 px-8',
};

const spinnerSizes: Record<ButtonSize, { width: number; height: number }> = {
  sm: { width: 14, height: 14 },
  md: { width: 18, height: 18 },
  lg: { width: 22, height: 22 },
};

// =============================================================================
// LOADING SPINNER COMPONENT
// =============================================================================

interface LoadingSpinnerProps {
  size: ButtonSize;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size }) => {
  const { width, height } = spinnerSizes[size];

  return (
    <svg
      className="animate-spin"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
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
  );
};

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

/**
 * Western-styled button component with variants, icons, and loading states
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click Me
 * </Button>
 *
 * <Button variant="secondary" icon={<StarIcon />}>
 *   With Icon
 * </Button>
 *
 * <Button isLoading loadingText="Saving...">
 *   Save
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loadingText,
      icon,
      iconAfter,
      disabled = false,
      className = '',
      type = 'button',
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const { isTouch } = useMobile();

    const isDisabled = disabled || isLoading;

    // Build class list
    const classes = [
      // Variant styling (from theme.css)
      variantClasses[variant],
      // Size styling
      sizeClasses[size],
      // Layout
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-lg',
      // Full width
      fullWidth && 'w-full',
      // Touch optimization
      isTouch && 'touch-target touch-active no-select no-zoom',
      // Disabled state
      isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      // Focus styles
      'focus:outline-none focus-visible:ring-4 focus-visible:ring-opacity-50',
      // Custom classes
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Compute aria-label from children if not provided
    const computedAriaLabel =
      ariaLabel || (typeof children === 'string' ? children : undefined);

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        aria-label={computedAriaLabel}
        data-testid={testId}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
            <span>{loadingText || 'Loading...'}</span>
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
  }
);

Button.displayName = 'Button';

export default Button;
