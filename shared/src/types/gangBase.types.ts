/**
 * Gang Base System Types
 *
 * Shared types for gang headquarters/bases between client and server
 */

/**
 * Base tier levels
 */
export enum BaseTier {
  HIDEOUT = 1,
  SAFEHOUSE = 2,
  COMPOUND = 3,
  FORTRESS = 4,
  CRIMINAL_EMPIRE_HQ = 5,
}

/**
 * Base tier names and configuration
 */
export const BASE_TIER_INFO = {
  [BaseTier.HIDEOUT]: {
    name: 'Hideout',
    cost: 500,
    capacity: 5,
    description: 'A basic hideout for small gangs',
    storageCapacity: 50,
    features: ['Basic storage', 'Meeting room'],
    defense: 10,
  },
  [BaseTier.SAFEHOUSE]: {
    name: 'Safehouse',
    cost: 2000,
    capacity: 10,
    description: 'A secure safehouse with basic amenities',
    storageCapacity: 100,
    features: ['Storage', 'Meeting room', 'Small armory'],
    defense: 25,
  },
  [BaseTier.COMPOUND]: {
    name: 'Compound',
    cost: 5000,
    capacity: 20,
    description: 'A fortified compound with multiple facilities',
    storageCapacity: 250,
    features: ['Storage', 'War room', 'Armory', 'Stables'],
    defense: 50,
  },
  [BaseTier.FORTRESS]: {
    name: 'Fortress',
    cost: 15000,
    capacity: 35,
    description: 'A heavily defended fortress',
    storageCapacity: 500,
    features: ['Full facilities', 'Prison cells', 'Underground vault'],
    defense: 75,
  },
  [BaseTier.CRIMINAL_EMPIRE_HQ]: {
    name: 'Criminal Empire HQ',
    cost: 50000,
    capacity: 50,
    description: 'The ultimate criminal headquarters',
    storageCapacity: 1000,
    features: ['Everything', 'Luxury quarters', 'War planning', 'Intelligence network'],
    defense: 100,
  },
} as const;

/**
 * Location types and their bonuses
 */
export enum BaseLocationType {
  FRONTERA = 'frontera',
  WILDERNESS = 'wilderness',
  NEAR_TOWN = 'near_town',
  MOUNTAINS = 'mountains',
}

/**
 * Location bonus types
 */
export interface LocationBonus {
  type: 'crime_success' | 'law_detection' | 'escape_chance' | 'recruitment' | 'defense' | 'accessibility';
  value: number;
  description: string;
}

/**
 * Base location configuration
 */
export const BASE_LOCATION_INFO = {
  [BaseLocationType.FRONTERA]: {
    name: 'The Frontera',
    description: 'Lawless borderlands, perfect for outlaws',
    bonuses: [
      { type: 'crime_success' as const, value: 20, description: '+20% crime success rate' },
      { type: 'law_detection' as const, value: -20, description: '-20% law detection chance' },
    ],
  },
  [BaseLocationType.WILDERNESS]: {
    name: 'Wilderness',
    description: 'Remote and hard to find',
    bonuses: [
      { type: 'escape_chance' as const, value: 10, description: '+10% escape chance' },
      { type: 'accessibility' as const, value: -15, description: 'Harder to find and reach' },
    ],
  },
  [BaseLocationType.NEAR_TOWN]: {
    name: 'Near Town',
    description: 'Close to civilization for easy access',
    bonuses: [
      { type: 'recruitment' as const, value: 10, description: '+10% recruitment success' },
      { type: 'accessibility' as const, value: 15, description: 'Easier to get supplies' },
    ],
  },
  [BaseLocationType.MOUNTAINS]: {
    name: 'Mountains',
    description: 'Natural fortress with excellent defenses',
    bonuses: [
      { type: 'defense' as const, value: 25, description: '+25% defense rating' },
      { type: 'accessibility' as const, value: -20, description: 'Very hard to reach' },
    ],
  },
} as const;

/**
 * Facility types available for bases
 */
export enum FacilityType {
  MEETING_ROOM = 'meeting_room',
  ARMORY = 'armory',
  STORAGE = 'storage',
  WAR_ROOM = 'war_room',
  TRAINING_GROUNDS = 'training_grounds',
  PRISON_CELLS = 'prison_cells',
  VAULT = 'vault',
  STABLES = 'stables',
}

/**
 * Facility configuration
 */
