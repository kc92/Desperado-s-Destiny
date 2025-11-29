/**
 * Card Component
 * Western-styled card with wood panel aesthetic
 */

import React from 'react';
import type { BaseComponentProps } from '@/types';

interface CardProps extends BaseComponentProps {
  variant?: 'wood' | 'leather' | 'parchment';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

const variantStyles = {
  wood: 'wood-panel text-desert-sand',
  leather: 'leather-panel text-desert-sand',
  parchment: 'parchment text-western-text',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Western-themed card component with wood/leather/parchment variants
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'wood',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
  'data-testid': dataTestId,
}) => {
  const baseStyles = 'rounded-lg';
  const variantStyle = variantStyles[variant];
  const paddingStyle = paddingStyles[padding];
  const hoverStyle = hover ? 'transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer' : '';
  const isInteractive = !!onClick;

  // Handle keyboard interaction for interactive cards
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  const interactiveProps = isInteractive
    ? {
        role: 'button',
        tabIndex: 0,
        onKeyDown: handleKeyDown,
        'aria-pressed': false,
      }
    : {};

  return (
    <div
      className={`${baseStyles} ${variantStyle} ${paddingStyle} ${hoverStyle} ${isInteractive ? 'focus-visible-gold' : ''} ${className}`}
      onClick={onClick}
      data-testid={dataTestId}
      {...interactiveProps}
    >
      {children}
    </div>
  );
};

export default Card;
