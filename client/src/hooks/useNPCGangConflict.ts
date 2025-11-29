/**
 * useNPCGangConflict Hook
 * Handles NPC gang conflict API operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/** NPC Gang Status - relationship with player */
export type NPCGangStanding = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';

/** Mission difficulty levels */
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

/** Mission status */
export type MissionStatus = 'available' | 'active' | 'completed' | 'failed';

/** Challenge phase */
export type ChallengePhase = 'none' | 'initiated' | 'missions_required' | 'ready_for_battle' | 'victory' | 'defeat';

/** NPC Gang territory */
export interface NPCGangTerritory {
  id: string;
  name: string;
  description: string;
  controlStrength: number;
  resources: string[];
  bonuses: string[];
}

/** NPC Gang leader */
export interface NPCGangLeader {
  name: string;
  title: string;
  description: string;
  combatPower: number;
  specialAbilities: string[];
}

/** NPC Gang data */
export interface NPCGang {
  id: string;
  name: string;
  tag: string;
  description: string;
  faction: string;
  strength: number;
  reputation: number;
  leader: NPCGangLeader;
  territories: NPCGangTerritory[];
  tributeRate: number;
  specialFeatures: string[];
  lore: string;
  iconEmoji: string;
  themeColor: string;
}

/** Player's relationship with an NPC gang */
export interface NPCGangRelationship {
  gangId: string;
  gangName: string;
  standing: NPCGangStanding;
  standingPoints: number;
  lastTribute: Date | null;
  tributeOwed: number;
  missionsCompleted: number;
  challengePhase: ChallengePhase;
  challengeMissionsCompleted: number;
  challengeMissionsRequired: number;
  isAtWar: boolean;
  warStarted: Date | null;
}

/** Mission from NPC gang */
export interface NPCGangMission {
  id: string;
  gangId: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  rewards: {
    gold: number;
    xp: number;
    reputation: number;
    items?: string[];
  };
  requirements: {
    level: number;
    skills?: Record<string, number>;
  };
  timeLimit?: number;
  objectives: string[];
  progress?: number;
  expiresAt?: Date;
}

/** Boss fight data */
export interface BossFight {
  gangId: string;
  bossName: string;
  bossTitle: string;
  bossPower: number;
  phases: number;
  currentPhase: number;
  bossHealth: number;
  bossMaxHealth: number;
  specialMoves: string[];
  rewards: {
    gold: number;
    xp: number;
    territoryControl: boolean;
    specialItems: string[];
  };
}

/** Result of tribute payment */
export interface TributeResult {
  success: boolean;
  message: string;
  goldPaid: number;
  newStanding: NPCGangStanding;
  standingChange: number;
  nextTributeDue: Date;
}

/** Result of challenge initiation */
export interface ChallengeResult {
  success: boolean;
  message: string;
  phase: ChallengePhase;
  missionsRequired: number;
  missionsAvailable: NPCGangMission[];
}

/** Result of boss fight */
export interface BossFightResult {
  success: boolean;
  victory: boolean;
  message: string;
  damageDealt: number;
  damageTaken: number;
  rewards?: {
    gold: number;
    xp: number;
    items: string[];
    territoryGained?: string;
  };
  phaseCompleted: boolean;
  bossDefeated: boolean;
}

/** NPC Gang overview combining gang details and relationship */
export interface NPCGangOverview {
  gang: NPCGang;
  relationship: NPCGangRelationship;
  availableMissions: NPCGangMission[];
  canChallenge: boolean;
  challengeRequirements: {
    levelRequired: number;
    goldRequired: number;
    reputationRequired: number;
  };
}

interface UseNPCGangConflictReturn {
  // State
  gangs: NPCGang[];
  relationships: NPCGangRelationship[];
  selectedGang: NPCGangOverview | null;
  activeMissions: NPCGangMission[];
  currentBossFight: BossFight | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllGangs: () => Promise<void>;
  fetchRelationships: () => Promise<void>;
  fetchGangOverview: (gangId: string) => Promise<void>;
  fetchAvailableMissions: (gangId: string) => Promise<NPCGangMission[]>;
  payTribute: (gangId: string, amount?: number) => Promise<TributeResult>;
  challengeTerritory: (gangId: string) => Promise<ChallengeResult>;
  acceptMission: (gangId: string, missionId: string) => Promise<{ success: boolean; message: string }>;
  completeMission: (gangId: string, missionId: string) => Promise<{ success: boolean; message: string; rewards?: any }>;
  initiateBossFight: (gangId: string) => Promise<BossFight | null>;
  executeBossAttack: (gangId: string, attackType: 'normal' | 'special' | 'ultimate') => Promise<BossFightResult>;
  clearSelectedGang: () => void;
  clearError: () => void;
}

