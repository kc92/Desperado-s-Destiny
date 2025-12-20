/**
 * DollarsDisplay Component
 * Optimized dollar/currency display with formatting
 */

import React, { useMemo } from 'react';
import { formatDollars } from '@/utils/format';

interface DollarsDisplayProps {
  amount: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

/**
 * Memoized dollar display component to prevent re-renders
 * Only re-renders when amount changes
 */
export const DollarsDisplay: React.FC<DollarsDisplayProps> = React.memo(({
  amount,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  // Memoize formatted dollar value
  const formattedDollars = useMemo(() => formatDollars(amount), [amount]);

  return (
    <span
      className={`font-western text-gold-light ${sizeStyles[size]} ${className}`}
      aria-label={`Dollars: ${formattedDollars}`}
    >
      <span aria-hidden="true">
        {showIcon && '💵 '}
        {formattedDollars}
      </span>
      <span className="sr-only">
        {amount} dollars
      </span>
    </span>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if amount, size, or showIcon changes
  return (
    prevProps.amount === nextProps.amount &&
    prevProps.size === nextProps.size &&
    prevProps.showIcon === nextProps.showIcon
  );
});

// Display name for React DevTools
DollarsDisplay.displayName = 'DollarsDisplay';

export default DollarsDisplay;
