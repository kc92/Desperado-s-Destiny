/**
 * Location Types
 * Types for the location-based navigation system
 */

/**
 * Region types in the game world
 */
export type RegionType =
  | 'town'
  | 'dusty_flats'
  | 'devils_canyon'
  | 'sangre_mountains'
  | 'border_territories'
  | 'ghost_towns'
  | 'sacred_lands'
  | 'outlaw_territory'
  | 'frontier';

/**
 * Location types within regions
 */
export type LocationType =
  | 'town_square'
  | 'saloon'
  | 'sheriff_office'
  | 'bank'
  | 'general_store'
  | 'stables'
  | 'train_station'
  | 'doctors_office'
  | 'gang_hq'
  | 'blacksmith'
  | 'camp'
  | 'cave'
  | 'mine'
  | 'outpost'
  | 'ruins'
  | 'wilderness'
  | 'ranch'
  | 'hideout'
  | 'settlement'
  | 'sacred_site'
  | 'trading_post'
  | 'fort'
  | 'canyon'
  | 'mesa'
  | 'springs'
  // New building types
  | 'hotel'
  | 'telegraph_office'
  | 'church'
  // Settler faction buildings
  | 'assay_office'
  | 'railroad_station'
  | 'newspaper_office'
  // Nahi faction buildings
  | 'spirit_lodge'
  | 'council_fire'
  | 'medicine_lodge'
  // Frontera faction buildings
  | 'cantina'
  | 'fighting_pit'
  | 'smugglers_den'
  | 'shrine'
  // Red Gulch expansion buildings
  | 'government'
  | 'mining_office'
  | 'elite_club'
  | 'labor_exchange'
  | 'worker_tavern'
  | 'tent_city'
  | 'laundry'
  | 'apothecary'
  | 'tea_house'
  | 'business'
  | 'entertainment'
  | 'labor'
  | 'service'
  // High-level zone types
  | 'wasteland';

/**
 * Town tier for building availability (1=Camp, 5=Capital)
 */
export type TownTier = 1 | 2 | 3 | 4 | 5;

/**
 * Operating hours for a building
 */
export interface OperatingHours {
  open: number;  // Hour of day (0-23)
  close: number; // Hour of day (0-23)
  peakStart?: number;
  peakEnd?: number;
}

/**
 * Secret/hidden content in a building
 */
export interface SecretContent {
  id: string;
  name: string;
  description: string;
  type: 'hidden_room' | 'secret_action' | 'easter_egg' | 'progressive';
  unlockCondition: {
    minReputation?: number;
    npcTrust?: { npcId: string; level: number };
    questComplete?: string;
    itemRequired?: string;
    visitCount?: number;
  };
  content: {
    actions?: string[];
    npcs?: string[];
    dialogue?: string[];
    rewards?: { gold?: number; xp?: number; items?: string[] };
  };
  isDiscovered?: boolean;
}

/**
 * Shop item for sale at a location
 */
export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  quantity?: number; // undefined = unlimited
  requiredLevel?: number;
}

/**
 * Shop/vendor at a location
 */
export interface LocationShop {
  id: string;
  name: string;
  description: string;
  shopType: 'general' | 'weapons' | 'armor' | 'medicine' | 'black_market' | 'specialty';
  items: ShopItem[];
  buyMultiplier?: number; // Sell price = item value * this (default 0.5)
}

/**
 * Job available at a location
 */
export interface LocationJob {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldownMinutes: number;
  rewards: {
    goldMin: number;
    goldMax: number;
    xp: number;
    items?: string[];
  };
  requirements?: {
    minLevel?: number;
    requiredSkill?: string;
    skillLevel?: number;
  };
}

/**
 * NPC at a location
 */
export interface LocationNPC {
  id: string;
  name: string;
  title?: string;
  description: string;
  personality?: string;
  faction?: string;
  dialogue?: string[];
  quests?: string[];
  isVendor?: boolean;
  shopId?: string;
  // Enhanced NPC features
  schedule?: { hour: number; buildingId: string }[];
  trustLevels?: { playerId: string; level: number }[];
  defaultTrust?: number;
}

/**
 * Location interface
 */
export interface Location {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: LocationType;
  region: RegionType;
  parentId?: string; // For nested locations (e.g., rooms in a building)

  // Building system fields
  tier?: TownTier; // 1=Camp, 2=Outpost, 3=Town, 4=City, 5=Capital
  dominantFaction?: 'settler' | 'nahi' | 'frontera' | 'neutral';
  operatingHours?: OperatingHours;
  secrets?: SecretContent[];

  // Visual/UI
  icon?: string;
  imageUrl?: string;
  atmosphere?: string; // Flavor text for the location

  // Requirements to access
  requirements?: LocationRequirements;

  // Available actions at this location
  availableActions: string[]; // Action IDs

  // Available crimes at this location
  availableCrimes: string[]; // Crime action IDs

  // Jobs available at this location
  jobs: LocationJob[];

  // Shops at this location
  shops: LocationShop[];

  // NPCs present
  npcs: LocationNPC[];

  // Connected locations (for travel)
  connections: LocationConnection[];

  // Danger and faction
  dangerLevel: number; // 1-10, affects random encounters
  factionInfluence: {
    settlerAlliance: number; // 0-100
    nahiCoalition: number;   // 0-100
    frontera: number;        // 0-100
  };

  // Location state
  isUnlocked: boolean;
  isHidden: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Requirements to access a location
 */
export interface LocationRequirements {
  minLevel?: number;
  minReputation?: number;
  maxWanted?: number; // Maximum wanted level allowed (for law-abiding buildings)
  minCriminalRep?: number; // Minimum criminal reputation (for outlaw buildings)
  requiredSkills?: { skillId: string; level: number }[];
  requiredItems?: string[];
  requiredQuests?: string[];
  faction?: string;
  factionStanding?: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored';
  gangMember?: boolean;
}

/**
 * Connection between locations
 */
export interface LocationConnection {
  targetLocationId: string;
  travelTime: number; // In seconds
  energyCost: number;
  description?: string;
  requirements?: LocationRequirements;
}

/**
 * Location with populated data (NPCs, actions)
 */
export interface PopulatedLocation extends Location {
  connectedLocations?: Location[];
}

/**
 * Travel result
 */
export interface TravelResult {
  success: boolean;
  newLocation: Location;
  travelTime: number;
  energySpent: number;
  encounter?: RandomEncounter;
}

/**
 * Random encounter during travel
 */
export interface RandomEncounter {
  type: 'combat' | 'loot' | 'npc' | 'event';
  description: string;
  data: any;
}

/**
 * API response types
 */
export interface GetLocationsResponse {
  locations: Location[];
}

export interface GetLocationResponse {
  location: PopulatedLocation;
}

export interface TravelResponse {
  result: TravelResult;
  character: {
    currentLocation: string;
    energy: number;
  };
}

export interface GetRegionResponse {
  region: RegionType;
  locations: Location[];
}

/**
 * Building info for town display
 */
export interface TownBuilding {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  icon: string;
  isAvailable: boolean;
  requirements?: LocationRequirements;
  actions: string[];
}
