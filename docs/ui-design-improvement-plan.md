# UI/Design Improvement Plan - Desperados Destiny

## Overview

This plan addresses the UI/UX gaps identified in the comprehensive review. The improvements are organized into 4 phases with clear deliverables, file changes, and estimated complexity.

**Total Scope:** ~50 tasks across 4 phases
**Complexity:** Medium-High (foundational changes + polish)

---

## Phase 1: Foundation Fixes (Critical)

### 1.1 Unified Data Hooks

**Goal:** Single source of truth for game state across all components.

#### Task 1.1.1: Create `useEnergy` Hook
**Files:**
- CREATE: `client/src/hooks/useEnergy.ts`
- MODIFY: `client/src/pages/Actions.tsx`
- MODIFY: `client/src/pages/Combat.tsx`
- MODIFY: `client/src/pages/Game.tsx`
- MODIFY: `client/src/components/layout/PlayerSidebar.tsx`

**Implementation:**
```typescript
// client/src/hooks/useEnergy.ts
import { useEnergyStore } from '@/store/useEnergyStore';
import { useCharacterStore } from '@/store/useCharacterStore';

export const useEnergy = () => {
  const { energy, fetchEnergy } = useEnergyStore();
  const { currentCharacter } = useCharacterStore();

  const current = Math.floor(energy?.currentEnergy ?? currentCharacter?.energy ?? 0);
  const max = energy?.maxEnergy ?? currentCharacter?.maxEnergy ?? 100;
  const regenRate = energy?.regenRate ?? 30;
  const percent = max > 0 ? Math.round((current / max) * 100) : 0;

  const canAfford = (cost: number): boolean => current >= cost;

  const formatRegenTime = (): string => {
    if (current >= max) return 'Full';
    const missing = max - current;
    const hoursToFull = missing / regenRate;
    const minutes = Math.ceil(hoursToFull * 60);
    return `${minutes}m to full`;
  };

  return {
    current,
    max,
    percent,
    regenRate,
    canAfford,
    formatRegenTime,
    refetch: fetchEnergy,
    isLow: percent < 20,
    isEmpty: current === 0,
  };
};
```

#### Task 1.1.2: Create `useStats` Hook
**Files:**
- CREATE: `client/src/hooks/useStats.ts`
- MODIFY: Pages that display character stats

**Implementation:**
```typescript
// client/src/hooks/useStats.ts
import { useCharacterStore } from '@/store/useCharacterStore';

export type StatKey = 'cunning' | 'spirit' | 'combat' | 'craft';

export interface StatInfo {
  key: StatKey;
  value: number;
  label: string;
  abbreviation: string;
  icon: string;
  suit: string;
  color: string;
  description: string;
}

const STAT_CONFIG: Record<StatKey, Omit<StatInfo, 'key' | 'value'>> = {
  cunning: {
    label: 'Cunning',
    abbreviation: 'CUN',
    icon: '🎭',
    suit: '♠',
    color: 'from-gray-600 to-gray-400',
    description: 'Stealth, deception, and social manipulation',
  },
  spirit: {
    label: 'Spirit',
    abbreviation: 'SPI',
    icon: '✨',
    suit: '♥',
    color: 'from-red-700 to-red-400',
    description: 'Willpower, luck, and mystical power',
  },
  combat: {
    label: 'Combat',
    abbreviation: 'COM',
    icon: '⚔️',
    suit: '♣',
    color: 'from-green-700 to-green-400',
    description: 'Fighting prowess and weapon mastery',
  },
  craft: {
    label: 'Craft',
    abbreviation: 'CRA',
    icon: '🔧',
    suit: '♦',
    color: 'from-blue-600 to-blue-400',
    description: 'Building, crafting, and technical skills',
  },
};

export const useStats = () => {
  const { currentCharacter } = useCharacterStore();
  const stats = currentCharacter?.stats;

  const getStat = (key: StatKey): StatInfo => ({
    key,
    value: stats?.[key] ?? 0,
    ...STAT_CONFIG[key],
  });

  const getAllStats = (): StatInfo[] =>
    (['cunning', 'spirit', 'combat', 'craft'] as StatKey[]).map(getStat);

  const getStatForAction = (statUsed: string): StatInfo | null => {
    const key = statUsed.toLowerCase() as StatKey;
    return STAT_CONFIG[key] ? getStat(key) : null;
  };

  return {
    getStat,
    getAllStats,
    getStatForAction,
    total: getAllStats().reduce((sum, s) => sum + s.value, 0),
  };
};
```

