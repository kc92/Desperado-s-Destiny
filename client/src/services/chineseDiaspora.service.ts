/**
 * Chinese Diaspora Service
 * API methods for the hidden Chinese immigrant network reputation system
 */

import { apiCall } from './api';
import {
  DiscoveryMethodRep,
  DiasporaReputationAction,
  DiasporaService,
  DiasporaTrustLevel,
  NetworkStanding,
  TrustLevelConfig
} from '@desperados/shared';

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Network status response when not discovered
 */
interface NetworkNotDiscoveredResponse {
  discovered: false;
  message: string;
}

/**
 * Network status response when discovered
 */
interface NetworkDiscoveredResponse {
  discovered: true;
  trustLevel: DiasporaTrustLevel;
  trustLevelName: string;
  trustLevelChinese: string;
  trustLevelPinyin: string;
  reputationPoints: number;
  networkStanding: NetworkStanding;
  discoveryMethod: DiscoveryMethodRep;
  discoveryDate: Date;
  knownNpcs: number;
  knownLocations: number;
  completedQuests: number;
  services: DiasporaService[];
  safeHouseAccess: boolean;
  safeHouseExpiresAt: Date | null;
  permanentSafeHouse: boolean;
  undergroundRailroadParticipant: boolean;
  isExiled: boolean;
  betrayals: number;
  vouchedBy: number;
  hasVouchedFor: number;
}

/**
 * Combined network status response
 */
type NetworkStatusResponse = NetworkNotDiscoveredResponse | NetworkDiscoveredResponse;

/**
 * Request to discover the network
 */
interface DiscoverNetworkRequest {
  characterId: string;
  method: DiscoveryMethodRep;
  npcId: string;
  locationId?: string;
}

/**
 * Discovery response
 */
interface DiscoveryResponse {
  discovered: true;
  firstDiscovery: boolean;
  message: string;
  trustLevel: DiasporaTrustLevel;
  reputationPoints: number;
  networkStanding: NetworkStanding;
}

/**
 * Network contact/NPC information
 */
interface NetworkContact {
  npcId: string;
  name: string;
  chineseName?: string;
  location: string;
  role: string;
  relationshipLevel: number;
  available: boolean;
}

/**
 * Contacts list response
 */
interface ContactsResponse {
  contacts: NetworkContact[];
  total: number;
}

/**
 * NPC interaction request
 */
interface InteractWithNPCRequest {
  characterId: string;
}

/**
 * NPC interaction response
 */
interface NPCInteractionResponse {
  success: boolean;
  message: string;
  dialogue?: string[];
  servicesOffered?: DiasporaService[];
  questsAvailable?: string[];
  relationshipChange?: number;
}

/**
 * Add reputation request
 */
