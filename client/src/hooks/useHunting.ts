/**
 * useHunting Hook
 * Handles hunting and tracking operations and state management
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Hunting enums
export enum AnimalSpecies {
  // Small Game
  RABBIT = 'RABBIT',
  PRAIRIE_DOG = 'PRAIRIE_DOG',
  SQUIRREL = 'SQUIRREL',
  RACCOON = 'RACCOON',
  SKUNK = 'SKUNK',
  OPOSSUM = 'OPOSSUM',
  // Medium Game
  TURKEY = 'TURKEY',
  PHEASANT = 'PHEASANT',
  DUCK = 'DUCK',
  GOOSE = 'GOOSE',
  COYOTE = 'COYOTE',
  FOX = 'FOX',
  BADGER = 'BADGER',
  // Large Game
  WHITE_TAILED_DEER = 'WHITE_TAILED_DEER',
  MULE_DEER = 'MULE_DEER',
  PRONGHORN = 'PRONGHORN',
  WILD_BOAR = 'WILD_BOAR',
  JAVELINA = 'JAVELINA',
  BIGHORN_SHEEP = 'BIGHORN_SHEEP',
  ELK = 'ELK',
  // Dangerous Game
  BLACK_BEAR = 'BLACK_BEAR',
  GRIZZLY_BEAR = 'GRIZZLY_BEAR',
  MOUNTAIN_LION = 'MOUNTAIN_LION',
  WOLF = 'WOLF',
  BISON = 'BISON',
  // Additional
  EAGLE = 'EAGLE',
  RATTLESNAKE = 'RATTLESNAKE',
  ARMADILLO = 'ARMADILLO',
  PORCUPINE = 'PORCUPINE'
}

export enum HuntingWeapon {
  HUNTING_RIFLE = 'HUNTING_RIFLE',
  VARMINT_RIFLE = 'VARMINT_RIFLE',
  BOW = 'BOW',
  SHOTGUN = 'SHOTGUN',
  PISTOL = 'PISTOL'
}

export enum KillQuality {
  PERFECT = 'PERFECT',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  COMMON = 'COMMON',
  POOR = 'POOR'
}

export enum TrackFreshness {
  FRESH = 'FRESH',
  RECENT = 'RECENT',
  OLD = 'OLD',
  COLD = 'COLD'
}

export enum TrackDirection {
  NORTH = 'NORTH',
  NORTHEAST = 'NORTHEAST',
  EAST = 'EAST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTH = 'SOUTH',
  SOUTHWEST = 'SOUTHWEST',
  WEST = 'WEST',
  NORTHWEST = 'NORTHWEST'
}

export enum TrackDistance {
  NEAR = 'NEAR',
  MEDIUM = 'MEDIUM',
  FAR = 'FAR'
}

export enum HuntingTripStatus {
  TRACKING = 'tracking',
  STALKING = 'stalking',
  SHOOTING = 'shooting',
  HARVESTING = 'harvesting',
  COMPLETE = 'complete',
  FAILED = 'failed'
}

// Interfaces
export interface HuntingGround {
  locationId: string;
  name: string;
  description: string;
  shortDescription: string;
  availableAnimals: AnimalSpecies[];
  spawnRates: Record<AnimalSpecies, number>;
  terrain: 'plains' | 'forest' | 'mountains' | 'desert' | 'swamp';
  coverLevel: number;
  dangerLevel: number;
  energyCost: number;
  minLevel: number;
}

export interface HuntingEquipment {
  weapon: HuntingWeapon;
  hasBinoculars: boolean;
  hasCamouflage: boolean;
  hasAnimalCalls: boolean;
  hasScentBlocker: boolean;
  hasHuntingKnife: boolean;
}

export interface HuntAvailability {
  canHunt: boolean;
  reason?: string;
  availableGrounds: HuntingGround[];
  equipment: HuntingEquipment;
  companion?: {
    id: string;
    name: string;
    trackingBonus: number;
    huntingBonus: number;
  };
}

export interface TrackingResult {
  success: boolean;
  message: string;
  animalType?: AnimalSpecies;
  freshness?: TrackFreshness;
  direction?: TrackDirection;
  distance?: TrackDistance;
  difficulty?: number;
  trackingBonus?: number;
  companionBonus?: number;
  canStalk?: boolean;
}

export interface HarvestResult {
  success: boolean;
  message: string;
  quality: KillQuality;
  qualityMultiplier: number;
  resources: HarvestedResource[];
  totalValue: number;
  skinningBonus?: number;
  xpGained: number;
}

export interface HarvestedResource {
  type: string;
  itemId: string;
  name: string;
  quantity: number;
  quality: KillQuality;
  value: number;
}

export interface HuntingTrip {
  _id?: string;
  characterId: string;
  huntingGroundId: string;
  startedAt: Date;
  completedAt?: Date;
  status: HuntingTripStatus;
  targetAnimal?: AnimalSpecies;
  trackingResult?: TrackingResult;
  harvestResult?: HarvestResult;
  energySpent: number;
  goldEarned: number;
  xpEarned: number;
  companionId?: string;
  weaponUsed?: HuntingWeapon;
}

export interface HuntingStatistics {
  totalHunts: number;
  successfulHunts: number;
  killsBySpecies: Record<AnimalSpecies, number>;
  perfectKills: number;
  totalGoldEarned: number;
  totalXpEarned: number;
  favoriteHuntingGround?: string;
  largestKill?: {
    species: AnimalSpecies;
    quality: KillQuality;
    value: number;
    date: Date;
  };
}

export interface StartHuntParams {
  huntingGroundId: string;
  weapon: HuntingWeapon;
  companionId?: string;
}

interface UseHuntingReturn {
  // State
  availability: HuntAvailability | null;
  currentTrip: HuntingTrip | null;
  statistics: HuntingStatistics | null;
  isLoading: boolean;
  error: string | null;

  // Hunting actions
  checkAvailability: () => Promise<HuntAvailability | null>;
  getCurrentTrip: () => Promise<HuntingTrip | null>;
  getStatistics: () => Promise<HuntingStatistics | null>;
  startHunt: (params: StartHuntParams) => Promise<{ success: boolean; trip?: HuntingTrip; error?: string }>;
  abandonHunt: () => Promise<{ success: boolean; error?: string }>;

  // Tracking action
  attemptTracking: (tripId: string) => Promise<TrackingResult>;

  // Utilities
  clearError: () => void;
}

export const useHunting = (): UseHuntingReturn => {
  const [availability, setAvailability] = useState<HuntAvailability | null>(null);
  const [currentTrip, setCurrentTrip] = useState<HuntingTrip | null>(null);
  const [statistics, setStatistics] = useState<HuntingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkAvailability = useCallback(async (): Promise<HuntAvailability | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: HuntAvailability }>('/hunting/availability');
      const data = response.data.data;
      setAvailability(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check hunting availability';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentTrip = useCallback(async (): Promise<HuntingTrip | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { trip: HuntingTrip | null } }>('/hunting/current');
      const trip = response.data.data.trip;
      setCurrentTrip(trip);
      return trip;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get current hunting trip';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatistics = useCallback(async (): Promise<HuntingStatistics | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: HuntingStatistics }>('/hunting/statistics');
      const stats = response.data.data;
      setStatistics(stats);
      return stats;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get hunting statistics';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startHunt = useCallback(async (params: StartHuntParams): Promise<{ success: boolean; trip?: HuntingTrip; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { success: boolean; trip?: HuntingTrip; error?: string } }>('/hunting/start', params);
      const result = response.data.data;
      if (result.success && result.trip) {
        setCurrentTrip(result.trip);
        await refreshCharacter();
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start hunting trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  const abandonHunt = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { success: boolean; error?: string } }>('/hunting/abandon');
      const result = response.data.data;
      if (result.success) {
        setCurrentTrip(null);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to abandon hunting trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const attemptTracking = useCallback(async (tripId: string): Promise<TrackingResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: TrackingResult }>('/tracking/attempt', { tripId });
      const result = response.data.data;
      // Update current trip if tracking was successful
      if (result.success) {
        await getCurrentTrip();
        await refreshCharacter();
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to attempt tracking';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentTrip, refreshCharacter]);

  return {
    // State
    availability,
    currentTrip,
    statistics,
    isLoading,
    error,

    // Hunting actions
    checkAvailability,
    getCurrentTrip,
    getStatistics,
    startHunt,
    abandonHunt,

    // Tracking action
    attemptTracking,

    // Utilities
    clearError
  };
};

export default useHunting;
