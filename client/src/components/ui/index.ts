/**
 * UI Components Barrel Export
 * Central export point for all reusable UI components
 *
 * Phase 17: UI Polish - Added ErrorState, StateView
 * Phase 1: Foundation - Enhanced Modal, ProgressBar, TabNavigation with ARIA
 */

// Core Components
export { Button, type ButtonProps } from './Button';
export { Card } from './Card';
export { ConfirmDialog } from './ConfirmDialog';
export { Input } from './Input';
export { Modal, type ModalProps, type ModalVariant } from './Modal';
export { ProgressBar, type ProgressBarProps, type ProgressBarColor } from './ProgressBar';
export { NavLink } from './NavLink';
export { TabNavigation, type Tab, type TabNavigationProps } from './TabNavigation';

// State Components (Loading, Empty, Error)
export { LoadingSpinner } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export { StateView } from './StateView';

// Skeleton Components
export {
  Skeleton,
  StatSkeleton,
  ListItemSkeleton,
  CardGridSkeleton,
  DashboardStatsSkeleton,
  ProgressBarSkeleton,
} from './Skeleton';

// Toast & Tooltips
export { ToastContainer } from './Toast';
export { Tooltip, SimpleTooltip, InfoTooltip } from './Tooltip';

// Game UI
export { GameClock } from './GameClock';
export { DayNightOverlay } from './DayNightOverlay';

// Western-themed Components
export { SheriffStarSpinner } from './SheriffStarSpinner';
export { WesternLoadingScreen } from './WesternLoadingScreen';
export { WesternPanel } from './WesternPanel';

// Phase 2: UX Polish Components
export { NavTile, type NavTileProps, type NavTileSize, type NavTileVariant, type BadgeVariant } from './NavTile';
export { AnimatedCounter, type AnimatedCounterProps, type EasingFunction } from './AnimatedCounter';
export { ThemedLoader, type ThemedLoaderProps, type LoaderVariant } from './ThemedLoader';

// Deprecated - use Button instead
export { WesternButton } from './WesternButton';
