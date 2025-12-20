import React from 'react';
import { formatGoldResource } from '../../utils/format';

interface GoldResourceDisplayProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  verbose?: boolean;
}

/**
 * GoldResourceDisplay Component
 * Displays gold resource amounts with gold/amber styling
 */
export const GoldResourceDisplay: React.FC<GoldResourceDisplayProps> = ({
  amount,
  className = '',
  showIcon = true,
  size = 'md',
  verbose = false
}) => {
  // Size-based text classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  // Format the amount
  const formattedAmount = formatGoldResource(amount, verbose);

  return (
    <span
      className={`inline-flex items-center gap-1 text-amber-500 ${sizeClasses[size]} ${className}`}
      aria-label={`${amount} gold`}
      title={`${amount} gold resource`}
    >
      {showIcon && (
        <span className="text-yellow-400" aria-hidden="true">
          🪙
        </span>
      )}
      <span className="font-medium">{formattedAmount}</span>
    </span>
  );
};

export default GoldResourceDisplay;