#### Task 1.1.3: Create `useCurrency` Hook
**Files:**
- CREATE: `client/src/hooks/useCurrency.ts`

**Implementation:**
```typescript
// client/src/hooks/useCurrency.ts
import { useCharacterStore } from '@/store/useCharacterStore';

export const useCurrency = () => {
  const { currentCharacter } = useCharacterStore();

  const dollars = currentCharacter?.gold ?? 0; // gold field stores dollars

  const format = (amount: number, compact: boolean = false): string => {
    if (compact) {
      if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
      if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const canAfford = (cost: number): boolean => dollars >= cost;

  return {
    dollars,
    formatted: format(dollars),
    formattedCompact: format(dollars, true),
    canAfford,
    format,
  };
};
```

---

### 1.2 Unified Modal Component

**Goal:** Single modal pattern with consistent animation and accessibility.

#### Task 1.2.1: Create Enhanced Modal Component
**Files:**
- MODIFY: `client/src/components/ui/Modal.tsx`
- CREATE: `client/src/components/ui/ConfirmDialog.tsx`

**Implementation:**
```typescript
// client/src/components/ui/Modal.tsx (enhanced)
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

const variantClasses = {
  default: 'border-wood-grain/50',
  danger: 'border-blood-red/50',
  success: 'border-green-500/50',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  variant = 'default',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  footer,
  ...ariaProps
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previous focus and restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Trap focus within modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const first = focusableElements[0] as HTMLElement;
    const last = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!isOpen) return null;

  const titleId = ariaProps['aria-labelledby'] || (title ? 'modal-title' : undefined);
  const descId = ariaProps['aria-describedby'] || (description ? 'modal-desc' : undefined);

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-gradient-to-b from-wood-dark to-wood-medium
          border-2 ${variantClasses[variant]}
          rounded-lg shadow-2xl
          animate-scale-in
          max-h-[90vh] overflow-hidden flex flex-col
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-wood-grain/30">
            {title && (
              <h2 id={titleId} className="text-xl font-western text-gold-light">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-desert-stone hover:text-gold-light text-2xl p-1 -m-1 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p id={descId} className="px-4 pt-2 text-sm text-desert-stone">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 p-4 border-t border-wood-grain/30 bg-wood-darker/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Sub-components for composition
Modal.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="text-desert-sand">{children}</div>
);

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end gap-2 mt-4">{children}</div>
);
```

#### Task 1.2.2: Create ConfirmDialog Component
**Files:**
- CREATE: `client/src/components/ui/ConfirmDialog.tsx`

```typescript
// client/src/components/ui/ConfirmDialog.tsx
import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      variant={variant}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-desert-sand">{message}</p>
    </Modal>
  );
};
```

---

### 1.3 Animation System

**Goal:** Consistent enter/exit animations for all transitions.

#### Task 1.3.1: Add Modal Animations to CSS
**Files:**
- MODIFY: `client/src/styles/animations.css`

```css
/* Modal Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}

.animate-fade-out {
  animation: fade-out 0.2s ease-in forwards;
}

.animate-scale-in {
  animation: scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-scale-out {
  animation: scale-out 0.2s ease-in forwards;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out forwards;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
```

#### Task 1.3.2: Add Tailwind Animation Config
**Files:**
- MODIFY: `client/tailwind.config.js`

