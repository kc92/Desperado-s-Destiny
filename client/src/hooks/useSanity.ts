/**
 * useSanity Hook
 * Handles sanity system operations including sanity tracking, hallucinations, traumas, and corruption
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';

// Types
export type SanityLevel = 'stable' | 'stressed' | 'unstable' | 'fractured' | 'broken';

export interface SanityStatus {
  characterId: string;
  current: number;
  max: number;
  percentage: number;
  level: SanityLevel;
  isLow: boolean;
  isCritical: boolean;
  regenerationRate: number;
  modifiers: {
    source: string;
    value: number;
    expiresAt?: string;
  }[];
}

export interface SanityCheckResult {
  success: boolean;
  roll: number;
  target: number;
  margin: number;
  consequence?: string;
  effect?: string;
}

export interface Hallucination {
  id: string;
  type: 'visual' | 'auditory' | 'paranoia' | 'delusion';
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  triggeredAt: string;
  duration?: number;
  effects: string[];
  isActive: boolean;
}

export interface Trauma {
  id: string;
  name: string;
  description: string;
  source: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  acquiredAt: string;
  effects: {
    type: string;
    value: number;
    description: string;
  }[];
  triggers: string[];
  healingProgress: number;
  isHealed: boolean;
}

export interface CorruptionStatus {
  level: number;
  maxLevel: number;
  percentage: number;
  stage: 'pure' | 'tainted' | 'corrupted' | 'consumed';
  sources: {
    source: string;
    amount: number;
    gainedAt: string;
  }[];
  effects: string[];
  resistanceModifier: number;
}

export interface RealityDistortion {
  id: string;
  type: 'temporal' | 'spatial' | 'perceptual' | 'existential';
  description: string;
  severity: number;
  startedAt: string;
  duration: number;
  effects: {
    type: string;
    modifier: number;
  }[];
  isActive: boolean;
}

export interface SanityChangeResult {
  previousSanity: number;
  newSanity: number;
  change: number;
  newLevel: SanityLevel;
  triggeredEffects?: string[];
  message: string;
}

export interface CorruptionGainResult {
  previousCorruption: number;
  newCorruption: number;
  change: number;
  newStage: string;
  triggeredEffects?: string[];
  message: string;
}

interface UseSanityReturn {
  // State
  status: SanityStatus | null;
  hallucinations: Hallucination[];
  traumas: Trauma[];
  corruption: CorruptionStatus | null;
  distortions: RealityDistortion[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStatus: () => Promise<void>;
  loseSanity: (amount: number, source?: string) => Promise<SanityChangeResult | null>;
  restoreSanity: (amount: number, source?: string) => Promise<SanityChangeResult | null>;
  performSanityCheck: (difficulty?: number, context?: string) => Promise<SanityCheckResult | null>;
  fetchHallucinations: () => Promise<void>;
  fetchTraumas: () => Promise<void>;
  fetchCorruption: () => Promise<void>;
  gainCorruption: (amount: number, source?: string) => Promise<CorruptionGainResult | null>;
  fetchDistortions: () => Promise<void>;
}

export const useSanity = (): UseSanityReturn => {
  const [status, setStatus] = useState<SanityStatus | null>(null);
  const [hallucinations, setHallucinations] = useState<Hallucination[]>([]);
  const [traumas, setTraumas] = useState<Trauma[]>([]);
  const [corruption, setCorruption] = useState<CorruptionStatus | null>(null);
  const [distortions, setDistortions] = useState<RealityDistortion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { status: SanityStatus } }>('/sanity');
      setStatus(response.data.data.status);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch sanity status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loseSanity = useCallback(async (
    amount: number,
    source?: string
  ): Promise<SanityChangeResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { result: SanityChangeResult; status: SanityStatus } }>(
        '/sanity/lose',
        { amount, source }
      );
      setStatus(response.data.data.status);
      return response.data.data.result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process sanity loss');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreSanity = useCallback(async (
    amount: number,
    source?: string
  ): Promise<SanityChangeResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { result: SanityChangeResult; status: SanityStatus } }>(
        '/sanity/restore',
        { amount, source }
      );
      setStatus(response.data.data.status);
      return response.data.data.result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to restore sanity');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSanityCheck = useCallback(async (
    difficulty?: number,
    context?: string
  ): Promise<SanityCheckResult | null> => {
    try {
      const response = await api.post<{ data: { result: SanityCheckResult; status: SanityStatus } }>(
        '/sanity/check',
        { difficulty, context }
      );
      setStatus(response.data.data.status);
      return response.data.data.result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to perform sanity check');
      return null;
    }
  }, []);

  const fetchHallucinations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { hallucinations: Hallucination[] } }>('/sanity/hallucinations');
      setHallucinations(response.data.data.hallucinations);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch hallucinations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTraumas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { traumas: Trauma[] } }>('/sanity/traumas');
      setTraumas(response.data.data.traumas);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch traumas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCorruption = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { corruption: CorruptionStatus } }>('/sanity/corruption');
      setCorruption(response.data.data.corruption);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch corruption status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const gainCorruption = useCallback(async (
    amount: number,
    source?: string
  ): Promise<CorruptionGainResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { result: CorruptionGainResult; corruption: CorruptionStatus } }>(
        '/sanity/corruption/gain',
        { amount, source }
      );
      setCorruption(response.data.data.corruption);
      return response.data.data.result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process corruption gain');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDistortions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { distortions: RealityDistortion[] } }>('/sanity/distortions');
      setDistortions(response.data.data.distortions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch reality distortions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    hallucinations,
    traumas,
    corruption,
    distortions,
    isLoading,
    error,
    fetchStatus,
    loseSanity,
    restoreSanity,
    performSanityCheck,
    fetchHallucinations,
    fetchTraumas,
    fetchCorruption,
    gainCorruption,
    fetchDistortions,
  };
};

export default useSanity;
