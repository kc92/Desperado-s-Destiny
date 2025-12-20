/**
 * Button Component
 * Western-styled button with multiple variants and sizes
 */

import React, { forwardRef } from 'react';
import type { ButtonVariant, ButtonSize } from '@/types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  'data-testid'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-leather-brown hover:bg-leather-saddle text-desert-sand border-wood-dark',
  secondary: 'bg-gold-medium hover:bg-gold-dark text-wood-dark border-gold-dark',
  danger: 'bg-blood-red hover:bg-blood-dark text-desert-sand border-blood-dark',
  ghost: 'bg-transparent hover:bg-wood-light/20 text-wood-dark border-wood-medium',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg',
};

// Loading spinner sizes
const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * Western-styled button component with variants and states
 * Supports loading state with spinner and custom loading text
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loadingText,
  disabled = false,
  className = '',
  'data-testid': testId,
  ...props
}, ref) => {
  const baseStyles = 'btn-western font-semibold uppercase tracking-wider transition-all duration-200';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';
  const spinnerSize = spinnerSizes[size];

  const focusStyles = 'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2';
  const variantFocusStyle = variant === 'danger'
    ? 'focus-visible:ring-blood-red'
    : 'focus-visible:ring-gold-light';

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${widthStyle} ${disabledStyle} ${focusStyles} ${variantFocusStyle} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      data-testid={testId}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span
            className={`inline-block ${spinnerSize} border-2 border-current border-t-transparent rounded-full animate-spin`}
            aria-hidden="true"
          />
          <span>{loadingText || 'Loading...'}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});

// Display name for React DevTools
Button.displayName = 'Button';

export default Button;
