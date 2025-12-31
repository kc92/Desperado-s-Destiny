/**
 * Global Actions Constants
 * Defines which actions are available globally vs location-specific
 *
 * Phase 7: Location-Specific Actions System
 */

// ============================================================================
// GLOBAL ACTIONS - Available at any location
// ============================================================================

/**
 * Actions available everywhere (with appropriate NPCs/context)
 * Social actions are generally global since talking happens everywhere
 */
export const GLOBAL_ACTIONS: string[] = [
  // Social actions - available anywhere with people
  'Charm Bartender',
  'Negotiate Trade',
  'Perform Music',
];

// ============================================================================
// LOCATION TYPE DEFINITIONS
// ============================================================================

export type LocationType =
  | 'saloon'
  | 'town_square'
  | 'market'
  | 'general_store'
  | 'bank'
  | 'sheriff_office'
  | 'courthouse'
  | 'telegraph_office'
  | 'blacksmith'
  | 'gunsmith'
  | 'apothecary'
  | 'doctor_office'
  | 'stable'
  | 'ranch'
  | 'homestead'
  | 'frontier'
  | 'wilderness'
  | 'forest'
  | 'mine'
  | 'cellar'
  | 'warehouse'
  | 'train_station'
  | 'railroad'
  | 'frontier_road'
  | 'fighting_pit'
  | 'outlaw_territory'
  | 'church'
  | 'canyon'
  | 'ghost_town'
  | 'border'
  | 'mountains';

// ============================================================================
// CRIME -> LOCATION TYPE MAPPING
// ============================================================================

/**
 * Maps crime action names to location types where they can be performed
 * Crimes not listed here won't appear at any location by default
 */
export const CRIME_LOCATION_MAP: Record<string, LocationType[]> = {
  // Tier 1 Crimes (Level 1)
  'Pickpocket Drunk': ['saloon', 'town_square', 'market'],
  'Steal from Market': ['market', 'general_store', 'town_square'],
  'Forge Documents': ['telegraph_office', 'courthouse', 'town_square'],
  'Pick Lock': ['general_store', 'bank', 'warehouse', 'saloon'],

  // Tier 2 Crimes (Level 10)
  'Burglarize Store': ['general_store', 'market', 'warehouse'],
  'Cattle Rustling': ['ranch', 'frontier', 'homestead'],
  'Stage Coach Robbery': ['frontier_road', 'wilderness', 'frontier'],
  'Rob Saloon': ['saloon'],
  'Bootlegging': ['saloon', 'outlaw_territory', 'wilderness'],
  'Smuggling Run': ['border', 'frontier', 'wilderness', 'outlaw_territory'],

  // Tier 3 Crimes (Level 20-39)
  "The Preacher's Ledger": ['church', 'town_square'],
  'Territorial Extortion': ['ranch', 'railroad', 'town_square'],
  'The Counterfeit Ring': ['bank', 'telegraph_office', 'outlaw_territory'],
  'Ghost Town Heist': ['ghost_town', 'mine'],
  "The Judge's Pocket": ['courthouse', 'town_square'],
  'The Iron Horse': ['railroad', 'train_station', 'frontier'],

  // Tier 4 Crimes (Level 40)
  'Bank Heist': ['bank'],
  'Train Robbery': ['train_station', 'railroad', 'frontier'],
  'Murder for Hire': ['outlaw_territory', 'wilderness', 'saloon'],
  'Steal Horse': ['stable', 'ranch', 'frontier'],
  'Arson': ['general_store', 'warehouse', 'ranch', 'saloon'],
};

// ============================================================================
// COMBAT -> LOCATION TYPE MAPPING
// ============================================================================

/**
 * Maps combat action names to location types where they can be performed
 */