export const FACILITY_INFO = {
  [FacilityType.MEETING_ROOM]: {
    name: 'Meeting Room',
    description: 'Basic meeting space for gang members',
    cost: 0,
    minTier: BaseTier.HIDEOUT,
    benefits: ['Gang chat bonus', 'Planning location'],
  },
  [FacilityType.STORAGE]: {
    name: 'Storage',
    description: 'Basic storage for gang items',
    cost: 0,
    minTier: BaseTier.HIDEOUT,
    benefits: ['Item storage'],
  },
  [FacilityType.ARMORY]: {
    name: 'Armory',
    description: 'Weapon storage and maintenance',
    cost: 1000,
    minTier: BaseTier.SAFEHOUSE,
    benefits: ['Shared weapons', 'Equipment lending', 'Maintenance station'],
  },
  [FacilityType.WAR_ROOM]: {
    name: 'War Room',
    description: 'Strategic planning center',
    cost: 2000,
    minTier: BaseTier.COMPOUND,
    benefits: ['Gang war planning', 'Territory overview', 'Intelligence gathering'],
  },
  [FacilityType.TRAINING_GROUNDS]: {
    name: 'Training Grounds',
    description: 'Practice and skill development area',
    cost: 1500,
    minTier: BaseTier.COMPOUND,
    benefits: ['+5% XP bonus', 'Skill training', 'Combat practice'],
  },
  [FacilityType.PRISON_CELLS]: {
    name: 'Prison Cells',
    description: 'Hold captured enemies',
    cost: 3000,
    minTier: BaseTier.FORTRESS,
    benefits: ['Hold prisoners', 'Ransom system', 'Interrogation'],
  },
  [FacilityType.VAULT]: {
    name: 'Underground Vault',
    description: 'Highly secure storage',
    cost: 5000,
    minTier: BaseTier.FORTRESS,
    benefits: ['+50% storage capacity', 'Better security'],
  },
  [FacilityType.STABLES]: {
    name: 'Stables',
    description: 'Horse and mount storage',
    cost: 800,
    minTier: BaseTier.COMPOUND,
    benefits: ['Mount storage', 'Horse care', 'Travel bonus'],
  },
} as const;

/**
 * Base upgrade types
 */
export enum BaseUpgradeType {
  FORGE = 'forge',
  STABLE_EXPANSION = 'stable_expansion',
  INFIRMARY = 'infirmary',
  LOOKOUT_TOWER = 'lookout_tower',
  SECRET_EXIT = 'secret_exit',
  REINFORCED_VAULT = 'reinforced_vault',
  ALARM_SYSTEM = 'alarm_system',
  TRAP_SYSTEM = 'trap_system',
}

/**
 * Base upgrade configuration
 */
export const BASE_UPGRADE_INFO = {
  [BaseUpgradeType.FORGE]: {
    name: 'Forge',
    description: 'Weapon repair and crafting station',
    cost: 2500,
    minTier: BaseTier.COMPOUND,
    benefits: ['Repair weapons', 'Craft basic items', '-20% repair costs'],
  },
  [BaseUpgradeType.STABLE_EXPANSION]: {
    name: 'Stable Expansion',
    description: 'Expanded stables for faster horses',
    cost: 1500,
    minTier: BaseTier.COMPOUND,
    benefits: ['+10% mount speed', 'More mount slots'],
    requires: FacilityType.STABLES,
  },
  [BaseUpgradeType.INFIRMARY]: {
    name: 'Infirmary',
    description: 'Medical facility for healing',
    cost: 2000,
    minTier: BaseTier.SAFEHOUSE,
    benefits: ['Healing station', 'Faster HP recovery', 'Reduced downtime'],
  },
  [BaseUpgradeType.LOOKOUT_TOWER]: {
    name: 'Lookout Tower',
    description: 'Early warning system',
    cost: 1800,
    minTier: BaseTier.COMPOUND,
    benefits: ['Early raid warnings', '+15% defense', 'Detect incoming attacks'],
  },
  [BaseUpgradeType.SECRET_EXIT]: {
    name: 'Secret Exit',
    description: 'Emergency escape route',
    cost: 3000,
    minTier: BaseTier.SAFEHOUSE,
    benefits: ['Emergency escape', '+25% escape chance', 'Avoid capture'],
  },
  [BaseUpgradeType.REINFORCED_VAULT]: {
    name: 'Reinforced Vault',
    description: 'Enhanced vault security',
    cost: 4000,
    minTier: BaseTier.FORTRESS,
    benefits: ['+100% storage security', 'Harder to raid'],
    requires: FacilityType.VAULT,
  },
  [BaseUpgradeType.ALARM_SYSTEM]: {
    name: 'Alarm System',
    description: 'Automated security system',
    cost: 2200,
    minTier: BaseTier.COMPOUND,
    benefits: ['Instant alerts', '+20% defense', 'Member notifications'],
  },
  [BaseUpgradeType.TRAP_SYSTEM]: {
    name: 'Trap System',
    description: 'Defensive traps and obstacles',
    cost: 2800,
    minTier: BaseTier.COMPOUND,
    benefits: ['+30% defense', 'Damage attackers', 'Slow invaders'],
  },
} as const;

