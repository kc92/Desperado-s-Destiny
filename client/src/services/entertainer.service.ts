/**
 * Entertainer Service
 * API methods for the wandering entertainer system
 * Part of Phase 4, Wave 4.1 - Entertainment System
 */

import { apiCall } from './api';

/**
 * Performance types available
 */
export enum PerformanceType {
  PIANO = 'piano',
  MAGIC = 'magic',
  SINGING = 'singing',
  STORYTELLING = 'storytelling',
  DANCING = 'dancing',
  HARMONICA = 'harmonica',
  WILD_WEST_SHOW = 'wild_west_show',
  FORTUNE_TELLING = 'fortune_telling',
  GOSPEL = 'gospel',
  COMEDY = 'comedy'
}

/**
 * Route stop for wandering entertainers
 */
export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number;
  stayDuration: number;
  performanceVenue: string;
}

/**
 * Performance definition
 */
export interface Performance {
  id: string;
  name: string;
  description: string;
  performanceType: PerformanceType;
  duration: number;
  energyCost: number;
  moodEffect: {
    mood: string;
    duration: number;
    intensity: number;
  };
  rewards?: {
    experience?: number;
    gold?: number;
    item?: string;
    buff?: {
      stat: string;
      modifier: number;
      duration: number;
    };
  };
}

/**
 * Teachable skill from entertainer
 */
export interface TeachableSkill {
  skillId: string;
  skillName: string;
  trustRequired: number;
  energyCost: number;
  goldCost: number;
  description: string;
  effect: {
    stat: string;
    modifier: number;
    permanent: boolean;
  };
}

/**
 * Entertainer dialogue
 */
export interface EntertainerDialogue {
  greeting: string[];
  aboutPerformance: string[];
  sharingGossip: string[];
  teachingSkill: string[];
  farewell: string[];
  duringPerformance: string[];
}

/**
 * Complete wandering entertainer definition
 */
export interface WanderingEntertainer {
  id: string;
  name: string;
  title: string;
  performanceType: PerformanceType;
  description: string;
  personality: string;
  baseMood: string;
  route: RouteStop[];
  performances: Performance[];
  dialogue: EntertainerDialogue;
  specialAbilities?: string[];
  teachableSkills?: TeachableSkill[];
  gossipAccess?: string[];
  trustLevel: number;
}

/**
 * Response types
 */
export interface GetAllEntertainersResponse {
  entertainers: WanderingEntertainer[];
  count: number;
}

export interface GetEntertainerDetailsResponse {
  entertainer: WanderingEntertainer;
}

export interface GetEntertainersByTypeResponse {
  entertainers: WanderingEntertainer[];
  count: number;
  type: string;
}

export interface GetEntertainersAtLocationResponse {
  entertainers: WanderingEntertainer[];
  count: number;
  locationId: string;
  currentDay: number;
}

export interface GetLocationPerformancesResponse {
  performances: Array<{
    entertainer: WanderingEntertainer;
    performance: Performance;
    venue: string;
  }>;
  count: number;
  locationId: string;
  currentDay: number;
}

export interface GetEntertainerLocationResponse {
  locationId: string;
  locationName: string;
  venue: string;
  daysRemaining: number;
  entertainerId: string;
  currentDay: number;
}

export interface GetEntertainerScheduleResponse {
  schedule: RouteStop[];
  entertainerId: string;
}

export interface IsEntertainerPerformingResponse {
  isPerforming: boolean;
  entertainerId: string;
  currentHour: number;
}

export interface SearchEntertainersResponse {
  entertainers: WanderingEntertainer[];
  count: number;
  query: string;
}

export interface WatchPerformanceResponse {
  success: boolean;
  message: string;
  energySpent: number;
  rewards?: {
    experience?: number;
    gold?: number;
    item?: string;
    buff?: {
      stat: string;
      modifier: number;
      duration: number;
    };
  };
  moodEffect: {
    mood: string;
    duration: number;
    intensity: number;
  };
}

export interface LearnSkillResponse {
  success: boolean;
  message: string;
  energySpent: number;
  goldSpent: number;
  skillLearned: TeachableSkill;
}

export interface GetGossipResponse {
  gossip: Array<{
    category: string;
    text: string;
    trustRequired: number;
  }>;
  entertainerId: string;
  trustLevel: number;
}

export interface GetRecommendedPerformancesResponse {
  performances: Array<{
    entertainer: WanderingEntertainer;
    performance: Performance;
    reason: string;
  }>;
  count: number;
}

export interface CheckAffordPerformanceResponse {
  canAfford: boolean;
  reason?: string;
  performanceId: string;
  performanceName: string;
  energyCost: number;
  characterEnergy: number;
}

/**
 * Get all entertainers
 */
