import React from 'react';
import { DollarsDisplay } from './DollarsDisplay';
import { GoldResourceDisplay } from './GoldResourceDisplay';
import { SilverDisplay } from './SilverDisplay';

interface CurrencyDisplayProps {
  amount: number;
  type: 'dollars' | 'gold' | 'silver';
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  verbose?: boolean;
}

/**
 * CurrencyDisplay Component
 * Generic wrapper that renders the appropriate currency display component based on type
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  type,
  className = '',
  showIcon = true,
  size = 'md',
  verbose = false
}) => {
  switch (type) {
    case 'dollars':
      return (
        <DollarsDisplay
          amount={amount}
          className={className}
          showIcon={showIcon}
          size={size}
        />
      );
    case 'gold':
      return (
        <GoldResourceDisplay
          amount={amount}
          className={className}
          showIcon={showIcon}
          size={size}
          verbose={verbose}
        />
      );
    case 'silver':
      return (
        <SilverDisplay
          amount={amount}
          className={className}
          showIcon={showIcon}
          size={size}
          verbose={verbose}
        />
      );
    default:
      // Fallback for unknown types
      return (
        <span className={className}>
          {amount.toLocaleString()}
        </span>
      );
  }
};

export default CurrencyDisplay;
