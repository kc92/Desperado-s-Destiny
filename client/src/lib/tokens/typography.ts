/**
 * Typography Tokens
 * Authoritative source for font families, sizes, and text styles
 *
 * Phase 17: UI Polish - Design Token Consolidation
 */

// =============================================================================
// FONT FAMILIES
// =============================================================================

export const fontFamily = {
  /** Western display font - for headings and emphasis */
  western: '"Rye", serif',
  /** Readable serif - for body text */
  serif: '"Merriweather", serif',
  /** Clean sans-serif - for UI elements */
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  /** Handwritten style - for wanted posters, notes */
  handwritten: '"Permanent Marker", cursive',
  /** Monospace - for numbers, stats, code */
  mono: '"JetBrains Mono", "Courier New", monospace',
} as const;

// =============================================================================
// FONT SIZES
// =============================================================================

export const fontSize = {
  /** 12px - tiny text, labels */
  xs: '0.75rem',
  /** 14px - small text, captions */
  sm: '0.875rem',
  /** 16px - base body text */
  base: '1rem',
  /** 18px - large body text */
  lg: '1.125rem',
  /** 20px - small headings */
  xl: '1.25rem',
  /** 24px - section headings */
  '2xl': '1.5rem',
  /** 32px - page headings */
  '3xl': '2rem',
  /** 48px - hero text */
  '4xl': '3rem',
  /** 64px - display text */
  '5xl': '4rem',
} as const;

// Pixel values for reference
export const fontSizePx = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
} as const;

// =============================================================================
// FONT WEIGHTS
// =============================================================================

export const fontWeight = {
  /** 400 - normal text */
  normal: 400,
  /** 500 - medium emphasis */
  medium: 500,
  /** 600 - semi-bold */
  semibold: 600,
  /** 700 - bold headings */
  bold: 700,
} as const;

// =============================================================================
// LINE HEIGHTS
// =============================================================================

export const lineHeight = {
  /** 1 - single line (icons, badges) */
  none: 1,
  /** 1.2 - tight (headings) */
  tight: 1.2,
  /** 1.4 - snug */
  snug: 1.4,
  /** 1.5 - normal (body) */
  base: 1.5,
  /** 1.75 - relaxed (reading) */
  relaxed: 1.75,
  /** 2 - loose */
  loose: 2,
} as const;

// =============================================================================
// LETTER SPACING
// =============================================================================

export const letterSpacing = {
  /** -0.05em - tighter */
  tighter: '-0.05em',
  /** -0.025em - tight */
  tight: '-0.025em',
  /** 0 - normal */
  normal: '0',
  /** 0.025em - wide */
  wide: '0.025em',
  /** 0.05em - wider */
  wider: '0.05em',
  /** 0.1em - widest (small caps, labels) */
  widest: '0.1em',
} as const;

// =============================================================================
// TEXT STYLES (Composite)
// =============================================================================

export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.western,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.western,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.western,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  h4: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },

  // Body
  body: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.base,
  },

  // UI
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.base,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.base,
  },
  button: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wide,
  },

  // Special
  stat: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.none,
  },
  price: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.none,
  },
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const typography = {
  fontFamily,
  fontSize,
  fontSizePx,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
} as const;

export type TypographyToken = typeof typography;
