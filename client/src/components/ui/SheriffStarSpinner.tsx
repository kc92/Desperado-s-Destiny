/**
 * SheriffStarSpinner Component
 * Western-themed loading spinner shaped like a sheriff's star
 * Classic Western Style
 */

import React from 'react';

export interface SheriffStarSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional message to display below spinner */
  message?: string;
  /** Additional class names */
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    star: 'w-8 h-8',
    text: 'text-xs',
    border: '3px',
  },
  md: {
    star: 'w-12 h-12',
    text: 'text-sm',
    border: '4px',
  },
  lg: {
    star: 'w-16 h-16',
    text: 'text-base',
    border: '5px',
  },
  xl: {
    star: 'w-24 h-24',
    text: 'text-lg',
    border: '6px',
  },
};

export const SheriffStarSpinner: React.FC<SheriffStarSpinnerProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  const sizeStyle = SIZE_STYLES[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Sheriff Star */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className={`${sizeStyle.star} absolute inset-0 rounded-full opacity-30 blur-md`}
          style={{
            background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)',
          }}
        />

        {/* Rotating star */}
        <div
          className={`${sizeStyle.star} relative flex items-center justify-center`}
          style={{
            animation: 'sheriffStarSpin 2s ease-in-out infinite',
          }}
        >
          {/* Star shape using SVG for crisp edges */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-lg"
            role="img"
            aria-label={message || 'Loading'}
          >
            {/* Star path - 5-pointed sheriff star */}
            <path
              d="M50 10 L61 40 L92 40 L68 58 L78 88 L50 70 L22 88 L32 58 L8 40 L39 40 Z"
              fill="url(#starGradient)"
              stroke="var(--color-bronze)"
              strokeWidth={sizeStyle.border}
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--color-gold-light)', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'var(--color-gold)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-gold-dark)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Center circle */}
            <circle
              cx="50"
              cy="50"
              r="12"
              fill="var(--color-bronze)"
              stroke="var(--color-gold-dark)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <p
          className={`font-western font-semibold ${sizeStyle.text} text-shadow-dark`}
          style={{ color: 'var(--color-gold)' }}
        >
          {message}
        </p>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {message || 'Loading, please wait...'}
      </div>
    </div>
  );
};

export default SheriffStarSpinner;