/**
 * Guard NPC types
 */
export interface Guard {
  guardId: string;
  name: string;
  level: number;
  combatSkill: number;
  hireCost: number;
  upkeepCost: number;
  isActive: boolean;
  hiredAt: Date;
}

/**
 * Trap types
 */
export interface Trap {
  trapId: string;
  type: 'alarm' | 'damage' | 'slow' | 'capture';
  name: string;
  effectiveness: number;
  cost: number;
  isActive: boolean;
  installedAt: Date;
}

/**
 * Defense system
 */
export interface DefenseSystem {
  guards: Guard[];
  traps: Trap[];
  alarmLevel: number; // 0-100
  escapeRoutes: number;
  overallDefense: number; // Calculated 1-100 rating
  lastAttacked?: Date;
  raidHistory: number;
}

/**
 * Storage item entry
 */
export interface StorageItem {
  itemId: string;
  itemName: string;
  quantity: number;
  addedBy: string;
  addedAt: Date;
}

/**
 * Gang storage
 */
export interface GangStorage {
  items: StorageItem[];
  capacity: number;
  currentUsage: number;
  categories: {
    weapons: StorageItem[];
    supplies: StorageItem[];
    valuables: StorageItem[];
    materials: StorageItem[];
  };
}

/**
 * Base location details
 */
export interface BaseLocation {
  region: string;
  coordinates?: {
    x: number;
    y: number;
  };
  locationType: BaseLocationType;
  bonuses: LocationBonus[];
}

/**
 * Facility instance
 */
export interface Facility {
  facilityType: FacilityType;
  level: number;
  isActive: boolean;
  installedAt: Date;
  lastUpgraded?: Date;
}

/**
 * Base upgrade instance
 */
export interface BaseUpgrade {
  upgradeType: BaseUpgradeType;
  isActive: boolean;
  installedAt: Date;
}

/**
 * Complete gang base
 */
export interface GangBase {
  _id: string;
  gangId: string;
  tier: BaseTier;
  tierName: string;
  location: BaseLocation;
  storage: GangStorage;
  facilities: Facility[];
  upgrades: BaseUpgrade[];
  defense: DefenseSystem;
  capacity: number;
  currentOccupants: number;
  createdAt: Date;
  lastUpgraded?: Date;
  isActive: boolean;
}

/**
 * Base establishment request
 */
export interface EstablishBaseRequest {
  gangId: string;
  tier: BaseTier;
  locationType: BaseLocationType;
  region: string;
  coordinates?: { x: number; y: number };
}

/**
 * Base upgrade tier request
 */
export interface UpgradeTierRequest {
  characterId: string;
}

/**
 * Add facility request
 */
export interface AddFacilityRequest {
  characterId: string;
  facilityType: FacilityType;
}

/**
 * Add upgrade request
 */
export interface AddUpgradeRequest {
  characterId: string;
  upgradeType: BaseUpgradeType;
}

/**
 * Storage deposit/withdraw request
 */
export interface StorageTransactionRequest {
  characterId: string;
  itemId: string;
  quantity: number;
}

/**
 * Hire guard request
 */
export interface HireGuardRequest {
  characterId: string;
  guardLevel: number;
}

/**
 * Install trap request
 */
export interface InstallTrapRequest {
  characterId: string;
  trapType: 'alarm' | 'damage' | 'slow' | 'capture';
}

/**
 * Base constraints
 */
export const BASE_CONSTRAINTS = {
  MAX_GUARDS: 10,
  MAX_TRAPS: 15,
  MAX_FACILITIES: 8,
  MAX_UPGRADES: 8,
  GUARD_UPKEEP_INTERVAL: 7, // days
} as const;
