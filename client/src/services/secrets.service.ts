/**
 * Secrets Service
 * API methods for secret discovery and hidden content
 */

import { apiCall } from './api';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Secret types enumeration
 */
export type SecretType =
  | 'location_secret'
  | 'npc_secret'
  | 'item_secret'
  | 'quest_secret'
  | 'lore_secret'
  | 'treasure_secret';

/**
 * Requirement types for unlocking secrets
 */
export type SecretRequirementType =
  | 'npc_trust'
  | 'quest_complete'
  | 'item_owned'
  | 'level'
  | 'faction_standing'
  | 'time'
  | 'secret_known'
  | 'achievement'
  | 'skill_level'
  | 'location_visit';

/**
 * Faction standing levels
 */
export type FactionStanding = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored';

/**
 * Individual requirement structure
 */
export interface SecretRequirement {
  type: SecretRequirementType;
  description: string;

  // NPC Trust requirement
  npcId?: string;
  trustLevel?: number;

  // Quest requirement
  questId?: string;

  // Item requirement
  itemId?: string;

  // Level requirement
  minLevel?: number;

  // Faction requirement
  faction?: 'settlerAlliance' | 'nahiCoalition' | 'frontera';
  standing?: FactionStanding;
  minReputation?: number;

  // Time requirement (in-game hours, 0-23)
  startHour?: number;
  endHour?: number;

  // Secret chain requirement
  secretId?: string;

  // Achievement requirement
  achievementType?: string;

  // Skill requirement
  skillId?: string;
  skillLevel?: number;

  // Location requirement
  locationId?: string;
  visitCount?: number;
}

/**
 * Reward types
 */
export type RewardType =
  | 'gold'
  | 'xp'
  | 'item'
  | 'quest_unlock'
  | 'location_access'
  | 'npc_dialogue'
  | 'lore_entry'
  | 'achievement';

/**
 * Secret reward structure
 */
export interface SecretReward {
  type: RewardType;

  // Gold/XP rewards
  amount?: number;

  // Item reward
  itemId?: string;
  itemName?: string;

  // Quest unlock
  questId?: string;
  questName?: string;

  // Location access
  locationId?: string;
  locationName?: string;

  // NPC dialogue
  npcId?: string;
  dialogueKey?: string;

  // Lore entry
  loreId?: string;
  loreTitle?: string;
  loreContent?: string;

  // Achievement
  achievementType?: string;
  achievementName?: string;

  // General description
  description?: string;
}

/**
 * Secret definition (template/blueprint)
 */
export interface SecretDefinition {
  secretId: string;
  name: string;
  description: string;
  type: SecretType;

  // Location-specific (optional)
  locationId?: string;

  // NPC-specific (optional)
  npcId?: string;

  // Requirements to unlock
  requirements: SecretRequirement[];

  // Reward for discovering
  rewards: SecretReward[];

  // Can this be discovered multiple times?
  isRepeatable: boolean;

  // Cooldown in minutes (for repeatable secrets)
  cooldownMinutes?: number;

  // Hint to show when character is close to qualifying
  hint?: string;

