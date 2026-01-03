/**
 * Saloon Location Components
 *
 * Immersive saloon location UI with zone-based layout,
 * faction theming, and danger-level visual effects.
 */

// Main view
export { SaloonLocationView, isSaloonLocation } from './SaloonLocationView';
export type { SaloonLocationViewProps, SaloonLocationData } from './SaloonLocationView';

// Theme system
export {
  computeSaloonTheme,
  computeDominantFaction,
  computeDangerCategory,
  computeSaloonStyle,
  getDangerDescription,
  getFactionDisplayName,
  getSaloonStyleDescription
} from './SaloonTheme';
export type {
  SaloonTheme,
  DominantFaction,
  DangerCategory,
  SaloonStyle,
  FactionInfluence
} from './SaloonTheme';

// Sub-components
export { SaloonHeader } from './SaloonHeader';
export type { SaloonHeaderProps } from './SaloonHeader';

export { SaloonAtmosphere } from './SaloonAtmosphere';
export type { SaloonAtmosphereProps } from './SaloonAtmosphere';

export { SaloonActivityZones } from './SaloonActivityZones';
export type { SaloonActivityZonesProps, ActivityZoneType } from './SaloonActivityZones';

export { SaloonNPCBar } from './SaloonNPCBar';
export type { SaloonNPCBarProps } from './SaloonNPCBar';
