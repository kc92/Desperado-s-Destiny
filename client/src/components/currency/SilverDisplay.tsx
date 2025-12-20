import React from 'react';
import { formatSilver } from '../../utils/format';

interface SilverDisplayProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  verbose?: boolean;
}

/**
 * SilverDisplay Component
 * Displays silver resource amounts with silver/gray styling
 */
export const SilverDisplay: React.FC<SilverDisplayProps> = ({
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
  const formattedAmount = formatSilver(amount, verbose);

  return (
    <span
      className={`inline-flex items-center gap-1 text-gray-400 ${sizeClasses[size]} ${className}`}
      aria-label={`${amount} silver`}
      title={`${amount} silver resource`}
    >
      {showIcon && (
        <span className="text-gray-300" aria-hidden="true">
          🪙
        </span>
      )}
      <span className="font-medium">{formattedAmount}</span>
    </span>
  );
};

export default SilverDisplay;