```javascript
// Add to animation section
animation: {
  // ... existing animations
  'fade-in': 'fade-in 0.2s ease-out forwards',
  'fade-out': 'fade-out 0.2s ease-in forwards',
  'scale-in': 'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  'scale-out': 'scale-out 0.2s ease-in forwards',
  'slide-up': 'slide-up 0.3s ease-out forwards',
  'shake': 'shake 0.5s ease-in-out',
  'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
},
keyframes: {
  // ... existing keyframes
  'bounce-in': {
    '0%': { transform: 'scale(0)', opacity: '0' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
}
```

---

### 1.4 Accessibility Audit Fixes

#### Task 1.4.1: Add ARIA to Tab Components
**Files:**
- MODIFY: `client/src/components/layout/PlayerSidebar.tsx`
- CREATE: `client/src/components/ui/Tabs.tsx`

```typescript
// client/src/components/ui/Tabs.tsx
import React, { useState, createContext, useContext } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultTab, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabListProps {
  children: React.ReactNode;
  className?: string;
  'aria-label': string;
}

export const TabList: React.FC<TabListProps> = ({ children, className, 'aria-label': ariaLabel }) => (
  <div role="tablist" aria-label={ariaLabel} className={className}>
    {children}
  </div>
);

interface TabProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ id, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(id)}
      className={`
        ${className}
        ${isActive ? 'border-b-2 border-gold-light text-gold-light' : 'text-desert-stone'}
        px-4 py-2 font-serif transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light
      `}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  const { activeTab } = context;
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
};

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

#### Task 1.4.2: Add Progress Bar ARIA
**Files:**
- CREATE: `client/src/components/ui/ProgressBar.tsx`

```typescript
// client/src/components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  showLabel?: boolean;
  showValue?: boolean;
  variant?: 'default' | 'energy' | 'health' | 'xp';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