export const COMBAT_LOCATION_MAP: Record<string, LocationType[]> = {
  // Tier 1 Combat (Level 1-9)
  'Clear Rat Nest': ['cellar', 'warehouse', 'mine', 'general_store'],
  'Run Off Coyotes': ['ranch', 'frontier', 'homestead'],
  'Bar Brawl': ['saloon', 'fighting_pit'],
  'Hunt Wildlife': ['wilderness', 'frontier', 'forest', 'mountains'],

  // Tier 2 Combat (Level 10-19)
  'Bounty: Cattle Rustlers': ['ranch', 'frontier', 'sheriff_office'],
  'Clear Bandit Camp': ['frontier', 'wilderness', 'outlaw_territory', 'canyon'],
  'Hunt Mountain Lion': ['mountains', 'wilderness', 'frontier', 'forest'],
  'Defend Homestead': ['ranch', 'homestead', 'frontier'],

  // Tier 3 Combat (Level 20-39)
  'Bounty: Mad Dog McGraw': ['frontier', 'wilderness', 'sheriff_office'],
  'Raid Smuggler Den': ['border', 'outlaw_territory', 'wilderness'],
  'Escort Prisoner Transport': ['sheriff_office', 'frontier_road', 'town_square'],
  'Duel Outlaw': ['town_square', 'saloon', 'frontier'],

  // Boss Encounters (Special locations)
  'The Warden of Perdition': ['mine', 'ghost_town'],
  'El Carnicero': ['canyon', 'outlaw_territory', 'frontier'],
  'The Pale Rider': ['frontier', 'wilderness', 'ghost_town'],
  'The Wendigo': ['mountains', 'wilderness', 'forest'],
  'General Sangre': ['canyon', 'outlaw_territory'],
};

// ============================================================================
// CRAFT -> LOCATION TYPE MAPPING
// ============================================================================

/**
 * Maps craft action names to location types where they can be performed
 */
export const CRAFT_LOCATION_MAP: Record<string, LocationType[]> = {
  'Forge Horseshoe': ['blacksmith'],
  'Craft Bullets': ['gunsmith', 'blacksmith'],
  'Brew Medicine': ['apothecary', 'doctor_office'],
  'Build Wagon Wheel': ['stable', 'blacksmith', 'general_store'],
};

// ============================================================================
// SOCIAL -> LOCATION TYPE MAPPING
// ============================================================================

/**
 * Maps social action names to location types where they can be performed
 * Note: Some social actions in GLOBAL_ACTIONS are available everywhere
 */
