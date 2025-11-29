/**
 * Character Types - Player Characters and Progression
 *
 * Character types for Desperados Destiny MMORPG
 */

import { CombatStats } from './combat.types';

/**
 * The three playable factions in Sangre Territory
 */
export enum Faction {
  /** American settlers and corporations */
  SETTLER_ALLIANCE = 'SETTLER_ALLIANCE',
  /** Indigenous Nahi peoples coalition */
  NAHI_COALITION = 'NAHI_COALITION',
  /** Mexican frontera communities */
  FRONTERA = 'FRONTERA'
}

/**
 * Character appearance customization
 */
export interface CharacterAppearance {
  bodyType: 'male' | 'female' | 'non-binary';
  skinTone: number;
  facePreset: number;
  hairStyle: number;
  hairColor: number;
}

/**
 * Character stat block
 */
export interface CharacterStats {
  cunning: number;
  spirit: number;
  combat: number;
  craft: number;
}

/**
 * Skill training record
 */
export interface CharacterSkill {
  skillId: string;
  level: number;
  experience: number;
  trainingStarted?: Date;
  trainingCompletes?: Date;
}

/**
 * Inventory item instance
 */
export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: Date;
}

/**
 * Complete character entity stored in database
 */
export interface Character {
  /** MongoDB ObjectId as string */
  _id: string;
  /** Reference to User who owns this character */
  userId: string;
  /** Character's unique name */
  name: string;
  /** Character's chosen faction */
  faction: Faction;
  /** Character's current level (1-50) */
  level: number;
  /** Current experience points */
  experience: number;
  /** Experience needed for next level */
  experienceToNextLevel: number;
  /** Current energy (action points) */
  energy: number;
  /** Maximum energy capacity */
  maxEnergy: number;
  /** Timestamp when energy was last regenerated */
  lastEnergyRegen: Date;
  /** Current location ID */
  locationId: string;
  /** Character's Destiny Deck (5 cards) */
  destinyDeck: string[];
  /** Timestamp when character was created */
  createdAt: Date;
  /** Timestamp when character was last updated */
  updatedAt: Date;
  /** Whether this character is deleted (soft delete) */
  isDeleted: boolean;
}

/**
 * Data required to create a new character
 */
export interface CharacterCreation {
  /** Character's unique name (3-20 characters) */
  name: string;
  /** Character's chosen faction */
  faction: Faction;
  /** Character appearance (optional, uses defaults if not provided) */
  appearance?: CharacterAppearance;
}

/**
 * Character data safe for client display
 * This matches what the backend returns from Character.toSafeObject()
 */
export interface SafeCharacter {
  /** MongoDB ObjectId as string */
  _id: string;
  /** Character's unique name */
  name: string;
  /** Character's chosen faction */
  faction: Faction;
  /** Character appearance customization */
  appearance: CharacterAppearance;
  /** Character's current level */
  level: number;
  /** Current experience points */
  experience: number;
  /** Experience needed for next level */
  experienceToNextLevel: number;
  /** Current energy */
  energy: number;
  /** Maximum energy capacity */
  maxEnergy: number;
  /** Current gold amount */
  gold: number;
  /** Current location name/ID */
  currentLocation: string;
  /** Location ID (alias) */
  locationId?: string;
  /** Gang ID if in a gang, null otherwise */
  gangId: string | null;
  /** Character stats */
  stats: CharacterStats;
  /** Character skills */
  skills: CharacterSkill[];
  /** Character inventory */
  inventory: InventoryItem[];
  /** Combat statistics */
  combatStats: CombatStats;
  /** Whether character is in jail */
  isJailed: boolean;
  /** When jail sentence ends */
  jailedUntil: Date | null;
  /** Current wanted level (0-5) */
  wantedLevel: number;
  /** Bounty amount on character's head */
  bountyAmount: number;
  /** Timestamp when character was created */
  createdAt: Date;
  /** Timestamp when character was last active */
  lastActive: Date;
}

/**
 * Character list item (minimal data for character selection)
 */
export interface CharacterListItem {
  /** MongoDB ObjectId as string */
  _id: string;
  /** Character's unique name */
  name: string;
  /** Character's chosen faction */
  faction: Faction;
  /** Character's current level */
  level: number;
  /** Current location ID */
  locationId: string;
}
