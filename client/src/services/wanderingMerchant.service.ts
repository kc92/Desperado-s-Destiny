/**
 * Wandering Merchant Service
 * API client for wandering merchant operations
 */

import { apiCall } from './api';

// ========================================
// Type Definitions
// ========================================

/**
 * Route stop interface - defines where and when a merchant stops
 */
export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number;      // Day of week (1=Monday, 7=Sunday)
  departureDay: number;
  arrivalHour: number;      // Hour of arrival (0-23)
  departureHour: number;    // Hour of departure (0-23)
}

/**
 * Shop item for wandering merchant
 */
export interface MerchantItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  rarity: string;
  type: 'weapon' | 'armor' | 'consumable' | 'mount' | 'material' | 'quest';
  trustRequired?: number;   // Trust level required (0-5), default 0
  quantity?: number;        // Limited stock
  isExclusive?: boolean;    // Only this merchant sells it
}

/**
 * Merchant dialogue by context
 */
export interface MerchantDialogue {
  greeting: string[];
  trading: string[];
  departure: string[];
  busy: string[];
  trust: {
    low: string[];      // Trust 0-1
    medium: string[];   // Trust 2-3
    high: string[];     // Trust 4-5
  };
}

/**
 * Trust unlock - special items/prices available at higher trust
 */
export interface TrustUnlock {
  level: number;
  benefit: string;
  description: string;
}

/**
 * Complete wandering merchant definition
 */
export interface WanderingMerchant {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  faction: string;
  route: RouteStop[];
  inventory: MerchantItem[];
  dialogue: MerchantDialogue;
  specialFeatures: string[];
  trustLevels: TrustUnlock[];
  barter?: boolean;             // Uses barter instead of gold
  hidden?: boolean;             // Must be discovered
  discoveryCondition?: string;
}

/**
 * Merchant state with location and availability information
 */
export interface WanderingMerchantState {
  npcId: string;
  npcName: string;
  currentActivity: string;
  currentLocation: string;
  currentLocationName: string;
  isAvailable: boolean;
  activityDialogue?: string;
  startTime?: string;
  endTime?: string;
  nextActivity?: string;
  merchantId: string;
  merchantName: string;
  currentStop?: RouteStop;
  nextStop?: RouteStop;
  isAvailableForTrade: boolean;
  inventory: MerchantItem[];
  specialFeatures: string[];
  usesBarter: boolean;
  isHidden: boolean;
  discoveryCondition?: string;
}

/**
 * Upcoming merchant arrival information
 */
export interface UpcomingMerchantArrival {
  merchant: WanderingMerchant;
  arrivalTime: string;
  hoursUntilArrival: number;
}

/**
 * Merchant statistics
 */
export interface MerchantStatistics {
  totalMerchants: number;
  availableNow: number;
  hiddenMerchants: number;
  byFaction: Record<string, number>;
}

/**
 * Trust level info response
 */
export interface TrustLevelInfo {
  currentLevel: number;
  unlocks: TrustUnlock[];
  currentUnlocks: TrustUnlock[];
  nextUnlock?: TrustUnlock;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  message: string;
  item: MerchantItem;
  quantity: number;
  totalCost: number;
  priceModifier: number;
  newGold: number;
  inventory: any[];
}

/**
 * Discovery result
 */
export interface DiscoveryResult {
  merchant: WanderingMerchant;
  message: string;
}

// ========================================
// API Functions
// ========================================

/**
 * Get all wandering merchants
 * GET /api/merchants/all
 */
export async function getAllMerchants(faction?: string): Promise<{
  merchants: WanderingMerchant[];
  total: number;
}> {
  const url = faction ? `/merchants/all?faction=${encodeURIComponent(faction)}` : '/merchants/all';
  return apiCall<{ merchants: WanderingMerchant[]; total: number }>('get', url);
}

/**
 * Get currently available merchants
 * GET /api/merchants/available
 */
export async function getAvailableMerchants(): Promise<{
  merchants: WanderingMerchantState[];
  total: number;
}> {
  return apiCall<{ merchants: WanderingMerchantState[]; total: number }>('get', '/merchants/available');
}

/**
 * Get specific merchant details
 * GET /api/merchants/:merchantId
 */
export async function getMerchantDetails(merchantId: string): Promise<{
  merchant: WanderingMerchant;
  state: WanderingMerchantState;
  schedule: any;
}> {
  return apiCall<{
    merchant: WanderingMerchant;
    state: WanderingMerchantState;
    schedule: any;
  }>('get', `/merchants/${merchantId}`);
}

/**
 * Get merchant's current state (location, availability)
 * GET /api/merchants/:merchantId/state
 */