export async function getAllEntertainers(): Promise<GetAllEntertainersResponse> {
  return apiCall<GetAllEntertainersResponse>('get', '/entertainers');
}

/**
 * Get entertainer by ID
 */
export async function getEntertainerDetails(entertainerId: string): Promise<GetEntertainerDetailsResponse> {
  return apiCall<GetEntertainerDetailsResponse>('get', `/entertainers/${entertainerId}`);
}

/**
 * Get entertainers by performance type
 */
export async function getEntertainersByType(type: PerformanceType): Promise<GetEntertainersByTypeResponse> {
  return apiCall<GetEntertainersByTypeResponse>('get', `/entertainers/type/${type}`);
}

/**
 * Get entertainers at a specific location
 */
export async function getEntertainersAtLocation(
  locationId: string,
  day?: number
): Promise<GetEntertainersAtLocationResponse> {
  const params = day !== undefined ? `?day=${day}` : '';
  return apiCall<GetEntertainersAtLocationResponse>('get', `/entertainers/location/${locationId}${params}`);
}

/**
 * Get available performances at a location
 */
export async function getLocationPerformances(
  locationId: string,
  day?: number
): Promise<GetLocationPerformancesResponse> {
  const params = day !== undefined ? `?day=${day}` : '';
  return apiCall<GetLocationPerformancesResponse>('get', `/entertainers/performances/location/${locationId}${params}`);
}

/**
 * Get entertainer's current location
 */
export async function getEntertainerLocation(
  entertainerId: string,
  day?: number
): Promise<GetEntertainerLocationResponse> {
  const params = day !== undefined ? `?day=${day}` : '';
  return apiCall<GetEntertainerLocationResponse>('get', `/entertainers/${entertainerId}/location${params}`);
}

/**
 * Get entertainer schedule
 */
export async function getEntertainerSchedule(entertainerId: string): Promise<GetEntertainerScheduleResponse> {
  return apiCall<GetEntertainerScheduleResponse>('get', `/entertainers/${entertainerId}/schedule`);
}

/**
 * Check if entertainer is currently performing
 */
export async function isEntertainerPerforming(
  entertainerId: string,
  hour?: number
): Promise<IsEntertainerPerformingResponse> {
  const params = hour !== undefined ? `?hour=${hour}` : '';
  return apiCall<IsEntertainerPerformingResponse>('get', `/entertainers/${entertainerId}/performing${params}`);
}

/**
 * Search entertainers by name
 */
export async function searchEntertainers(query: string): Promise<SearchEntertainersResponse> {
  return apiCall<SearchEntertainersResponse>('get', `/entertainers/search?q=${encodeURIComponent(query)}`);
}

/**
 * Get recommended performances for the character
 */
export async function getRecommendedPerformances(needs?: string[]): Promise<GetRecommendedPerformancesResponse> {
  const params = needs && needs.length > 0 ? `?needs=${needs.join(',')}` : '';
  return apiCall<GetRecommendedPerformancesResponse>('get', `/entertainers/recommendations${params}`);
}

/**
 * Get gossip from an entertainer (requires trust)
 */
export async function getGossipFromEntertainer(
  entertainerId: string,
  category?: string
): Promise<GetGossipResponse> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiCall<GetGossipResponse>('get', `/entertainers/${entertainerId}/gossip${params}`);
}

/**
 * Check if character can afford a performance
 */
export async function checkAffordPerformance(
  entertainerId: string,
  performanceId: string
): Promise<CheckAffordPerformanceResponse> {
  return apiCall<CheckAffordPerformanceResponse>(
    'get',
    `/entertainers/${entertainerId}/performances/${performanceId}/check-afford`
  );
}

/**
 * Watch a performance (costs energy, gives rewards)
 */
export async function watchPerformance(
  entertainerId: string,
  performanceId: string
): Promise<WatchPerformanceResponse> {
  return apiCall<WatchPerformanceResponse>(
    'post',
    `/entertainers/${entertainerId}/performances/${performanceId}/watch`
  );
}

/**
 * Learn a skill from an entertainer (costs energy and gold, requires trust)
 */
export async function learnSkill(
  entertainerId: string,
  skillId: string
): Promise<LearnSkillResponse> {
  return apiCall<LearnSkillResponse>(
    'post',
    `/entertainers/${entertainerId}/skills/${skillId}/learn`
  );
}

/**
 * Default export with all methods
 */
const entertainerService = {
  getAllEntertainers,
  getEntertainerDetails,
  getEntertainersByType,
  getEntertainersAtLocation,
  getLocationPerformances,
  getEntertainerLocation,
  getEntertainerSchedule,
  isEntertainerPerforming,
  searchEntertainers,
  getRecommendedPerformances,
  getGossipFromEntertainer,
  checkAffordPerformance,
  watchPerformance,
  learnSkill,
};

export default entertainerService;
