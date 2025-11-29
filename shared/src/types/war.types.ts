/**
 * Gang War Types
 *
 * Shared types for gang warfare system
 */

/**
 * War status enum
 */
export enum WarStatus {
  ACTIVE = 'ACTIVE',
  ATTACKER_WON = 'ATTACKER_WON',
  DEFENDER_WON = 'DEFENDER_WON',
  CANCELLED = 'CANCELLED',
}

/**
 * War contribution
 */
export interface WarContribution {
  characterId: string;
  characterName: string;
  amount: number;
  contributedAt: string;
}

/**
 * War log entry
 */
export interface WarLogEntry {
  timestamp: string;
  event: string;
  data: Record<string, unknown>;
}

/**
 * Territory Gang War (basic structure)
 * Note: For comprehensive gang warfare, use GangWar from gangWar.types.ts
 */
export interface TerritoryGangWar {
  _id: string;
  attackerGangId: string;
  attackerGangName: string;
  attackerGangTag?: string;
  defenderGangId: string | null;
  defenderGangName: string | null;
  defenderGangTag?: string;
  territoryId: string;
  territoryName?: string;
  status: WarStatus;
  declaredAt: string;
  resolveAt: string;
  endsAt?: string;
  attackerFunding: number;
  defenderFunding: number;
  attackerContributions: WarContribution[];
  defenderContributions: WarContribution[];
  capturePoints: number;
  warLog: WarLogEntry[];
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * War declaration request
 */
export interface DeclareWarRequest {
  funding: number;
}

/**
 * War contribution request
 */
export interface ContributeToWarRequest {
  amount: number;
}