  // Is this secret active?
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Character's discovered secret
 */
export interface CharacterSecret {
  characterId: string;
  secretId: string;
  discoveredAt: Date;
  rewardClaimed: boolean;
  discoveryCount?: number;
  lastDiscoveredAt?: Date;
}

/**
 * Result of checking if a character can unlock a secret
 */
export interface SecretUnlockCheck {
  canUnlock: boolean;
  requirements: SecretRequirement[];
  metRequirements: string[];
  unmetRequirements: string[];
  progress?: number; // Percentage (0-100)
}

/**
 * Result of unlocking a secret
 */
export interface SecretUnlockResult {
  success: boolean;
  reward?: SecretReward[];
  message: string;
  secret?: CharacterSecret;
}

/**
 * Location secrets summary
 */
export interface LocationSecretsResult {
  discovered: Array<SecretDefinition & { discoveredAt: Date; rewardClaimed: boolean }>;
  hidden: number;
  hints: Array<{ secretId: string; hint: string }>;
}

/**
 * Discovered secret with details
 */
export interface DiscoveredSecret extends CharacterSecret {
  definition?: SecretDefinition;
}

/**
 * Secret type descriptor
 */
export interface SecretTypeDescriptor {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Secret statistics
 */
export interface SecretStatistics {
  totalDiscovered: number;
  byType: Record<string, number>;
  totalAvailable: number;
  recentDiscoveries: DiscoveredSecret[];
}

/**
 * Secret progress response
 */
export interface SecretProgressResponse {
  count: number;
  secrets: SecretDefinition[];
  message: string;
}

/**
 * Discovered secrets response
 */
export interface DiscoveredSecretsResponse {
  total: number;
  secrets: DiscoveredSecret[];
}

/**
 * Secrets by type response
 */
export interface SecretsByTypeResponse {
  discovered: DiscoveredSecret[];
  available: SecretDefinition[];
}

/**
 * Secret details response
 */
export interface SecretDetailsResponse {
  definition: SecretDefinition;
  discovered: CharacterSecret | null;
  unlockCheck: SecretUnlockCheck;
}

/**
 * NPC secrets response
 */
export interface NPCSecretsResponse {
  discovered: DiscoveredSecret[];
  available: Array<SecretDefinition & { progress: number }>;
}

/**
 * Secret types response
 */
export interface SecretTypesResponse {
  types: SecretTypeDescriptor[];
}

/**
 * Unlock secret request
 */
export interface UnlockSecretRequest {
  secretId: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all available secret types
 * GET /api/secrets/types
 */
export async function getSecretTypes(): Promise<SecretTypesResponse> {
  return apiCall<SecretTypesResponse>('get', '/secrets/types');
}

/**
 * Get character's secret statistics
 * GET /api/secrets/stats
 */
export async function getSecretStatistics(): Promise<SecretStatistics> {
  return apiCall<SecretStatistics>('get', '/secrets/stats');
}

/**
 * Check character's progress (newly qualified secrets)
 * GET /api/secrets/progress
 */
export async function checkSecretProgress(): Promise<SecretProgressResponse> {
  return apiCall<SecretProgressResponse>('get', '/secrets/progress');
}

/**
 * Get all discovered secrets
 * GET /api/secrets/discovered
 */
export async function getDiscoveredSecrets(): Promise<DiscoveredSecretsResponse> {
  return apiCall<DiscoveredSecretsResponse>('get', '/secrets/discovered');
}

/**
 * Get secrets by type
 * GET /api/secrets/type/:type
 */
export async function getSecretsByType(type: string): Promise<SecretsByTypeResponse> {
  return apiCall<SecretsByTypeResponse>('get', `/secrets/type/${type}`);
}

/**
 * Get secrets at a location
 * GET /api/secrets/location/:locationId
 */
export async function getLocationSecrets(locationId: string): Promise<LocationSecretsResult> {
  return apiCall<LocationSecretsResult>('get', `/secrets/location/${locationId}`);
}

/**
 * Get secrets related to an NPC
 * GET /api/secrets/npc/:npcId
 */
export async function getNPCSecrets(npcId: string): Promise<NPCSecretsResponse> {
  return apiCall<NPCSecretsResponse>('get', `/secrets/npc/${npcId}`);
}

/**
 * Check if can unlock a specific secret
 * GET /api/secrets/check/:secretId
 */
export async function checkSecretUnlock(secretId: string): Promise<SecretUnlockCheck> {
  return apiCall<SecretUnlockCheck>('get', `/secrets/check/${secretId}`);
}

/**
 * Get secret details
 * GET /api/secrets/:secretId
 */
export async function getSecretDetails(secretId: string): Promise<SecretDetailsResponse> {
  return apiCall<SecretDetailsResponse>('get', `/secrets/${secretId}`);
}

/**
 * Unlock a secret
 * POST /api/secrets/unlock
 */
export async function unlockSecret(secretId: string): Promise<SecretUnlockResult> {
  const data: UnlockSecretRequest = { secretId };
  return apiCall<SecretUnlockResult>('post', '/secrets/unlock', data);
}

// ============================================================================
// Default Export
// ============================================================================

const secretsService = {
  getSecretTypes,
  getSecretStatistics,
  checkSecretProgress,
  getDiscoveredSecrets,
  getSecretsByType,
  getLocationSecrets,
  getNPCSecrets,
  checkSecretUnlock,
  getSecretDetails,
  unlockSecret,
};

export default secretsService;
