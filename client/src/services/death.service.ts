/**
 * Death Service
 * API methods for death, respawn, and death statistics system
 */

import { apiCall } from './api';
import { DeathType, DeathPenalty, DeathStats } from '@desperados/shared';

/**
 * Death status response
 */
export interface DeathStatusResponse {
  isDead: boolean;
  currentLocation: string;
  energy: number;
  maxEnergy: number;
}

/**
 * Death trigger request
 */
export interface TriggerDeathRequest {
  deathType: DeathType;
}

/**
 * Death trigger response
 */
export interface TriggerDeathResponse {
  message: string;
  penalty: DeathPenalty;
  respawnLocation: string;
  respawnDelay: number;
}

/**
 * Respawn request
 */
export interface RespawnRequest {
  locationId?: string;
}

/**
 * Respawn response
 */
export interface RespawnResponse {
  message: string;
  characterId: string;
  name: string;
  currentLocation: string;
  energy: number;
  maxEnergy: number;
}

/**
 * Death penalty info
 */
export interface DeathPenaltyInfo {
  deathType: DeathType;
  penalties: {
    goldLoss: number;
    xpLoss: number;
    itemDropChance: number;
  };
  respawnDelay: number;
}

/**
 * Death penalties response
 */
export interface DeathPenaltiesResponse {
  penalties: DeathPenaltyInfo[];
}

/**
 * Check jail request
 */
export interface CheckJailRequest {
  killerType: 'lawful_npc' | 'lawful_player' | 'outlaw';
}

/**
 * Check jail response
 */
export interface CheckJailResponse {
  shouldSendToJail: boolean;
  wantedLevel: number;
  jailSentenceMinutes: number;
}

/**
 * Get current death/respawn status for authenticated character
 */
export async function getStatus(): Promise<DeathStatusResponse> {
  return apiCall<DeathStatusResponse>('get', '/death/status');
}

/**
 * Get death statistics and history for authenticated character
 */
export async function getHistory(): Promise<DeathStats> {
  return apiCall<DeathStats>('get', '/death/history');
}

/**
 * Get information about death penalties for each death type
 */
export async function getPenalties(): Promise<DeathPenaltiesResponse> {
  return apiCall<DeathPenaltiesResponse>('get', '/death/penalties');
}

/**
 * Trigger death for a character
 */
export async function triggerDeath(request: TriggerDeathRequest): Promise<TriggerDeathResponse> {
  return apiCall<TriggerDeathResponse>('post', '/death/trigger', request);
}

/**
 * Respawn character at designated location
 */
export async function respawn(request?: RespawnRequest): Promise<RespawnResponse> {
  return apiCall<RespawnResponse>('post', '/death/respawn', request || {});
}

/**
 * Check if death should result in jail time instead
 */
export async function checkJail(request: CheckJailRequest): Promise<CheckJailResponse> {
  return apiCall<CheckJailResponse>('post', '/death/check-jail', request);
}

const deathService = {
  getStatus,
  getHistory,
  getPenalties,
  triggerDeath,
  respawn,
  checkJail,
};

export default deathService;