export async function getMerchantState(merchantId: string): Promise<WanderingMerchantState> {
  return apiCall<WanderingMerchantState>('get', `/merchants/${merchantId}/state`);
}

/**
 * Get merchants at a specific location
 * GET /api/merchants/at-location/:locationId
 */
export async function getMerchantsAtLocation(locationId: string): Promise<{
  merchants: WanderingMerchant[];
  locationId: string;
  total: number;
}> {
  return apiCall<{
    merchants: WanderingMerchant[];
    locationId: string;
    total: number;
  }>('get', `/merchants/at-location/${locationId}`);
}

/**
 * Get upcoming merchants arriving at location
 * GET /api/merchants/upcoming/:locationId
 */
export async function getUpcomingMerchants(locationId: string, hours: number = 48): Promise<{
  upcoming: UpcomingMerchantArrival[];
  locationId: string;
  hoursAhead: number;
  total: number;
}> {
  return apiCall<{
    upcoming: UpcomingMerchantArrival[];
    locationId: string;
    hoursAhead: number;
    total: number;
  }>('get', `/merchants/upcoming/${locationId}?hours=${hours}`);
}

/**
 * Search merchants by name or goods
 * GET /api/merchants/search
 */
export async function searchMerchants(query: string): Promise<{
  merchants: WanderingMerchant[];
  query: string;
  total: number;
}> {
  return apiCall<{
    merchants: WanderingMerchant[];
    query: string;
    total: number;
  }>('get', `/merchants/search?q=${encodeURIComponent(query)}`);
}

/**
 * Get merchant inventory (filtered by player trust)
 * GET /api/merchants/:merchantId/inventory
 */
export async function getMerchantInventory(merchantId: string): Promise<{
  inventory: MerchantItem[];
  priceModifier: number;
  trustLevel: number;
  total: number;
}> {
  return apiCall<{
    inventory: MerchantItem[];
    priceModifier: number;
    trustLevel: number;
    total: number;
  }>('get', `/merchants/${merchantId}/inventory`);
}

/**
 * Get merchant dialogue
 * GET /api/merchants/:merchantId/dialogue
 */
export async function getMerchantDialogue(
  merchantId: string,
  context: 'greeting' | 'trading' | 'departure' | 'busy' = 'greeting'
): Promise<{
  dialogue: string;
  context: string;
  trustLevel: number;
}> {
  return apiCall<{
    dialogue: string;
    context: string;
    trustLevel: number;
  }>('get', `/merchants/${merchantId}/dialogue?context=${context}`);
}

/**
 * Get trust level info for merchant
 * GET /api/merchants/:merchantId/trust
 */
export async function getMerchantTrustInfo(merchantId: string): Promise<TrustLevelInfo> {
  return apiCall<TrustLevelInfo>('get', `/merchants/${merchantId}/trust`);
}

/**
 * Get merchant statistics
 * GET /api/merchants/stats
 */
export async function getMerchantStats(): Promise<MerchantStatistics> {
  return apiCall<MerchantStatistics>('get', '/merchants/stats');
}

/**
 * Get merchants visible to player (including discovered hidden ones)
 * GET /api/merchants/visible
 * Requires authentication
 */
export async function getVisibleMerchants(): Promise<{
  merchants: WanderingMerchant[];
  total: number;
}> {
  return apiCall<{ merchants: WanderingMerchant[]; total: number }>('get', '/merchants/visible');
}

/**
 * Discover a hidden merchant
 * POST /api/merchants/:merchantId/discover
 * Requires authentication
 */
export async function discoverMerchant(merchantId: string): Promise<DiscoveryResult> {
  return apiCall<DiscoveryResult>('post', `/merchants/${merchantId}/discover`);
}

/**
 * Buy an item from a wandering merchant
 * POST /api/merchants/:merchantId/buy
 * Requires authentication
 */
export async function buyFromMerchant(
  merchantId: string,
  itemId: string,
  quantity: number = 1
): Promise<PurchaseResult> {
  return apiCall<PurchaseResult>('post', `/merchants/${merchantId}/buy`, {
    itemId,
    quantity,
  });
}

// ========================================
// Default Export
// ========================================

const wanderingMerchantService = {
  getAllMerchants,
  getAvailableMerchants,
  getMerchantDetails,
  getMerchantState,
  getMerchantsAtLocation,
  getUpcomingMerchants,
  searchMerchants,
  getMerchantInventory,
  getMerchantDialogue,
  getMerchantTrustInfo,
  getMerchantStats,
  getVisibleMerchants,
  discoverMerchant,
  buyFromMerchant,
};

export default wanderingMerchantService;
