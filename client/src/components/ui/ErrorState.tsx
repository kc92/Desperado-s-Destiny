/**
 * ErrorState Component
 * Western-themed error display with retry functionality
 *
 * Phase 17: UI Polish - Loading/Empty State Enhancement
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { presets, useAnimationConfig } from '@/lib/animations';

// =============================================================================
// TYPES
// =============================================================================

type ErrorSeverity = 'warning' | 'error' | 'critical';

interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Retry button callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Go back callback */
  onGoBack?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Error code for debugging */
  errorCode?: string;
}

// =============================================================================
// STYLE MAPPINGS
// =============================================================================

const severityStyles: Record<
  ErrorSeverity,
  { icon: string; iconBg: string; titleColor: string; borderColor: string }
> = {
  warning: {
    icon: '⚠️',
    iconBg: 'bg-gold-dark/20',
    titleColor: 'text-gold-light',
    borderColor: 'border-gold-dark/30',
  },
  error: {
    icon: '❌',
    iconBg: 'bg-blood-red/20',
    titleColor: 'text-blood-crimson',
    borderColor: 'border-blood-red/30',
  },
  critical: {
    icon: '💀',
    iconBg: 'bg-blood-dark/30',
    titleColor: 'text-blood-red',
    borderColor: 'border-blood-red/50',
  },
};

const sizeStyles = {
  sm: {
    container: 'py-6 px-4',
    icon: 'text-3xl w-14 h-14',
    title: 'text-lg',
    message: 'text-sm',
  },
  md: {
    container: 'py-8 px-6',
    icon: 'text-4xl w-18 h-18',
    title: 'text-xl',
    message: 'text-base',
  },
  lg: {
    container: 'py-12 px-8',
    icon: 'text-5xl w-22 h-22',
    title: 'text-2xl',
    message: 'text-lg',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Western-themed error state with retry functionality
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="Connection Lost"
 *   message="Unable to reach the server. Please check your connection."
 *   severity="error"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  severity = 'error',
  onRetry,
  retryText = 'Try Again',
  isRetrying = false,
  onGoBack,
  className = '',
  size = 'md',
  errorCode,
}) => {
  const { shouldAnimate } = useAnimationConfig();
  const styles = severityStyles[severity];
  const sizes = sizeStyles[size];

  const Container = shouldAnimate ? motion.div : 'div';

  return (
    <Container
      className={`
        flex flex-col items-center justify-center text-center
        ${sizes.container}
        border rounded-lg ${styles.borderColor}
        bg-wood-darker/50
        ${className}
      `}
      role="alert"
      aria-live="assertive"
      {...(shouldAnimate && {
        variants: presets.scaleIn,
        initial: 'hidden',
        animate: 'visible',
      })}
    >
      {/* Icon */}
      <motion.div
        className={`
          flex items-center justify-center rounded-full mb-4
          ${sizes.icon} ${styles.iconBg}
        `}
        aria-hidden="true"
        {...(shouldAnimate && {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { delay: 0.1 },
        })}
      >
        {styles.icon}
      </motion.div>

      {/* Title */}
      <h3
        className={`
          font-western mb-2
          ${sizes.title} ${styles.titleColor}
        `}
      >
        {title}
      </h3>

      {/* Message */}
      <p
        className={`
          text-desert-stone max-w-md mb-4
          ${sizes.message}
        `}
      >
        {message}
      </p>

      {/* Error Code (for debugging) */}
      {errorCode && (
        <p className="text-wood-grain text-xs mb-4 font-mono">
          Error Code: {errorCode}
        </p>
      )}

      {/* Actions */}
      {(onRetry || onGoBack) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {onRetry && (
            <Button
              variant="primary"
              size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
              onClick={onRetry}
              isLoading={isRetrying}
              loadingText="Retrying..."
              icon={!isRetrying ? '🔄' : undefined}
            >
              {retryText}
            </Button>
          )}
          {onGoBack && (
            <Button
              variant="ghost"
              size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
              onClick={onGoBack}
            >
              Go Back
            </Button>
          )}
        </div>
      )}
    </Container>
  );
};

ErrorState.displayName = 'ErrorState';

export default ErrorState;
