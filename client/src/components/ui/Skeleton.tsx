/**
 * Skeleton Component
 * Western-themed loading placeholder with shimmer animation
 */

import React from 'react';
import type { BaseComponentProps } from '@/types';

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'button' | 'stat' | 'bar';

interface SkeletonProps extends BaseComponentProps {
  /** Visual variant of the skeleton */
  variant?: SkeletonVariant;
  /** Width (CSS value or Tailwind class) */
  width?: string;
  /** Height (CSS value or Tailwind class) */
  height?: string;
  /** Whether to animate the shimmer effect */
  animate?: boolean;
  /** Number of items to render (for lists) */
  count?: number;
  /** Gap between items when count > 1 */
  gap?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  card: 'h-32 rounded-lg',
  avatar: 'h-12 w-12 rounded-full',
  button: 'h-10 w-24 rounded-lg',
  stat: 'h-16 w-20 rounded-lg',
  bar: 'h-3 rounded-full',
};

const gapStyles = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

/**
 * Skeleton loading placeholder with western-themed styling
 *
 * @example
 * // Single text skeleton
 * <Skeleton variant="text" width="w-3/4" />
 *
 * // Multiple text lines
 * <Skeleton variant="text" count={3} />
 *
 * // Card skeleton
 * <Skeleton variant="card" />
 *
 * // Avatar skeleton
 * <Skeleton variant="avatar" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animate = true,
  count = 1,
  gap = 'md',
  className = '',
}) => {
  const baseStyle = variantStyles[variant];
  const shimmerStyle = animate
    ? 'animate-pulse bg-gradient-to-r from-wood-grain/30 via-desert-stone/20 to-wood-grain/30 bg-[length:200%_100%]'
    : 'bg-wood-grain/30';

  // Custom dimensions override variant defaults
  const widthStyle = width || (variant === 'text' ? 'w-full' : '');
  const heightStyle = height || '';

  const skeletonElement = (index: number) => (
    <div
      key={index}
      className={`${baseStyle} ${shimmerStyle} ${widthStyle} ${heightStyle} ${className}`}
      aria-hidden="true"
      role="presentation"
    />
  );

  if (count === 1) {
    return skeletonElement(0);
  }

  return (
    <div className={`flex flex-col ${gapStyles[gap]}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, i) => skeletonElement(i))}
    </div>
  );
};

/**
 * Pre-composed skeleton for character stat blocks
 */
export const StatSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <Skeleton variant="stat" />
        <Skeleton variant="text" width="w-16" />
      </div>
    ))}
  </div>
);

/**
 * Pre-composed skeleton for list items
 */
export const ListItemSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-wood-dark/20">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="w-1/3" />
          <Skeleton variant="text" width="w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Pre-composed skeleton for cards in a grid
 */
export const CardGridSkeleton: React.FC<{ count?: number; columns?: 2 | 3 | 4 }> = ({
  count = 6,
  columns = 3
}) => {
  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colsClass[columns]} gap-4`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4 rounded-lg bg-wood-dark/20 space-y-3">
          <Skeleton variant="text" width="w-1/2" />
          <Skeleton variant="bar" />
          <Skeleton variant="text" width="w-3/4" />
        </div>
      ))}
    </div>
  );
};

/**
 * Pre-composed skeleton for dashboard stats header
 */
export const DashboardStatsSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 rounded-lg bg-wood-dark/30">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" className="w-16 h-16" />
      <div className="space-y-2">
        <Skeleton variant="text" width="w-32" height="h-6" />
        <Skeleton variant="text" width="w-24" />
      </div>
    </div>
    <div className="flex gap-4">
      <div className="text-center space-y-1">
        <Skeleton variant="stat" className="w-16 h-8" />
        <Skeleton variant="text" width="w-12" />
      </div>
      <div className="text-center space-y-1">
        <Skeleton variant="stat" className="w-16 h-8" />
        <Skeleton variant="text" width="w-12" />
      </div>
    </div>
  </div>
);

/**
 * Pre-composed skeleton for energy/progress bars
 */
export const ProgressBarSkeleton: React.FC = () => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <Skeleton variant="text" width="w-20" />
      <Skeleton variant="text" width="w-12" />
    </div>
    <Skeleton variant="bar" height="h-4" />
  </div>
);

// Display name for React DevTools
Skeleton.displayName = 'Skeleton';
StatSkeleton.displayName = 'StatSkeleton';
ListItemSkeleton.displayName = 'ListItemSkeleton';
CardGridSkeleton.displayName = 'CardGridSkeleton';
DashboardStatsSkeleton.displayName = 'DashboardStatsSkeleton';
ProgressBarSkeleton.displayName = 'ProgressBarSkeleton';

export default Skeleton;
