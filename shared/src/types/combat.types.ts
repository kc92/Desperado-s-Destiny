/**
 * Combat Types - Turn-Based HP Combat System
 *
 * Type definitions for the turn-based combat system in Desperados Destiny
 */

import { Card, HandRank } from './destinyDeck.types';

/**
 * NPC types in the game world
 */
export enum NPCType {
  OUTLAW = 'OUTLAW',
  WILDLIFE = 'WILDLIFE',
  LAWMAN = 'LAWMAN',
  BOSS = 'BOSS'
}

/**
 * Combat encounter status
 */
export enum CombatStatus {
  ACTIVE = 'ACTIVE',
  PLAYER_VICTORY = 'PLAYER_VICTORY',
  PLAYER_DEFEAT = 'PLAYER_DEFEAT',
  FLED = 'FLED'
}

/**
 * Loot item from combat
 */
export interface LootItem {
  /** Item name */
  name: string;
  /** Drop chance (0-1) */
  chance: number;
  /** Item rarity */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * NPC loot table
 */
export interface LootTable {
  /** Minimum gold reward */
  goldMin: number;
  /** Maximum gold reward */
  goldMax: number;
  /** Experience reward */
  xpReward: number;
  /** Minimum XP reward (for frontend compatibility, defaults to xpReward) */
  xpMin?: number;
  /** Maximum XP reward (for frontend compatibility, defaults to xpReward) */
  xpMax?: number;
  /** Possible item drops */
  items: LootItem[];
  /** Item rarities available */
  itemRarities?: string[];
  /** Item drop chance */
  itemChance?: number;
}

/**
 * NPC definition
 */
export interface NPC {
  /** NPC unique identifier */
  _id?: string;
  /** NPC name */
  name: string;
  /** NPC type */
  type: NPCType;
  /** NPC level (1-50) */
  level: number;
  /** Maximum HP (scaled by level) */
  maxHP: number;
  /** Difficulty rating (1-10) affects card draw quality */
  difficulty: number;
  /** Loot table for rewards */
  lootTable: LootTable;
  /** Location where NPC spawns */
  location: string;
  /** Respawn time in minutes */
  respawnTime: number;
  /** NPC description */
  description: string;
  /** Whether NPC is currently active/alive */
  isActive: boolean;
  /** Whether this is a boss NPC */
  isBoss: boolean;
  /** Last defeated timestamp */
  lastDefeated?: Date;
}

/**
 * Single round of combat
 */
export interface CombatRound {
  /** Round number */
  roundNum: number;
  /** Round number (alias for frontend compatibility) */
  roundNumber?: number;
  /** Cards drawn by player */
  playerCards: Card[];
  /** Player hand (alias for frontend compatibility) */
  playerHand?: Card[];
  /** Player's hand rank */
  playerHandRank: HandRank;
  /** Damage dealt by player */
  playerDamage: number;
  /** Cards drawn by NPC */
  npcCards: Card[];
  /** NPC's hand rank */
  npcHandRank: HandRank;
  /** Damage dealt by NPC */
  npcDamage: number;
  /** Player HP after round */
  playerHPAfter: number;
  /** NPC HP after round */
  npcHPAfter: number;
}

/**
 * Loot awarded from combat
 */
export interface LootAwarded {
  /** Gold awarded */
  gold: number;
  /** Experience awarded */
  xp: number;
  /** Items awarded */
  items: string[];
}

/**
 * Combat encounter
 */
export interface CombatEncounter {
  /** Encounter unique identifier */
  _id?: string;
  /** Character participating in combat */
  characterId: string;
  /** NPC being fought */
  npcId: string;
  /** Populated NPC data (for frontend) */
  npc?: NPC;
  /** Current player HP */
  playerHP: number;
  /** Player's max HP */
  playerMaxHP: number;
  /** Current NPC HP */
  npcHP: number;
  /** NPC's max HP */
  npcMaxHP: number;
  /** Current turn (0 = player, 1 = NPC) */
  turn: number;
  /** Current round number */
  roundNumber: number;
  /** History of all rounds */
  rounds: CombatRound[];
  /** Combat status */
  status: CombatStatus;
  /** Loot awarded (if victory) */
  lootAwarded?: LootAwarded;
  /** Combat start time */
  startedAt: Date;
  /** Combat end time */
  endedAt?: Date;
}

/**
 * Combat stats for a character
 */
export interface CombatStats {
  /** Total wins */
  wins: number;
  /** Victories (alias) */
  victories?: number;
  /** Total losses */
  losses: number;
  /** Defeats (alias) */
  defeats?: number;
  /** Total damage dealt */
  totalDamage: number;
  /** Total kills */
  kills: number;
  /** Win rate percentage */
  winRate?: number;
  /** Total gold gained */
  totalGoldGained?: number;
}

/**
 * Inventory item display info
 */
export interface InventoryItemDisplay {
  /** Item name */
  name: string;
  /** Item rarity */
  rarity: string;
  /** Item value in gold */
  value: number;
  /** Quantity owned */
  quantity: number;
}

/**
 * Combat turn result
 */
export interface CombatTurnResult {
  /** Updated encounter */
  encounter: CombatEncounter;
  /** Player's round (if player turn was played) */
  playerRound?: CombatRound;
  /** NPC's round (if NPC turn was auto-played) */
  npcRound?: CombatRound;
  /** Combat ended flag */
  combatEnded: boolean;
  /** Loot awarded (if victory) */
  lootAwarded?: LootAwarded;
  /** Death penalty info (if defeat) */
  deathPenalty?: {
    goldLost: number;
    respawned: boolean;
  };
}

/**
 * Flee attempt result
 */
export interface FleeResult {
  /** Whether flee was successful */
  success: boolean;
  /** Message describing the result */
  message: string;
  /** Updated encounter if flee succeeded */
  encounter?: CombatEncounter;
}

/**
 * Turn result alias for frontend compatibility
 */
export type TurnResult = CombatTurnResult;

/**
 * NPC list response
 */
export interface NPCListResponse {
  /** Total NPCs */
  total: number;
  /** NPCs by type */
  byType: {
    [key in NPCType]: NPC[];
  };
}

/**
 * Combat history entry
 */
export interface CombatHistoryEntry {
  /** Encounter ID */
  _id: string;
  /** NPC name */
  npcName: string;
  /** NPC level */
  npcLevel: number;
  /** Combat status */
  status: CombatStatus;
  /** Total rounds */
  rounds: number;
  /** Damage dealt */
  damageDealt: number;
  /** Gold earned */
  goldEarned: number;
  /** XP earned */
  xpEarned: number;
  /** Combat date */
  date: Date;
}

/**
 * Combat history response
 */
export interface CombatHistoryResponse {
  /** Total encounters */
  total: number;
  /** Combat stats */
  stats: CombatStats;
  /** Recent encounters */
  encounters: CombatHistoryEntry[];
  /** Current page */
  page: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Looted item with rarity
 */
export interface LootedItem {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Combat result (frontend-friendly summary)
 */
export interface CombatResult {
  /** Encounter ID */
  encounterId: string;
  /** Whether player won */
  victory: boolean;
  /** Combat status */
  status: CombatStatus;
  /** NPC name */
  npcName: string;
  /** NPC level */
  npcLevel: number;
  /** Total rounds fought */
  rounds: number;
  /** Total rounds (alias) */
  totalRounds?: number;
  /** Total damage dealt */
  damageDealt: number;
  /** Total damage dealt (alias) */
  totalDamageDealt?: number;
  /** Damage taken */
  damageTaken: number;
  /** Total damage taken (alias) */
  totalDamageTaken?: number;
  /** Gold earned */
  goldEarned: number;
  /** Gold gained (alias) */
  goldGained?: number;
  /** Gold lost on defeat */
  goldLost?: number;
  /** XP earned */
  xpEarned: number;
  /** XP gained (alias) */
  xpGained?: number;
  /** Items earned */
  itemsEarned: string[];
  /** Items looted with details */
  itemsLooted?: LootedItem[];
  /** Combat date */
  date: Date;
}
