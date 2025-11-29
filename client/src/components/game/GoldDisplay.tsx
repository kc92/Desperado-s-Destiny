/**
 * GoldDisplay Component
 * Optimized gold/currency display with formatting
 */

import React, { useMemo } from 'react';
import { formatGold } from '@/utils/format';

interface GoldDisplayProps {
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
 * Memoized gold display component to prevent re-renders
 * Only re-renders when amount changes
 */
export const GoldDisplay: React.FC<GoldDisplayProps> = React.memo(({
  amount,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  // Memoize formatted gold value
  const formattedGold = useMemo(() => formatGold(amount), [amount]);

  return (
    <span
      className={`font-western text-gold-light ${sizeStyles[size]} ${className}`}
      aria-label={`Gold: ${formattedGold}`}
    >
      <span aria-hidden="true">
        {showIcon && '💰 '}
        {formattedGold}
      </span>
      <span className="sr-only">
        {amount} gold coins
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
GoldDisplay.displayName = 'GoldDisplay';

export default GoldDisplay;
