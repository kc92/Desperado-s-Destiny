/**
 * TabNavigation Component
 * Reusable western-styled tab navigation with full ARIA support
 *
 * Phase 17: UI Polish - Component Standardization
 * Phase 1: Foundation - Enhanced keyboard navigation
 *
 * @example
 * ```tsx
 * <TabNavigation
 *   tabs={[
 *     { id: 'friends', label: 'Friends', count: 5 },
 *     { id: 'requests', label: 'Requests', count: 2 },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 */

import React, { useRef, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface Tab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon (emoji or React node) */
  icon?: React.ReactNode;
  /** Optional count badge */
  count?: number;
  /** Whether tab is disabled */
  disabled?: boolean;
}

export interface TabNavigationProps {
  /** Array of tab configurations */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
  /** Visual variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether tabs should fill available width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// STYLE MAPPINGS
// =============================================================================

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const badgeSizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2 py-1',
};

// =============================================================================
// COMPONENT
// =============================================================================

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Get enabled tabs for keyboard navigation
  const enabledTabs = tabs.filter((t) => !t.disabled);

  // Handle keyboard navigation per ARIA tabs pattern
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentTab: Tab) => {
      const currentIndex = enabledTabs.findIndex((t) => t.id === currentTab.id);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % enabledTabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = enabledTabs.length - 1;
          break;
      }

      if (nextIndex !== null) {
        const nextTab = enabledTabs[nextIndex];
        const nextButton = tabRefs.current.get(nextTab.id);
        if (nextButton) {
          nextButton.focus();
          onTabChange(nextTab.id);
        }
      }
    },
    [enabledTabs, onTabChange]
  );

  const setTabRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(id, el);
    } else {
      tabRefs.current.delete(id);
    }
  }, []);

  const getTabClasses = (tab: Tab) => {
    const isActive = activeTab === tab.id;
    const isDisabled = tab.disabled;

    const baseClasses = [
      sizeClasses[size],
      'font-semibold rounded-lg transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-wood-dark',
      fullWidth ? 'flex-1' : '',
    ];

    if (isDisabled) {
      return [...baseClasses, 'opacity-50 cursor-not-allowed bg-wood-dark/30 text-desert-stone'].join(' ');
    }

    if (variant === 'default') {
      return [
        ...baseClasses,
        isActive
          ? 'bg-gold-light text-wood-dark shadow-md'
          : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70 hover:text-desert-sand',
      ].join(' ');
    }

    if (variant === 'pills') {
      return [
        ...baseClasses,
        'rounded-full',
        isActive
          ? 'bg-gold-medium text-wood-darker'
          : 'bg-transparent text-desert-stone hover:bg-wood-dark/30 hover:text-desert-sand',
      ].join(' ');
    }

    if (variant === 'underline') {
      return [
        ...baseClasses,
        'rounded-none border-b-2',
        isActive
          ? 'border-gold-light text-gold-light'
          : 'border-transparent text-desert-stone hover:border-wood-grain hover:text-desert-sand',
      ].join(' ');
    }

    return baseClasses.join(' ');
  };

  const getBadgeClasses = (tab: Tab) => {
    const isActive = activeTab === tab.id;

    return [
      badgeSizeClasses[size],
      'rounded-full ml-2 font-normal',
      isActive
        ? 'bg-wood-dark text-gold-light'
        : 'bg-wood-grain/30 text-desert-stone',
    ].join(' ');
  };

  return (
    <div
      className={`flex ${fullWidth ? '' : 'flex-wrap'} gap-2 ${className}`}
      role="tablist"
      aria-label="Navigation tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={(el) => setTabRef(tab.id, el)}
            role="tab"
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab)}
            disabled={tab.disabled}
            className={getTabClasses(tab)}
          >
            <span className="inline-flex items-center">
              {tab.icon && <span className="mr-2" aria-hidden="true">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={getBadgeClasses(tab)} aria-label={`${tab.count} items`}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;
