/**
 * Admin Service
 * API methods for administrative operations - user management, economy monitoring, system analytics
 * All routes protected by authentication + admin role + rate limiting on backend
 */

import { apiCall } from './api';
import type { User, Character } from '@/types';

/**
 * Pagination response wrapper
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * User Management Types
 */
export interface GetUsersParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface UserDetailsResponse {
  user: User;
  characters: Character[];
}

export interface BanUserRequest {
  reason?: string;
}

export interface BanUserResponse {
  message: string;
  userId: string;
}

/**
 * Character Management Types
 */
export interface GetCharactersParams {
  search?: string;
  faction?: string;
  minLevel?: number;
  maxLevel?: number;
  page?: number;
  limit?: number;
}

export interface GetCharactersResponse {
  characters: Character[];
  pagination: PaginationInfo;
}

export interface UpdateCharacterRequest {
  gold?: number;
  level?: number;
  health?: number;
  energy?: number;
  wanted?: number;
}

export interface UpdateCharacterResponse {
  message: string;
  character: Character;
}

export interface DeleteCharacterResponse {
  message: string;
  characterId: string;
}

/**
 * Economy Management Types
 */
export interface AdjustGoldRequest {
  characterId: string;
  amount: number;
  reason?: string;
}

export interface AdjustGoldResponse {
  message: string;
  character: {
    _id: string;
    name: string;
    previousGold: number;
    newGold: number;
    adjustment: number;
  };
}

export interface AnalyticsResponse {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisWeek: number;
  };
  characters: {
    total: number;
    levelDistribution: Array<{
      _id: number;
      count: number;
    }>;
  };
  gangs: {
    total: number;
  };
  economy: {
    totalGoldInCirculation: number;
    averageGoldPerCharacter: number;
    totalTransactions: number;
    transactionVolume24h: number;
  };
}

/**
 * Gang Management Types
 */
export interface Gang {
  _id: string;
  name: string;
  tag: string;
  leaderId: string | { _id: string; name: string };
  bankBalance: number;
  reputation: number;
  memberCount: number;
  createdAt: string;
}

export interface GetGangsParams {
  page?: number;
  limit?: number;
}

export interface GetGangsResponse {
  gangs: Gang[];
  pagination: PaginationInfo;
}

export interface DisbandGangResponse {
  message: string;
  gangId: string;
}

/**
 * System Management Types
 */
export interface SystemSettings {
  environment: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  chatEnabled: boolean;
}

export interface UpdateSystemSettingsRequest {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  chatEnabled?: boolean;
}

export interface UpdateSystemSettingsResponse {
  message: string;
  settings: {
    maintenanceMode?: boolean;
    registrationEnabled?: boolean;
    chatEnabled?: boolean;
  };
}

export interface AuditLog {
  _id: string;
  userId?: string | { _id: string; email: string; username?: string };
  characterId?: string | { _id: string; name: string };
  action: string;
  endpoint: string;
  method: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: Record<string, unknown>;
  responseData?: Record<string, unknown>;
  timestamp: string;
}

export interface GetAuditLogsParams {
  userId?: string;
  action?: string;
  endpoint?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface GetAuditLogsResponse {
  logs: AuditLog[];
  pagination: PaginationInfo;
}

export interface ServerHealthResponse {
  server: {
    uptime: number;
    uptimeFormatted: string;
    nodeVersion: string;
    platform: string;
  };
  memory: {
    used: number;
    total: number;
    rss: number;
    system: {
      total: number;
      free: number;
      usagePercent: number;
    };
  };
  cpu: {
    count: number;
    loadAverage: number[];
  };
  database: {
    status: string;
    connected: boolean;
  };
}

/**
 * Territory Management Types
 */
export interface ResetTerritoriesResponse {
  message: string;
}

/**
 * USER MANAGEMENT
 */

/**
 * Get list of all users with filtering and pagination
 */
export async function getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append('search', params.search);
  if (params?.role) queryParams.append('role', params.role);
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiCall<GetUsersResponse>('get', url);
}

/**
 * Get detailed information about a specific user
 */
