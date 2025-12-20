/**
 * EmptyState Component
 * Western-themed empty state display for pages with no data
 */

import React from 'react';
import { Button } from './Button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'success';

interface EmptyStateProps {
  /** Main title text */
  title: string;
  /** Description/subtitle text */
  description?: string;
  /** Icon or emoji to display */
  icon?: string;
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Primary action button text */
  actionText?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Alternative action format { label, onClick } */
  action?: { label: string; onClick: () => void };
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<EmptyStateVariant, { iconBg: string; titleColor: string }> = {
  default: {
    iconBg: 'bg-wood-grain/20',
    titleColor: 'text-desert-sand',
  },
  search: {
    iconBg: 'bg-gold-dark/20',
    titleColor: 'text-gold-light',
  },
  error: {
    iconBg: 'bg-blood-red/20',
    titleColor: 'text-blood-red',
  },
  success: {
    iconBg: 'bg-green-600/20',
    titleColor: 'text-green-400',
  },
};

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'text-4xl w-16 h-16',
    title: 'text-lg',
    description: 'text-sm',
  },
  md: {
    container: 'py-10',
    icon: 'text-5xl w-20 h-20',
    title: 'text-xl',
    description: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'text-6xl w-24 h-24',
    title: 'text-2xl',
    description: 'text-lg',
  },
};

/**
 * Western-themed empty state component
 * Use for pages/sections with no data to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '🏜️',
  variant = 'default',
  actionText,
  onAction,
  action,
  secondaryActionText,
  onSecondaryAction,
  className = '',
  size = 'md',
}) => {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  // Support both action formats
  const finalActionText = actionText || action?.label;
  const finalOnAction = onAction || action?.onClick;

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${sizes.container}
        ${className}
      `}
      role="status"
      aria-label={title}
    >
      {/* Icon */}
      <div
        className={`
          flex items-center justify-center rounded-full mb-4
          ${sizes.icon} ${styles.iconBg}
        `}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className={`
          font-western mb-2
          ${sizes.title} ${styles.titleColor}
        `}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`
            text-desert-stone max-w-md mb-6
            ${sizes.description}
          `}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(finalActionText || secondaryActionText) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {finalActionText && finalOnAction && (
            <Button
              variant="primary"
              size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
              onClick={finalOnAction}
            >
              {finalActionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="ghost"
              size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Display name for React DevTools
EmptyState.displayName = 'EmptyState';

export default EmptyState;
