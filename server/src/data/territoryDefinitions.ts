/**
 * Territory Definitions
 *
 * Base configuration for all territories in the Sangre Territory
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import { TerritoryDefinition, TerritoryType, TerritoryFactionId } from '@desperados/shared';

/**
 * All territory definitions
 */
export const TERRITORY_DEFINITIONS: TerritoryDefinition[] = [
  // ===== TOWNS =====
  {
    id: 'red_gulch',
    name: 'Red Gulch',
    type: TerritoryType.TOWN,
    description: 'A bustling frontier town where all factions vie for control. Rich in resources and strategic value.',
    baseStability: 50,
    baseLawLevel: 60,
    baseEconomicHealth: 70,
    initialInfluence: {
      [TerritoryFactionId.SETTLER_ALLIANCE]: 20,
      [TerritoryFactionId.NAHI_COALITION]: 15,
      [TerritoryFactionId.FRONTERA_CARTEL]: 20,
      [TerritoryFactionId.US_MILITARY]: 15,
      [TerritoryFactionId.RAILROAD_BARONS]: 20,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 10,
    },
    strategicValue: 9,
  },
  {
    id: 'the_frontera',
    name: 'The Frontera',
    type: TerritoryType.TOWN,
    description: 'A lawless border town controlled by the Frontera Cartel. Center of smuggling and vice.',
    baseStability: 30,
    baseLawLevel: 20,
    baseEconomicHealth: 60,
    initialInfluence: {
      [TerritoryFactionId.FRONTERA_CARTEL]: 60,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 20,
      [TerritoryFactionId.US_MILITARY]: 10,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 5,
      [TerritoryFactionId.RAILROAD_BARONS]: 5,
      [TerritoryFactionId.NAHI_COALITION]: 0,
    },
    strategicValue: 8,
  },
  {
    id: 'fort_ashford',
    name: 'Fort Ashford',
    type: TerritoryType.TOWN,
    description: 'A heavily fortified military installation. The U.S. Army maintains strict control.',
    baseStability: 80,
    baseLawLevel: 90,
    baseEconomicHealth: 65,
    initialInfluence: {
      [TerritoryFactionId.US_MILITARY]: 70,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 15,
      [TerritoryFactionId.RAILROAD_BARONS]: 10,
      [TerritoryFactionId.NAHI_COALITION]: 3,
      [TerritoryFactionId.FRONTERA_CARTEL]: 2,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 0,
    },
    strategicValue: 7,
  },
  {
    id: 'whiskey_bend',
    name: 'Whiskey Bend',
    type: TerritoryType.TOWN,
    description: 'A railroad hub town contested between settlers and railroad corporations.',
    baseStability: 55,
    baseLawLevel: 65,
    baseEconomicHealth: 80,
    initialInfluence: {
      [TerritoryFactionId.RAILROAD_BARONS]: 35,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 30,
      [TerritoryFactionId.US_MILITARY]: 15,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 10,
      [TerritoryFactionId.FRONTERA_CARTEL]: 5,
      [TerritoryFactionId.NAHI_COALITION]: 5,
    },
    strategicValue: 8,
  },

  // ===== WILDERNESS =====
  {
    id: 'kaiowa_mesa',
    name: 'Kaiowa Mesa',
    type: TerritoryType.WILDERNESS,
    description: 'Sacred lands of the Nahi Coalition. Ancient burial grounds and spiritual sites.',
    baseStability: 70,
    baseLawLevel: 40,
    baseEconomicHealth: 30,
    initialInfluence: {
      [TerritoryFactionId.NAHI_COALITION]: 75,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 10,
      [TerritoryFactionId.RAILROAD_BARONS]: 8,
      [TerritoryFactionId.US_MILITARY]: 5,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 2,
      [TerritoryFactionId.FRONTERA_CARTEL]: 0,
    },
    strategicValue: 6,
  },
  {
    id: 'spirit_springs',
    name: 'Spirit Springs',
    type: TerritoryType.WILDERNESS,
    description: 'Holy springs controlled by the Nahi Coalition. Source of fresh water and spiritual power.',
    baseStability: 80,
    baseLawLevel: 30,
    baseEconomicHealth: 40,
    initialInfluence: {
      [TerritoryFactionId.NAHI_COALITION]: 80,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 10,
      [TerritoryFactionId.US_MILITARY]: 5,
      [TerritoryFactionId.RAILROAD_BARONS]: 3,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 2,
      [TerritoryFactionId.FRONTERA_CARTEL]: 0,
    },
    strategicValue: 7,
  },
  {
    id: 'thunderbird_perch',
    name: "Thunderbird's Perch",
    type: TerritoryType.WILDERNESS,
    description: 'Sacred mountain peak of the Nahi Coalition. Site of ancient rituals and visions.',
    baseStability: 90,
    baseLawLevel: 20,
    baseEconomicHealth: 20,
    initialInfluence: {
      [TerritoryFactionId.NAHI_COALITION]: 85,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 5,
      [TerritoryFactionId.US_MILITARY]: 5,
      [TerritoryFactionId.RAILROAD_BARONS]: 3,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 2,
      [TerritoryFactionId.FRONTERA_CARTEL]: 0,
    },
    strategicValue: 5,
  },
  {
    id: 'longhorn_ranch',
    name: 'Longhorn Ranch',
    type: TerritoryType.WILDERNESS,
    description: 'Vast cattle ranch owned by Settler Alliance families. Key economic territory.',
    baseStability: 65,
    baseLawLevel: 50,
    baseEconomicHealth: 75,
    initialInfluence: {
      [TerritoryFactionId.SETTLER_ALLIANCE]: 65,
      [TerritoryFactionId.RAILROAD_BARONS]: 15,
      [TerritoryFactionId.US_MILITARY]: 10,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 5,
      [TerritoryFactionId.NAHI_COALITION]: 3,
      [TerritoryFactionId.FRONTERA_CARTEL]: 2,
    },
    strategicValue: 7,
  },
  {
    id: 'goldfingers_mine',
    name: "Goldfinger's Mine",
    type: TerritoryType.WILDERNESS,
    description: 'Rich gold mine contested by all factions. Immense wealth for whoever controls it.',
    baseStability: 35,
    baseLawLevel: 30,
    baseEconomicHealth: 90,
    initialInfluence: {
      [TerritoryFactionId.RAILROAD_BARONS]: 25,
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 20,
      [TerritoryFactionId.FRONTERA_CARTEL]: 20,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 15,
      [TerritoryFactionId.US_MILITARY]: 15,
      [TerritoryFactionId.NAHI_COALITION]: 5,
    },
    strategicValue: 10,
  },
  {
    id: 'the_wastes',
    name: 'The Wastes',
    type: TerritoryType.WILDERNESS,
    description: 'Lawless badlands where outlaws and criminals hide. No faction dares claim it.',
    baseStability: 20,
    baseLawLevel: 10,
    baseEconomicHealth: 25,
    initialInfluence: {
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 50,
      [TerritoryFactionId.FRONTERA_CARTEL]: 25,
      [TerritoryFactionId.US_MILITARY]: 10,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 5,
      [TerritoryFactionId.RAILROAD_BARONS]: 5,
      [TerritoryFactionId.NAHI_COALITION]: 5,
    },
    strategicValue: 4,
  },
  {
    id: 'the_scar',
    name: 'The Scar',
    type: TerritoryType.WILDERNESS,
    description: 'A desolate wasteland formed by unknown catastrophe. Dangerous and unpredictable.',
    baseStability: 15,
    baseLawLevel: 5,
    baseEconomicHealth: 10,
    initialInfluence: {
      [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 30,
      [TerritoryFactionId.NAHI_COALITION]: 20,
      [TerritoryFactionId.FRONTERA_CARTEL]: 15,
      [TerritoryFactionId.US_MILITARY]: 15,
      [TerritoryFactionId.SETTLER_ALLIANCE]: 10,
      [TerritoryFactionId.RAILROAD_BARONS]: 10,
    },
    strategicValue: 3,
  },
];

/**
 * Get territory definition by ID
 */
export function getTerritoryDefinition(territoryId: string): TerritoryDefinition | undefined {
  return TERRITORY_DEFINITIONS.find((t) => t.id === territoryId);
}

/**
 * Get all town territories
 */
export function getTownTerritories(): TerritoryDefinition[] {
  return TERRITORY_DEFINITIONS.filter((t) => t.type === TerritoryType.TOWN);
}

/**
 * Get all wilderness territories
 */
export function getWildernessTerritories(): TerritoryDefinition[] {
  return TERRITORY_DEFINITIONS.filter((t) => t.type === TerritoryType.WILDERNESS);
}

/**
 * Get territories by strategic value (high to low)
 */
export function getTerritoriesByValue(): TerritoryDefinition[] {
  return [...TERRITORY_DEFINITIONS].sort((a, b) => b.strategicValue - a.strategicValue);
}
