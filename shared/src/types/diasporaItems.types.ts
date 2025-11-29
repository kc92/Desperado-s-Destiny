/**
 * Chinese Diaspora Items Types
 *
 * Types for unique items, equipment, and intelligence rewards obtainable
 * through the Chinese Diaspora network. All items reflect Chinese culture
 * and provide benefits unavailable elsewhere.
 *
 * Design Principles:
 * - Culturally authentic representation
 * - Mechanically unique from Western items
 * - Trust-gated access (better items at higher trust)
 * - Intel as valuable as gold
 */

/**
 * Item categories specific to Chinese Diaspora items
 */
export type DiasporaItemType =
  | 'weapon'        // Traditional Chinese weapons
  | 'armor'         // Silk armor and traditional clothing
  | 'consumable'    // Medicine, teas, food
  | 'tool'          // Specialized tools and equipment
  | 'intelligence'  // Information and maps
  | 'explosive'     // Powder/fireworks from railroad expertise
  | 'accessory';    // Jewelry, charms, disguises

/**
 * Weapon subtypes
 */
export type WeaponSubtype =
  | 'sword'         // Jian, Dao
  | 'staff'         // Gun/Bang
  | 'exotic'        // Rope dart, butterfly swords
  | 'ranged'        // Throwing stars, dragon pistol
  | 'paired';       // Dual-wield weapons

/**
 * Armor subtypes
 */
export type ArmorSubtype =
  | 'silk'          // Silk underclothing and armor
  | 'clothing'      // Disguises and robes
  | 'mask'          // Face coverings
  | 'ceremonial';   // Special occasion armor

/**
 * Intelligence categories
 */
export type IntelligenceCategory =
  | 'military'      // Fort movements, patrols
  | 'criminal'      // Gang operations, smuggling
  | 'political'     // Corruption, power structures
  | 'economic'      // Trade routes, prices
  | 'personal'      // NPC secrets, blackmail
  | 'geographic';   // Maps, locations, caches

/**
 * Item effect types
 */
export interface DiasporaItemEffect {
  type: 'stat' | 'combat' | 'stealth' | 'social' | 'special';
  stat?: 'damage' | 'defense' | 'speed' | 'stealth' | 'persuasion' | 'intimidation';
  value: number | string;
  description: string;
  duration?: number;        // Minutes (for buffs)
  condition?: string;       // Situational effects
}

/**
 * Intelligence effect types
 */
export interface IntelEffect {
  type: 'map_reveal' | 'schedule_access' | 'secret_reveal' | 'price_bonus' | 'quest_unlock' | 'npc_location';
  target: string;           // What is affected
  value: number | string;   // Effect value
  duration?: number;        // How long intel is valid (hours)
}

/**
 * Base Diaspora Item interface
 */
export interface DiasporaItem {
  // Identity
  id: string;
  name: string;
  chineseName: string;           // Chinese name (Pinyin)
  chineseCharacters?: string;    // Chinese characters

  // Classification
  type: DiasporaItemType;
  subtype?: WeaponSubtype | ArmorSubtype;

  // Description
  description: string;
  culturalNote: string;          // Historical/cultural context

  // Access
  trustRequired: number;         // 1-5 (Outsider to Dragon)
  cost: number | 'quest_only';   // Gold cost or quest reward only

  // Properties
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'unique';
  effects: DiasporaItemEffect[];

  // Stack/Equip
  stackable: boolean;
  maxStack?: number;
  equipSlot?: 'weapon' | 'head' | 'body' | 'feet' | 'accessory';

  // Special properties
  unique?: boolean;              // Only one exists in game
  questRequired?: string;        // Specific quest needed
  sourceNPC?: string;            // Which NPC sells/provides
}

/**
 * Intelligence item (information as reward)
 */
export interface IntelligenceItem {
  // Identity
  id: string;
  name: string;
  chineseName?: string;

  // Classification
  category: IntelligenceCategory;

  // Description
  description: string;
  details: string;               // What you actually learn

  // Access
  trustRequired: number;
  cost: number;