const variantColors = {
  default: 'from-gold-dark to-gold-light',
  energy: 'from-gold-dark to-gold-light',
  health: 'from-red-700 to-red-500',
  xp: 'from-green-700 to-green-500',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showLabel = false,
  showValue = false,
  variant = 'default',
  size = 'md',
  animate = true,
  className = '',
}) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={className}>
      {(showLabel || showValue) && (
        <div className="flex justify-between text-xs text-desert-sand mb-1">
          {showLabel && <span>{label}</span>}
          {showValue && <span>{value}/{max}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={`
          ${sizeClasses[size]}
          bg-wood-dark/50 rounded-full overflow-hidden
        `}
      >
        <div
          className={`
            h-full bg-gradient-to-r ${variantColors[variant]}
            ${animate ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
```

#### Task 1.4.3: Add Focus Visible Styles
**Files:**
- MODIFY: `client/src/styles/theme.css`

```css
/* Focus Visible Styles */
.focus-visible-gold:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.5);
}

.focus-visible-ring:focus-visible {
  outline: 2px solid var(--color-gold-light);
  outline-offset: 2px;
}

/* Interactive elements default focus */
button:focus-visible,
a:focus-visible,
[role="button"]:focus-visible,
[tabindex="0"]:focus-visible {
  outline: 2px solid var(--color-gold-light);
  outline-offset: 2px;
}

/* Skip link enhancement */
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: 1rem;
  background: var(--color-wood-dark);
  color: var(--color-gold-light);
  text-decoration: none;
  font-weight: bold;
}

.skip-link:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}
```

---

## Phase 2: UX Polish

### 2.1 Navigation Hierarchy

#### Task 2.1.1: Create Navigation Tile Component
**Files:**
- CREATE: `client/src/components/ui/NavTile.tsx`

```typescript
// client/src/components/ui/NavTile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavTileProps {
  to: string;
  icon: string;
  title: string;
  subtitle?: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'danger' | 'success' | 'new';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'featured' | 'locked';
  disabled?: boolean;
  disabledReason?: string;
  isNew?: boolean;
  'data-testid'?: string;
  'data-tutorial-target'?: string;
}

const sizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const iconSizes = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

const badgeVariants = {
  default: 'bg-gold-dark text-wood-dark',
  danger: 'bg-blood-red text-white',
  success: 'bg-green-600 text-white',
  new: 'bg-purple-600 text-white animate-pulse',
};

export const NavTile: React.FC<NavTileProps> = ({
  to,
  icon,
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  size = 'md',
  variant = 'default',
  disabled = false,
  disabledReason,
  isNew = false,
  'data-testid': testId,
  'data-tutorial-target': tutorialTarget,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!disabled) {
      navigate(to);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      navigate(to);
    }
  };

  const baseClasses = `
    group relative overflow-hidden rounded-lg border transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2
    ${sizeClasses[size]}
  `;

  const variantClasses = {
    default: `
      border-wood-grain/50
      hover:border-gold-light hover:shadow-lg hover:shadow-gold-dark/20
      bg-gradient-to-b from-wood-dark to-wood-medium
    `,
    featured: `
      border-gold-light/50
      hover:border-gold-light hover:shadow-xl hover:shadow-gold-dark/30
      bg-gradient-to-b from-gold-dark/20 to-wood-medium
      ring-1 ring-gold-light/20
    `,
    locked: `
      border-gray-600
      bg-gradient-to-b from-gray-800 to-gray-900
      opacity-60 cursor-not-allowed
    `,
  };

  const appliedVariant = disabled ? 'locked' : variant;

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[appliedVariant]}`}
      data-testid={testId}
      data-tutorial-target={tutorialTarget}
      aria-disabled={disabled}
      title={disabled ? disabledReason : undefined}
    >
      {/* Badge */}
      {badge !== undefined && (
        <span
          className={`
            absolute top-2 right-2
            px-2 py-0.5 rounded-full text-xs font-bold
            ${badgeVariants[badgeVariant]}
          `}
        >
          {badge}
        </span>
      )}

      {/* New indicator */}
      {isNew && !badge && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
      )}

      {/* Content */}
      <div className="text-center">
        <div className={`${iconSizes[size]} mb-2 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="font-western text-desert-sand group-hover:text-gold-light transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-desert-stone mt-1">
            {disabled ? disabledReason || 'Locked' : subtitle}
          </p>
        )}
      </div>

      {/* Locked overlay */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-2xl">🔒</span>
        </div>
      )}

      {/* Featured glow effect */}
      {variant === 'featured' && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-t from-gold-light/10 to-transparent pointer-events-none" />
      )}
    </button>
  );
};
```

#### Task 2.1.2: Redesign Game.tsx Navigation Grid
**Files:**
- MODIFY: `client/src/pages/Game.tsx`

```typescript
// Replace the current grid with hierarchical layout:

{/* Primary Actions - Large tiles */}
<div className="grid grid-cols-2 gap-4">
  <NavTile
    to="/game/actions"
    icon="📜"
    title="Jobs & Actions"
    subtitle="Earn gold & XP"
    size="lg"
    variant="featured"
    disabled={isJailed}
    disabledReason="Locked while jailed"
    data-testid="nav-actions"
  />
  <NavTile
    to="/game/combat"
    icon="⚔️"
    title="Combat"
    subtitle="Fight & duel"
    size="lg"
    disabled={isJailed}
    disabledReason="Locked while jailed"
    data-testid="nav-combat"
  />
</div>

{/* Secondary Actions - Medium tiles */}
<div className="grid grid-cols-3 gap-3">
  <NavTile to="/game/skills" icon="📚" title="Skills" subtitle="Train abilities" />
  <NavTile to="/game/quests" icon="📖" title="Quests" subtitle="Missions" badge={activeQuestCount} />
  <NavTile to="/game/contracts" icon="📋" title="Contracts" subtitle="Daily jobs" isNew={hasNewContracts} />
</div>

{/* Tertiary Actions - Small tiles */}
<div className="grid grid-cols-4 gap-2">
  <NavTile to="/game/inventory" icon="🎒" title="Items" size="sm" />
  <NavTile to="/game/shop" icon="🏪" title="Shop" size="sm" />
  <NavTile to="/game/mail" icon="📨" title="Mail" size="sm" badge={unreadMail} badgeVariant="danger" />
  <NavTile to="/game/friends" icon="🤝" title="Social" size="sm" />
</div>
```

---

### 2.2 Feedback System

#### Task 2.2.1: Create Animated Counter Component
**Files:**
- CREATE: `client/src/components/ui/AnimatedCounter.tsx`

```typescript
// client/src/components/ui/AnimatedCounter.tsx
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  formatter = (v) => v.toLocaleString(),
  className = '',
  onComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();
    const diff = endValue - startValue;

    if (diff === 0) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(startValue + diff * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, onComplete]);

  const isIncreasing = value > previousValue.current;
  const isDecreasing = value < previousValue.current;

  return (
    <span
      className={`
        ${className}
        ${isIncreasing ? 'text-green-400' : ''}
        ${isDecreasing ? 'text-red-400' : ''}
        transition-colors duration-300
      `}
    >
      {prefix}{formatter(displayValue)}{suffix}
    </span>
  );
};
```

#### Task 2.2.2: Create Toast Notification Enhancements
**Files:**
- MODIFY: `client/src/components/ui/ToastContainer.tsx`

```typescript
// Add success/failure animations to toasts
const toastVariants = {
  success: {
    icon: '✓',
    className: 'bg-green-800 border-green-600',
    animation: 'animate-bounce-in',
  },
  error: {
    icon: '✗',
    className: 'bg-red-800 border-red-600',
    animation: 'animate-shake',
  },
  warning: {
    icon: '⚠',
    className: 'bg-yellow-800 border-yellow-600',
    animation: 'animate-slide-up',
  },
  info: {
    icon: 'ℹ',
    className: 'bg-blue-800 border-blue-600',
    animation: 'animate-slide-up',
  },
  reward: {
    icon: '💰',
    className: 'bg-gold-dark border-gold-light',
    animation: 'animate-bounce-in',
  },
};
```

---

### 2.3 Empty States

#### Task 2.3.1: Enhance EmptyState Component
**Files:**
- MODIFY: `client/src/components/ui/EmptyState.tsx`

```typescript
// client/src/components/ui/EmptyState.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'compact' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { icon: 'text-3xl', title: 'text-base', desc: 'text-xs' },
  md: { icon: 'text-5xl', title: 'text-lg', desc: 'text-sm' },
  lg: { icon: 'text-6xl', title: 'text-xl', desc: 'text-base' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
}) => {
  const navigate = useNavigate();
  const sizes = sizeClasses[size];

  const handleAction = (actionConfig: typeof action) => {
    if (!actionConfig) return;
    if (actionConfig.to) {
      navigate(actionConfig.to);
    } else if (actionConfig.onClick) {
      actionConfig.onClick();
    }
  };

  const content = (
    <div className="text-center py-8 px-4">
      <div className={`${sizes.icon} mb-4 opacity-50`}>{icon}</div>
      <h3 className={`${sizes.title} font-western text-desert-sand mb-2`}>
        {title}
      </h3>
      {description && (
        <p className={`${sizes.desc} text-desert-stone mb-4 max-w-sm mx-auto`}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={() => handleAction(action)}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={() => handleAction(secondaryAction)}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="bg-wood-dark/30 rounded-lg border border-wood-grain/30">
        {content}
      </div>
    );
  }

  return content;
};
```

---

### 2.4 Loading States

#### Task 2.4.1: Create Themed Loading Components
**Files:**
- CREATE: `client/src/components/ui/ThemedLoader.tsx`

```typescript
// client/src/components/ui/ThemedLoader.tsx
import React from 'react';

interface ThemedLoaderProps {
  variant?: 'spinner' | 'cards' | 'tumbleweed' | 'wanted';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemedLoader: React.FC<ThemedLoaderProps> = ({
  variant = 'spinner',
  text,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'cards':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${sizeClasses[size]}
                  bg-gradient-to-br from-red-800 to-red-900
                  rounded border-2 border-gold-light
                  animate-bounce
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'tumbleweed':
        return (
          <div className={`${sizeClasses[size]} text-4xl animate-spin`}>
            🌾
          </div>
        );

      case 'wanted':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-4 border-dashed border-gold-light rounded animate-pulse`} />
            <span className="absolute inset-0 flex items-center justify-center text-gold-light font-western text-xs">
              ?
            </span>
          </div>
        );

      case 'spinner':
      default:
        return (
          <div className={`${sizeClasses[size]} relative`}>
            {/* Sheriff star spinner */}
            <svg
              className="animate-spin text-gold-light"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6.4-4.8-6.4 4.8 2.4-7.4-6-4.6h7.6z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoader()}
      {text && (
        <p className="text-desert-sand font-serif text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
```

---

## Phase 3: Visual Polish

### 3.1 Component Documentation

#### Task 3.1.1: Create Storybook Stories
**Files:**
- CREATE: `client/src/components/ui/Button.stories.tsx`
- CREATE: `client/src/components/ui/Card.stories.tsx`
- CREATE: `client/src/components/ui/Modal.stories.tsx`

```typescript
// client/src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    icon: '⚔️',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
    loadingText: 'Processing...',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

### 3.2 Design Tokens

#### Task 3.2.1: Create Centralized Token File
**Files:**
- CREATE: `client/src/styles/tokens.ts`

```typescript
// client/src/styles/tokens.ts

export const colors = {
  // Primary
  primary: {
    DEFAULT: 'var(--color-gold-light)',
    dark: 'var(--color-gold-dark)',
    light: 'var(--color-gold-pale)',
  },

  // Secondary
  secondary: {
    DEFAULT: 'var(--color-wood-medium)',
    dark: 'var(--color-wood-dark)',
    light: 'var(--color-wood-light)',
  },

  // Semantic
  success: 'var(--color-green-500)',
  warning: 'var(--color-yellow-500)',
  danger: 'var(--color-blood-red)',
  info: 'var(--color-blue-500)',

  // Text
  text: {
    primary: 'var(--color-desert-sand)',
    secondary: 'var(--color-desert-stone)',
    muted: 'var(--color-wood-grain)',
    inverse: 'var(--color-wood-dark)',
  },

  // Background
  bg: {
    primary: 'var(--color-wood-dark)',
    secondary: 'var(--color-wood-medium)',
    surface: 'var(--color-desert-dust)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const typography = {
  fontFamily: {
    western: "'Rye', serif",
    serif: "'Merriweather', serif",
    sans: "'Inter', sans-serif",
    handwritten: "'Permanent Marker', cursive",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  },
} as const;

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modalBackdrop: 900,
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
} as const;
```

---

## Phase 4: Mobile & Performance

### 4.1 Mobile Navigation

#### Task 4.1.1: Create Bottom Navigation Component
**Files:**
- CREATE: `client/src/components/layout/BottomNav.tsx`

```typescript
// client/src/components/layout/BottomNav.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/game', icon: '🏠', label: 'Home' },
  { path: '/game/actions', icon: '📜', label: 'Actions' },
  { path: '/game/combat', icon: '⚔️', label: 'Combat' },
  { path: '/game/inventory', icon: '🎒', label: 'Items' },
  { path: '/game/profile', icon: '👤', label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-sticky
        bg-wood-dark border-t border-wood-grain/30
        safe-area-bottom
        lg:hidden
      "
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center justify-center
                  w-16 h-full
                  transition-colors
                  ${isActive ? 'text-gold-light' : 'text-desert-stone'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-xl relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blood-red rounded-full text-xs text-white flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
```

#### Task 4.1.2: Responsive Sidebar
**Files:**
- MODIFY: `client/src/components/layout/GameLayout.tsx`

```typescript
// Add responsive sidebar behavior
const [sidebarMode, setSidebarMode] = useState<'full' | 'icons' | 'hidden'>('full');

// Auto-detect based on viewport
useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setSidebarMode('hidden');
    } else if (width < 1024) {
      setSidebarMode('icons');
    } else {
      setSidebarMode('full');
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 4.2 Touch Optimization

#### Task 4.2.1: Create Touch-Friendly Card Component
**Files:**
- MODIFY: `client/src/components/game/CardHand.tsx`

```typescript
// Add touch handlers for mobile
const handleTouchStart = (index: number) => (e: React.TouchEvent) => {
  // Long press for card preview
  touchTimerRef.current = setTimeout(() => {
    setPreviewCard(index);
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, 300);
};

const handleTouchEnd = () => {
  if (touchTimerRef.current) {
    clearTimeout(touchTimerRef.current);
  }
  setPreviewCard(null);
};

// Responsive card sizes
const cardSize = useMemo(() => {
  if (typeof window === 'undefined') return 'md';
  if (window.innerWidth < 640) return 'sm';
  if (window.innerWidth < 1024) return 'md';
  return 'lg';
}, []);
```

---

## Implementation Checklist

### Phase 1: Foundation (Days 1-3)
- [ ] 1.1.1 Create useEnergy hook
- [ ] 1.1.2 Create useStats hook
- [ ] 1.1.3 Create useCurrency hook
- [ ] 1.2.1 Enhance Modal component
- [ ] 1.2.2 Create ConfirmDialog component
- [ ] 1.3.1 Add modal animations to CSS
- [ ] 1.3.2 Update Tailwind animation config
- [ ] 1.4.1 Create Tabs component with ARIA
- [ ] 1.4.2 Create ProgressBar with ARIA
- [ ] 1.4.3 Add focus visible styles

### Phase 2: UX Polish (Days 4-7)
- [ ] 2.1.1 Create NavTile component
- [ ] 2.1.2 Redesign Game.tsx navigation
- [ ] 2.2.1 Create AnimatedCounter
- [ ] 2.2.2 Enhance toast notifications
- [ ] 2.3.1 Enhance EmptyState component
- [ ] 2.4.1 Create ThemedLoader component

### Phase 3: Visual Polish (Days 8-12)
- [ ] 3.1.1 Create Storybook stories for Button
- [ ] 3.1.2 Create Storybook stories for Card
- [ ] 3.1.3 Create Storybook stories for Modal
- [ ] 3.2.1 Create design tokens file

### Phase 4: Mobile (Days 13-15)
- [ ] 4.1.1 Create BottomNav component
- [ ] 4.1.2 Make sidebar responsive
- [ ] 4.2.1 Add touch handlers to CardHand

---

## Success Metrics

1. **Consistency:** Single source of truth for energy/stats/currency
2. **Accessibility:** WCAG 2.1 AA compliance
3. **Mobile:** All touch targets 44x44px minimum
4. **Performance:** No layout shift on load
5. **Documentation:** 100% component coverage in Storybook

---

## Files Summary

### New Files (14)
- `client/src/hooks/useEnergy.ts`
- `client/src/hooks/useStats.ts`
- `client/src/hooks/useCurrency.ts`
- `client/src/components/ui/ConfirmDialog.tsx`
- `client/src/components/ui/Tabs.tsx`
- `client/src/components/ui/ProgressBar.tsx`
- `client/src/components/ui/NavTile.tsx`
- `client/src/components/ui/AnimatedCounter.tsx`
- `client/src/components/ui/ThemedLoader.tsx`
- `client/src/components/layout/BottomNav.tsx`
- `client/src/styles/tokens.ts`
- `client/src/components/ui/Button.stories.tsx`
- `client/src/components/ui/Card.stories.tsx`
- `client/src/components/ui/Modal.stories.tsx`

### Modified Files (12)
- `client/src/components/ui/Modal.tsx`
- `client/src/components/ui/EmptyState.tsx`
- `client/src/components/ui/ToastContainer.tsx`
- `client/src/components/ui/index.ts`
- `client/src/components/layout/PlayerSidebar.tsx`
- `client/src/components/layout/GameLayout.tsx`
- `client/src/components/game/CardHand.tsx`
- `client/src/pages/Game.tsx`
- `client/src/pages/Actions.tsx`
- `client/src/pages/Combat.tsx`
- `client/src/styles/animations.css`
- `client/tailwind.config.js`
