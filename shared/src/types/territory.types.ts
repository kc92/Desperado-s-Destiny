/**
 * Territory Types
 *
 * Shared types for territory system
 */

/**
 * Territory faction enum
 */
export enum TerritoryFaction {
  SETTLER = 'SETTLER',
  NAHI = 'NAHI',
  FRONTERA = 'FRONTERA',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Territory benefits
 */
export interface TerritoryBenefits {
  goldBonus: number;
  xpBonus: number;
  energyRegen: number;
  energyBonus?: number;
}

/**
 * Conquest history entry
 */
export interface ConquestHistoryEntry {
  gangId: string;
  gangName: string;
  conqueredAt: string;
  capturePoints: number;
}

/**
 * Territory position for map display
 */
export interface TerritoryPosition {
  x: number;
  y: number;
}

/**
 * Territory
 */
export interface Territory {
  _id: string;
  id: string;
  name: string;
  description: string;
  faction: TerritoryFaction;
  controllingGangId: string | null;
  controllingGangName?: string | null;
  capturePoints: number;
  benefits: TerritoryBenefits;
  difficulty: number;
  lastConqueredAt: string | null;
  conquestHistory: ConquestHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  position?: TerritoryPosition;
  isUnderSiege?: boolean;
}

/**
 * Territory statistics
 */
export interface TerritoryStats {
  total: number;
  controlled: number;
  available: number;
  byFaction: Record<string, number>;
}
