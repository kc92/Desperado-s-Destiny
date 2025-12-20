/**
 * Disguise Service
 * API methods for disguise system
 */

import { apiCall } from './api';

/**
 * Disguise Type Interface
 */
export interface DisguiseType {
  id: string;
  name: string;
  description: string;
  faction: string | null;
  wantedReduction: number;
  durationMinutes: number;
  cost: number;
  requiredItems?: string[];
  canAfford?: boolean;
}

/**
 * Disguise Status Interface
 */
export interface DisguiseStatus {
  isDisguised: boolean;
  disguise?: DisguiseType;
  expiresAt?: Date;
  remainingMinutes?: number;
}

/**
 * Available Disguises Response
 */
export interface AvailableDisguisesResponse {
  disguises: DisguiseType[];
  characterGold: number;
}

/**
 * Disguise Result Interface
 */
export interface DisguiseResult {
  success: boolean;
  message: string;
  disguiseId?: string;
  expiresAt?: Date;
  faction?: string | null;
  goldSpent?: number;
}

/**
 * Detection Result Interface
 */
export interface DetectionResult {
  detected: boolean;
  consequence?: string;
  wantedIncrease?: number;
}

/**
 * Apply Disguise Request
 */
export interface ApplyDisguiseRequest {
  disguiseId: string;
}

/**
 * Check Detection Request
 */
export interface CheckDetectionRequest {
  dangerLevel: number;
}

/**
 * Get all disguise types (no character required)
 */
export async function getTypes(): Promise<DisguiseType[]> {
  const response = await apiCall<{ types: DisguiseType[] }>('get', '/disguise/types');
  return response.types;
}

/**
 * Get current disguise status for authenticated character
 */
export async function getStatus(): Promise<DisguiseStatus> {
  return apiCall<DisguiseStatus>('get', '/disguise/status');
}

/**
 * Get all available disguises with affordability info
 */
export async function getAvailable(): Promise<AvailableDisguisesResponse> {
  return apiCall<AvailableDisguisesResponse>('get', '/disguise/available');
}

/**
 * Apply a disguise to the character
 */
export async function applyDisguise(disguiseId: string): Promise<DisguiseResult> {
  return apiCall<DisguiseResult>('post', '/disguise/apply', { disguiseId });
}

/**
 * Remove current disguise
 */
export async function removeDisguise(): Promise<DisguiseResult> {
  return apiCall<DisguiseResult>('post', '/disguise/remove');
}

/**
 * Check if disguise is detected (used during actions)
 */
export async function checkDetection(dangerLevel: number): Promise<DetectionResult> {
  return apiCall<DetectionResult>('post', '/disguise/check-detection', { dangerLevel });
}

/**
 * Default export - service object with all methods
 */
const disguiseService = {
  getTypes,
  getStatus,
  getAvailable,
  applyDisguise,
  removeDisguise,
  checkDetection,
};

export default disguiseService;