export async function getUserDetails(userId: string): Promise<UserDetailsResponse> {
  return apiCall<UserDetailsResponse>('get', `/admin/users/${userId}`);
}

/**
 * Ban a user
 */
export async function banUser(userId: string, request?: BanUserRequest): Promise<BanUserResponse> {
  return apiCall<BanUserResponse>('post', `/admin/users/${userId}/ban`, request);
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string): Promise<BanUserResponse> {
  return apiCall<BanUserResponse>('post', `/admin/users/${userId}/unban`);
}

/**
 * CHARACTER MANAGEMENT
 */

/**
 * Get list of all characters with filtering and pagination
 */
export async function getCharacters(params?: GetCharactersParams): Promise<GetCharactersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append('search', params.search);
  if (params?.faction) queryParams.append('faction', params.faction);
  if (params?.minLevel) queryParams.append('minLevel', String(params.minLevel));
  if (params?.maxLevel) queryParams.append('maxLevel', String(params.maxLevel));
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const url = `/admin/characters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiCall<GetCharactersResponse>('get', url);
}

/**
 * Modify a character's properties
 */
export async function updateCharacter(
  characterId: string,
  updates: UpdateCharacterRequest
): Promise<UpdateCharacterResponse> {
  return apiCall<UpdateCharacterResponse>('put', `/admin/characters/${characterId}`, updates);
}

/**
 * Delete a character
 */
export async function deleteCharacter(characterId: string): Promise<DeleteCharacterResponse> {
  return apiCall<DeleteCharacterResponse>('delete', `/admin/characters/${characterId}`);
}

/**
 * ECONOMY MANAGEMENT
 */

/**
 * Adjust a character's gold
 */
export async function adjustGold(request: AdjustGoldRequest): Promise<AdjustGoldResponse> {
  return apiCall<AdjustGoldResponse>('post', '/admin/gold/adjust', request);
}

/**
 * Get system analytics and statistics
 */
export async function getAnalytics(): Promise<AnalyticsResponse> {
  return apiCall<AnalyticsResponse>('get', '/admin/analytics');
}

/**
 * GANG MANAGEMENT
 */

/**
 * Get list of all gangs
 */
export async function getGangs(params?: GetGangsParams): Promise<GetGangsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const url = `/admin/gangs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiCall<GetGangsResponse>('get', url);
}

/**
 * Disband a gang
 */
export async function disbandGang(gangId: string): Promise<DisbandGangResponse> {
  return apiCall<DisbandGangResponse>('delete', `/admin/gangs/${gangId}`);
}

/**
 * SYSTEM MANAGEMENT
 */

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  return apiCall<SystemSettings>('get', '/admin/system/settings');
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
  settings: UpdateSystemSettingsRequest
): Promise<UpdateSystemSettingsResponse> {
  return apiCall<UpdateSystemSettingsResponse>('put', '/admin/system/settings', settings);
}

/**
 * Get audit logs (admin actions)
 */
export async function getAuditLogs(params?: GetAuditLogsParams): Promise<GetAuditLogsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.action) queryParams.append('action', params.action);
  if (params?.endpoint) queryParams.append('endpoint', params.endpoint);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const url = `/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiCall<GetAuditLogsResponse>('get', url);
}

/**
 * Get server health metrics
 */
export async function getServerHealth(): Promise<ServerHealthResponse> {
  return apiCall<ServerHealthResponse>('get', '/admin/server/health');
}

/**
 * TERRITORY MANAGEMENT
 */

/**
 * Reset all territories (dangerous operation)
 */
export async function resetTerritories(): Promise<ResetTerritoriesResponse> {
  return apiCall<ResetTerritoriesResponse>('post', '/admin/territories/reset');
}

/**
 * Default export - Admin service object with all methods
 */
const adminService = {
  // User Management
  getUsers,
  getUserDetails,
  banUser,
  unbanUser,

  // Character Management
  getCharacters,
  updateCharacter,
  deleteCharacter,

  // Economy Management
  adjustGold,
  getAnalytics,

  // Gang Management
  getGangs,
  disbandGang,

  // System Management
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getServerHealth,

  // Territory Management
  resetTerritories,
};

export default adminService;
