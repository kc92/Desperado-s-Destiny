/**
 * Gang Base Service
 * API client for gang base/headquarters endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import type {
  GangBase,
  BaseTier,
  BaseLocationType,
  FacilityType,
  BaseUpgradeType,
  Guard,
  Trap,
  GangStorage,
  StorageItem,
} from '@desperados/shared';

/**
 * Request interface for establishing a new base
 */
export interface EstablishBaseRequest {
  characterId: string;
  tier?: BaseTier;
  locationType: BaseLocationType;
  region: string;
  coordinates?: { x: number; y: number };
}

/**
 * Request interface for upgrading base tier
 */
export interface UpgradeTierRequest {
  characterId: string;
}

/**
 * Request interface for adding a facility
 */
export interface AddFacilityRequest {
  characterId: string;
  facilityType: FacilityType;
}

/**
 * Request interface for adding an upgrade
 */
export interface AddUpgradeRequest {
  characterId: string;
  upgradeType: BaseUpgradeType;
}

/**
 * Request interface for hiring a guard
 */
export interface HireGuardRequest {
  characterId: string;
  guardName: string;
  level: number;
  combatSkill: number;
}

/**
 * Request interface for firing a guard
 */
export interface FireGuardRequest {
  characterId: string;
}

/**
 * Request interface for installing a trap
 */
export interface InstallTrapRequest {
  characterId: string;
  trapType: 'alarm' | 'damage' | 'slow' | 'capture';
  effectiveness: number;
}

/**
 * Request interface for removing a trap
 */
export interface RemoveTrapRequest {
  characterId: string;
}

/**
 * Request interface for depositing items to storage
 */
export interface DepositItemRequest {
  characterId: string;
  itemId: string;
  quantity: number;
}

/**
 * Request interface for withdrawing items from storage
 */
export interface WithdrawItemRequest {
  characterId: string;
  itemId: string;
  quantity: number;
}

/**
 * Establish a new gang base
 */
export const establishBase = async (
  gangId: string,
  data: EstablishBaseRequest
): Promise<ApiResponse<{ base: GangBase; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ base: GangBase; message: string }>>(
    `/gangs/${gangId}/base/establish`,
    data
  );
  return response.data;
};

/**
 * Get gang base details
 */
export const getBase = async (
  gangId: string
): Promise<ApiResponse<{ base: GangBase }>> => {
  const response = await apiClient.get<ApiResponse<{ base: GangBase }>>(
    `/gangs/${gangId}/base`
  );
  return response.data;
};

/**
 * Upgrade base tier
 */
export const upgradeTier = async (
  gangId: string,
  data: UpgradeTierRequest
): Promise<ApiResponse<{ base: GangBase; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ base: GangBase; message: string }>>(
    `/gangs/${gangId}/base/upgrade`,
    data
  );
  return response.data;
};

/**
 * Add facility to base
 */
export const addFacility = async (
  gangId: string,
  data: AddFacilityRequest
): Promise<ApiResponse<{ base: GangBase; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ base: GangBase; message: string }>>(
    `/gangs/${gangId}/base/facility`,
    data
  );
  return response.data;
};

/**
 * Add upgrade to base
 */
export const addUpgrade = async (
  gangId: string,
  data: AddUpgradeRequest
): Promise<ApiResponse<{ base: GangBase; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ base: GangBase; message: string }>>(
    `/gangs/${gangId}/base/upgrade-feature`,
    data
  );
  return response.data;
};

/**
 * Hire a guard for base defense
 */
export const hireGuard = async (
  gangId: string,
  data: HireGuardRequest
): Promise<ApiResponse<{ guard: Guard; defense: any; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ guard: Guard; defense: any; message: string }>>(
    `/gangs/${gangId}/base/defense/guard`,
    data
  );
  return response.data;
};

/**
 * Fire a guard from base defense
 */
export const fireGuard = async (
  gangId: string,
  guardId: string,
  data: FireGuardRequest
): Promise<ApiResponse<{ defense: any; message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ defense: any; message: string }>>(
    `/gangs/${gangId}/base/defense/guard/${guardId}`,
    { data }
  );
  return response.data;
};

/**
 * Install a trap for base defense
 */
export const installTrap = async (
  gangId: string,
  data: InstallTrapRequest
): Promise<ApiResponse<{ trap: Trap; defense: any; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ trap: Trap; defense: any; message: string }>>(
    `/gangs/${gangId}/base/defense/trap`,
    data
  );
  return response.data;
};

/**
 * Remove a trap from base defense
 */
export const removeTrap = async (
  gangId: string,
  trapId: string,
  data: RemoveTrapRequest
): Promise<ApiResponse<{ defense: any; message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ defense: any; message: string }>>(
    `/gangs/${gangId}/base/defense/trap/${trapId}`,
    { data }
  );
  return response.data;
};

/**
 * Get base storage details
 */
export const getStorage = async (
  gangId: string
): Promise<ApiResponse<{ storage: GangStorage }>> => {
  const response = await apiClient.get<ApiResponse<{ storage: GangStorage }>>(
    `/gangs/${gangId}/base/storage`
  );
  return response.data;
};

/**
 * Deposit item to base storage
 */
export const depositItem = async (
  gangId: string,
  data: DepositItemRequest
): Promise<ApiResponse<{ storage: GangStorage; item: StorageItem; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ storage: GangStorage; item: StorageItem; message: string }>>(
    `/gangs/${gangId}/base/storage/deposit`,
    data
  );
  return response.data;
};

/**
 * Withdraw item from base storage
 */
export const withdrawItem = async (
  gangId: string,
  data: WithdrawItemRequest
): Promise<ApiResponse<{ storage: GangStorage; item: StorageItem; message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ storage: GangStorage; item: StorageItem; message: string }>>(
    `/gangs/${gangId}/base/storage/withdraw`,
    data
  );
  return response.data;
};

/**
 * Gang base service object with all methods
 */
export const gangBaseService = {
  establishBase,
  getBase,
  upgradeTier,
  addFacility,
  addUpgrade,
  hireGuard,
  fireGuard,
  installTrap,
  removeTrap,
  getStorage,
  depositItem,
  withdrawItem,
};

export default gangBaseService;
