/**
 * SaloonTheme - Theme computation for saloon locations
 *
 * Computes visual theme based on faction influence, danger level, and saloon type.
 * Part of the Saloon Location UI Redesign.
 */

import { SALOON_BONUSES } from '@shared/constants/tavern.constants';

/**
 * Faction types for theme computation
 */
export type DominantFaction = 'settler' | 'nahi' | 'frontera' | 'neutral';

/**
 * Danger level categories
 */
export type DangerCategory = 'safe' | 'moderate' | 'dangerous' | 'lawless';

/**
 * Saloon style based on location type
 */
export type SaloonStyle = 'rustic' | 'refined' | 'frontier' | 'opulent';

/**
 * Complete saloon theme configuration
 */
export interface SaloonTheme {
  /** Dominant faction based on influence */
  dominantFaction: DominantFaction;
  /** Danger category */
  dangerCategory: DangerCategory;
  /** Saloon style */
  saloonStyle: SaloonStyle;
  /** CSS class for panel styling */
  panelClass: string;
  /** CSS class for header styling */
  headerClass: string;
  /** Primary accent color CSS variable */
  accentColor: string;
  /** Border color CSS variable */
  borderColor: string;
  /** Background gradient */
  backgroundGradient: string;
  /** Whether this saloon has special bonuses */
  hasBonuses: boolean;
}

/**
 * Faction influence data from Location
 */
export interface FactionInfluence {
  settlerAlliance: number;
  nahiCoalition: number;
  frontera: number;
}

/**
 * Location data needed for theme computation
 */
export interface SaloonLocationData {
  id: string;
  type: string;
  dangerLevel: number;
  factionInfluence: FactionInfluence;
}

/**
 * Compute dominant faction from influence values
 */
export function computeDominantFaction(influence: FactionInfluence): DominantFaction {
  const { settlerAlliance, nahiCoalition, frontera } = influence;
  const maxInfluence = Math.max(settlerAlliance, nahiCoalition, frontera);

  // If no faction has significant influence, consider it neutral
  if (maxInfluence < 30) {
    return 'neutral';
  }

  if (settlerAlliance === maxInfluence) return 'settler';
  if (nahiCoalition === maxInfluence) return 'nahi';
  return 'frontera';
}

/**
 * Compute danger category from danger level
 */
export function computeDangerCategory(dangerLevel: number): DangerCategory {
  if (dangerLevel <= 2) return 'safe';
  if (dangerLevel <= 5) return 'moderate';
  if (dangerLevel <= 7) return 'dangerous';
  return 'lawless';
}

/**
 * Compute saloon style from location type
 */
export function computeSaloonStyle(locationType: string): SaloonStyle {
  switch (locationType.toLowerCase()) {
    case 'cantina':
      return 'frontier';
    case 'worker_tavern':
    case 'tavern':
      return 'rustic';
    case 'elite_club':
    case 'hotel':
      return 'opulent';
    case 'saloon':
    default:
      return 'refined';
  }
}

/**
 * Get accent color for faction
 */
function getFactionAccentColor(faction: DominantFaction): string {
  switch (faction) {
    case 'settler':
      return 'var(--color-settler)';
    case 'nahi':
      return 'var(--color-kaiowa)';
    case 'frontera':
      return 'var(--color-outlaw)';
    case 'neutral':
    default:
      return 'var(--color-gold-medium)';
  }
}

/**
 * Get border color for faction
 */
function getFactionBorderColor(faction: DominantFaction): string {
  switch (faction) {
    case 'settler':
      return 'border-[#4169E1]';
    case 'nahi':
      return 'border-[#32CD32]';
    case 'frontera':
      return 'border-[#DC143C]';
    case 'neutral':
    default:
      return 'border-gold-medium';
  }
}

/**
 * Get background gradient for danger category
 */
function getDangerBackground(danger: DangerCategory): string {
  switch (danger) {
    case 'safe':
      return 'from-wood-dark/90 to-wood-darker/95';
    case 'moderate':
      return 'from-wood-dark/85 via-amber-950/20 to-wood-darker/90';
    case 'dangerous':
      return 'from-wood-dark/80 via-red-950/30 to-wood-darker/85';
    case 'lawless':
      return 'from-wood-dark/75 via-red-900/40 to-wood-darker/80';
  }
}

/**
 * Compute complete saloon theme from location data
 */
export function computeSaloonTheme(location: SaloonLocationData): SaloonTheme {
  const dominantFaction = computeDominantFaction(location.factionInfluence);
  const dangerCategory = computeDangerCategory(location.dangerLevel);
  const saloonStyle = computeSaloonStyle(location.type);

  // Check if this location has special bonuses
  const hasBonuses = location.id in SALOON_BONUSES;

  // Compute CSS classes
  const dangerClass = `saloon-danger-${dangerCategory}`;
  const factionClass = `saloon-faction-${dominantFaction}`;

  return {
    dominantFaction,
    dangerCategory,
    saloonStyle,
    panelClass: `${dangerClass} ${factionClass}`,
    headerClass: `${factionClass}`,
    accentColor: getFactionAccentColor(dominantFaction),
    borderColor: getFactionBorderColor(dominantFaction),
    backgroundGradient: getDangerBackground(dangerCategory),
    hasBonuses
  };
}

/**
 * Get danger level description for display
 */
export function getDangerDescription(dangerLevel: number): string {
  if (dangerLevel <= 2) return 'Safe';
  if (dangerLevel <= 4) return 'Cautious';
  if (dangerLevel <= 6) return 'Dangerous';
  if (dangerLevel <= 8) return 'Very Dangerous';
  return 'Lawless';
}

/**
 * Get faction display name
 */
export function getFactionDisplayName(faction: DominantFaction): string {
  switch (faction) {
    case 'settler':
      return 'Settler Alliance';
    case 'nahi':
      return 'Nahi Coalition';
    case 'frontera':
      return 'Frontera';
    case 'neutral':
      return 'Neutral Territory';
  }
}

/**
 * Get saloon style description
 */
export function getSaloonStyleDescription(style: SaloonStyle): string {
  switch (style) {
    case 'rustic':
      return 'A working-class establishment';
    case 'refined':
      return 'A respectable drinking hole';
    case 'frontier':
      return 'A border-town watering hole';
    case 'opulent':
      return 'An upscale establishment';
  }
}