export const useNPCGangConflict = (): UseNPCGangConflictReturn => {
  const [gangs, setGangs] = useState<NPCGang[]>([]);
  const [relationships, setRelationships] = useState<NPCGangRelationship[]>([]);
  const [selectedGang, setSelectedGang] = useState<NPCGangOverview | null>(null);
  const [activeMissions, setActiveMissions] = useState<NPCGangMission[]>([]);
  const [currentBossFight, setCurrentBossFight] = useState<BossFight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  const fetchAllGangs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { gangs: NPCGang[] } }>('/npc-gangs');
      setGangs(response.data.data.gangs || []);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch NPC gangs';
      setError(message);
      // Set default gangs for fallback
      setGangs(getDefaultGangs());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRelationships = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { relationships: NPCGangRelationship[] } }>('/npc-gangs/relationships');
      setRelationships(response.data.data.relationships || []);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch relationships';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGangOverview = useCallback(async (gangId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: NPCGangOverview }>(`/npc-gangs/${gangId}/overview`);
      setSelectedGang(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch gang details';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableMissions = useCallback(async (gangId: string): Promise<NPCGangMission[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { missions: NPCGangMission[] } }>(`/npc-gangs/${gangId}/missions`);
      const missions = response.data.data.missions || [];
      setActiveMissions(missions.filter(m => m.status === 'active'));
      return missions;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch missions';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const payTribute = useCallback(async (gangId: string, amount?: number): Promise<TributeResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: TributeResult }>(`/npc-gangs/${gangId}/tribute`, { amount });
      await refreshCharacter();
      await fetchRelationships();
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to pay tribute';
      setError(message);
      return {
        success: false,
        message,
        goldPaid: 0,
        newStanding: 'hostile',
        standingChange: 0,
        nextTributeDue: new Date(),
      };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter, fetchRelationships]);

  const challengeTerritory = useCallback(async (gangId: string): Promise<ChallengeResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: ChallengeResult }>(`/npc-gangs/${gangId}/challenge`);
      await fetchRelationships();
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to challenge territory';
      setError(message);
      return {
        success: false,
        message,
        phase: 'none',
        missionsRequired: 0,
        missionsAvailable: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, [fetchRelationships]);

  const acceptMission = useCallback(async (gangId: string, missionId: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { success: boolean; message: string } }>(
        `/npc-gangs/${gangId}/missions/${missionId}`
      );
      await fetchAvailableMissions(gangId);
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to accept mission';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAvailableMissions]);

  const completeMission = useCallback(async (
    gangId: string,
    missionId: string
  ): Promise<{ success: boolean; message: string; rewards?: any }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { success: boolean; message: string; rewards?: any } }>(
        `/npc-gangs/${gangId}/challenge/mission`,
        { missionId }
      );
      await refreshCharacter();
      await fetchRelationships();
      await fetchAvailableMissions(gangId);
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to complete mission';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter, fetchRelationships, fetchAvailableMissions]);

  const initiateBossFight = useCallback(async (gangId: string): Promise<BossFight | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { bossFight: BossFight } }>(
        `/npc-gangs/${gangId}/challenge/final-battle`
      );
      const bossFight = response.data.data.bossFight;
      setCurrentBossFight(bossFight);
      return bossFight;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to initiate boss fight';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeBossAttack = useCallback(async (
    gangId: string,
    attackType: 'normal' | 'special' | 'ultimate'
  ): Promise<BossFightResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: BossFightResult }>(
        `/npc-gangs/${gangId}/challenge/final-battle`,
        { attackType }
      );
      const result = response.data.data;

      if (result.bossDefeated || !result.victory) {
        setCurrentBossFight(null);
        await refreshCharacter();
        await fetchRelationships();
      }

      return result;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to execute attack';
      setError(message);
      return {
        success: false,
        victory: false,
        message,
        damageDealt: 0,
        damageTaken: 0,
        phaseCompleted: false,
        bossDefeated: false,
      };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter, fetchRelationships]);

  const clearSelectedGang = useCallback(() => {
    setSelectedGang(null);
    setActiveMissions([]);
    setCurrentBossFight(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    gangs,
    relationships,
    selectedGang,
    activeMissions,
    currentBossFight,
    isLoading,
    error,
    fetchAllGangs,
    fetchRelationships,
    fetchGangOverview,
    fetchAvailableMissions,
    payTribute,
    challengeTerritory,
    acceptMission,
    completeMission,
    initiateBossFight,
    executeBossAttack,
    clearSelectedGang,
    clearError,
  };
};

// Default gangs for fallback/demo
function getDefaultGangs(): NPCGang[] {
  return [
    {
      id: 'el-rey-frontera',
      name: "El Rey's Frontera Gang",
      tag: 'FRON',
      description: 'The most powerful gang in the territory, led by the enigmatic El Rey. They control the main trade routes and demand tribute from all who pass.',
      faction: 'Frontera Collective',
      strength: 150,
      reputation: 15000,
      leader: {
        name: 'El Rey',
        title: 'The Desert King',
        description: 'A legendary outlaw whose real name has been forgotten. He rules with an iron fist and is feared throughout the territory.',
        combatPower: 500,
        specialAbilities: ['Desert Storm', 'Iron Will', 'King\'s Decree'],
      },
      territories: [
        {
          id: 'dusty-gulch',
          name: 'Dusty Gulch',
          description: 'A vital chokepoint controlling access to the northern territories',
          controlStrength: 90,
          resources: ['Water', 'Trade Routes'],
          bonuses: ['+20% Trade Income', '-10% Travel Time'],
        },
      ],
      tributeRate: 500,
      specialFeatures: ['Protection from other gangs', 'Access to black market', 'Fast travel network'],
      lore: 'El Rey rose to power during the Great Drought, uniting scattered outlaws into a formidable force.',
      iconEmoji: '👑',
      themeColor: 'gold',
    },
    {
      id: 'comanche-raiders',
      name: 'The Comanche Raiders',
      tag: 'RAID',
      description: 'Swift and deadly, these raiders strike without warning. They honor strength and courage above all else.',
      faction: 'Nahi Coalition',
      strength: 80,
      reputation: 8000,
      leader: {
        name: 'Running Thunder',
        title: 'War Chief',
        description: 'A fierce warrior who earned his name from the speed of his attacks.',
        combatPower: 350,
        specialAbilities: ['Lightning Strike', 'War Cry', 'Spirit Walk'],
      },
      territories: [
        {
          id: 'shadow-ridge',
          name: 'Shadow Ridge',
          description: 'Hidden mountain paths perfect for ambushes',
          controlStrength: 85,
          resources: ['Horses', 'Hidden Paths'],
          bonuses: ['+15% Combat Speed', '+10% Ambush Chance'],
        },
      ],
      tributeRate: 250,
      specialFeatures: ['Horse training', 'Tracking lessons', 'Combat training'],
      lore: 'The Raiders have protected these lands for generations, adapting to the changing times.',
      iconEmoji: '🏹',
      themeColor: 'red',
    },
    {
      id: 'railroad-barons',
      name: 'The Railroad Barons',
      tag: 'RAIL',
      description: 'Industrialists who control the railways and the wealth that flows through them. Money is their weapon.',
      faction: 'Settler Alliance',
      strength: 100,
      reputation: 12000,
      leader: {
        name: 'Cornelius Sterling',
        title: 'The Iron Baron',
        description: 'A ruthless businessman who sees the West as an empire to be conquered with steel and gold.',
        combatPower: 300,
        specialAbilities: ['Golden Bullet', 'Iron Guard', 'Market Manipulation'],
      },
      territories: [
        {
          id: 'junction-city',
          name: 'Junction City',
          description: 'The central hub where all rail lines converge',
          controlStrength: 95,
          resources: ['Railways', 'Industry'],
          bonuses: ['+25% Shipping Income', '+15% Resource Production'],
        },
      ],
      tributeRate: 400,
      specialFeatures: ['Railway access', 'Industrial contracts', 'Legal protection'],
      lore: 'The Barons arrived with the railroad, bringing progress and exploitation in equal measure.',
      iconEmoji: '🚂',
      themeColor: 'blue',
    },
    {
      id: 'bankers-syndicate',
      name: "The Banker's Syndicate",
      tag: 'BANK',
      description: 'They control the money, and money controls everything. Cross them and your debts will be called in.',
      faction: 'Settler Alliance',
      strength: 60,
      reputation: 10000,
      leader: {
        name: 'Victoria Blackwood',
        title: 'The Collector',
        description: 'Cold and calculating, she views people as assets to be invested or liquidated.',
        combatPower: 200,
        specialAbilities: ['Debt Collection', 'Hired Guns', 'Economic Warfare'],
      },
      territories: [
        {
          id: 'prosperity-plaza',
          name: 'Prosperity Plaza',
          description: 'The financial district where fortunes are made and lost',
          controlStrength: 80,
          resources: ['Banking', 'Contracts'],
          bonuses: ['+20% Interest Income', '-15% Loan Rates'],
        },
      ],
      tributeRate: 300,
      specialFeatures: ['Loans and credit', 'Investment opportunities', 'Debt forgiveness'],
      lore: 'The Syndicate emerged from the ashes of failed frontier banks, consolidating power through foreclosures.',
      iconEmoji: '💰',
      themeColor: 'green',
    },
  ];
}

export default useNPCGangConflict;