interface AddReputationRequest {
  characterId: string;
  action: DiasporaReputationAction;
  customAmount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Reputation change response
 */
interface ReputationChangeResponse {
  reputationPoints: number;
  trustLevel: DiasporaTrustLevel;
  change: number;
  leveledUp: boolean;
  newLevel?: DiasporaTrustLevel;
  message: string;
}

/**
 * Remove reputation request
 */
interface RemoveReputationRequest {
  characterId: string;
  action: DiasporaReputationAction;
  customAmount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Reputation loss response
 */
interface ReputationLossResponse {
  reputationPoints: number;
  trustLevel: DiasporaTrustLevel;
  change: number;
  leveledDown: boolean;
  exiled: boolean;
  message: string;
}

/**
 * Vouch request
 */
interface VouchRequest {
  voucherId: string;
  targetCharacterId: string;
}

/**
 * Vouch response
 */
interface VouchResponse {
  message: string;
  trustGranted?: number;
}

/**
 * Service request
 */
interface ServiceRequest {
  characterId: string;
  service: DiasporaService;
}

/**
 * Safe house service response
 */
interface SafeHouseResponse {
  message: string;
  duration?: number;
  expiresAt?: Date;
}

/**
 * Generic service response
 */
interface GenericServiceResponse {
  message: string;
  service: DiasporaService;
}

/**
 * Combined service response
 */
type ServiceResponse = SafeHouseResponse | GenericServiceResponse;

/**
 * Available services response
 */
interface AvailableServicesResponse {
  services: DiasporaService[];
  trustLevel: DiasporaTrustLevel;
  trustLevelInfo: TrustLevelConfig;
}

/**
 * Leaderboard entry
 */
interface LeaderboardEntry {
  characterId: string;
  reputationPoints: number;
  trustLevel: DiasporaTrustLevel;
  discoveryDate: Date;
  networkStanding: NetworkStanding;
}

/**
 * Leaderboard response
 */
interface LeaderboardResponse {
  dragons: LeaderboardEntry[];
}

/**
 * Weekly bonus response
 */
interface WeeklyBonusResponse {
  message: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get character's network status (null if not discovered)
 */
export async function getStatus(characterId: string): Promise<NetworkStatusResponse> {
  return apiCall<NetworkStatusResponse>('get', `/diaspora/status?characterId=${characterId}`);
}

/**
 * Discover the network for the first time
 */
export async function discoverNetwork(request: DiscoverNetworkRequest): Promise<DiscoveryResponse> {
  return apiCall<DiscoveryResponse>('post', '/diaspora/discover', request);
}

/**
 * Get known network contacts
 */
export async function getContacts(characterId: string): Promise<ContactsResponse> {
  return apiCall<ContactsResponse>('get', `/diaspora/contacts?characterId=${characterId}`);
}

/**
 * Interact with a network NPC
 */
export async function interactWithNPC(npcId: string, characterId: string): Promise<NPCInteractionResponse> {
  const request: InteractWithNPCRequest = { characterId };
  return apiCall<NPCInteractionResponse>('post', `/diaspora/interact/${npcId}`, request);
}

/**
 * Add reputation (for quest completion, helping NPCs, etc.)
 */
export async function addReputation(request: AddReputationRequest): Promise<ReputationChangeResponse> {
  return apiCall<ReputationChangeResponse>('post', '/diaspora/reputation/add', request);
}

/**
 * Remove reputation (for betrayals, crimes against network, etc.)
 */
export async function removeReputation(request: RemoveReputationRequest): Promise<ReputationLossResponse> {
  return apiCall<ReputationLossResponse>('post', '/diaspora/reputation/remove', request);
}

/**
 * Vouch for another character
 */
export async function vouchForCharacter(request: VouchRequest): Promise<VouchResponse> {
  return apiCall<VouchResponse>('post', '/diaspora/vouch', request);
}

/**
 * Request a network service
 */
export async function requestService(request: ServiceRequest): Promise<ServiceResponse> {
  return apiCall<ServiceResponse>('post', '/diaspora/request-service', request);
}

/**
 * Get available services for character
 */
export async function getAvailableServices(characterId: string): Promise<AvailableServicesResponse> {
  return apiCall<AvailableServicesResponse>('get', `/diaspora/services?characterId=${characterId}`);
}

/**
 * Get leaderboard of Dragons (highest trust level)
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
  return apiCall<LeaderboardResponse>('get', `/diaspora/leaderboard?limit=${limit}`);
}

/**
 * Process weekly secret-keeping bonus (internal/job endpoint)
 */
export async function processWeeklyBonus(characterId: string): Promise<WeeklyBonusResponse> {
  return apiCall<WeeklyBonusResponse>('post', '/diaspora/weekly-bonus', { characterId });
}

// ============================================================================
// Service Object Export
// ============================================================================

const chineseDiasporaService = {
  getStatus,
  discoverNetwork,
  getContacts,
  interactWithNPC,
  addReputation,
  removeReputation,
  vouchForCharacter,
  requestService,
  getAvailableServices,
  getLeaderboard,
  processWeeklyBonus,
};

export default chineseDiasporaService;
