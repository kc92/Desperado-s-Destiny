/**
 * WesternPanel Component
 * Reusable panel with Western-themed textures
 * Hybrid Western-Modern Design
 */

import React from 'react';

export interface WesternPanelProps {
  /** Panel visual style */
  variant?: 'wood' | 'leather' | 'parchment' | 'glass' | 'glass-western';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show border */
  bordered?: boolean;
  /** Whether to show shadow */
  shadow?: boolean;
  /** Additional class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** ARIA role */
  role?: string;
  /** ARIA label */
  'aria-label'?: string;
}

const PADDING_STYLES = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

export const WesternPanel: React.FC<WesternPanelProps> = ({
  variant = 'wood',
  padding = 'md',
  bordered = true,
  shadow = true,
  className = '',
  children,
  onClick,
  role,
  'aria-label': ariaLabel,
}) => {
  // Determine base classes based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'wood':
        return `
          texture-wood
          ${bordered ? 'border-4 rounded-lg' : ''}
          ${shadow ? 'shadow-lg' : ''}
        `;

      case 'leather':
        return `
          texture-leather
          ${bordered ? 'border-4 rounded-lg' : ''}
          ${shadow ? 'shadow-lg' : ''}
        `;

      case 'parchment':
        return `
          parchment
          ${shadow ? 'shadow-md' : ''}
        `;

      case 'glass':
        return `
          glass
          rounded-lg
          ${shadow ? 'shadow-lg' : ''}
        `;

      case 'glass-western':
        return `
          glass-western
          rounded-lg
          ${shadow ? 'shadow-western' : ''}
        `;

      default:
        return '';
    }
  };

  const variantClasses = getVariantClasses();
  const paddingClass = PADDING_STYLES[padding];

  return (
    <div
      className={`
        ${variantClasses}
        ${paddingClass}
        ${onClick ? 'cursor-pointer transition-smooth hover:transform hover:scale-102' : ''}
        ${className}
      `}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      style={{
        borderColor: bordered ? (variant === 'wood' ? 'var(--color-wood-dark)' : variant === 'leather' ? 'var(--color-leather-dark)' : 'var(--color-border)') : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default WesternPanel;
