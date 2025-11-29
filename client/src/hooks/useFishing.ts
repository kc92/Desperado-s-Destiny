/**
 * useFishing Hook
 * Handles fishing session operations and state management
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Fishing enums
export enum SpotType {
  SHALLOW = 'SHALLOW',
  DEEP = 'DEEP',
  STRUCTURE = 'STRUCTURE',
  SURFACE = 'SURFACE',
  BOTTOM = 'BOTTOM'
}

export enum FishSize {
  TINY = 'TINY',
  SMALL = 'SMALL',
  AVERAGE = 'AVERAGE',
  LARGE = 'LARGE',
  TROPHY = 'TROPHY',
  LEGENDARY = 'LEGENDARY'
}

export enum FightPhase {
  HOOKING = 'HOOKING',
  FIGHTING = 'FIGHTING',
  LANDING = 'LANDING'
}

export enum FishingTimeOfDay {
  DAWN = 'DAWN',
  MORNING = 'MORNING',
  MIDDAY = 'MIDDAY',
  AFTERNOON = 'AFTERNOON',
  DUSK = 'DUSK',
  NIGHT = 'NIGHT'
}

export enum FishingWeather {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  STORM = 'STORM',
  FOG = 'FOG'
}

// Interfaces
export interface FishingSetup {
  rodId: string;
  reelId: string;
  lineId: string;
  baitId?: string;
  lureId?: string;
}

export interface FishFightState {
  phase: FightPhase;
  fishStamina: number;
  lineTension: number;
  playerStamina: number;
  roundsElapsed: number;
  lastAction: 'REEL' | 'LET_RUN' | 'WAIT';
  tensionHistory: number[];
  hookStrength: number;
}

export interface FishingSession {
  characterId: string;
  locationId: string;
  spotType: SpotType;
  setup: FishingSetup;
  startedAt: Date;
  lastBiteCheck: Date;
  isWaiting: boolean;
  hasBite: boolean;
  currentFish?: {
    speciesId: string;
    weight: number;
    size: FishSize;
    fightState: FishFightState;
  };
  timeOfDay: FishingTimeOfDay;
  weather: FishingWeather;
  catchCount: number;
  totalValue: number;
}

export interface CaughtFish {
  speciesId: string;
  speciesName: string;
  weight: number;
  size: FishSize;
  quality: number;
  goldValue: number;
  experience: number;
  drops: { itemId: string; quantity: number }[];
  isNewRecord: boolean;
  isFirstCatch: boolean;
  caughtAt: Date;
  location: string;
}

export interface FishingActionResult {
  success: boolean;
  message: string;
  session?: FishingSession;
  catch?: CaughtFish;
  energyUsed?: number;
  goldGained?: number;
  experienceGained?: number;
  itemsGained?: { itemId: string; quantity: number }[];
  hasBite?: boolean;
  biteTimeWindow?: number;
  fightUpdate?: {
    fishStamina: number;
    lineTension: number;
    message: string;
    canContinue: boolean;
  };
}

export interface StartFishingParams {
  locationId: string;
  spotType: SpotType;
  setup: FishingSetup;
}

interface UseFishingReturn {
  session: FishingSession | null;
  isLoading: boolean;
  error: string | null;
  lastResult: FishingActionResult | null;
  getSession: () => Promise<void>;
  startFishing: (params: StartFishingParams) => Promise<FishingActionResult>;
  checkBite: () => Promise<FishingActionResult>;
  setHook: () => Promise<FishingActionResult>;
  endFishing: () => Promise<FishingActionResult>;
  clearError: () => void;
}

export const useFishing = (): UseFishingReturn => {
  const [session, setSession] = useState<FishingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<FishingActionResult | null>(null);
  const { refreshCharacter } = useCharacterStore();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { session: FishingSession | null } }>('/fishing/session');
      setSession(response.data.data.session);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get fishing session';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startFishing = useCallback(async (params: StartFishingParams): Promise<FishingActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: FishingActionResult }>('/fishing/start', params);
      const result = response.data.data;
      setLastResult(result);
      if (result.session) {
        setSession(result.session);
      }
      if (result.energyUsed) {
        await refreshCharacter();
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start fishing';
      setError(errorMessage);
      const failResult: FishingActionResult = { success: false, message: errorMessage };
      setLastResult(failResult);
      return failResult;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  const checkBite = useCallback(async (): Promise<FishingActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: FishingActionResult }>('/fishing/check-bite');
      const result = response.data.data;
      setLastResult(result);
      if (result.session) {
        setSession(result.session);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check for bite';
      setError(errorMessage);
      const failResult: FishingActionResult = { success: false, message: errorMessage };
      setLastResult(failResult);
      return failResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setHook = useCallback(async (): Promise<FishingActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: FishingActionResult }>('/fishing/set-hook');
      const result = response.data.data;
      setLastResult(result);
      if (result.session) {
        setSession(result.session);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to set hook';
      setError(errorMessage);
      const failResult: FishingActionResult = { success: false, message: errorMessage };
      setLastResult(failResult);
      return failResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endFishing = useCallback(async (): Promise<FishingActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: FishingActionResult }>('/fishing/end');
      const result = response.data.data;
      setLastResult(result);
      setSession(null);
      if (result.goldGained || result.experienceGained) {
        await refreshCharacter();
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to end fishing session';
      setError(errorMessage);
      const failResult: FishingActionResult = { success: false, message: errorMessage };
      setLastResult(failResult);
      return failResult;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  return {
    session,
    isLoading,
    error,
    lastResult,
    getSession,
    startFishing,
    checkBite,
    setHook,
    endFishing,
    clearError
  };
};

export default useFishing;
