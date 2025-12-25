/**
 * StateView Component
 * Unified component for handling loading, empty, and error states
 *
 * Phase 17: UI Polish - Loading/Empty State Enhancement
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StateView
 *   isLoading={isLoading}
 *   error={error}
 *   isEmpty={data.length === 0}
 *   emptyProps={{ title: 'No items', description: 'Add your first item' }}
 * >
 *   <MyContent data={data} />
 * </StateView>
 *
 * // With retry functionality
 * <StateView
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 *   isEmpty={!data}
 * >
 *   <MyContent />
 * </StateView>
 * ```
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { presets, useAnimationConfig } from '@/lib/animations';

// =============================================================================
// TYPES
// =============================================================================

interface EmptyStateConfig {
  title: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

interface ErrorStateConfig {
  title?: string;
  severity?: 'warning' | 'error' | 'critical';
  retryText?: string;
}

interface StateViewProps {
  /** Content to render when not in loading/error/empty state */
  children: React.ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Loading text to display */
  loadingText?: string;
  /** Error object or message */
  error?: Error | string | null;
  /** Custom error configuration */
  errorConfig?: ErrorStateConfig;
  /** Retry callback for errors */
  onRetry?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Whether data is empty */
  isEmpty?: boolean;
  /** Empty state configuration */
  emptyProps?: EmptyStateConfig;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Custom empty component */
  emptyComponent?: React.ReactNode;
  /** Size variant for states */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to animate state transitions */
  animate?: boolean;
  /** Additional CSS classes for container */
  className?: string;
  /** Minimum height for container */
  minHeight?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const StateView: React.FC<StateViewProps> = ({
  children,
  isLoading = false,
  loadingText,
  error = null,
  errorConfig = {},
  onRetry,
  isRetrying = false,
  isEmpty = false,
  emptyProps,
  loadingComponent,
  errorComponent,
  emptyComponent,
  size = 'md',
  animate = true,
  className = '',
  minHeight = 'min-h-[200px]',
}) => {
  const { shouldAnimate } = useAnimationConfig();
  const enableAnimation = animate && shouldAnimate;

  // Determine current state
  const state: 'loading' | 'error' | 'empty' | 'content' = isLoading
    ? 'loading'
    : error
    ? 'error'
    : isEmpty
    ? 'empty'
    : 'content';

  // Parse error message
  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

  // Render state content
  const renderState = () => {
    switch (state) {
      case 'loading':
        return (
          loadingComponent || (
            <div
              className={`flex items-center justify-center ${minHeight}`}
              key="loading"
            >
              <LoadingSpinner size={size} text={loadingText} />
            </div>
          )
        );

      case 'error':
        return (
          errorComponent || (
            <div
              className={`flex items-center justify-center ${minHeight}`}
              key="error"
            >
              <ErrorState
                title={errorConfig.title}
                message={errorMessage}
                severity={errorConfig.severity}
                onRetry={onRetry}
                retryText={errorConfig.retryText}
                isRetrying={isRetrying}
                size={size}
              />
            </div>
          )
        );

      case 'empty':
        return (
          emptyComponent ||
          (emptyProps && (
            <div
              className={`flex items-center justify-center ${minHeight}`}
              key="empty"
            >
              <EmptyState
                title={emptyProps.title}
                description={emptyProps.description}
                icon={emptyProps.icon}
                actionText={emptyProps.actionText}
                onAction={emptyProps.onAction}
                size={size}
              />
            </div>
          ))
        );

      case 'content':
        return <div key="content">{children}</div>;
    }
  };

  if (!enableAnimation) {
    return <div className={className}>{renderState()}</div>;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          variants={presets.fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {renderState()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

StateView.displayName = 'StateView';

export default StateView;
