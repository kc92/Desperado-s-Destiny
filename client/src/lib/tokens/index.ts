/**
 * Design Tokens - Central Export
 * Authoritative source for all design values in Desperados Destiny
 *
 * Phase 17: UI Polish - Design Token Consolidation
 *
 * @example
 * ```tsx
 * import { tokens } from '@/lib/tokens';
 *
 * const style = {
 *   color: tokens.colors.gold.light,
 *   padding: tokens.spacing.md,
 *   fontFamily: tokens.typography.fontFamily.western,
 * };
 * ```
 */

export * from './colors';
export * from './spacing';
export * from './typography';

import { colors, type ColorToken } from './colors';
import { layout, type LayoutToken } from './spacing';
import { typography, type TypographyToken } from './typography';

// =============================================================================
// SHADOWS (Composite definitions using colors)
// =============================================================================

export const shadows = {
  /** Subtle shadow for cards */
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  /** Medium shadow for elevated elements */
  md: '0 4px 8px rgba(0, 0, 0, 0.2)',
  /** Large shadow for modals */
  lg: '0 12px 24px rgba(0, 0, 0, 0.3)',
  /** Extra large shadow for popovers */
  xl: '0 20px 40px rgba(0, 0, 0, 0.4)',

  /** Wood panel shadow */
  wood: '0 4px 6px -1px rgba(62, 39, 35, 0.3), 0 2px 4px -1px rgba(62, 39, 35, 0.2)',
  /** Leather texture shadow */
  leather: '0 4px 6px -1px rgba(111, 78, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  /** Gold glow effect */
  gold: '0 4px 14px 0 rgba(255, 215, 0, 0.39)',
  /** Blood/danger glow */
  blood: '0 0 20px rgba(139, 0, 0, 0.5)',
  /** Inner wood shadow */
  innerWood: 'inset 0 2px 4px 0 rgba(62, 39, 35, 0.3)',

  /** Focus ring - gold */
  focusGold: '0 0 0 3px rgba(218, 165, 32, 0.4)',
  /** Focus ring - blood */
  focusBlood: '0 0 0 3px rgba(220, 20, 60, 0.4)',
} as const;

// =============================================================================
// TEXT SHADOWS (for text glow effects)
// =============================================================================

export const textShadows = {
  /** Gold glow for important text */
  goldGlow: '0 0 20px rgba(255, 215, 0, 0.8)',
  /** Subtle gold glow */
  goldSubtle: '0 0 10px rgba(255, 215, 0, 0.5)',
  /** Blood/damage text glow */
  bloodGlow: '0 0 20px rgba(139, 0, 0, 0.5)',
  /** Success text glow */
  successGlow: '0 4px 8px rgba(34, 197, 94, 0.5)',
  /** Dark outline for readability */
  darkOutline: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  /** Drop shadow for floating text */
  drop: '0 2px 4px rgba(0, 0, 0, 0.5)',
  /** Crisp outline for contrast */
  crispOutline: '1px 1px 0 rgba(0, 0, 0, 0.8), -1px -1px 0 rgba(0, 0, 0, 0.8), 1px -1px 0 rgba(0, 0, 0, 0.8), -1px 1px 0 rgba(0, 0, 0, 0.8)',
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Add opacity to a hex color
 * @param hex - Hex color (e.g., '#FFD700')
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 *
 * @example
 * withOpacity('#FFD700', 0.5) // 'rgba(255, 215, 0, 0.5)'
 */
export function withOpacity(hex: string, opacity: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Clamp opacity to valid range
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  /** 0.1s - instant feedback */
  instant: '0.1s ease-out',
  /** 0.15s - fast interactions */
  fast: '0.15s ease-out',
  /** 0.3s - standard transitions */
  base: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  /** 0.5s - slow, deliberate transitions */
  slow: '0.5s ease-in-out',
  /** 0.8s - very slow, dramatic */
  slower: '0.8s ease-in-out',
} as const;

// =============================================================================
// COMBINED TOKENS OBJECT
// =============================================================================

export const tokens = {
  colors,
  ...layout,
  typography,
  shadows,
  textShadows,
  transitions,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Tokens = {
  colors: ColorToken;
  layout: LayoutToken;
  typography: TypographyToken;
  shadows: typeof shadows;
  textShadows: typeof textShadows;
  transitions: typeof transitions;
};

export default tokens;