  // Properties
  effects: IntelEffect[];
  refreshRate?: 'daily' | 'weekly' | 'permanent';  // How often intel updates
  expires?: number;              // Hours until intel is outdated

  // Special
  stackable: boolean;            // Can you buy multiple copies
  questUnlock?: string;          // Quest that becomes available
  sourceNPC?: string;            // Which NPC provides this
}

/**
 * Weapon stats interface
 */
export interface WeaponStats {
  damage: number;
  speed: number;                 // Attack speed modifier (1.0 = normal)
  range: 'melee' | 'close' | 'medium' | 'long';
  critChance: number;            // Base crit chance bonus
  durability?: number;           // Degradation rate
  special?: string[];            // Special abilities
}

/**
 * Armor stats interface
 */
export interface ArmorStats {
  defense: number;
  mobility: number;              // Movement speed modifier
  stealth: number;               // Stealth bonus
  durability?: number;
  special?: string[];
}

/**
 * Consumable effects interface
 */
export interface ConsumableEffect {
  health?: number;               // HP restoration
  energy?: number;               // Energy restoration
  buffType?: string;             // Buff applied
  buffDuration?: number;         // Minutes
  cures?: ('poison' | 'curse' | 'debuff')[];
  special?: string;              // Special effect description
}

/**
 * Complete weapon item
 */
export interface DiasporaWeapon extends DiasporaItem {
  type: 'weapon';
  subtype: WeaponSubtype;
  stats: WeaponStats;
  requiredSkill?: string;        // Martial arts skill needed
  dualWield?: boolean;           // Can dual wield
  stealth?: boolean;             // Silent kills
}

/**
 * Complete armor item
 */
export interface DiasporaArmor extends DiasporaItem {
  type: 'armor';
  subtype: ArmorSubtype;
  stats: ArmorStats;
  disguise?: string;             // What role it disguises you as
  hidden?: boolean;              // Can be worn under normal clothes
}

/**
 * Complete consumable item
 */
export interface DiasporaConsumable extends DiasporaItem {
  type: 'consumable';
  consumableEffects: ConsumableEffect;
  usesPerStack: number;
  craftable?: boolean;           // Can player craft more
  ingredients?: Array<{ itemId: string; quantity: number }>;
}

/**
 * Unique item (legendary, only one exists)
 */
export interface UniqueItem extends DiasporaItem {
  rarity: 'unique';
  unique: true;
  legend: string;                // Story behind the item
  owner?: string;                // Current owner (if any)
  questChain: string[];          // Quest chain to obtain
}

/**
 * Item collection for a trust level
 */
export interface TrustLevelItemCollection {
  trustLevel: number;
  weapons: DiasporaWeapon[];
  armor: DiasporaArmor[];
  consumables: DiasporaConsumable[];
  tools: DiasporaItem[];
  intelligence: IntelligenceItem[];
}

/**
 * Complete network item catalog
 */
export interface DiasporaItemCatalog {
  weapons: DiasporaWeapon[];
  armor: DiasporaArmor[];
  consumables: DiasporaConsumable[];
  tools: DiasporaItem[];
  intelligence: IntelligenceItem[];
  unique: UniqueItem[];
}

/**
 * Player's item discovery tracking
 */
export interface DiasporaItemDiscovery {
  playerId: string;
  discoveredItems: string[];     // Item IDs discovered
  purchasedItems: string[];      // Item IDs purchased
  intelUnlocked: string[];       // Intelligence items revealed
  uniqueObtained: string[];      // Unique items obtained (max 1 each)
}

/**
 * Item price modifiers by trust level
 */
export const TRUST_PRICE_MODIFIERS: Record<number, number> = {
  1: 1.5,   // Outsider: 50% markup
  2: 1.0,   // Friend: Normal price
  3: 0.85,  // Sibling: 15% discount
  4: 0.70,  // Family: 30% discount
  5: 0.50   // Dragon: 50% discount
};

/**
 * Rarity color codes (for UI)
 */
export const RARITY_COLORS = {
  common: '#FFFFFF',
  uncommon: '#1EFF00',
  rare: '#0070DD',
  legendary: '#FF8000',
  unique: '#E6CC80'
} as const;
