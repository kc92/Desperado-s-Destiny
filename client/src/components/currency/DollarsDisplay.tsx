import React from 'react';
import { formatDollars } from '../../utils/format';

interface DollarsDisplayProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DollarsDisplay Component
 * Displays dollar amounts with consistent styling and formatting
 */
export const DollarsDisplay: React.FC<DollarsDisplayProps> = ({
  amount,
  className = '',
  showIcon = true,
  size = 'md'
}) => {
  // Size-based text classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  // Format the amount
  const formattedAmount = formatDollars(amount);

  return (
    <span
      className={`inline-flex items-center gap-1 text-green-500 ${sizeClasses[size]} ${className}`}
      aria-label={`${amount} dollars`}
      title={`${amount} dollars`}
    >
      {showIcon && (
        <span className="text-green-500" aria-hidden="true">
          💵
        </span>
      )}
      <span className="font-medium">{formattedAmount}</span>
    </span>
  );
};

export default DollarsDisplay;
