/**
 * Loading Spinner Component
 * Western-themed loading indicator
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  text?: string;
}

const sizeStyles = {
  sm: 'w-6 h-6 border-2',
  md: 'w-12 h-12 border-3',
  lg: 'w-16 h-16 border-4',
};

/**
 * Western-themed loading spinner with star decoration
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-gold-medium',
  fullScreen = false,
  text = 'Loading...',
}) => {
  const sizeStyle = sizeStyles[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinning border */}
      <div
        className={`${sizeStyle} ${color} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />

      {/* Western star decoration */}
      <div className="text-gold-medium text-2xl animate-pulse-gold">
        ★
      </div>

      <p className="text-wood-dark font-western text-sm uppercase tracking-wider">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-desert-sand/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