export const SOCIAL_LOCATION_MAP: Record<string, LocationType[]> = {
  'Convince Sheriff': ['sheriff_office', 'town_square', 'courthouse'],
  // Global social actions (Charm Bartender, Negotiate Trade, Perform Music)
  // are handled separately via GLOBAL_ACTIONS array
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all actions available at a specific location type
 */
export function getActionsForLocationType(locationType: LocationType): {
  crimes: string[];
  combat: string[];
  craft: string[];
  social: string[];
  global: string[];
} {
  const crimes = Object.entries(CRIME_LOCATION_MAP)
    .filter(([_, types]) => types.includes(locationType))
    .map(([name]) => name);

  const combat = Object.entries(COMBAT_LOCATION_MAP)
    .filter(([_, types]) => types.includes(locationType))
    .map(([name]) => name);

  const craft = Object.entries(CRAFT_LOCATION_MAP)
    .filter(([_, types]) => types.includes(locationType))
    .map(([name]) => name);

  const social = Object.entries(SOCIAL_LOCATION_MAP)
    .filter(([_, types]) => types.includes(locationType))
    .map(([name]) => name);

  return {
    crimes,
    combat,
    craft,
    social,
    global: GLOBAL_ACTIONS,
  };
}

/**
 * Check if an action is available at a specific location type
 */
export function isActionAvailableAt(actionName: string, locationType: LocationType): boolean {
  // Check if it's a global action
  if (GLOBAL_ACTIONS.includes(actionName)) {
    return true;
  }

  // Check all location maps
  const allMaps = [
    CRIME_LOCATION_MAP,
    COMBAT_LOCATION_MAP,
    CRAFT_LOCATION_MAP,
    SOCIAL_LOCATION_MAP,
  ];

  for (const map of allMaps) {
    if (map[actionName]?.includes(locationType)) {
      return true;
    }
  }

  return false;
}

/**
 * Get location types where an action is available
 */
export function getLocationTypesForAction(actionName: string): LocationType[] {
  // Global actions are available everywhere
  if (GLOBAL_ACTIONS.includes(actionName)) {
    return []; // Empty means "all locations"
  }

  // Check all location maps
  const allMaps = [
    CRIME_LOCATION_MAP,
    COMBAT_LOCATION_MAP,
    CRAFT_LOCATION_MAP,
    SOCIAL_LOCATION_MAP,
  ];

  for (const map of allMaps) {
    if (map[actionName]) {
      return map[actionName];
    }
  }

  return [];
}

// ============================================================================
// LOCATION SLUG -> TYPE MAPPING HELPER
// Common location slugs mapped to their types
// ============================================================================

export const LOCATION_SLUG_TO_TYPE: Record<string, LocationType> = {
  // Red Gulch buildings
  'golden-spur-saloon': 'saloon',
  'red-gulch-saloon': 'saloon',
  'red-gulch-general-store': 'general_store',
  'red-gulch-bank': 'bank',
  'red-gulch-sheriff-office': 'sheriff_office',
  'red-gulch-blacksmith': 'blacksmith',
  'red-gulch-stable': 'stable',
  'red-gulch-church': 'church',
  'red-gulch-town-square': 'town_square',
  'red-gulch-telegraph': 'telegraph_office',

  // Frontera buildings
  'frontera-cantina': 'saloon',
  'frontera-market': 'market',
  'frontera-gunsmith': 'gunsmith',
  'frontera-apothecary': 'apothecary',

  // Kaiowa Mesa buildings
  'kaiowa-mesa-trading-post': 'general_store',
  'kaiowa-mesa-shrine': 'church',

  // Frontier/Wilderness locations
  'dusty-plains': 'frontier',
  'buzzard-canyon': 'canyon',
  'silver-creek': 'wilderness',
  'devils-backbone': 'mountains',
  'perdition-gulch': 'ghost_town',
  'dead-mans-pass': 'frontier_road',
  'sangre-canyon': 'canyon',
  'border-crossing': 'border',
  'abandoned-mine': 'mine',
  'old-sawmill': 'warehouse',
  'hidden-valley-ranch': 'ranch',
  'homestead-ridge': 'homestead',
  'pine-forest': 'forest',
  'outlaw-hideout': 'outlaw_territory',
  'train-depot': 'train_station',
  'railroad-junction': 'railroad',
};

/**
 * Get location type from a location slug
 * Returns undefined if not found in mapping
 */
export function getLocationTypeFromSlug(slug: string): LocationType | undefined {
  // Direct mapping
  if (LOCATION_SLUG_TO_TYPE[slug]) {
    return LOCATION_SLUG_TO_TYPE[slug];
  }

  // Try to infer from slug keywords
  const lowerSlug = slug.toLowerCase();

  if (lowerSlug.includes('saloon') || lowerSlug.includes('cantina')) return 'saloon';
  if (lowerSlug.includes('bank')) return 'bank';
  if (lowerSlug.includes('sheriff')) return 'sheriff_office';
  if (lowerSlug.includes('blacksmith') || lowerSlug.includes('forge')) return 'blacksmith';
  if (lowerSlug.includes('gunsmith')) return 'gunsmith';
  if (lowerSlug.includes('general-store') || lowerSlug.includes('trading-post')) return 'general_store';
  if (lowerSlug.includes('market')) return 'market';
  if (lowerSlug.includes('stable')) return 'stable';
  if (lowerSlug.includes('church') || lowerSlug.includes('shrine')) return 'church';
  if (lowerSlug.includes('telegraph')) return 'telegraph_office';
  if (lowerSlug.includes('courthouse')) return 'courthouse';
  if (lowerSlug.includes('apothecary') || lowerSlug.includes('doctor')) return 'apothecary';
  if (lowerSlug.includes('ranch')) return 'ranch';
  if (lowerSlug.includes('homestead')) return 'homestead';
  if (lowerSlug.includes('mine')) return 'mine';
  if (lowerSlug.includes('warehouse') || lowerSlug.includes('sawmill')) return 'warehouse';
  if (lowerSlug.includes('canyon')) return 'canyon';
  if (lowerSlug.includes('ghost') || lowerSlug.includes('abandoned')) return 'ghost_town';
  if (lowerSlug.includes('mountain') || lowerSlug.includes('peak')) return 'mountains';
  if (lowerSlug.includes('forest') || lowerSlug.includes('woods')) return 'forest';
  if (lowerSlug.includes('train') || lowerSlug.includes('depot')) return 'train_station';
  if (lowerSlug.includes('railroad') || lowerSlug.includes('junction')) return 'railroad';
  if (lowerSlug.includes('border')) return 'border';
  if (lowerSlug.includes('outlaw') || lowerSlug.includes('hideout')) return 'outlaw_territory';
  if (lowerSlug.includes('town-square') || lowerSlug.includes('plaza')) return 'town_square';
  if (lowerSlug.includes('road') || lowerSlug.includes('pass') || lowerSlug.includes('trail')) return 'frontier_road';

  // Default to frontier for unknown outdoor locations
  return 'frontier';
}
