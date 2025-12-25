/**
 * Color Tokens
 * Authoritative source for all color definitions in Desperados Destiny
 *
 * Phase 17: UI Polish - Design Token Consolidation
 */

// =============================================================================
// WESTERN PALETTE
// =============================================================================

export const desert = {
  sand: '#E6D5B8',
  stone: '#C8B9A1',
  clay: '#A89176',
  dust: '#D4C4A8',
} as const;

export const wood = {
  darker: '#2C1810',
  dark: '#3E2723',
  medium: '#5D4037',
  light: '#795548',
  grain: '#8D6E63',
} as const;

export const leather = {
  dark: '#3E2723',
  brown: '#6F4E37',
  tan: '#A0826D',
  saddle: '#8B4513',
} as const;

export const gold = {
  dark: '#B8860B',
  medium: '#DAA520',
  light: '#FFD700',
  pale: '#EEE8AA',
} as const;

export const blood = {
  dark: '#5C0000',
  red: '#8B0000',
  crimson: '#DC143C',
} as const;

// =============================================================================
// FACTION COLORS
// =============================================================================

export const faction = {
  settler: '#4682B4',
  nahi: '#40E0D0',
  frontera: '#DC143C',
  outlaw: '#DC143C',
  kaiowa: '#32CD32',
  chinese: '#FFD700',
} as const;

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

export const semantic = {
  success: '#2ed573',
  warning: '#ffa502',
  error: '#ff4757',
  info: '#4ecdc4',
} as const;

// =============================================================================
// RARITY COLORS
// =============================================================================

export const rarity = {
  common: '#9ca3af',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
} as const;

// =============================================================================
// UI COLORS
// =============================================================================

export const ui = {
  // Backgrounds
  background: '#1a1a1a',
  backgroundLight: '#2d2d2d',
  backgroundLighter: '#3a3a3a',

  // Surfaces
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.05)',
  surfaceActive: 'rgba(255, 255, 255, 0.08)',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(255, 255, 255, 0.2)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#b8b8b8',
  textTertiary: '#888888',
} as const;

// =============================================================================
// WESTERN UI THEME
// =============================================================================

export const western = {
  primary: '#8B4513',
  secondary: '#DAA520',
  accent: '#DC143C',
  bg: '#F5F5DC',
  bgDark: '#2C1810',
  text: '#3E2723',
  textLight: '#E6D5B8',
} as const;

// =============================================================================
// SHADOW COLORS (for box-shadow values)
// =============================================================================

export const shadows = {
  wood: 'rgba(62, 39, 35, 0.3)',
  leather: 'rgba(111, 78, 55, 0.3)',
  gold: 'rgba(255, 215, 0, 0.4)',
  blood: 'rgba(139, 0, 0, 0.5)',
} as const;

// =============================================================================
// OVERLAY COLORS (for backgrounds and masks)
// =============================================================================

export const overlays = {
  /** 10% black - subtle overlay */
  black10: 'rgba(0, 0, 0, 0.1)',
  /** 30% black - light overlay */
  black30: 'rgba(0, 0, 0, 0.3)',
  /** 50% black - medium overlay */
  black50: 'rgba(0, 0, 0, 0.5)',
  /** 80% black - heavy overlay */
  black80: 'rgba(0, 0, 0, 0.8)',
  /** White highlight */
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
} as const;

// =============================================================================
// GLOW COLORS (for effects and highlights)
// =============================================================================

export const glows = {
  /** Gold glow - standard intensity */
  gold: 'rgba(255, 215, 0, 0.8)',
  /** Gold glow - subtle */
  goldSubtle: 'rgba(255, 215, 0, 0.4)',
  /** Gold glow - intense */
  goldIntense: 'rgba(255, 215, 0, 1)',
  /** Blood/damage glow */
  blood: 'rgba(139, 0, 0, 0.8)',
  /** Blood glow - subtle */
  bloodSubtle: 'rgba(139, 0, 0, 0.4)',
  /** Success glow */
  success: 'rgba(34, 197, 94, 0.8)',
  /** Success glow - subtle */
  successSubtle: 'rgba(34, 197, 94, 0.4)',
  /** Warning glow */
  warning: 'rgba(255, 165, 2, 0.8)',
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const colors = {
  desert,
  wood,
  leather,
  gold,
  blood,
  faction,
  semantic,
  rarity,
  ui,
  western,
  shadows,
  overlays,
  glows,
} as const;

export type ColorToken = typeof colors;
