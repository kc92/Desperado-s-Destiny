/**
 * useWarfare Hook
 * Manages territory fortifications, resistance activities, liberation, and diplomacy
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { logger } from '@/services/logger.service';

// Fortification types
export type FortificationType =
  | 'WATCHTOWER'
  | 'BARRICADE'
  | 'BUNKER'
  | 'TRENCH'
  | 'SNIPER_NEST'
  | 'ARMORY'
  | 'MEDICAL_POST'
  | 'SUPPLY_DEPOT';

export type FortificationStatus = 'BUILDING' | 'ACTIVE' | 'DAMAGED' | 'DESTROYED';

// Resistance types
export type ResistanceActionType =
  | 'SABOTAGE'
  | 'INTELLIGENCE'
  | 'PROPAGANDA'
  | 'SUPPLY_RAID'
  | 'AMBUSH'
  | 'RECRUIT';

export type ResistanceStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

// Diplomacy types
export type DiplomacyType =
  | 'CEASEFIRE'
  | 'TRADE_AGREEMENT'
  | 'ALLIANCE'
  | 'NON_AGGRESSION'
  | 'SURRENDER';

export type DiplomacyStatus = 'PROPOSED' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface FortificationBonus {
  type: 'defense' | 'attack' | 'morale' | 'supplies' | 'intel';
  value: number;
}

export interface FortificationCost {
  gold: number;
  materials?: { itemId: string; quantity: number }[];
  timeHours: number;
}

export interface Fortification {
  _id: string;
  territoryId: string;
  type: FortificationType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  status: FortificationStatus;
  health: number;
  maxHealth: number;
  bonuses: FortificationBonus[];
  buildCost: FortificationCost;
  upgradeCost?: FortificationCost;
  repairCost?: FortificationCost;
  builtAt: string;
  lastRepairedAt?: string;
  garrison?: number;
}

export interface ResistanceActivity {
  _id: string;
  territoryId: string;
  type: ResistanceActionType;
  name: string;
  description: string;
  status: ResistanceStatus;
  plannedAt: string;
  executedAt?: string;
  success?: boolean;
  participants: string[];
  effects?: {
    type: string;
    value: number;
    description: string;
  }[];
  risk: number;
  reward: number;
}

export interface ResistanceActionOption {
  type: ResistanceActionType;
  name: string;
  description: string;
  requirements: {
    minParticipants: number;
    requiredItems?: string[];
    requiredSkills?: { skillId: string; minLevel: number }[];
  };
  risk: number;
  potentialReward: number;
  cooldownHours: number;
  isAvailable: boolean;
}

export interface LiberationProgress {
  territoryId: string;
  progress: number; // 0-100
  phase: 'GATHERING' | 'PLANNING' | 'EXECUTION' | 'AFTERMATH';
  supporters: number;
  resistance: number;
  estimatedSuccessChance: number;
  requiredForSuccess: number;
}

export interface DiplomacyProposal {
  _id: string;
  fromGangId: string;
  fromGangName: string;
  toGangId: string;
  toGangName: string;
  territoryId: string;
  type: DiplomacyType;
  status: DiplomacyStatus;
  terms: {
    description: string;
    duration?: number; // in days
    goldExchange?: number;
    territoryExchange?: string[];
    conditions?: string[];
  };
  proposedAt: string;
  expiresAt: string;
  respondedAt?: string;
}

export interface WarfareStats {
  totalFortifications: number;
  activeFortifications: number;
  resistanceActivities: number;
  successfulActions: number;
  territoriesLiberated: number;
  diplomacyProposals: number;
}

interface UseWarfareReturn {
  fortifications: Fortification[];
  resistanceActivities: ResistanceActivity[];
  resistanceOptions: ResistanceActionOption[];
  liberationProgress: LiberationProgress | null;
  diplomacyProposals: DiplomacyProposal[];
  isLoading: boolean;
  error: string | null;

  // Fortification operations
  fetchFortifications: (territoryId: string) => Promise<void>;
  buildFortification: (territoryId: string, type: FortificationType, name?: string) => Promise<{ success: boolean; message: string; fortification?: Fortification }>;
  upgradeFortification: (territoryId: string, fortificationId: string) => Promise<{ success: boolean; message: string }>;
  repairFortification: (territoryId: string, fortificationId: string) => Promise<{ success: boolean; message: string }>;
  demolishFortification: (territoryId: string, fortificationId: string) => Promise<{ success: boolean; message: string }>;

  // Resistance operations
  fetchResistanceActivities: (territoryId: string) => Promise<void>;
  executeResistanceAction: (territoryId: string, actionType: ResistanceActionType, participants?: string[]) => Promise<{ success: boolean; message: string; activity?: ResistanceActivity }>;

  // Liberation operations
  startLiberation: (territoryId: string) => Promise<{ success: boolean; message: string; progress?: LiberationProgress }>;

  // Diplomacy operations
  proposeDiplomacy: (territoryId: string, proposal: Omit<DiplomacyProposal, '_id' | 'fromGangId' | 'fromGangName' | 'status' | 'proposedAt' | 'expiresAt'>) => Promise<{ success: boolean; message: string; proposal?: DiplomacyProposal }>;

  clearError: () => void;
}

export const useWarfare = (): UseWarfareReturn => {
  const [fortifications, setFortifications] = useState<Fortification[]>([]);
  const [resistanceActivities, setResistanceActivities] = useState<ResistanceActivity[]>([]);
  const [resistanceOptions, setResistanceOptions] = useState<ResistanceActionOption[]>([]);
  const [liberationProgress, setLiberationProgress] = useState<LiberationProgress | null>(null);
  const [diplomacyProposals, setDiplomacyProposals] = useState<DiplomacyProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fortifications for a territory
  const fetchFortifications = useCallback(async (territoryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { fortifications: Fortification[] } }>(
        `/warfare/territories/${territoryId}/fortifications`
      );
      setFortifications(response.data.data.fortifications || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch fortifications';
      setError(errorMessage);
      logger.error('Fetch fortifications error', err as Error, { context: 'useWarfare' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Build a new fortification
  const buildFortification = useCallback(async (
    territoryId: string,
    type: FortificationType,
    name?: string
  ): Promise<{ success: boolean; message: string; fortification?: Fortification }> => {
    try {
      const response = await api.post<{ data: { fortification: Fortification; message: string } }>(
        `/warfare/territories/${territoryId}/fortifications`,
        { type, name }
      );
      const newFortification = response.data.data.fortification;
      setFortifications(prev => [...prev, newFortification]);
      return { success: true, message: response.data.data.message, fortification: newFortification };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to build fortification';
      setError(errorMessage);
      logger.error('Build fortification error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Upgrade a fortification
  const upgradeFortification = useCallback(async (
    territoryId: string,
    fortificationId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put<{ data: { fortification: Fortification; message: string } }>(
        `/warfare/territories/${territoryId}/fortifications/${fortificationId}/upgrade`
      );
      const updatedFortification = response.data.data.fortification;
      setFortifications(prev => prev.map(f => f._id === fortificationId ? updatedFortification : f));
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upgrade fortification';
      setError(errorMessage);
      logger.error('Upgrade fortification error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Repair a fortification
  const repairFortification = useCallback(async (
    territoryId: string,
    fortificationId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put<{ data: { fortification: Fortification; message: string } }>(
        `/warfare/territories/${territoryId}/fortifications/${fortificationId}/repair`
      );
      const updatedFortification = response.data.data.fortification;
      setFortifications(prev => prev.map(f => f._id === fortificationId ? updatedFortification : f));
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to repair fortification';
      setError(errorMessage);
      logger.error('Repair fortification error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Demolish a fortification
  const demolishFortification = useCallback(async (
    territoryId: string,
    fortificationId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ data: { message: string } }>(
        `/warfare/territories/${territoryId}/fortifications/${fortificationId}`
      );
      setFortifications(prev => prev.filter(f => f._id !== fortificationId));
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to demolish fortification';
      setError(errorMessage);
      logger.error('Demolish fortification error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Fetch resistance activities for a territory
  const fetchResistanceActivities = useCallback(async (territoryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { activities: ResistanceActivity[]; options: ResistanceActionOption[] } }>(
        `/warfare/territories/${territoryId}/resistance`
      );
      setResistanceActivities(response.data.data.activities || []);
      setResistanceOptions(response.data.data.options || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch resistance activities';
      setError(errorMessage);
      logger.error('Fetch resistance activities error', err as Error, { context: 'useWarfare' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Execute a resistance action
  const executeResistanceAction = useCallback(async (
    territoryId: string,
    actionType: ResistanceActionType,
    participants?: string[]
  ): Promise<{ success: boolean; message: string; activity?: ResistanceActivity }> => {
    try {
      const response = await api.post<{ data: { activity: ResistanceActivity; message: string } }>(
        `/warfare/territories/${territoryId}/resistance/execute`,
        { actionType, participants }
      );
      const newActivity = response.data.data.activity;
      setResistanceActivities(prev => [...prev, newActivity]);
      return { success: true, message: response.data.data.message, activity: newActivity };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to execute resistance action';
      setError(errorMessage);
      logger.error('Execute resistance action error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Start liberation of a territory
  const startLiberation = useCallback(async (
    territoryId: string
  ): Promise<{ success: boolean; message: string; progress?: LiberationProgress }> => {
    try {
      const response = await api.post<{ data: { progress: LiberationProgress; message: string } }>(
        `/warfare/territories/${territoryId}/liberation/start`
      );
      const progress = response.data.data.progress;
      setLiberationProgress(progress);
      return { success: true, message: response.data.data.message, progress };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to start liberation';
      setError(errorMessage);
      logger.error('Start liberation error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Propose diplomacy
  const proposeDiplomacy = useCallback(async (
    territoryId: string,
    proposal: Omit<DiplomacyProposal, '_id' | 'fromGangId' | 'fromGangName' | 'status' | 'proposedAt' | 'expiresAt'>
  ): Promise<{ success: boolean; message: string; proposal?: DiplomacyProposal }> => {
    try {
      const response = await api.post<{ data: { proposal: DiplomacyProposal; message: string } }>(
        `/warfare/territories/${territoryId}/diplomacy/propose`,
        proposal
      );
      const newProposal = response.data.data.proposal;
      setDiplomacyProposals(prev => [...prev, newProposal]);
      return { success: true, message: response.data.data.message, proposal: newProposal };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to propose diplomacy';
      setError(errorMessage);
      logger.error('Propose diplomacy error', err as Error, { context: 'useWarfare' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    fortifications,
    resistanceActivities,
    resistanceOptions,
    liberationProgress,
    diplomacyProposals,
    isLoading,
    error,
    fetchFortifications,
    buildFortification,
    upgradeFortification,
    repairFortification,
    demolishFortification,
    fetchResistanceActivities,
    executeResistanceAction,
    startLiberation,
    proposeDiplomacy,
    clearError,
  };
};

export default useWarfare;
