/**
 * Spacing & Layout Tokens
 * Authoritative source for spacing, sizing, and layout values
 *
 * Phase 17: UI Polish - Design Token Consolidation
 */

// =============================================================================
// SPACING SCALE (8px base)
// =============================================================================

export const spacing = {
  /** 4px */
  xs: '4px',
  /** 8px */
  sm: '8px',
  /** 16px */
  md: '16px',
  /** 24px */
  lg: '24px',
  /** 32px */
  xl: '32px',
  /** 48px */
  '2xl': '48px',
  /** 64px */
  '3xl': '64px',
} as const;

// Numeric versions for calculations
export const spacingPx = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  /** 4px - subtle rounding */
  sm: '4px',
  /** 8px - standard rounding */
  md: '8px',
  /** 12px - prominent rounding */
  lg: '12px',
  /** 16px - large rounding */
  xl: '16px',
  /** 9999px - pill/circle */
  full: '9999px',
} as const;

// =============================================================================
// Z-INDEX LAYERS
// =============================================================================

export const zIndex = {
  /** 0 - base layer */
  base: 0,
  /** 10 - slightly elevated */
  raised: 10,
  /** 100 - dropdowns, popovers */
  dropdown: 100,
  /** 200 - sticky headers */
  sticky: 200,
  /** 300 - fixed elements */
  fixed: 300,
  /** 900 - modal backdrop */
  modalBackdrop: 900,
  /** 1000 - modals */
  modal: 1000,
  /** 1100 - toasts/notifications */
  toast: 1100,
  /** 1200 - tooltips */
  tooltip: 1200,
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  /** 480px - small phone */
  xs: '480px',
  /** 640px - phone */
  sm: '640px',
  /** 768px - tablet */
  md: '768px',
  /** 1024px - desktop */
  lg: '1024px',
  /** 1280px - large desktop */
  xl: '1280px',
  /** 1536px - extra large */
  '2xl': '1536px',
} as const;

// Numeric versions for JS media queries
export const breakpointsPx = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// =============================================================================
// CARD DIMENSIONS
// =============================================================================

export const cardSizes = {
  default: {
    width: '200px',
    height: '300px',
  },
  small: {
    width: '140px',
    height: '210px',
  },
  large: {
    width: '260px',
    height: '390px',
  },
} as const;

// =============================================================================
// TOUCH TARGETS (Accessibility)
// =============================================================================

export const touchTargets = {
  /** 44px - minimum touch target (WCAG) */
  min: '44px',
  /** 48px - comfortable touch target */
  comfortable: '48px',
  /** 56px - large touch target */
  large: '56px',
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const layout = {
  spacing,
  spacingPx,
  radius,
  zIndex,
  breakpoints,
  breakpointsPx,
  cardSizes,
  touchTargets,
} as const;

export type LayoutToken = typeof layout;
